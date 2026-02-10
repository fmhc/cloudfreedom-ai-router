# 🚀 FIRST TENANT DEPLOYMENT - Quick Guide

**Status:** Ready for deployment
**Tenant:** Internal (app.cloudfreedom.de)

---

## 🎯 Quick Deployment in Coolify UI

### 1. Navigate to Project
- Open: https://coolify.enubys.de/project/pwos0c0cks8wk0ckg4084w0o/environment/ikw0c8ko0cgkscc0cgkscckk
- Click **"+ New"** button

### 2. Select "Private Repository (with Deploy Key)"
- Scroll to "Git Based" section
- Click on **"Private Repository (with Deploy Key)"**

### 3. Configure Repository
```
Git Repository: https://gitlab.enubys.de/finn/tenant-template.git
Branch: main
Build Pack: Docker Compose
Docker Compose Location: /docker-compose.yml
```

### 4. Set Environment Variables (CRITICAL!)

Click on "Environment Variables" after creation and add:

```bash
# Tenant Configuration
TENANT_SLUG=app
TENANT_NAME=CloudFreedom Internal
TENANT_ID=internal-001

# LiteLLM Master Key (generate with: openssl rand -base64 32)
LITELLM_MASTER_KEY=<generate_new_key>

# AI Provider API Keys
OPENAI_API_KEY=<your_openai_key>
ANTHROPIC_API_KEY=<your_anthropic_key>
GOOGLE_API_KEY=<your_google_key>

# CloudFreedom Integration
POCKETBASE_URL=https://api.cloudfreedom.de
BILLING_API_URL=https://billing.cloudfreedom.de
BILLING_API_KEY=<from_billing_api_env>

# Database (generate with: openssl rand -base64 32)
POSTGRES_DB=cloudfreedom_app
POSTGRES_USER=cloudfreedom
POSTGRES_PASSWORD=<generate_secure_password>

# Redis (generate with: openssl rand -base64 32)
REDIS_PASSWORD=<generate_secure_password>

# PocketBase OAuth (create in PocketBase Admin)
POCKETBASE_OAUTH_CLIENT_ID=<create_in_pocketbase>
POCKETBASE_OAUTH_CLIENT_SECRET=<create_in_pocketbase>

# OpenWebUI Settings
ENABLE_SIGNUP=false
```

### 5. Configure Domains

In Coolify, navigate to the application and set domains for each service:

**LiteLLM (Service: litellm):**
```
Domain: https://ai.cloudfreedom.de
```

**OpenWebUI (Service: openwebui):**
```
Domain: https://app.cloudfreedom.de
```

### 6. Deploy!

Click **"Deploy"** button and wait for services to start.

---

## 🔐 Security Keys Generation

Generate all secrets before deployment:

```bash
# LiteLLM Master Key
openssl rand -base64 32

# Postgres Password
openssl rand -base64 32

# Redis Password
openssl rand -base64 32

# Billing API Key (if not already set)
openssl rand -base64 32
```

---

## 📝 DNS Configuration

Add these DNS records to cloudfreedom.de:

```
A   ai.cloudfreedom.de   →  46.243.203.26
A   app.cloudfreedom.de  →  46.243.203.26
```

---

## ✅ Post-Deployment Checklist

After deployment:

1. [ ] Check service status in Coolify (all should be "running:healthy")
2. [ ] Test LiteLLM: `curl https://ai.cloudfreedom.de/health`
3. [ ] Test OpenWebUI: `curl https://app.cloudfreedom.de`
4. [ ] Create OAuth2 App in PocketBase Admin
5. [ ] Update environment variables with OAuth credentials
6. [ ] Redeploy to apply OAuth settings
7. [ ] Test login flow
8. [ ] Test LLM requests through LiteLLM
9. [ ] Verify usage tracking in Billing API

---

## 🎉 Expected Result

After successful deployment:

- **LiteLLM Proxy:** https://ai.cloudfreedom.de (API Gateway for ChatGPT, Claude, Gemini)
- **OpenWebUI:** https://app.cloudfreedom.de (User-facing chat interface)
- **Postgres:** Internal (database for both services)
- **Redis:** Internal (caching and rate limiting)

---

## 🔧 Troubleshooting

**Services not starting?**
- Check logs in Coolify
- Verify all environment variables are set
- Ensure DNS propagation is complete

**OAuth not working?**
- Create OAuth2 App in PocketBase: https://api.cloudfreedom.de/_/
- Settings → OAuth2 Applications → New Application
- Set Redirect URI: `https://app.cloudfreedom.de/auth/callback`

**LiteLLM not connecting to PocketBase?**
- Verify `POCKETBASE_URL` and `BILLING_API_URL` are correct
- Check network connectivity between services
- Ensure `BILLING_API_KEY` matches in both environments

---

**Ready to deploy? Let's go! 🚀**

