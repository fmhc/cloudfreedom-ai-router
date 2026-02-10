import { Hono } from 'hono'
import { cors } from 'hono/cors'
import PocketBase from 'pocketbase'

const app = new Hono()

// PocketBase client
const pb = new PocketBase(process.env.POCKETBASE_URL || 'http://localhost:8090')

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

// Apply auth middleware to all /api/* routes except health
app.use('/api/*', authMiddleware)

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

const port = parseInt(process.env.PORT || '3000')
console.log(`🚀 CloudFreedom Billing API running on port ${port}`)

export default {
  port,
  fetch: app.fetch
}

