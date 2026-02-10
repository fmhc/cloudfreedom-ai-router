# CloudFreedom Billing API

Budget management and usage tracking API for CloudFreedom AI Router.

## 🚀 Deployment

### Coolify Setup

**Project:** CloudFreedom AI Router  
**Service Type:** Docker Compose  
**Domain:** billing.cloudfreedom.de  
**Repository:** gitlab.enubys.de/finn/billing-api

### Environment Variables

```bash
PORT=3000
POCKETBASE_URL=http://pocketbase:8090
BILLING_API_KEY=<secure-key>
ADMIN_SECRET_KEY=<secure-key>
```

Generate secure keys:
```bash
openssl rand -base64 32
```

### First Deploy

1. In Coolify:
   - New Resource → Docker Compose
   - Connect GitLab repo (gitlab.enubys.de/finn/billing-api)
   - Set environment variables
   - Deploy

2. API will be available at: https://billing.cloudfreedom.de

## 📋 API Endpoints

### Public Endpoints

#### Health Check
```http
GET /
```

Returns API health status.

### Protected Endpoints (Require X-API-Key header)

#### Check Budget
```http
POST /api/check-budget
X-API-Key: <BILLING_API_KEY>
Content-Type: application/json

{
  "user_id": "user123",
  "model": "gpt-4",
  "tokens_input": 100,
  "tokens_output": 200,
  "cost_estimate": 0.05
}
```

Response:
```json
{
  "allowed": true,
  "budget": {
    "total": 50.00,
    "used": 12.34,
    "remaining": 37.66
  },
  "status": "active",
  "message": "OK"
}
```

#### Log Usage
```http
POST /api/log-usage
X-API-Key: <BILLING_API_KEY>
Content-Type: application/json

{
  "user_id": "user123",
  "model": "gpt-4",
  "request_id": "req_abc123",
  "tokens_input": 100,
  "tokens_output": 200,
  "cost_total": 0.05,
  "response_time": 1234
}
```

Response:
```json
{
  "message": "Usage logged and budget updated successfully"
}
```

### Admin Endpoints (Require X-Admin-Key header)

#### Reset Monthly Budgets
```http
POST /api/admin/reset-budgets
X-Admin-Key: <ADMIN_SECRET_KEY>
```

Resets all user budgets (typically triggered by cron job or n8n).

#### Provision New User
```http
POST /api/admin/provision-user
X-Admin-Key: <ADMIN_SECRET_KEY>
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "secure-password",
  "product_id": "prod_abc123",
  "tenant_id": "tenant_xyz"
}
```

Response:
```json
{
  "message": "User provisioned successfully",
  "user": { ... }
}
```

## 🔧 Development

### Local Development

```bash
# Install dependencies
bun install

# Start development server
bun run index.js
```

### Testing

```bash
# Health check
curl http://localhost:3000/

# Check budget
curl -X POST http://localhost:3000/api/check-budget \
  -H "X-API-Key: super-secret-billing-key" \
  -H "Content-Type: application/json" \
  -d '{"user_id":"test123","model":"gpt-4","cost_estimate":0.05}'
```

## 🏗️ Architecture

```
Billing API (Hono + Bun)
├── Budget Checks (Pre-request validation)
├── Usage Logging (Post-request tracking)
├── Budget Updates (Real-time deduction)
└── Admin Functions (User provisioning, budget resets)
```

## 🔗 Integration

### LiteLLM Proxy Integration

Configure LiteLLM to call Billing API for budget checks:

```yaml
litellm_settings:
  success_callback: ["billing_api"]
  failure_callback: ["billing_api"]

environment_variables:
  BILLING_API_URL: "http://billing-api:3000"
  BILLING_API_KEY: "your-api-key"
```

### n8n Workflow Integration

Monthly budget reset workflow:
1. Trigger: Schedule (1st of each month, 00:00)
2. HTTP Request: POST to `/api/admin/reset-budgets`
3. Notification: Send email to admin with results

## 📊 Monitoring

- Health check endpoint: `/`
- Logs available via Coolify interface
- Metrics: Request count, response time, error rate

## 🔐 Security

- API key authentication for all endpoints
- Admin endpoints require separate admin key
- CORS configured for specific origins
- Rate limiting (TODO: implement with Redis)

## 📝 Notes

- Connects to PocketBase Core via internal Docker network
- Uses `cloudfreedom-network` for service discovery
- Runs on Bun runtime (faster than Node.js)
- Stateless design for horizontal scaling


