#!/usr/bin/env node

/**
 * Script to create PocketBase collections via API
 * Run with: node create_collections.js
 */

const PB_URL = 'https://api.cloudfreedom.de';
const ADMIN_EMAIL = 'admin@cloudfreedom.de';
const ADMIN_PASSWORD = 'yD8kL2mN9pX3vQ6wR5tF1zC4hJ7bG0sA';

async function createCollections() {
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
    console.log('✅ Authenticated successfully');

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': token
    };

    // Create cf_users collection
    console.log('\n📦 Creating cf_users collection...');
    const cfUsersRes = await fetch(`${PB_URL}/api/collections`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        name: 'cf_users',
        type: 'base',
        system: false,
        schema: [
          { name: 'email', type: 'email', required: true, options: { exceptDomains: null, onlyDomains: null } },
          { name: 'name', type: 'text', required: true, options: { min: 1, max: 255, pattern: '' } },
          { name: 'tenant_id', type: 'text', required: true, options: {} },
          { name: 'product_id', type: 'text', required: true, options: {} },
          { name: 'role', type: 'select', required: true, options: { maxSelect: 1, values: ['user', 'tenant_admin', 'super_admin'] } },
          { name: 'status', type: 'select', required: true, options: { maxSelect: 1, values: ['pending', 'active', 'suspended'] } },
          { name: 'budget_limit', type: 'number', required: false, options: { min: 0 } },
          { name: 'budget_used', type: 'number', required: false, options: { min: 0 } },
          { name: 'api_key', type: 'text', required: false, options: {} },
          { name: 'last_login', type: 'date', required: false, options: {} }
        ],
        indexes: [
          'CREATE UNIQUE INDEX idx_cf_users_email ON cf_users (email)',
          'CREATE INDEX idx_cf_users_tenant ON cf_users (tenant_id)'
        ],
        listRule: "@request.auth.id != ''",
        viewRule: "@request.auth.id != ''",
        createRule: null,
        updateRule: null,
        deleteRule: null
      })
    });

    if (!cfUsersRes.ok) {
      const error = await cfUsersRes.text();
      console.error(`❌ Failed to create cf_users: ${cfUsersRes.status}`, error);
    } else {
      console.log('✅ cf_users collection created');
    }

    // Create usage_logs collection
    console.log('\n📊 Creating usage_logs collection...');
    const usageLogsRes = await fetch(`${PB_URL}/api/collections`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        name: 'usage_logs',
        type: 'base',
        system: false,
        schema: [
          { name: 'tenant_id', type: 'text', required: true, options: {} },
          { name: 'user_id', type: 'text', required: true, options: {} },
          { name: 'model', type: 'text', required: true, options: { max: 255 } },
          { name: 'input_tokens', type: 'number', required: true, options: { min: 0 } },
          { name: 'output_tokens', type: 'number', required: true, options: { min: 0 } },
          { name: 'total_tokens', type: 'number', required: true, options: { min: 0 } },
          { name: 'cost', type: 'number', required: true, options: { min: 0 } },
          { name: 'request_id', type: 'text', required: false, options: {} },
          { name: 'metadata', type: 'json', required: false, options: {} }
        ],
        indexes: [
          'CREATE INDEX idx_usage_logs_tenant ON usage_logs (tenant_id)',
          'CREATE INDEX idx_usage_logs_user ON usage_logs (user_id)',
          'CREATE INDEX idx_usage_logs_created ON usage_logs (created)'
        ],
        listRule: "@request.auth.id != ''",
        viewRule: "@request.auth.id != ''",
        createRule: null,
        updateRule: null,
        deleteRule: null
      })
    });

    if (!usageLogsRes.ok) {
      const error = await usageLogsRes.text();
      console.error(`❌ Failed to create usage_logs: ${usageLogsRes.status}`, error);
    } else {
      console.log('✅ usage_logs collection created');
    }

    console.log('\n🎉 Collections setup complete!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createCollections();

