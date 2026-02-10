# 🚀 CloudFreedom AI Router - Project Overview

## 📋 GitLab Repositories

### Core Services (Always Running)

1. **pocketbase-core** ✅ CREATED
   - Repo: `gitlab.com/cloudfreedom/pocketbase-core`
   - Domain: `api.cloudfreedom.de`
   - Type: Docker Compose
   - Purpose: Central auth & data storage

2. **billing-api** 🔨 IN PROGRESS
   - Repo: `gitlab.com/cloudfreedom/billing-api`
   - Domain: `billing.cloudfreedom.de`
   - Type: Bun + Hono (Dockerfile)
   - Purpose: Usage tracking & budget management

3. **admin-portal** 📝 TODO
   - Repo: `gitlab.com/cloudfreedom/admin-portal`
   - Domain: `admin.cloudfreedom.de`
   - Type: React + Vite (Static Site)
   - Purpose: Tenant & user management UI

4. **sales-portal** 📝 TODO
   - Repo: `gitlab.com/cloudfreedom/sales-portal`
   - Domain: `sales.cloudfreedom.de`
   - Type: React + Vite (Static Site)
   - Purpose: Lead management & onboarding

### Tenant Template

5. **tenant-template** 📝 TODO
   - Repo: `gitlab.com/cloudfreedom/tenant-template`
   - Domains: Variable (`{slug}.cloudfreedom.de`)
   - Type: Docker Compose
   - Purpose: Blueprint for customer deployments

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   cloudfreedom.de                           │
└─────────────────────────────────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┬─────────────────┐
        │                 │                 │                 │
        ▼                 ▼                 ▼                 ▼
   ┌────────┐        ┌────────┐      ┌────────┐        ┌────────┐
   │  api.  │        │billing.│      │ admin. │        │ sales. │
   │        │◄───────│        │◄─────│        │        │        │
   └────────┘        └────────┘      └────────┘        └────────┘
   PocketBase         Billing        Admin Portal      Sales Portal
   (Docker)           API (Bun)      (React+Vite)      (React+Vite)
        ▲                 ▲
        │                 │
        └─────────────────┴──────────────────────────┐
                          │                          │
                    ┌─────┴─────┐            ┌───────┴──────┐
                    │   app.    │            │   demo.      │
                    │           │            │              │
                    └───────────┘            └──────────────┘
                  Tenant Internal           Tenant Demo
                  (Docker Compose)          (Docker Compose)
```

---

## 🔧 Tech Stack

### Backend
- **PocketBase**: SQLite + Auth + REST API
- **Bun**: Fast JavaScript runtime
- **Hono**: Ultra-fast web framework
- **TypeScript**: Type safety

### Frontend
- **React 19**: Latest React with new features
- **Vite 6**: Lightning-fast build tool
- **Shadcn/ui**: Modern component library
- **Tailwind CSS 4**: Utility-first CSS
- **TanStack Router**: Type-safe routing
- **TanStack Query**: Server state management

### DevOps
- **GitLab**: Source control
- **Coolify**: Deployment platform (coolify.enubys.de)
- **Docker**: Containerization
- **Traefik**: Reverse proxy (built into Coolify)

---

## 📦 Coolify Deployment

### Project Setup

**Coolify Project:** `CloudFreedom AI Router`

### Services Configuration

| Service | Type | Repository | Domain | Deploy |
|---------|------|------------|--------|--------|
| PocketBase Core | Docker Compose | pocketbase-core | api.cloudfreedom.de | Auto |
| Billing API | Dockerfile | billing-api | billing.cloudfreedom.de | Auto |
| Admin Portal | Static Site | admin-portal | admin.cloudfreedom.de | Auto |
| Sales Portal | Static Site | sales-portal | sales.cloudfreedom.de | Auto |
| Tenant: CloudFreedom | Docker Compose | tenant-template | app.cloudfreedom.de | Manual |
| Tenant: Demo | Docker Compose | tenant-template | demo.cloudfreedom.de | Manual |
| Tenant: Dev | Docker Compose | tenant-template | dev.cloudfreedom.de | Auto |

---

## 🔐 Environment Variables

### PocketBase Core
```bash
POCKETBASE_ADMIN_EMAIL=admin@cloudfreedom.de
POCKETBASE_ADMIN_PASSWORD=<secure>
```

### Billing API
```bash
POCKETBASE_URL=https://api.cloudfreedom.de
POCKETBASE_ADMIN_TOKEN=<admin-token>
STRIPE_SECRET_KEY=<stripe-key>
STRIPE_WEBHOOK_SECRET=<webhook-secret>
```

### Admin Portal
```bash
VITE_POCKETBASE_URL=https://api.cloudfreedom.de
VITE_BILLING_API_URL=https://billing.cloudfreedom.de
```

### Tenant Template
```bash
TENANT_SLUG=<slug>
TENANT_DOMAIN=<slug>.cloudfreedom.de
POCKETBASE_URL=https://api.cloudfreedom.de
BILLING_API_URL=https://billing.cloudfreedom.de
LITELLM_MASTER_KEY=<generated>
OPENAI_API_KEY=<optional>
ANTHROPIC_API_KEY=<optional>
```

---

## 📊 Collections in PocketBase

### tenants
```javascript
{
  name: string          // "CloudFreedom Internal"
  slug: string          // "cloudfreedom" (unique)
  domain: string        // "app.cloudfreedom.de"
  type: enum            // internal|demo|development|customer
  status: enum          // pending|active|suspended|deleted
  services: json        // {openwebui_port: 3001, ...}
  billing_plan: string  // "enterprise"
  max_users: number     // 100
  created: datetime
  updated: datetime
}
```

### products
```javascript
{
  name: string          // "Pro Plan"
  description: string   // "Für Power-User"
  price: number         // 50.00
  currency: string      // "EUR"
  budget_included: number  // 50.00
  models: json          // ["all"] or ["gpt-4", ...]
  features: json        // ["priority_support", ...]
  rate_limit: number    // 120
  active: boolean       // true
}
```

### users (extended)
```javascript
{
  email: string
  tenant_id: string     // Foreign key to tenants
  status: enum          // pending|active|suspended
  product_id: string    // Foreign key to products
  budget_total: number  // 50.00
  budget_used: number   // 12.50
  budget_remaining: number  // 37.50
  budget_reset_date: datetime
}
```

### usage_logs
```javascript
{
  tenant_id: string
  user_id: string
  model: string         // "gpt-4-turbo"
  tokens_input: number
  tokens_output: number
  total_tokens: number
  cost_total: number    // 0.07 EUR
  timestamp: datetime
}
```

---

## 🚀 Development Workflow

### 1. Local Development
```bash
# Clone repo
git clone git@gitlab.com:cloudfreedom/<repo-name>.git
cd <repo-name>

# Install dependencies (for JS/TS projects)
bun install  # or npm install

# Run locally
bun dev      # or npm run dev

# Build
bun run build
```

### 2. Push to GitLab
```bash
git add .
git commit -m "feat: new feature"
git push origin main
```

### 3. Auto-Deploy (Coolify)
- Coolify detects push
- Builds & deploys automatically
- Updates domain with zero-downtime

---

## 📝 Next Steps

### Phase 1: Core Infrastructure (This Week)
- [x] PocketBase Core
- [ ] Billing API
- [ ] Admin Portal (basic)
- [ ] Tenant Template

### Phase 2: First Deployments (Next Week)
- [ ] Deploy to Coolify
- [ ] Configure domains
- [ ] Test 3 tenants
- [ ] Admin UI functional

### Phase 3: Customer Ready (Week 3)
- [ ] Sales Portal
- [ ] Onboarding workflow
- [ ] Billing integration
- [ ] Documentation

### Phase 4: Production (Week 4)
- [ ] First customer
- [ ] Monitoring
- [ ] Backups
- [ ] Support processes

---

## 📞 Support

**Coolify:** coolify.enubys.de  
**Domain:** cloudfreedom.de  
**GitLab:** gitlab.com/cloudfreedom/

---

Last Updated: 2025-10-08


