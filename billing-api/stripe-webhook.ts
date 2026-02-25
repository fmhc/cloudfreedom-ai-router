/**
 * CloudFreedom Stripe Webhook Handler
 * 
 * This is a Node.js/Express webhook endpoint stub for processing Stripe events.
 * Deploy this as a separate service or integrate into your existing API.
 */

import express from 'express';
import Stripe from 'stripe';
import { createHash } from 'crypto';

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Stripe (replace with your actual secret key)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2023-10-16', // Use the latest API version
});

const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_placeholder';

// Middleware to capture raw body for webhook signature verification
app.use('/webhooks/stripe', express.raw({ type: 'application/json' }));
app.use(express.json()); // For other routes

// Types for our subscription data
interface Subscription {
  id: string;
  customerId: string;
  customerEmail: string;
  productId: string;
  priceId: string;
  status: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface Customer {
  id: string;
  stripeCustomerId: string;
  email: string;
  name?: string;
  phone?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Database interface (replace with your actual database connection)
class DatabaseService {
  static async createCustomer(customerData: Partial<Customer>): Promise<Customer> {
    console.log('📝 Creating customer:', customerData);
    // TODO: Implement database insert
    // Example: await db.customers.create(customerData);
    return customerData as Customer;
  }

  static async updateCustomer(customerId: string, updates: Partial<Customer>): Promise<Customer> {
    console.log('📝 Updating customer:', customerId, updates);
    // TODO: Implement database update
    // Example: await db.customers.update(customerId, updates);
    return updates as Customer;
  }

  static async createSubscription(subscriptionData: Partial<Subscription>): Promise<Subscription> {
    console.log('📝 Creating subscription:', subscriptionData);
    // TODO: Implement database insert
    // Example: await db.subscriptions.create(subscriptionData);
    return subscriptionData as Subscription;
  }

  static async updateSubscription(subscriptionId: string, updates: Partial<Subscription>): Promise<Subscription> {
    console.log('📝 Updating subscription:', subscriptionId, updates);
    // TODO: Implement database update
    // Example: await db.subscriptions.update(subscriptionId, updates);
    return updates as Subscription;
  }

  static async deleteSubscription(subscriptionId: string): Promise<void> {
    console.log('📝 Deleting subscription:', subscriptionId);
    // TODO: Implement database soft delete
    // Example: await db.subscriptions.softDelete(subscriptionId);
  }

  static async findCustomerByStripeId(stripeCustomerId: string): Promise<Customer | null> {
    console.log('🔍 Finding customer by Stripe ID:', stripeCustomerId);
    // TODO: Implement database query
    // Example: return await db.customers.findByStripeId(stripeCustomerId);
    return null;
  }

  static async findSubscriptionByStripeId(stripeSubscriptionId: string): Promise<Subscription | null> {
    console.log('🔍 Finding subscription by Stripe ID:', stripeSubscriptionId);
    // TODO: Implement database query
    // Example: return await db.subscriptions.findByStripeId(stripeSubscriptionId);
    return null;
  }
}

// Email service for notifications
class EmailService {
  static async sendWelcomeEmail(customerEmail: string, productName: string) {
    console.log('📧 Sending welcome email to:', customerEmail, 'for product:', productName);
    // TODO: Implement email sending
    // Example: await emailProvider.send({
    //   to: customerEmail,
    //   template: 'welcome',
    //   data: { productName }
    // });
  }

  static async sendPaymentFailedEmail(customerEmail: string, amountDue: number) {
    console.log('📧 Sending payment failed email to:', customerEmail, 'amount:', amountDue);
    // TODO: Implement payment failure notification
  }

  static async sendCancellationEmail(customerEmail: string, productName: string, endDate: Date) {
    console.log('📧 Sending cancellation email to:', customerEmail);
    // TODO: Implement cancellation notification
  }

  static async sendInvoiceEmail(customerEmail: string, invoiceUrl: string) {
    console.log('📧 Sending invoice email to:', customerEmail, 'URL:', invoiceUrl);
    // TODO: Implement invoice forwarding
  }
}

// Agent provisioning service
class AgentService {
  static async provisionAgent(customerId: string, productId: string, subscriptionId: string) {
    console.log('🤖 Provisioning agent for customer:', customerId, 'product:', productId);
    
    // Map product IDs to agent types
    const productMapping = {
      'jobhunter': 'JobHunter Agent',
      'recruiting': 'Recruiting Agent',
      'docint': 'Document Intelligence',
      'devops': 'DevOps Agent',
      'content': 'Content Agent',
    };

    const agentType = productMapping[productId as keyof typeof productMapping] || 'Unknown Agent';
    
    // TODO: Implement actual agent deployment
    // Examples:
    // - Create Kubernetes deployment
    // - Configure agent with customer settings
    // - Generate API keys and access tokens
    // - Set up monitoring and logging
    
    console.log(`✅ Agent "${agentType}" provisioned for customer ${customerId}`);
  }

  static async updateAgentPlan(customerId: string, oldPriceId: string, newPriceId: string) {
    console.log('🔄 Updating agent plan for customer:', customerId);
    console.log('🔄 From:', oldPriceId, 'to:', newPriceId);
    
    // TODO: Implement plan changes
    // Examples:
    // - Update resource limits
    // - Enable/disable features
    // - Migrate agent configuration
  }

  static async suspendAgent(customerId: string, subscriptionId: string) {
    console.log('⏸️ Suspending agent for customer:', customerId);
    
    // TODO: Implement agent suspension
    // Examples:
    // - Scale down deployments
    // - Disable API access
    // - Preserve data but stop processing
  }

  static async terminateAgent(customerId: string, subscriptionId: string) {
    console.log('🛑 Terminating agent for customer:', customerId);
    
    // TODO: Implement agent termination
    // Examples:
    // - Delete Kubernetes resources
    // - Archive customer data
    // - Clean up external integrations
  }
}

// Webhook event handlers
const webhookHandlers = {
  // New checkout session completed - activate subscription
  'checkout.session.completed': async (event: Stripe.Event) => {
    const session = event.data.object as Stripe.Checkout.Session;
    console.log('💳 Checkout session completed:', session.id);

    try {
      // Get customer and subscription details
      const customer = await stripe.customers.retrieve(session.customer as string);
      const subscription = await stripe.subscriptions.retrieve(session.subscription as string);

      if (customer.deleted) {
        console.error('❌ Customer was deleted:', session.customer);
        return;
      }

      // Extract product information from the subscription
      const lineItem = subscription.items.data[0];
      const price = lineItem.price;
      const product = await stripe.products.retrieve(price.product as string);

      // Create or update customer in our database
      let dbCustomer = await DatabaseService.findCustomerByStripeId(customer.id);
      if (!dbCustomer) {
        dbCustomer = await DatabaseService.createCustomer({
          stripeCustomerId: customer.id,
          email: customer.email!,
          name: customer.name || undefined,
          phone: customer.phone || undefined,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }

      // Create subscription in our database
      const dbSubscription = await DatabaseService.createSubscription({
        id: subscription.id,
        customerId: dbCustomer.id,
        customerEmail: customer.email!,
        productId: product.metadata.agent_type || 'unknown',
        priceId: price.id,
        status: subscription.status,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Provision the AI agent
      await AgentService.provisionAgent(
        dbCustomer.id, 
        product.metadata.agent_type || 'unknown',
        subscription.id
      );

      // Send welcome email
      await EmailService.sendWelcomeEmail(customer.email!, product.name);

      console.log('✅ Checkout session processing completed');
    } catch (error) {
      console.error('❌ Error processing checkout session:', error);
      throw error;
    }
  },

  // Successful payment - extend service
  'invoice.payment_succeeded': async (event: Stripe.Event) => {
    const invoice = event.data.object as Stripe.Invoice;
    console.log('💰 Payment succeeded for invoice:', invoice.id);

    try {
      if (invoice.subscription) {
        // Get subscription and update our records
        const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
        
        await DatabaseService.updateSubscription(subscription.id, {
          status: subscription.status,
          currentPeriodStart: new Date(subscription.current_period_start * 1000),
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          updatedAt: new Date(),
        });

        console.log('✅ Subscription extended:', subscription.id);
      }

      // Forward invoice to customer if needed
      if (invoice.hosted_invoice_url && invoice.customer_email) {
        await EmailService.sendInvoiceEmail(
          invoice.customer_email, 
          invoice.hosted_invoice_url
        );
      }
    } catch (error) {
      console.error('❌ Error processing successful payment:', error);
      throw error;
    }
  },

  // Failed payment - handle gracefully
  'invoice.payment_failed': async (event: Stripe.Event) => {
    const invoice = event.data.object as Stripe.Invoice;
    console.log('💸 Payment failed for invoice:', invoice.id);

    try {
      if (invoice.customer_email && invoice.amount_due) {
        await EmailService.sendPaymentFailedEmail(
          invoice.customer_email,
          invoice.amount_due / 100 // Convert from cents
        );
      }

      // If this is a recurring payment failure, might want to suspend the agent
      if (invoice.subscription && invoice.attempt_count > 2) {
        console.log('⚠️ Multiple payment failures, considering suspension');
        // TODO: Implement suspension logic after multiple failures
      }
    } catch (error) {
      console.error('❌ Error processing failed payment:', error);
      throw error;
    }
  },

  // Subscription updated - handle plan changes
  'customer.subscription.updated': async (event: Stripe.Event) => {
    const subscription = event.data.object as Stripe.Subscription;
    const previousAttributes = event.data.previous_attributes as Partial<Stripe.Subscription>;
    
    console.log('📝 Subscription updated:', subscription.id);

    try {
      // Update subscription in database
      await DatabaseService.updateSubscription(subscription.id, {
        status: subscription.status,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        updatedAt: new Date(),
      });

      // Check if price/plan changed
      const currentPrice = subscription.items.data[0].price.id;
      const oldPrice = previousAttributes.items?.data?.[0]?.price?.id;

      if (oldPrice && oldPrice !== currentPrice) {
        console.log('🔄 Plan change detected:', oldPrice, '→', currentPrice);
        
        const customer = await stripe.customers.retrieve(subscription.customer as string);
        if (!customer.deleted) {
          const dbCustomer = await DatabaseService.findCustomerByStripeId(customer.id);
          if (dbCustomer) {
            await AgentService.updateAgentPlan(dbCustomer.id, oldPrice, currentPrice);
          }
        }
      }

      // Handle cancellation
      if (subscription.cancel_at_period_end && !previousAttributes.cancel_at_period_end) {
        console.log('🔚 Subscription marked for cancellation:', subscription.id);
        // TODO: Send cancellation confirmation email
      }
    } catch (error) {
      console.error('❌ Error processing subscription update:', error);
      throw error;
    }
  },

  // Subscription canceled - deactivate agent
  'customer.subscription.deleted': async (event: Stripe.Event) => {
    const subscription = event.data.object as Stripe.Subscription;
    console.log('🗑️ Subscription canceled:', subscription.id);

    try {
      // Update subscription status
      await DatabaseService.updateSubscription(subscription.id, {
        status: 'canceled',
        updatedAt: new Date(),
      });

      // Get customer information
      const customer = await stripe.customers.retrieve(subscription.customer as string);
      if (!customer.deleted) {
        const dbCustomer = await DatabaseService.findCustomerByStripeId(customer.id);
        if (dbCustomer) {
          // Terminate the agent
          await AgentService.terminateAgent(dbCustomer.id, subscription.id);

          // Send cancellation confirmation
          const lineItem = subscription.items.data[0];
          const product = await stripe.products.retrieve(lineItem.price.product as string);
          
          await EmailService.sendCancellationEmail(
            customer.email!,
            product.name,
            new Date(subscription.current_period_end * 1000)
          );
        }
      }

      console.log('✅ Subscription cancellation processed');
    } catch (error) {
      console.error('❌ Error processing subscription cancellation:', error);
      throw error;
    }
  },

  // New customer created
  'customer.created': async (event: Stripe.Event) => {
    const customer = event.data.object as Stripe.Customer;
    console.log('👤 New customer created:', customer.id);

    try {
      await DatabaseService.createCustomer({
        stripeCustomerId: customer.id,
        email: customer.email!,
        name: customer.name || undefined,
        phone: customer.phone || undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      console.log('✅ Customer record created');
    } catch (error) {
      console.error('❌ Error creating customer:', error);
      throw error;
    }
  },
};

// Main webhook endpoint
app.post('/webhooks/stripe', async (req, res) => {
  const sig = req.headers['stripe-signature'] as string;
  const rawBody = req.body;

  let event: Stripe.Event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(rawBody, sig, STRIPE_WEBHOOK_SECRET);
    console.log('🔐 Webhook signature verified for event:', event.type);
  } catch (err: any) {
    console.error('❌ Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  const handler = webhookHandlers[event.type as keyof typeof webhookHandlers];
  
  if (handler) {
    try {
      await handler(event);
      console.log(`✅ Successfully processed ${event.type} event`);
    } catch (error) {
      console.error(`❌ Error handling ${event.type}:`, error);
      return res.status(500).json({ 
        error: 'Internal server error', 
        event_type: event.type,
        event_id: event.id 
      });
    }
  } else {
    console.log(`ℹ️ Unhandled event type: ${event.type}`);
  }

  // Always return 200 to acknowledge receipt
  res.json({ received: true, event_type: event.type, event_id: event.id });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'CloudFreedom Billing API'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 CloudFreedom Billing API listening on port ${PORT}`);
  console.log(`📍 Webhook endpoint: http://localhost:${PORT}/webhooks/stripe`);
  console.log(`💚 Health check: http://localhost:${PORT}/health`);
});

export default app;

/**
 * DEPLOYMENT NOTES:
 * 
 * 1. Environment Variables:
 *    - STRIPE_SECRET_KEY: Your Stripe secret key
 *    - STRIPE_WEBHOOK_SECRET: Webhook signing secret from Stripe Dashboard
 *    - DATABASE_URL: Connection string for your database
 *    - PORT: Port to run the service on (default: 3001)
 * 
 * 2. Database Setup:
 *    - Replace DatabaseService methods with your actual database logic
 *    - Consider using Prisma, TypeORM, or similar ORM
 *    - Create proper database schema for customers and subscriptions
 * 
 * 3. Email Service:
 *    - Replace EmailService methods with your actual email provider
 *    - Consider using SendGrid, Mailgun, or similar service
 *    - Create email templates for different notifications
 * 
 * 4. Agent Service:
 *    - Implement actual agent deployment logic
 *    - Configure Kubernetes, Docker, or your deployment platform
 *    - Set up proper monitoring and resource management
 * 
 * 5. Security:
 *    - Use proper environment variable management
 *    - Implement rate limiting and DDoS protection
 *    - Set up proper logging and monitoring
 *    - Consider using a secret management service
 * 
 * 6. Monitoring:
 *    - Add proper error tracking (Sentry, Rollbar)
 *    - Set up webhook delivery monitoring
 *    - Implement health checks and alerting
 * 
 * 7. Testing:
 *    - Use Stripe CLI for local testing: `stripe listen --forward-to localhost:3001/webhooks/stripe`
 *    - Create unit tests for each webhook handler
 *    - Set up integration tests with test webhooks
 */