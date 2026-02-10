#!/bin/sh
# Initialize PocketBase Collections via API
# This script runs once on first startup to create required collections

echo "🔧 Initializing CloudFreedom Collections..."

# Wait for PocketBase to be ready
sleep 5

# Admin login to get token
ADMIN_TOKEN=$(curl -s -X POST http://localhost:8090/api/admins/auth-with-password \
  -H "Content-Type: application/json" \
  -d "{\"identity\":\"${POCKETBASE_ADMIN_EMAIL}\",\"password\":\"${POCKETBASE_ADMIN_PASSWORD}\"}" \
  | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$ADMIN_TOKEN" ]; then
  echo "⚠️  Could not authenticate admin - collections may need to be created manually"
  exit 0
fi

echo "✅ Admin authenticated"

# Function to check if collection exists
collection_exists() {
  curl -s -X GET "http://localhost:8090/api/collections/$1" \
    -H "Authorization: $ADMIN_TOKEN" \
    | grep -q "\"id\":"
}

# Create tenants collection
if ! collection_exists "tenants"; then
  echo "Creating tenants collection..."
  curl -X POST http://localhost:8090/api/collections \
    -H "Authorization: $ADMIN_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "name": "tenants",
      "type": "base",
      "schema": [
        {"name": "name", "type": "text", "required": true},
        {"name": "slug", "type": "text", "required": true},
        {"name": "domain", "type": "text"},
        {"name": "type", "type": "select", "required": true, "options": {"values": ["internal", "demo", "dev", "enterprise"], "maxSelect": 1}},
        {"name": "status", "type": "select", "required": true, "options": {"values": ["active", "inactive", "pending"], "maxSelect": 1}}
      ],
      "indexes": ["CREATE UNIQUE INDEX idx_tenants_slug ON tenants (slug)"],
      "listRule": "@request.auth.id != \"\"",
      "viewRule": "@request.auth.id != \"\"",
      "createRule": null,
      "updateRule": null,
      "deleteRule": null
    }'
  echo "✅ Tenants collection created"
else
  echo "✅ Tenants collection already exists"
fi

# Create products collection  
if ! collection_exists "products"; then
  echo "Creating products collection..."
  curl -X POST http://localhost:8090/api/collections \
    -H "Authorization: $ADMIN_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "name": "products",
      "type": "base",
      "schema": [
        {"name": "name", "type": "text", "required": true},
        {"name": "description", "type": "text"},
        {"name": "price", "type": "number", "required": true},
        {"name": "currency", "type": "text", "required": true},
        {"name": "budget_included", "type": "number", "required": true},
        {"name": "models", "type": "json"},
        {"name": "features", "type": "json"},
        {"name": "rate_limit", "type": "number"},
        {"name": "active", "type": "bool"}
      ],
      "listRule": "@request.auth.id != \"\"",
      "viewRule": "@request.auth.id != \"\"",
      "createRule": null,
      "updateRule": null,
      "deleteRule": null
    }'
  echo "✅ Products collection created"
else
  echo "✅ Products collection already exists"
fi

# Create custom users collection (for app users, not admin)
if ! collection_exists "cf_users"; then
  echo "Creating cf_users collection..."
  curl -X POST http://localhost:8090/api/collections \
    -H "Authorization: $ADMIN_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "name": "cf_users",
      "type": "base",
      "schema": [
        {"name": "email", "type": "email", "required": true},
        {"name": "name", "type": "text"},
        {"name": "role", "type": "select", "required": true, "options": {"values": ["admin", "tenant_admin", "user"], "maxSelect": 1}},
        {"name": "status", "type": "select", "required": true, "options": {"values": ["active", "inactive", "pending"], "maxSelect": 1}},
        {"name": "tenant_id", "type": "text", "required": true},
        {"name": "product_id", "type": "text"},
        {"name": "budget_total", "type": "number"},
        {"name": "budget_used", "type": "number"},
        {"name": "budget_remaining", "type": "number"},
        {"name": "budget_reset_date", "type": "date"},
        {"name": "litellm_api_key", "type": "text"}
      ],
      "indexes": ["CREATE UNIQUE INDEX idx_cf_users_email ON cf_users (email)"],
      "listRule": "@request.auth.id != \"\"",
      "viewRule": "@request.auth.id != \"\"",
      "createRule": null,
      "updateRule": null,
      "deleteRule": null
    }'
  echo "✅ cf_users collection created"
else
  echo "✅ cf_users collection already exists"
fi

# Create usage_logs collection
if ! collection_exists "usage_logs"; then
  echo "Creating usage_logs collection..."
  curl -X POST http://localhost:8090/api/collections \
    -H "Authorization: $ADMIN_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "name": "usage_logs",
      "type": "base",
      "schema": [
        {"name": "tenant_id", "type": "text", "required": true},
        {"name": "user_id", "type": "text", "required": true},
        {"name": "model", "type": "text", "required": true},
        {"name": "prompt_tokens", "type": "number"},
        {"name": "completion_tokens", "type": "number"},
        {"name": "total_tokens", "type": "number"},
        {"name": "cost_total", "type": "number", "required": true},
        {"name": "timestamp", "type": "date"}
      ],
      "indexes": [
        "CREATE INDEX idx_usage_logs_tenant ON usage_logs (tenant_id)",
        "CREATE INDEX idx_usage_logs_user ON usage_logs (user_id)",
        "CREATE INDEX idx_usage_logs_timestamp ON usage_logs (timestamp)"
      ],
      "listRule": "@request.auth.id != \"\"",
      "viewRule": "@request.auth.id != \"\"",
      "createRule": null,
      "updateRule": null,
      "deleteRule": null
    }'
  echo "✅ usage_logs collection created"
else
  echo "✅ usage_logs collection already exists"
fi

echo "🎉 Collections initialization complete!"

