# CloudFreedom AI Router - Deployment Guide

## 🚀 Schnell-Deployment

### 1. Billing API deployen (JETZT!)

#### Option A: Über Coolify UI (Empfohlen)
1. Öffne Coolify: https://coolify.enubys.de
2. Navigiere zu "CloudFreedom AI Router" Projekt
3. Klicke "+ New"
4. Wähle "Private Repository (with Deploy Key)"
5. Fülle aus:
   ```
   Repository URL: https://oauth2:$GITLAB_TOKEN@gitlab.enubys.de/finn/billing-api.git
   Branch: main
   Destination: Standalone Docker (coolify)
   Server: ace-bunker
   ```
6. Nach Erstellung → Configuration:
   ```
   Name: billing-api
   Build Pack: Docker Compose
   Docker Compose Location: /docker-compose.yml
   Domain: billing.cloudfreedom.de
   ```
7. Environment Variables:
   ```bash
   PORT=3000
   POCKETBASE_URL=http://pocketbase-core:8090
   BILLING_API_KEY=ph+thaW/V12UdnMDkFSlLiY0GSRQfyA9Kt4KU2c8HO4=
   ADMIN_SECRET_KEY=maSnimUURY2MqxGkSFM0zvHBfKSOlEqWu33shtisWzg=
   ```
8. Klicke "Deploy"

#### Option B: Via Terminal (Für erfahrene Nutzer)
```bash
cd /home/fmh/ai/cloudfreedom-ai-router/billing-api

# Generate .env from example
cp env.example .env

# Edit with actual values
nano .env

# Deploy via Docker Compose
docker-compose up -d

# Check logs
docker-compose logs -f
```

### 2. Admin Portal deployen (nach UI fertig)

```bash
cd /home/fmh/ai/cloudfreedom-ai-router/admin-portal

# Install dependencies
bun install

# Build for production
bun run build

# Create Dockerfile
cat > Dockerfile << 'EOF'
FROM node:20-alpine
WORKDIR /app
COPY dist ./dist
RUN npm install -g serve
CMD ["serve", "-s", "dist", "-l", "3000"]
EXPOSE 3000
EOF

# Create docker-compose.yml
cat > docker-compose.yml << 'EOF'
version: '3.8'
services:
  admin-portal:
    build: .
    container_name: admin-portal
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - VITE_POCKETBASE_URL=http://pocketbase-core:8090
      - VITE_BILLING_API_URL=http://billing-api:3000
      - VITE_BILLING_API_KEY=${BILLING_API_KEY}
    networks:
      - cloudfreedom-network
    labels:
      - "coolify.managed=true"
      - "coolify.type=application"
      - "coolify.name=admin-portal"

networks:
  cloudfreedom-network:
    external: true
EOF

# Push to GitLab
git init
git add .
git commit -m "Initial commit: Admin Portal"
git branch -M main
git remote add origin https://oauth2:$GITLAB_TOKEN@gitlab.enubys.de/finn/admin-portal.git
git push -u origin main

# Then deploy in Coolify UI
```

### 3. Tenant Instance deployen

```bash
cd /home/fmh/ai/cloudfreedom-ai-router/tenant-template

# Create .env for internal tenant
cat > .env << 'EOF'
# Tenant Configuration
TENANT_SLUG=app
TENANT_NAME=CloudFreedom Internal
TENANT_ID=internal-001

# Ports
LITELLM_PORT=4000
OPENWEBUI_PORT=3000

# LiteLLM
LITELLM_MASTER_KEY=$(openssl rand -base64 32)

# AI Provider API Keys
OPENAI_API_KEY=sk-xxx
ANTHROPIC_API_KEY=sk-ant-xxx
GOOGLE_API_KEY=AIzxxx

# CloudFreedom Integration
POCKETBASE_URL=http://pocketbase-core:8090
BILLING_API_URL=http://billing-api:3000
BILLING_API_KEY=ph+thaW/V12UdnMDkFSlLiY0GSRQfyA9Kt4KU2c8HO4=

# Database
POSTGRES_DB=cloudfreedom_app
POSTGRES_USER=cloudfreedom
POSTGRES_PASSWORD=$(openssl rand -base64 32)

# Redis
REDIS_PASSWORD=$(openssl rand -base64 32)

# PocketBase OAuth (for OpenWebUI)
POCKETBASE_OAUTH_CLIENT_ID=xxx
POCKETBASE_OAUTH_CLIENT_SECRET=xxx

# Signup
ENABLE_SIGNUP=false
EOF

# Deploy
docker-compose up -d

# Check logs
docker-compose logs -f

# Push to GitLab for Coolify deployment
git init
git add .
git commit -m "Initial commit: Tenant Template"
git branch -M main
git remote add origin https://oauth2:$GITLAB_TOKEN@gitlab.enubys.de/finn/tenant-template.git
git push -u origin main
```

## 🔧 PocketBase Collections Setup

Nach dem ersten Deployment von PocketBase Core, erstelle diese Collections manuell:

### 1. Öffne PocketBase Admin UI
```
https://api.cloudfreedom.de/_/
```

### 2. Erstelle Collections

#### Collection: `tenants`
```json
{
  "name": "tenants",
  "type": "base",
  "schema": [
    {"name": "name", "type": "text", "required": true},
    {"name": "slug", "type": "text", "required": true, "unique": true},
    {"name": "domain", "type": "text"},
    {"name": "type", "type": "select", "options": ["internal", "demo", "dev", "enterprise"]},
    {"name": "status", "type": "select", "options": ["active", "inactive", "pending"], "default": "pending"}
  ]
}
```

#### Collection: `products`
```json
{
  "name": "products",
  "type": "base",
  "schema": [
    {"name": "name", "type": "text", "required": true},
    {"name": "slug", "type": "text", "required": true, "unique": true},
    {"name": "description", "type": "text"},
    {"name": "price", "type": "number", "required": true},
    {"name": "currency", "type": "text", "default": "EUR"},
    {"name": "budget_included", "type": "number", "default": 0},
    {"name": "features", "type": "json"}
  ]
}
```

#### Collection: `users` (erweitere die bestehende Collection)
```json
{
  "schema": [
    // ... existing fields (email, password, etc.)
    {"name": "status", "type": "select", "options": ["active", "inactive", "pending"], "default": "pending"},
    {"name": "product_id", "type": "relation", "collectionId": "products"},
    {"name": "tenant_id", "type": "relation", "collectionId": "tenants"},
    {"name": "budget_total", "type": "number"},
    {"name": "budget_used", "type": "number", "default": 0},
    {"name": "budget_remaining", "type": "number"},
    {"name": "budget_reset_date", "type": "date"},
    {"name": "litellm_api_key", "type": "text", "unique": true}
  ]
}
```

#### Collection: `usage_logs`
```json
{
  "name": "usage_logs",
  "type": "base",
  "schema": [
    {"name": "user_id", "type": "relation", "collectionId": "users", "required": true},
    {"name": "model", "type": "text", "required": true},
    {"name": "request_id", "type": "text"},
    {"name": "tokens_input", "type": "number"},
    {"name": "tokens_output", "type": "number"},
    {"name": "total_tokens", "type": "number"},
    {"name": "cost_total", "type": "number", "required": true},
    {"name": "response_time", "type": "number"}
  ]
}
```

### 3. Erstelle Test-Daten

#### Test Product (Starter)
```json
{
  "name": "Starter",
  "slug": "starter",
  "description": "Perfect for individuals",
  "price": 9.99,
  "currency": "EUR",
  "budget_included": 25,
  "features": ["ChatGPT 4o-mini", "Claude 3.5 Haiku", "Email Support"]
}
```

#### Test Tenant (Internal)
```json
{
  "name": "CloudFreedom Internal",
  "slug": "app",
  "domain": "app.cloudfreedom.de",
  "type": "internal",
  "status": "active"
}
```

## 🧪 Testing nach Deployment

### 1. Test PocketBase Core
```bash
# Health Check
curl https://api.cloudfreedom.de/api/health

# List Products
curl https://api.cloudfreedom.de/api/collections/products/records
```

### 2. Test Billing API
```bash
# Health Check
curl https://billing.cloudfreedom.de/

# Check Budget (requires API key)
curl -X POST https://billing.cloudfreedom.de/api/check-budget \
  -H "Content-Type: application/json" \
  -H "X-API-Key: ph+thaW/V12UdnMDkFSlLiY0GSRQfyA9Kt4KU2c8HO4=" \
  -d '{"user_id":"test123","model":"gpt-4","cost_estimate":0.05}'
```

### 3. Test Admin Portal
```bash
# Open in browser
open https://admin.cloudfreedom.de

# Login with test credentials
```

### 4. Test Tenant Instance (LiteLLM)
```bash
# List Models
curl https://app.cloudfreedom.de/v1/models \
  -H "Authorization: Bearer YOUR_LITELLM_KEY"

# Test Chat Completion
curl https://app.cloudfreedom.de/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_LITELLM_KEY" \
  -d '{
    "model": "gpt-4o-mini",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'
```

## 🐛 Troubleshooting

### Billing API startet nicht
```bash
# Check logs
docker logs billing-api

# Check if PocketBase Core is reachable
docker exec billing-api curl http://pocketbase-core:8090/api/health

# Check environment variables
docker exec billing-api env | grep POCKETBASE
```

### Admin Portal kann nicht auf Backend zugreifen
```bash
# Check network
docker network inspect cloudfreedom-network

# Check if services are in same network
docker inspect pocketbase-core | grep NetworkMode
docker inspect billing-api | grep NetworkMode
docker inspect admin-portal | grep NetworkMode
```

### LiteLLM kann keine Requests verarbeiten
```bash
# Check logs
docker-compose logs litellm

# Verify API keys
docker-compose exec litellm env | grep API_KEY

# Test direct connection to OpenAI
docker-compose exec litellm curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"
```

## 📊 Monitoring

### Service Health Checks
```bash
# Create health check script
cat > /home/fmh/ai/cloudfreedom-ai-router/health-check.sh << 'EOF'
#!/bin/bash
echo "Checking CloudFreedom Services..."
echo ""

echo "1. PocketBase Core:"
curl -f https://api.cloudfreedom.de/api/health && echo " ✅" || echo " ❌"

echo "2. Billing API:"
curl -f https://billing.cloudfreedom.de/ && echo " ✅" || echo " ❌"

echo "3. Admin Portal:"
curl -f https://admin.cloudfreedom.de/ && echo " ✅" || echo " ❌"

echo "4. LiteLLM (Internal Tenant):"
curl -f https://app.cloudfreedom.de/health && echo " ✅" || echo " ❌"

echo ""
echo "Done!"
EOF

chmod +x health-check.sh
./health-check.sh
```

### Setup Uptime Monitoring (mit Uptime Kuma)
```bash
# Deploy Uptime Kuma
docker run -d \
  --name uptime-kuma \
  --network cloudfreedom-network \
  -p 3001:3001 \
  -v uptime-kuma:/app/data \
  louislam/uptime-kuma:1

# Add monitors in UI for all services
```

## 🎯 Next Steps nach Deployment

1. ✅ Alle Services laufen
2. ✅ Health Checks erfolgreich
3. ✅ Test-User erstellt
4. ✅ Test AI Request erfolgreich
5. 📋 Stripe Integration
6. 📋 Web Entry Point
7. 📋 Private Beta User einladen

---

**Status**: Ready for Deployment
**Estimated Time**: 2-3 hours (inkl. Testing)
**Support**: support@cloudfreedom.de

