#!/usr/bin/env node

/**
 * Script to create test data in PocketBase
 */

const PB_URL = 'https://api.cloudfreedom.de';
const ADMIN_EMAIL = 'admin@cloudfreedom.de';
const ADMIN_PASSWORD = 'yD8kL2mN9pX3vQ6wR5tF1zC4hJ7bG0sA';

async function createTestData() {
  try {
    // Authenticate as admin
    console.log('🔐 Authenticating...');
    const authRes = await fetch(`${PB_URL}/api/admins/auth-with-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identity: ADMIN_EMAIL,
        password: ADMIN_PASSWORD
      })
    });

    if (!authRes.ok) {
      throw new Error(`Auth failed: ${authRes.status} ${await authRes.text()}`);
    }

    const { token } = await authRes.json();
    console.log('✅ Authenticated successfully\n');

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': token
    };

    // 1. Create Test Tenant
    console.log('📦 Creating test tenant...');
    const tenantRes = await fetch(`${PB_URL}/api/collections/tenants/records`, {
      method: 'POST',
      headers,
      body: JSON.stringify({})
    });

    if (!tenantRes.ok) {
      console.error(`❌ Failed to create tenant: ${tenantRes.status}`, await tenantRes.text());
      return;
    }

    const tenant = await tenantRes.json();
    console.log(`✅ Tenant created: ${tenant.id}\n`);

    // 2. Create Test Product
    console.log('🏷️  Creating test product...');
    const productRes = await fetch(`${PB_URL}/api/collections/products/records`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        name: "AI Pro Plan"
      })
    });

    if (!productRes.ok) {
      console.error(`❌ Failed to create product: ${productRes.status}`, await productRes.text());
      return;
    }

    const product = await productRes.json();
    console.log(`✅ Product created: ${product.id} - ${product.name}\n`);

    // 3. Create Test User (tenant_admin)
    console.log('👤 Creating test user (tenant_admin)...');
    const userRes = await fetch(`${PB_URL}/api/collections/cf_users/records`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        email: "admin@testcompany.com",
        name: "Test Admin",
        tenant_id: tenant.id,
        product_id: product.id,
        role: "tenant_admin",
        status: "active",
        budget_limit: 1000.00,
        budget_used: 0.00
      })
    });

    if (!userRes.ok) {
      console.error(`❌ Failed to create user: ${userRes.status}`, await userRes.text());
      return;
    }

    const user = await userRes.json();
    console.log(`✅ User created: ${user.id} - ${user.email}\n`);

    // 4. Create Test User (regular user)
    console.log('👤 Creating test user (user)...');
    const user2Res = await fetch(`${PB_URL}/api/collections/cf_users/records`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        email: "user@testcompany.com",
        name: "Test User",
        tenant_id: tenant.id,
        product_id: product.id,
        role: "user",
        status: "active",
        budget_limit: 100.00,
        budget_used: 25.50
      })
    });

    if (!user2Res.ok) {
      console.error(`❌ Failed to create user2: ${user2Res.status}`, await user2Res.text());
      return;
    }

    const user2 = await user2Res.json();
    console.log(`✅ User created: ${user2.id} - ${user2.email}\n`);

    // 5. Create Test Usage Log
    console.log('📊 Creating test usage log...');
    const logRes = await fetch(`${PB_URL}/api/collections/usage_logs/records`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        tenant_id: tenant.id,
        user_id: user2.id,
        model: "gpt-4o",
        input_tokens: 1500,
        output_tokens: 800,
        total_tokens: 2300,
        cost: 0.0345,
        request_id: "test-req-12345",
        metadata: {
          endpoint: "/v1/chat/completions",
          duration_ms: 2500
        }
      })
    });

    if (!logRes.ok) {
      console.error(`❌ Failed to create usage log: ${logRes.status}`, await logRes.text());
      return;
    }

    const log = await logRes.json();
    console.log(`✅ Usage log created: ${log.id}\n`);

    console.log('🎉 Test data creation complete!');
    console.log('\n📋 Summary:');
    console.log(`   Tenant ID: ${tenant.id}`);
    console.log(`   Product ID: ${product.id} (${product.name})`);
    console.log(`   Admin User: ${user.email} (ID: ${user.id})`);
    console.log(`   Regular User: ${user2.email} (ID: ${user2.id})`);
    console.log(`   Usage Log: ${log.id}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createTestData();

