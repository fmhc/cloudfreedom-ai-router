import { Hono } from 'hono'
import { cors } from 'hono/cors'
import PocketBase from 'pocketbase'
import Stripe from 'stripe'

const app = new Hono()

// PocketBase client
const pb = new PocketBase(process.env.POCKETBASE_URL || 'http://localhost:8090')

// Stripe client
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia'
})

// Stripe pricing configuration
const STRIPE_PLANS = {
  starter: {
    name: 'Starter',
    price: 2900, // €29.00 in cents
    tokens: 50000,
    currency: 'eur'
  },
  pro: {
    name: 'Pro', 
    price: 9900, // €99.00 in cents
    tokens: 500000,
    currency: 'eur'
  },
  enterprise: {
    name: 'Enterprise',
    price: 29900, // €299.00 in cents
    tokens: -1, // unlimited
    currency: 'eur'
  }
}

const OVERAGE_PRICE_PER_TOKEN = 0.002 // €0.002 per token

// CORS for API access
app.use('/*', cors())

// Auth middleware: Validate PocketBase token
const authMiddleware = async (c, next) => {
  const authHeader = c.req.header('Authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized: Missing or invalid token' }, 401)
  }

  const token = authHeader.substring(7) // Remove "Bearer " prefix

  try {
    // Validate token with PocketBase
    pb.authStore.save(token)
    
    // Try to get the current user to verify token is valid
    const authData = await pb.collection('users').authRefresh()
    
    if (!authData || !authData.record) {
      return c.json({ error: 'Unauthorized: Invalid token' }, 401)
    }

    // Store user info in context for later use
    c.set('user', authData.record)
    c.set('userId', authData.record.id)
    
    await next()
  } catch (error) {
    console.error('Auth error:', error)
    return c.json({ error: 'Unauthorized: Token validation failed' }, 401)
  }
}

// Apply auth middleware to all /api/* routes except health and webhook
app.use('/api/*', async (c, next) => {
  // Skip auth for Stripe webhook
  if (c.req.path === '/api/stripe/webhook') {
    await next()
    return
  }
  
  await authMiddleware(c, next)
})

// Health check
app.get('/health', (c) => {
  return c.json({
    status: 'ok',
    service: 'cloudfreedom-billing-api',
    version: '0.1.0',
    pocketbase: process.env.POCKETBASE_URL
  })
})

// Track usage endpoint
app.post('/api/usage/track', async (c) => {
  try {
    const body = await c.req.json()
    const { tenant_id, user_id, model, tokens, cost_total } = body

    // Validate required fields
    if (!tenant_id || !user_id || !model || !cost_total) {
      return c.json({ error: 'Missing required fields' }, 400)
    }

    // Save usage log to PocketBase
    const record = await pb.collection('usage_logs').create({
      tenant_id,
      user_id,
      model,
      total_tokens: tokens || 0,
      cost_total: parseFloat(cost_total),
      timestamp: new Date().toISOString()
    })

    // Update user budget (if user_id provided)
    if (user_id) {
      try {
        const user = await pb.collection('users').getOne(user_id)
        const newBudgetUsed = (user.budget_used || 0) + parseFloat(cost_total)
        const newBudgetRemaining = (user.budget_total || 0) - newBudgetUsed

        await pb.collection('users').update(user_id, {
          budget_used: newBudgetUsed,
          budget_remaining: newBudgetRemaining
        })

        return c.json({
          success: true,
          usage_id: record.id,
          budget: {
            used: newBudgetUsed,
            remaining: newBudgetRemaining,
            total: user.budget_total
          }
        })
      } catch (userError) {
        console.error('User update failed:', userError)
        // Still return success for usage log
        return c.json({
          success: true,
          usage_id: record.id,
          warning: 'User budget not updated'
        })
      }
    }

    return c.json({
      success: true,
      usage_id: record.id
    })

  } catch (error) {
    console.error('Usage tracking error:', error)
    return c.json({ 
      error: 'Failed to track usage',
      details: error.message 
    }, 500)
  }
})

// Get tenant usage stats
app.get('/api/usage/tenant/:tenantId', async (c) => {
  try {
    const tenantId = c.req.param('tenantId')
    
    // Get usage logs for tenant
    const logs = await pb.collection('usage_logs').getList(1, 100, {
      filter: `tenant_id = "${tenantId}"`,
      sort: '-created'
    })

    // Calculate totals
    const totalCost = logs.items.reduce((sum, log) => sum + (log.cost_total || 0), 0)
    const totalTokens = logs.items.reduce((sum, log) => sum + (log.total_tokens || 0), 0)

    return c.json({
      tenant_id: tenantId,
      total_cost: totalCost.toFixed(2),
      total_tokens: totalTokens,
      request_count: logs.items.length,
      logs: logs.items
    })

  } catch (error) {
    console.error('Usage stats error:', error)
    return c.json({ 
      error: 'Failed to get usage stats',
      details: error.message 
    }, 500)
  }
})

// Check budget before request
app.post('/api/budget/check', async (c) => {
  try {
    const body = await c.req.json()
    const { user_id } = body

    if (!user_id) {
      return c.json({ error: 'user_id required' }, 400)
    }

    const user = await pb.collection('users').getOne(user_id)

    const hasBudget = (user.budget_remaining || 0) > 0
    const status = user.status || 'pending'

    return c.json({
      allowed: hasBudget && status === 'active',
      budget: {
        total: user.budget_total || 0,
        used: user.budget_used || 0,
        remaining: user.budget_remaining || 0
      },
      status: status,
      message: !hasBudget ? 'Budget exceeded' : status !== 'active' ? 'Account not active' : 'OK'
    })

  } catch (error) {
    console.error('Budget check error:', error)
    return c.json({ 
      error: 'Failed to check budget',
      details: error.message 
    }, 500)
  }
})

// ======================
// STRIPE ENDPOINTS
// ======================

// Create Stripe Checkout Session
app.post('/api/stripe/create-checkout-session', async (c) => {
  try {
    const body = await c.req.json()
    const { plan_id, tenant_id, user_id, success_url, cancel_url } = body

    // Validate required fields
    if (!plan_id || !tenant_id || !user_id || !success_url || !cancel_url) {
      return c.json({ error: 'Missing required fields: plan_id, tenant_id, user_id, success_url, cancel_url' }, 400)
    }

    // Validate plan
    if (!STRIPE_PLANS[plan_id]) {
      return c.json({ error: `Invalid plan_id: ${plan_id}. Available: ${Object.keys(STRIPE_PLANS).join(', ')}` }, 400)
    }

    const plan = STRIPE_PLANS[plan_id]

    // Get or create Stripe customer for user
    let customer
    const user = await pb.collection('users').getOne(user_id)
    
    if (user.stripe_customer_id) {
      // Get existing customer
      customer = await stripe.customers.retrieve(user.stripe_customer_id)
    } else {
      // Create new customer
      customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          user_id: user_id,
          tenant_id: tenant_id
        }
      })

      // Update user with Stripe customer ID
      await pb.collection('users').update(user_id, {
        stripe_customer_id: customer.id
      })
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: plan.currency,
            product_data: {
              name: `CloudFreedom ${plan.name} Plan`,
              description: `${plan.tokens === -1 ? 'Unlimited' : plan.tokens.toLocaleString()} tokens per month`
            },
            unit_amount: plan.price,
            recurring: {
              interval: 'month'
            }
          },
          quantity: 1
        }
      ],
      mode: 'subscription',
      success_url: success_url,
      cancel_url: cancel_url,
      metadata: {
        plan_id: plan_id,
        tenant_id: tenant_id,
        user_id: user_id
      }
    })

    return c.json({
      success: true,
      checkout_url: session.url,
      session_id: session.id
    })

  } catch (error) {
    console.error('Stripe checkout session error:', error)
    return c.json({ 
      error: 'Failed to create checkout session',
      details: error.message 
    }, 500)
  }
})

// Stripe Webhook Handler
app.post('/api/stripe/webhook', async (c) => {
  try {
    const sig = c.req.header('stripe-signature')
    const body = await c.req.text()

    if (!sig) {
      return c.json({ error: 'Missing Stripe signature' }, 400)
    }

    // Verify webhook signature
    let event
    try {
      event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET)
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message)
      return c.json({ error: 'Webhook signature verification failed' }, 400)
    }

    console.log('Stripe webhook event:', event.type)

    // Handle events
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object
        const { plan_id, tenant_id, user_id } = session.metadata
        
        console.log(`Checkout completed for user ${user_id}, plan ${plan_id}`)

        // Update user with subscription info
        const plan = STRIPE_PLANS[plan_id]
        await pb.collection('users').update(user_id, {
          subscription_id: session.subscription,
          subscription_status: 'active',
          plan_id: plan_id,
          budget_total: plan.tokens === -1 ? 999999999 : plan.tokens, // Set high number for unlimited
          budget_used: 0,
          budget_remaining: plan.tokens === -1 ? 999999999 : plan.tokens
        })

        // Log payment history
        await pb.collection('payment_history').create({
          stripe_event_id: event.id,
          user_id: user_id,
          tenant_id: tenant_id,
          amount: plan.price / 100, // Convert from cents to euros
          status: 'completed',
          event_type: 'subscription_started'
        })

        break
      }

      case 'invoice.paid': {
        const invoice = event.data.object
        const subscription = await stripe.subscriptions.retrieve(invoice.subscription)
        const customer = await stripe.customers.retrieve(subscription.customer)
        const user_id = customer.metadata.user_id
        const tenant_id = customer.metadata.tenant_id

        console.log(`Invoice paid for user ${user_id}`)

        // Reset token allowance for the billing period
        const user = await pb.collection('users').getOne(user_id)
        const plan = STRIPE_PLANS[user.plan_id]
        
        await pb.collection('users').update(user_id, {
          subscription_status: 'active',
          budget_total: plan.tokens === -1 ? 999999999 : plan.tokens,
          budget_used: 0,
          budget_remaining: plan.tokens === -1 ? 999999999 : plan.tokens
        })

        // Log payment history
        await pb.collection('payment_history').create({
          stripe_event_id: event.id,
          user_id: user_id,
          tenant_id: tenant_id,
          amount: invoice.amount_paid / 100,
          status: 'completed',
          event_type: 'invoice_paid'
        })

        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object
        const subscription = await stripe.subscriptions.retrieve(invoice.subscription)
        const customer = await stripe.customers.retrieve(subscription.customer)
        const user_id = customer.metadata.user_id
        const tenant_id = customer.metadata.tenant_id

        console.log(`Invoice payment failed for user ${user_id}`)

        // Update subscription status
        await pb.collection('users').update(user_id, {
          subscription_status: 'past_due'
        })

        // Log payment history
        await pb.collection('payment_history').create({
          stripe_event_id: event.id,
          user_id: user_id,
          tenant_id: tenant_id,
          amount: invoice.amount_due / 100,
          status: 'failed',
          event_type: 'payment_failed'
        })

        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object
        const customer = await stripe.customers.retrieve(subscription.customer)
        const user_id = customer.metadata.user_id
        const tenant_id = customer.metadata.tenant_id

        console.log(`Subscription deleted for user ${user_id}`)

        // Update user status
        await pb.collection('users').update(user_id, {
          subscription_status: 'canceled',
          subscription_id: null,
          plan_id: null,
          budget_total: 0,
          budget_used: 0,
          budget_remaining: 0
        })

        // Log payment history
        await pb.collection('payment_history').create({
          stripe_event_id: event.id,
          user_id: user_id,
          tenant_id: tenant_id,
          amount: 0,
          status: 'canceled',
          event_type: 'subscription_canceled'
        })

        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return c.json({ received: true })

  } catch (error) {
    console.error('Webhook error:', error)
    return c.json({ 
      error: 'Webhook processing failed',
      details: error.message 
    }, 500)
  }
})

// Create Stripe Customer Portal Session
app.get('/api/stripe/portal/:userId', async (c) => {
  try {
    const userId = c.req.param('userId')
    const return_url = c.req.query('return_url') || 'https://app.cloudfreedom.ai/billing'

    // Get user
    const user = await pb.collection('users').getOne(userId)
    
    if (!user.stripe_customer_id) {
      return c.json({ error: 'User has no Stripe customer ID' }, 400)
    }

    // Create portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: user.stripe_customer_id,
      return_url: return_url
    })

    return c.json({
      success: true,
      portal_url: portalSession.url
    })

  } catch (error) {
    console.error('Portal session error:', error)
    return c.json({ 
      error: 'Failed to create portal session',
      details: error.message 
    }, 500)
  }
})

// Get Subscription Status for Tenant
app.get('/api/stripe/subscription/:tenantId', async (c) => {
  try {
    const tenantId = c.req.param('tenantId')

    // Find users in this tenant
    const users = await pb.collection('users').getList(1, 50, {
      filter: `tenant_id = "${tenantId}"`
    })

    if (users.items.length === 0) {
      return c.json({ error: 'No users found for tenant' }, 404)
    }

    // Get subscription info for active subscribers
    const subscriptions = []
    
    for (const user of users.items) {
      if (user.subscription_id && user.stripe_customer_id) {
        try {
          const subscription = await stripe.subscriptions.retrieve(user.subscription_id)
          const plan = STRIPE_PLANS[user.plan_id] || {}
          
          subscriptions.push({
            user_id: user.id,
            user_email: user.email,
            subscription_id: user.subscription_id,
            plan_id: user.plan_id,
            plan_name: plan.name,
            status: subscription.status,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            budget_total: user.budget_total,
            budget_used: user.budget_used,
            budget_remaining: user.budget_remaining
          })
        } catch (err) {
          console.error(`Failed to get subscription for user ${user.id}:`, err)
        }
      }
    }

    return c.json({
      tenant_id: tenantId,
      subscription_count: subscriptions.length,
      subscriptions: subscriptions
    })

  } catch (error) {
    console.error('Subscription status error:', error)
    return c.json({ 
      error: 'Failed to get subscription status',
      details: error.message 
    }, 500)
  }
})

const port = parseInt(process.env.PORT || '3000')
console.log(`🚀 CloudFreedom Billing API running on port ${port}`)

export default {
  port,
  fetch: app.fetch
}

