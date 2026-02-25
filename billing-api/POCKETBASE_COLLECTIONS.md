# PocketBase Collections for Stripe Integration

This document outlines the database changes needed to support Stripe integration.

## 1. Updates to Existing `users` Collection

Add the following fields to your existing `users` collection:

### New Fields

| Field Name | Type | Required | Description |
|------------|------|----------|-------------|
| `stripe_customer_id` | text | No | Stripe customer ID for billing |
| `subscription_id` | text | No | Active Stripe subscription ID |
| `subscription_status` | text | No | Subscription status (active, past_due, canceled, etc.) |
| `plan_id` | text | No | Plan identifier (starter, pro, enterprise) |

### Field Configuration

```javascript
// In PocketBase Admin UI -> Collections -> users -> Add field

// stripe_customer_id
{
  "name": "stripe_customer_id",
  "type": "text",
  "required": false,
  "unique": true,
  "max": 100
}

// subscription_id  
{
  "name": "subscription_id", 
  "type": "text",
  "required": false,
  "unique": false,
  "max": 100
}

// subscription_status
{
  "name": "subscription_status",
  "type": "text", 
  "required": false,
  "unique": false,
  "max": 50,
  "options": ["active", "past_due", "canceled", "incomplete", "trialing"]
}

// plan_id
{
  "name": "plan_id",
  "type": "text",
  "required": false, 
  "unique": false,
  "max": 50,
  "options": ["starter", "pro", "enterprise"]
}
```

## 2. New `payment_history` Collection

Create a completely new collection to track payment events from Stripe webhooks.

### Collection Settings
- **Name:** `payment_history`
- **Type:** Base collection
- **API permissions:** Admin only (for security)

### Fields

| Field Name | Type | Required | Description |
|------------|------|----------|-------------|
| `stripe_event_id` | text | Yes | Unique Stripe webhook event ID |
| `user_id` | relation | Yes | Reference to users collection |
| `tenant_id` | text | Yes | Tenant identifier |
| `amount` | number | Yes | Payment amount in euros |
| `status` | text | Yes | Payment status |
| `event_type` | text | Yes | Type of payment event |

### Field Configuration

```javascript
// stripe_event_id
{
  "name": "stripe_event_id",
  "type": "text", 
  "required": true,
  "unique": true,
  "max": 100
}

// user_id (relation to users)
{
  "name": "user_id",
  "type": "relation",
  "required": true,
  "options": {
    "collectionId": "users",
    "cascadeDelete": false,
    "maxSelect": 1,
    "displayFields": ["email", "name"]
  }
}

// tenant_id
{
  "name": "tenant_id", 
  "type": "text",
  "required": true,
  "unique": false,
  "max": 100
}

// amount
{
  "name": "amount",
  "type": "number",
  "required": true,
  "min": 0
}

// status
{
  "name": "status",
  "type": "text",
  "required": true,
  "max": 50,
  "options": ["completed", "failed", "pending", "canceled", "refunded"]
}

// event_type
{
  "name": "event_type", 
  "type": "text",
  "required": true,
  "max": 100,
  "options": [
    "subscription_started", 
    "invoice_paid", 
    "payment_failed", 
    "subscription_canceled",
    "refund_issued"
  ]
}
```

## 3. API Rules & Permissions

### Users Collection
- **List/View:** Only authenticated users can see their own records
- **Create:** Allow user registration
- **Update:** Users can update their own records, API can update billing fields
- **Delete:** Admins only

### Payment History Collection
- **List/View:** Admins only (contains sensitive payment data)
- **Create:** API only (via webhook processing)  
- **Update:** API only
- **Delete:** Admins only

## 4. Indexes for Performance

Add these indexes for better query performance:

### Users Collection Indexes
```sql
-- Index for Stripe customer lookups
CREATE INDEX idx_users_stripe_customer ON users(stripe_customer_id);

-- Index for subscription queries  
CREATE INDEX idx_users_subscription ON users(subscription_id);

-- Index for tenant subscription queries
CREATE INDEX idx_users_tenant_subscription ON users(tenant_id, subscription_status);
```

### Payment History Indexes
```sql
-- Index for event ID lookups (prevent duplicate processing)
CREATE INDEX idx_payment_history_event ON payment_history(stripe_event_id);

-- Index for user payment history
CREATE INDEX idx_payment_history_user ON payment_history(user_id, created);

-- Index for tenant payment history
CREATE INDEX idx_payment_history_tenant ON payment_history(tenant_id, created);
```

## 5. Migration Commands (if using PocketBase JS SDK)

If you need to programmatically create these collections:

```javascript
// Create payment_history collection
await pb.collections.create({
  "name": "payment_history",
  "type": "base", 
  "schema": [
    {
      "name": "stripe_event_id",
      "type": "text",
      "required": true,
      "options": {
        "max": 100
      }
    },
    {
      "name": "user_id", 
      "type": "relation",
      "required": true,
      "options": {
        "collectionId": "users",
        "cascadeDelete": false,
        "maxSelect": 1
      }
    },
    // ... other fields
  ]
})

// Update users collection (add fields)
await pb.collections.update("users", {
  "schema": [
    // ... existing fields
    {
      "name": "stripe_customer_id",
      "type": "text", 
      "required": false,
      "options": {
        "max": 100
      }
    },
    // ... other new fields
  ]
})
```

## 6. Testing the Schema

After creating the collections, test with:

```javascript
// Test creating a payment record
const paymentRecord = await pb.collection('payment_history').create({
  stripe_event_id: 'evt_test_webhook',
  user_id: 'user123',
  tenant_id: 'tenant456', 
  amount: 29.00,
  status: 'completed',
  event_type: 'subscription_started'
})

// Test updating user with Stripe info
const user = await pb.collection('users').update('user123', {
  stripe_customer_id: 'cus_test_customer',
  subscription_id: 'sub_test_subscription',
  subscription_status: 'active',
  plan_id: 'starter'
})
```