# Stripe Integration Setup Guide

This guide explains how to set up Stripe for the CloudFreedom billing API.

## 1. Environment Variables

Add the following to your `.env` file:

```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

**Test keys are available in:** `/home/fmh/.openclaw/workspace/secrets/stripe-test.env`

For production, get your live keys from the [Stripe Dashboard](https://dashboard.stripe.com/apikeys).

## 2. Create Products and Prices in Stripe Dashboard

### Option A: Manual Setup (Stripe Dashboard)

1. Go to [Products](https://dashboard.stripe.com/products) in your Stripe Dashboard
2. Create three products with recurring prices:

#### Starter Plan
- **Name:** CloudFreedom Starter Plan  
- **Description:** 50,000 tokens per month
- **Price:** €29.00/month (recurring)
- **Price ID:** Note this for configuration

#### Pro Plan  
- **Name:** CloudFreedom Pro Plan
- **Description:** 500,000 tokens per month  
- **Price:** €99.00/month (recurring)
- **Price ID:** Note this for configuration

#### Enterprise Plan
- **Name:** CloudFreedom Enterprise Plan
- **Description:** Unlimited tokens per month
- **Price:** €299.00/month (recurring)  
- **Price ID:** Note this for configuration

### Option B: Automated Setup (Stripe CLI)

```bash
# Create products and prices via CLI
stripe products create \
  --name="CloudFreedom Starter Plan" \
  --description="50,000 tokens per month"

stripe prices create \
  --currency=eur \
  --unit-amount=2900 \
  --recurring[interval]=month \
  --product=prod_XXXXXXXXXX
```

## 3. Webhook Configuration

### Set up Webhook Endpoint

1. Go to [Webhooks](https://dashboard.stripe.com/webhooks) in Stripe Dashboard
2. Click "Add endpoint"
3. **Endpoint URL:** `https://yourdomain.com/api/stripe/webhook`
4. **Events to send:**
   - `checkout.session.completed`
   - `invoice.paid`
   - `invoice.payment_failed`  
   - `customer.subscription.deleted`
5. Copy the **Signing Secret** and add it to your environment as `STRIPE_WEBHOOK_SECRET`

### Webhook Security

⚠️ **Important:** The webhook endpoint bypasses authentication middleware and instead uses Stripe signature verification. Do NOT add auth middleware to `/api/stripe/webhook`.

## 4. PocketBase Collections Setup

### Update Users Collection

Add these fields to your `users` collection:

```javascript
// New fields for users collection
{
  "stripe_customer_id": "text", // Stripe customer ID
  "subscription_id": "text",    // Stripe subscription ID  
  "subscription_status": "text", // active, past_due, canceled, etc.
  "plan_id": "text"             // starter, pro, enterprise
}
```

### Create Payment History Collection

Create a new collection called `payment_history`:

```javascript
{
  "stripe_event_id": "text",    // Stripe webhook event ID (unique)
  "user_id": "relation",        // Reference to users collection
  "tenant_id": "text",          // Tenant identifier
  "amount": "number",           // Payment amount in euros
  "status": "text",             // completed, failed, canceled
  "event_type": "text",         // subscription_started, invoice_paid, etc.
  "created": "date"             // Auto-generated timestamp
}
```

## 5. Testing with Stripe CLI

### Install Stripe CLI

```bash
# macOS
brew install stripe/stripe-cli/stripe

# Linux  
wget -O - https://packages.stripe.dev/api/security/keypairs/stripe-cli-gpg/public | gpg --dearmor | sudo tee /usr/share/keyrings/stripe.gpg
echo "deb [signed-by=/usr/share/keyrings/stripe.gpg] https://packages.stripe.dev/stripe-cli-debian-local stable main" | sudo tee -a /etc/apt/sources.list.d/stripe.list
sudo apt update && sudo apt install stripe
```

### Login and Forward Webhooks

```bash
# Login to Stripe
stripe login

# Forward webhooks to local development
stripe listen --forward-to localhost:3000/api/stripe/webhook

# This will output a webhook signing secret like: whsec_...
# Copy this to your .env file as STRIPE_WEBHOOK_SECRET
```

### Test Payments

Use Stripe's [test card numbers](https://stripe.com/docs/testing#cards):

- **Successful payment:** `4242 4242 4242 4242`
- **Decline:** `4000 0000 0000 0002`  
- **3D Secure:** `4000 0025 0000 3155`

## 6. API Endpoints

### Create Checkout Session
```http
POST /api/stripe/create-checkout-session
Authorization: Bearer <pocketbase_token>

{
  "plan_id": "starter",
  "tenant_id": "tenant_123",
  "user_id": "user_456", 
  "success_url": "https://app.cloudfreedom.ai/success",
  "cancel_url": "https://app.cloudfreedom.ai/cancel"
}
```

### Customer Portal
```http  
GET /api/stripe/portal/:userId?return_url=https://app.cloudfreedom.ai/billing
Authorization: Bearer <pocketbase_token>
```

### Subscription Status
```http
GET /api/stripe/subscription/:tenantId
Authorization: Bearer <pocketbase_token>
```

### Webhook (No Auth)
```http
POST /api/stripe/webhook
Stripe-Signature: <stripe_signature_header>
```

## 7. Pricing Structure

| Plan | Price | Tokens | Overage |
|------|-------|---------|---------|
| Starter | €29/mo | 50,000 | €0.002/token |
| Pro | €99/mo | 500,000 | €0.002/token |  
| Enterprise | €299/mo | Unlimited | N/A |

## 8. Production Checklist

- [ ] Replace test keys with live keys
- [ ] Update webhook URL to production domain
- [ ] Configure proper success/cancel URLs
- [ ] Set up monitoring for webhook failures
- [ ] Test subscription lifecycle (create → pay → cancel)
- [ ] Verify PocketBase collections are created
- [ ] Test Customer Portal functionality

## 9. Common Issues

### Webhook Not Working
- Check `STRIPE_WEBHOOK_SECRET` is correct
- Verify endpoint URL is accessible from internet
- Check webhook events are configured correctly

### Customer Portal Issues  
- Ensure customer has a valid Stripe customer ID
- Verify return_url is a valid HTTPS URL

### Subscription Not Updating
- Check webhook events are being received
- Verify user metadata contains correct user_id/tenant_id
- Check PocketBase permissions for updates

## 10. Support

For issues:
1. Check Stripe Dashboard logs
2. Review webhook delivery attempts  
3. Check application logs for errors
4. Test with Stripe CLI webhook forwarding