#!/usr/bin/env node

/**
 * Script to create PocketBase collections via POST API
 * Based on PocketBase v0.30.2 source code analysis
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
    const cfUsersCollection = {
      name: 'cf_users',
      type: 'base',
      system: false,
      fields: [
        {
          type: 'email',
          name: 'email',
          required: true,
          presentable: true,
          exceptDomains: null,
          onlyDomains: null
        },
        {
          type: 'text',
          name: 'name',
          required: true,
          presentable: true,
          min: 1,
          max: 255,
          pattern: ''
        },
        {
          type: 'text',
          name: 'tenant_id',
          required: true,
          presentable: false
        },
        {
          type: 'text',
          name: 'product_id',
          required: true,
          presentable: false
        },
        {
          type: 'select',
          name: 'role',
          required: true,
          presentable: false,
          maxSelect: 1,
          values: ['user', 'tenant_admin', 'super_admin']
        },
        {
          type: 'select',
          name: 'status',
          required: true,
          presentable: false,
          maxSelect: 1,
          values: ['pending', 'active', 'suspended']
        },
        {
          type: 'number',
          name: 'budget_limit',
          required: false,
          presentable: false,
          min: 0,
          noDecimal: false
        },
        {
          type: 'number',
          name: 'budget_used',
          required: false,
          presentable: false,
          min: 0,
          noDecimal: false
        },
        {
          type: 'text',
          name: 'api_key',
          required: false,
          presentable: false
        },
        {
          type: 'date',
          name: 'last_login',
          required: false,
          presentable: false
        }
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
    };

    const cfUsersRes = await fetch(`${PB_URL}/api/collections`, {
      method: 'POST',
      headers,
      body: JSON.stringify(cfUsersCollection)
    });

    if (!cfUsersRes.ok) {
      const error = await cfUsersRes.text();
      console.error(`❌ Failed to create cf_users: ${cfUsersRes.status}`, error);
    } else {
      const result = await cfUsersRes.json();
      console.log('✅ cf_users collection created:', result.id);
    }

    // Create usage_logs collection
    console.log('\n📊 Creating usage_logs collection...');
    const usageLogsCollection = {
      name: 'usage_logs',
      type: 'base',
      system: false,
      fields: [
        {
          type: 'text',
          name: 'tenant_id',
          required: true,
          presentable: false
        },
        {
          type: 'text',
          name: 'user_id',
          required: true,
          presentable: false
        },
        {
          type: 'text',
          name: 'model',
          required: true,
          presentable: false,
          max: 255
        },
        {
          type: 'number',
          name: 'input_tokens',
          required: true,
          presentable: false,
          min: 0,
          noDecimal: false
        },
        {
          type: 'number',
          name: 'output_tokens',
          required: true,
          presentable: false,
          min: 0,
          noDecimal: false
        },
        {
          type: 'number',
          name: 'total_tokens',
          required: true,
          presentable: false,
          min: 0,
          noDecimal: false
        },
        {
          type: 'number',
          name: 'cost',
          required: true,
          presentable: false,
          min: 0,
          noDecimal: false
        },
        {
          type: 'text',
          name: 'request_id',
          required: false,
          presentable: false
        },
        {
          type: 'json',
          name: 'metadata',
          required: false,
          presentable: false
        }
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
    };

    const usageLogsRes = await fetch(`${PB_URL}/api/collections`, {
      method: 'POST',
      headers,
      body: JSON.stringify(usageLogsCollection)
    });

    if (!usageLogsRes.ok) {
      const error = await usageLogsRes.text();
      console.error(`❌ Failed to create usage_logs: ${usageLogsRes.status}`, error);
    } else {
      const result = await usageLogsRes.json();
      console.log('✅ usage_logs collection created:', result.id);
    }

    console.log('\n🎉 Collections setup complete!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createCollections();

