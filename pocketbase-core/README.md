# CloudFreedom PocketBase Core

Central authentication and data service for CloudFreedom AI Router.

## 🚀 Deployment

### Coolify Setup

**Project:** CloudFreedom AI Router  
**Service Type:** Docker Compose  
**Domain:** api.cloudfreedom.de  
**Repository:** gitlab.enubys.de/finn/pocketbase-core

### Environment Variables

```bash
POCKETBASE_ADMIN_EMAIL=admin@cloudfreedom.de
POCKETBASE_ADMIN_PASSWORD=<secure-password>
```

### First Deploy

1. In Coolify:
   - New Resource → Docker Compose
   - Connect GitLab repo (gitlab.enubys.de/finn/pocketbase-core)
   - Set environment variables
   - Deploy

2. Access Admin UI:
   - https://api.cloudfreedom.de/_/

### Collections

The following collections need to be created manually after first deployment:

#### 1. `tenants`
- name (Text, Required)
- slug (Text, Required, Unique)
- domain (Text)
- type (Select: internal, demo, development, customer)
- status (Select: pending, active, suspended, deleted)
- services (JSON)
- billing_plan (Text)

#### 2. `products`
- name (Text, Required)
- description (Text)
- price (Number, Required)
- currency (Text, Required, Default: EUR)
- budget_included (Number, Required)
- models (JSON)
- features (JSON)
- rate_limit (Number)
- active (Bool, Default: true)

#### 3. `usage_logs`
- tenant_id (Text, Required)
- user_id (Text, Required)
- model (Text, Required)
- total_tokens (Number)
- cost_total (Number, Required)

## 📊 API Endpoints

- **Health**: `GET /api/health`
- **Admin UI**: `/_/`
- **REST API**: `/api/collections/{collection}/records`

## 🔐 Security

- Admin UI is password protected
- API requires authentication tokens
- All data is stored in SQLite (`pb_data/`)

## 📦 Backups

PocketBase data is stored in `pb_data/` volume.
Ensure regular backups via Coolify or manual exports.
