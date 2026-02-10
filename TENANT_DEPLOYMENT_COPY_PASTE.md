# 🚀 First Tenant Deployment - Copy & Paste Ready

**Status:** Browser form open, ready to fill!

---

## 📋 **Form Values - Copy & Paste These!**

### 1. **Repository URL** (Already filled ✅)
```
https://oauth2:$GITLAB_TOKEN@gitlab.enubys.de/finn/tenant-template.git
```

### 2. **Branch** (Already filled ✅)
```
main
```

### 3. **Build Pack**
**Select:** `Docker Compose` (dropdown)

### 4. **Base Directory** (leave empty)
```
(leave empty / blank)
```

### 5. **Port** (nicht relevant für Docker Compose - ignorieren)
```
3000
```

### 6. **Is it a static site?**
**Uncheck** (leave unchecked)

---

## 🎯 **After clicking "Continue", set Domain:**

Navigate to **"Configuration" → "Domains"** and add:
```
app.cloudfreedom.de
```

---

## 🔐 **Environment Variables (CRITICAL!)**

Navigate to **"Configuration" → "Environment Variables"** and paste ALL of these:

```bash
# Tenant Configuration
TENANT_SLUG=app
TENANT_NAME=CloudFreedom Internal
TENANT_ID=internal-001

# LiteLLM Master Key (Generated)
LITELLM_MASTER_KEY=Wn1iHJzCsGGwzmByhO7uzxU0SoJ6oOlVH5si999qJS4=

# AI Provider API Keys (⚠️ REPLACE WITH YOUR REAL KEYS!)
OPENAI_API_KEY=sk-proj-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
ANTHROPIC_API_KEY=sk-ant-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
GOOGLE_API_KEY=AIzaXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

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

# OpenWebUI Settings
ENABLE_SIGNUP=false
```

---

## ⚠️ **IMPORTANT: Replace API Keys!**

Before deploying, you MUST replace:
- `OPENAI_API_KEY` with your real OpenAI API key
- `ANTHROPIC_API_KEY` with your real Anthropic/Claude API key  
- `GOOGLE_API_KEY` with your real Google/Gemini API key

**Where to get these:**
- OpenAI: https://platform.openai.com/api-keys
- Anthropic: https://console.anthropic.com/settings/keys
- Google: https://aistudio.google.com/app/apikey

---

## 🚀 **Deploy Steps (Summary):**

1. ✅ Fill form (Repository URL, Branch, Build Pack: Docker Compose)
2. ✅ Click "Continue"
3. ✅ Add domain: `app.cloudfreedom.de`
4. ✅ Add all environment variables (with real API keys!)
5. ✅ Click "Deploy"
6. ⏳ Wait 5-10 minutes for deployment
7. ✅ Test: `curl -I https://app.cloudfreedom.de`
8. 🎉 Open in browser: `https://app.cloudfreedom.de`

---

## 🔍 **After Deployment:**

### Verify Services are Running:
In Coolify, check that all 4 containers are "running:healthy":
- `app-litellm` (LiteLLM Proxy)
- `app-openwebui` (OpenWebUI Chat Interface)
- `app-postgres` (PostgreSQL Database)
- `app-redis` (Redis Cache)

### Access OpenWebUI:
```
https://app.cloudfreedom.de
```

You should see the OpenWebUI login/signup page!

### Create First User:
**Option 1:** Via PocketBase Admin
1. Go to `https://api.cloudfreedom.de/_/`
2. Login as admin
3. Go to "users" collection
4. Create new user with:
   - email: `your@email.com`
   - password: (set a password)
   - status: `active`
   - product_id: (select a product)
   - tenant_id: (select `internal-001`)
   - budget_total: `100` (€100)
   - budget_remaining: `100`

**Option 2:** If `ENABLE_SIGNUP=true`, sign up directly in OpenWebUI

---

## ✅ **Success Criteria:**

- [ ] Deployment completes without errors in Coolify
- [ ] All 4 services show "running:healthy"
- [ ] `https://app.cloudfreedom.de` is accessible
- [ ] OpenWebUI login page loads
- [ ] Can login/create user
- [ ] Can send a test message to ChatGPT/Claude
- [ ] Usage is logged in PocketBase `usage_logs` collection
- [ ] User budget decreases after usage

---

**You're almost there! Just fill the form and deploy! 🚀**

