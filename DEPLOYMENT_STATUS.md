# CloudFreedom AI Router - Deployment Status

## ✅ Completed

### GitLab Repositories
1. **pocketbase-core** - https://gitlab.enubys.de/finn/pocketbase-core
   - Initial commit pushed with docker-compose.yml, .gitignore, env.example, README.md
   
2. **billing-api** - https://gitlab.enubys.de/finn/billing-api  
   - Repository created
   - Code ready locally in `/home/fmh/ai/cloudfreedom-ai-router/billing-api`
   - **PENDING**: Push to GitLab

### Coolify Project
- **CloudFreedom AI Router** project created (UUID: pwos0c0cks8wk0ckg4084w0o)

## 🚧 In Progress

### Coolify Deployment
Currently deploying **PocketBase Core** via Browser MCP.

**Next Steps:**
1. Configure PocketBase Core as Docker Compose application
2. Set domain: `api.cloudfreedom.de`
3. Add environment variables
4. Deploy

## 📋 Pending Tasks

1. **Billing API**
   - Push code to GitLab
   - Create Dockerfile
   - Deploy to Coolify with domain: `billing.cloudfreedom.de`

2. **Admin Portal**
   - Create GitLab repo
   - Develop React 19 + Vite + Tailwind UI
   - Deploy to Coolify with domain: `admin.cloudfreedom.de`

3. **Tenant Templates**
   - Create base template with OpenWebUI + LiteLLM
   - Test deployment for `app.cloudfreedom.de`
   - Document deployment process

## 🎯 Deployment Architecture

```
cloudfreedom.de (Main domain)
├── api.cloudfreedom.de      → PocketBase Core
├── billing.cloudfreedom.de  → Billing API (Hono)
├── admin.cloudfreedom.de    → Admin Portal (React)
├── app.cloudfreedom.de      → Internal Tenant (OpenWebUI + LiteLLM)
├── demo.cloudfreedom.de     → Demo Tenant
└── dev.cloudfreedom.de      → Dev Tenant
```

## 📝 Notes

- Using GitLab at `gitlab.enubys.de` instead of GitHub
- Coolify server: `coolify.enubys.de`
- All services in project "CloudFreedom AI Router"
- Using Private Repository deployment with Deploy Keys


