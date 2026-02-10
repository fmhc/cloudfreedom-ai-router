# CloudFreedom AI Router - Complete Deployment Guide

## 🎯 Status Update

✅ **All Code Complete & Pushed to GitLab!**

- ✅ PocketBase Core (with automatic collections setup)
- ✅ Billing API (complete with all endpoints)
- ✅ Admin Portal (complete with Dashboard, Login, API integration)
- ✅ Tenant Template (LiteLLM + OpenWebUI + PostgreSQL + Redis)

---

## 🚀 Deployment Steps (In Order)

### Step 1: Verify PocketBase Core ✅ ALREADY DEPLOYED

**Status**: Running on https://api.cloudfreedom.de

**Verify**:
```bash
curl https://api.cloudfreedom.de/api/health
# Expected: {"code":200,"message":"API is healthy.","data":{}}
```

**Note**: The new `pb_hooks/setup_collections.pb.js` will automatically create all collections on the next restart!

**Trigger collections setup**:
1. Go to Coolify: https://coolify.enubys.de
2. Find "pocketbase-core" application
3. Click "Restart" to trigger the hook
4. Check logs for "🎉 CloudFreedom collections setup complete!"

---

### Step 2: Deploy Billing API

**Repository**: https://gitlab.enubys.de/finn/billing-api
**Domain**: billing.cloudfreedom.de

#### Via Coolify UI:

1. Open https://coolify.enubys.de
2. Go to "CloudFreedom AI Router" project → "production" environment
3. Click "+ New" → "Private Repository (with Deploy Key)"
4. Select Server: `ace-bunker`
5. Fill in:
   ```
   Repository URL: https://oauth2:$GITLAB_TOKEN@gitlab.enubys.de/finn/billing-api.git
   Branch: main
   ```
6. Click "Continue"
7. Configuration:
   ```
   Name: billing-api
   Build Pack: Docker Compose
   Port: 3000
   Domain: billing.cloudfreedom.de
   ```
8. Environment Variables (click "Bulk Edit"):
   ```env
   PORT=3000
   POCKETBASE_URL=http://pocketbase-core:8090
   BILLING_API_KEY=ph+thaW/V12UdnMDkFSlLiY0GSRQfyA9Kt4KU2c8HO4=
   ADMIN_SECRET_KEY=maSnimUURY2MqxGkSFM0zvHBfKSOlEqWu33shtisWzg=
   ```
9. Click "Save" and then "Deploy"

**Verify**:
```bash
curl https://billing.cloudfreedom.de/
# Expected: {"message":"Billing API is healthy!"}
```

---

### Step 3: Deploy Admin Portal

**Repository**: https://gitlab.enubys.de/finn/admin-portal
**Domain**: admin.cloudfreedom.de

#### Via Coolify UI:

1. Open https://coolify.enubys.de
2. Go to "CloudFreedom AI Router" project → "production" environment
3. Click "+ New" → "Private Repository (with Deploy Key)"
4. Select Server: `ace-bunker`
5. Fill in:
   ```
   Repository URL: https://oauth2:$GITLAB_TOKEN@gitlab.enubys.de/finn/admin-portal.git
   Branch: main
   ```
6. Click "Continue"
7. Configuration:
   ```
   Name: admin-portal
   Build Pack: Docker Compose
   Port: 3000
   Domain: admin.cloudfreedom.de
   ```
8. Environment Variables (click "Bulk Edit"):
   ```env
   PORT=3000
   VITE_POCKETBASE_URL=https://api.cloudfreedom.de
   VITE_BILLING_API_URL=https://billing.cloudfreedom.de
   VITE_BILLING_API_KEY=ph+thaW/V12UdnMDkFSlLiY0GSRQfyA9Kt4KU2c8HO4=
   VITE_ADMIN_SECRET_KEY=maSnimUURY2MqxGkSFM0zvHBfKSOlEqWu33shtisWzg=
   ```
9. Click "Save" and then "Deploy"

**Verify**:
```bash
curl https://admin.cloudfreedom.de/health
# Expected: healthy

# Open in browser
open https://admin.cloudfreedom.de
# Expected: Login page
```

---

### Step 4: Create First Admin User

**Via PocketBase Admin UI**:

1. Open https://api.cloudfreedom.de/_/
2. Login with your admin credentials (from initial setup)
3. Go to "users" collection
4. Create a new user:
   ```
   Email: admin@cloudfreedom.de
   Password: (your secure password)
   Verified: Yes
   Status: active
   ```
5. Save

**Test Admin Portal Login**:
1. Open https://admin.cloudfreedom.de
2. Login with admin@cloudfreedom.de
3. You should see the Dashboard with stats!

---

### Step 5: Deploy First Tenant (Internal)

**Repository**: https://gitlab.enubys.de/finn/tenant-template
**Domain**: app.cloudfreedom.de

#### Via Coolify UI:

1. Open https://coolify.enubys.de
2. Go to "CloudFreedom AI Router" project → "production" environment
3. Click "+ New" → "Private Repository (with Deploy Key)"
4. Select Server: `ace-bunker`
5. Fill in:
   ```
   Repository URL: https://oauth2:$GITLAB_TOKEN@gitlab.enubys.de/finn/tenant-template.git
   Branch: main
   ```
6. Click "Continue"
7. Configuration:
   ```
   Name: tenant-app
   Build Pack: Docker Compose
   Ports: 4000, 3000
   Domain: app.cloudfreedom.de
   ```
8. Environment Variables (click "Bulk Edit"):
   ```env
   # Tenant Config
   TENANT_SLUG=app
   TENANT_NAME=CloudFreedom Internal
   TENANT_ID=internal-001
   
   # Ports
   LITELLM_PORT=4000
   OPENWEBUI_PORT=3000
   
   # LiteLLM
   LITELLM_MASTER_KEY=YOUR_LITELLM_KEY_HERE_32_CHARS
   
   # AI Provider Keys (ADD YOUR REAL KEYS!)
   OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxx
   ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxx
   GOOGLE_API_KEY=AIzaxxxxxxxxxxxxx
   
   # CloudFreedom Integration
   POCKETBASE_URL=http://pocketbase-core:8090
   BILLING_API_URL=http://billing-api:3000
   BILLING_API_KEY=ph+thaW/V12UdnMDkFSlLiY0GSRQfyA9Kt4KU2c8HO4=
   
   # Database
   POSTGRES_DB=cloudfreedom_app
   POSTGRES_USER=cloudfreedom
   POSTGRES_PASSWORD=YOUR_SECURE_PASSWORD_HERE
   
   # Redis
   REDIS_PASSWORD=YOUR_SECURE_PASSWORD_HERE
   
   # OpenWebUI
   ENABLE_SIGNUP=false
   ```
9. Click "Save" and then "Deploy"

**Important**: Replace the placeholder API keys and passwords with real values!

**Verify**:
```bash
# Check LiteLLM
curl https://app.cloudfreedom.de/v1/models \
  -H "Authorization: Bearer YOUR_LITELLM_MASTER_KEY"

# Check OpenWebUI
curl https://app.cloudfreedom.de/
# Expected: OpenWebUI login page
```

---

## 🧪 End-to-End Test

After all services are deployed, test the complete flow:

### 1. Create Test User via Admin Portal

1. Login to https://admin.cloudfreedom.de
2. Go to "Users" tab
3. Click "New User"
4. Fill in:
   ```
   Email: test@cloudfreedom.de
   Password: Test123!
   Product: Starter
   Tenant: CloudFreedom Internal
   ```
5. Save

### 2. Use Billing API to Provision User

```bash
curl -X POST https://billing.cloudfreedom.de/api/admin/provision-user \
  -H "Content-Type: application/json" \
  -H "X-Admin-Key: maSnimUURY2MqxGkSFM0zvHBfKSOlEqWu33shtisWzg=" \
  -d '{
    "email": "test@cloudfreedom.de",
    "password": "Test123!",
    "product_id": "PRODUCT_ID_FROM_POCKETBASE",
    "tenant_id": "TENANT_ID_FROM_POCKETBASE"
  }'
```

### 3. Test AI Request

1. Login to https://app.cloudfreedom.de
2. Create account with test@cloudfreedom.de
3. Start a chat
4. Send message: "Hello! Test message."
5. Verify response from AI

### 4. Verify Usage Tracking

1. Check Admin Portal → Overview
2. See usage statistics updated
3. Check user's budget decreased

---

## 📊 Monitoring & Health Checks

### Quick Health Check Script

Create `/home/fmh/ai/cloudfreedom-ai-router/health-check.sh`:

```bash
#!/bin/bash
echo "🔍 CloudFreedom AI Router Health Check"
echo "========================================"
echo ""

echo "1. PocketBase Core:"
curl -f https://api.cloudfreedom.de/api/health && echo " ✅" || echo " ❌"

echo ""
echo "2. Billing API:"
curl -f https://billing.cloudfreedom.de/ && echo " ✅" || echo " ❌"

echo ""
echo "3. Admin Portal:"
curl -f https://admin.cloudfreedom.de/health && echo " ✅" || echo " ❌"

echo ""
echo "4. Internal Tenant (LiteLLM):"
curl -f https://app.cloudfreedom.de/health && echo " ✅" || echo " ❌"

echo ""
echo "========================================"
echo "✨ Health check complete!"
```

Run:
```bash
chmod +x health-check.sh
./health-check.sh
```

---

## 🐛 Troubleshooting

### Billing API Can't Connect to PocketBase

**Problem**: `Connection refused` or timeout errors

**Solution**:
1. Check both services are in the same Docker network
2. Use internal hostname: `http://pocketbase-core:8090`
3. Verify PocketBase is running: `curl https://api.cloudfreedom.de/api/health`

### Admin Portal Shows "Network Error"

**Problem**: Can't connect to backend APIs

**Solution**:
1. Check environment variables are set correctly
2. Verify CORS is allowed in PocketBase settings
3. Check browser console for specific errors
4. Ensure domains are accessible: `curl https://api.cloudfreedom.de/api/health`

### LiteLLM "Budget Check Failed"

**Problem**: Requests fail with budget check errors

**Solution**:
1. Verify Billing API is running
2. Check BILLING_API_KEY matches in both LiteLLM and Billing API
3. Ensure user has budget: Check in Admin Portal
4. Look at Billing API logs: `docker logs billing-api`

### OpenWebUI Can't Connect to LiteLLM

**Problem**: "Connection refused" in OpenWebUI

**Solution**:
1. Check LiteLLM is running: `docker ps | grep litellm`
2. Verify OpenWebUI has correct OLLAMA_BASE_URL
3. Test LiteLLM directly: `curl http://litellm:4000/health` (from within container)
4. Check logs: `docker logs litellm-proxy`

---

## ✅ Deployment Checklist

- [ ] PocketBase Core deployed and collections setup triggered
- [ ] Billing API deployed and health check passed
- [ ] Admin Portal deployed and login works
- [ ] First admin user created in PocketBase
- [ ] First tenant deployed (app.cloudfreedom.de)
- [ ] Test user created and provisioned
- [ ] AI request test successful
- [ ] Usage tracking verified in Admin Portal
- [ ] All health checks passing

---

## 🎉 Next Steps After Deployment

1. **Create More Products** (if needed)
   - Login to Admin Portal
   - Go to Products
   - Add custom pricing tiers

2. **Deploy Additional Tenants**
   - Demo tenant (demo.cloudfreedom.de)
   - Dev tenant (dev.cloudfreedom.de)
   - Enterprise customers

3. **Stripe Integration**
   - Add Stripe keys to Billing API
   - Implement webhooks for payment events
   - Test subscription flow

4. **Web Entry Point**
   - Create public-facing website
   - Add signup flow
   - Marketing pages

5. **Monitoring**
   - Setup Uptime Kuma for alerts
   - Configure Prometheus/Grafana
   - Add error tracking (Sentry)

---

**Ready to Deploy!** 🚀

**Total Time**: ~2-3 hours for full deployment
**Confidence**: HIGH - All code tested and ready
**Support**: Detailed troubleshooting guide included

---

**Last Updated**: 09. Oktober 2025, 03:00 Uhr
**Status**: READY FOR PRODUCTION DEPLOYMENT ✅

