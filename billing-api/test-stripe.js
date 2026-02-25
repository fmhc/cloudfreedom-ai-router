#!/usr/bin/env node

/**
 * Simple test script for Stripe integration
 * Run with: node test-stripe.js
 * 
 * Make sure to:
 * 1. Start the billing API server
 * 2. Have Stripe test keys in your .env
 * 3. Have PocketBase running with proper collections
 */

import fetch from 'node-fetch'

const API_BASE = 'http://localhost:3000'

// Test data
const testData = {
  plan_id: 'starter',
  tenant_id: 'test_tenant_123',
  user_id: 'test_user_456',
  success_url: 'https://app.cloudfreedom.ai/success',
  cancel_url: 'https://app.cloudfreedom.ai/cancel'
}

async function testHealthCheck() {
  console.log('🏥 Testing health check...')
  try {
    const response = await fetch(`${API_BASE}/health`)
    const data = await response.json()
    console.log('✅ Health check passed:', data)
    return true
  } catch (error) {
    console.error('❌ Health check failed:', error.message)
    return false
  }
}

async function testCreateCheckoutSession(authToken) {
  console.log('💳 Testing checkout session creation...')
  try {
    const response = await fetch(`${API_BASE}/api/stripe/create-checkout-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(testData)
    })

    const data = await response.json()
    
    if (response.ok) {
      console.log('✅ Checkout session created:')
      console.log('   Session ID:', data.session_id)
      console.log('   Checkout URL:', data.checkout_url)
      return data
    } else {
      console.error('❌ Checkout session failed:', data)
      return null
    }
  } catch (error) {
    console.error('❌ Checkout session error:', error.message)
    return null
  }
}

async function testWebhookEndpoint() {
  console.log('🔗 Testing webhook endpoint (should fail auth)...')
  try {
    const response = await fetch(`${API_BASE}/api/stripe/webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Note: Missing Stripe-Signature header on purpose
      },
      body: JSON.stringify({ test: 'webhook' })
    })

    const data = await response.json()
    
    if (response.status === 400 && data.error?.includes('signature')) {
      console.log('✅ Webhook properly rejects requests without valid signature')
      return true
    } else {
      console.error('❌ Webhook security issue:', data)
      return false
    }
  } catch (error) {
    console.error('❌ Webhook test error:', error.message)
    return false
  }
}

async function testSubscriptionStatus(authToken, tenantId) {
  console.log('📊 Testing subscription status...')
  try {
    const response = await fetch(`${API_BASE}/api/stripe/subscription/${tenantId}`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    })

    const data = await response.json()
    
    if (response.ok) {
      console.log('✅ Subscription status retrieved:')
      console.log('   Tenant ID:', data.tenant_id)
      console.log('   Active subscriptions:', data.subscription_count)
      return data
    } else {
      console.error('❌ Subscription status failed:', data)
      return null
    }
  } catch (error) {
    console.error('❌ Subscription status error:', error.message)
    return null
  }
}

async function runTests() {
  console.log('🧪 Starting Stripe Integration Tests\n')

  // Test 1: Health check
  const healthOk = await testHealthCheck()
  if (!healthOk) {
    console.log('❌ Server not running or misconfigured. Stopping tests.')
    return
  }
  console.log('')

  // Test 2: Webhook security
  await testWebhookEndpoint()
  console.log('')

  // For tests requiring auth, you'll need a valid PocketBase token
  const authToken = process.env.TEST_POCKETBASE_TOKEN
  
  if (!authToken) {
    console.log('⚠️  Skipping authenticated tests (set TEST_POCKETBASE_TOKEN)')
    console.log('   To get a token:')
    console.log('   1. Login via PocketBase admin UI or auth endpoint')
    console.log('   2. Export token: export TEST_POCKETBASE_TOKEN="your_token_here"')
    console.log('   3. Re-run this script')
    return
  }

  // Test 3: Create checkout session
  const checkout = await testCreateCheckoutSession(authToken)
  console.log('')

  // Test 4: Subscription status  
  await testSubscriptionStatus(authToken, testData.tenant_id)
  console.log('')

  console.log('🏁 Test complete!')
  console.log('')
  console.log('Next steps:')
  console.log('1. Test actual payment flow using checkout URL')
  console.log('2. Set up Stripe CLI webhook forwarding')  
  console.log('3. Verify PocketBase collections are created')
  console.log('4. Test customer portal functionality')
}

// Run tests
runTests().catch(console.error)