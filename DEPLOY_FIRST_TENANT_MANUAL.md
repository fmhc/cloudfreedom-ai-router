# 🚀 Deploy First Tenant - Complete Manual Guide

**Date:** 2025-10-09
**Status:** Core services deployed & running, ready for tenant deployment

---

## ✅ **Pre-Deployment Checklist**

- [x] Core services deployed (PocketBase, Billing API, Admin Portal)
- [x] DNS configured for `app.cloudfreedom.de` → `46.243.203.26`
- [x] Tenant template ready in GitLab
- [x] Generated secrets available

---

## 🎯 **Step-by-Step Deployment in Coolify**

### 1. Navigate to CloudFreedom Project
- Open: `https://coolify.enubys.de`
- Go to Projects → **CloudFreedom AI Router** → **production** environment
- Click **"+ New"** button

### 2. Select "Private Repository (with Deploy Key)"
- In the list, find and click: **"Private Repository (with Deploy Key)"**
- Select destination: **"Standalone Docker (coolify)"**
- Click **Continue**

### 3. Configure Repository
```
Git Repository URL: https://gitlab.enubys.de/finn/tenant-template.git
Branch: main
Build Pack: Docker Compose
Docker Compose Location: /docker-compose.yml
Name: First Tenant (app.cloudfreedom.de)
```

Click **"Continue"** or **"Save"**

### 4. Configure Domain
- Navigate to **"Configuration" → "Domains"**
- Add domain: `app.cloudfreedom.de`
- Save

### 5. Add Environment Variables
Navigate to **"Configuration" → "Environment Variables"** and add ALL the following:

```bash
# Tenant Configuration
TENANT_SLUG=app
TENANT_NAME=CloudFreedom Internal
TENANT_ID=internal-001

# LiteLLM Master Key (Generated)
LITELLM_MASTER_KEY=Wn1iHJzCsGGwzmByhO7uzxU0SoJ6oOlVH5si999qJS4=

# AI Provider API Keys (REPLACE WITH YOUR ACTUAL KEYS!)
OPENAI_API_KEY=sk-proj-XXXXXXXXXXXXX
ANTHROPIC_API_KEY=sk-ant-XXXXXXXXXXXXXX
GOOGLE_API_KEY=AIzaXXXXXXXXXXXXXX

# CloudFreedom Integration
POCKETBASE_URL=https://api.cloudfreedom.de
BILLING_API_URL=https://billing.cloudfreedom.de
BILLING_API_KEY=hU/qikq0/vumeqVUHjsngQlLFUPYzP543tyZsd+ZYwU=

# Database (Generated)
POSTGRES_DB=cloudfreedom_app
POSTGRES_USER=cloudfreedom
POSTGRES_PASSWORD=yryImXCdZv3jVz7BbeX+WKdd47r6tMAxVIsyU5s4E34=

# Redis (Generated)
REDIS_PASSWORD=rAIBUohtAdTw9psdHG7qUiVP3mfTD1Y0kMv1jikPqKs=

# PocketBase OAuth (OPTIONAL - für SSO später)
# POCKETBASE_OAUTH_CLIENT_ID=your_oauth_client_id
# POCKETBASE_OAUTH_CLIENT_SECRET=your_oauth_client_secret

# OpenWebUI Settings
ENABLE_SIGNUP=false
```

**WICHTIG:** Ersetze `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, und `GOOGLE_API_KEY` mit deinen echten API Keys!

### 6. Deploy!
- Click **"Deploy"** button
- Watch the deployment logs
- Wait for all services to start (LiteLLM, OpenWebUI, PostgreSQL, Redis)

### 7. Verify Deployment
After deployment completes, check:

```bash
# From terminal:
curl -I https://app.cloudfreedom.de
```

Expected: HTTP 200 or redirect to OpenWebUI login

---

## 🔍 **Post-Deployment Testing**

### 1. Access OpenWebUI
- Open: `https://app.cloudfreedom.de`
- Should see OpenWebUI login page

### 2. Create First User (if ENABLE_SIGNUP=true)
- Or configure users via PocketBase Admin

### 3. Test AI Integration
- Login to OpenWebUI
- Try sending a message to test AI routing

---

## 🐛 **Troubleshooting**

### If services don't start:
1. Check logs in Coolify: **Deployments → View Logs**
2. Verify all environment variables are set
3. Ensure AI API keys are valid
4. Check Docker network configuration

### If domain doesn't resolve:
1. Verify DNS: `dig +short app.cloudfreedom.de`
2. Check Coolify domain configuration
3. Wait for Let's Encrypt certificate (can take 5-10 minutes)

---

## ✅ **Success Criteria**

- [ ] Deployment completes without errors
- [ ] `https://app.cloudfreedom.de` is accessible
- [ ] OpenWebUI login page loads
- [ ] Can create/login user
- [ ] Can send messages to AI models
- [ ] Billing tracking works (check PocketBase usage_logs)

---

## 📝 **Next Steps After First Tenant**

1. **Create first user in PocketBase Admin**
2. **Test full workflow:** Sign up → Activate → Use AI → Check billing
3. **Deploy additional tenants** (demo, dev) with different TENANT_SLUG
4. **Configure monitoring** (check service health, usage logs)
5. **Enable Let's Encrypt** (should happen automatically)

---

**You got this! 🚀**
