# 🚀 DEPLOY FIRST TENANT WITH GOOGLE GEMINI - Quick Guide

**Status:** ✅ **READY TO DEPLOY!**
**Date:** 2025-10-09

---

## 📋 **Pre-Flight Check:**

- [x] Core services deployed (PocketBase, Billing API, Admin Portal)
- [x] DNS configured (`app.cloudfreedom.de` → `46.243.203.26`)
- [x] Google Gemini API Key available
- [x] Secrets generated and saved locally
- [x] Tenant template ready in GitLab

---

## 🎯 **DEPLOYMENT STEPS:**

### 1. Open Coolify and Create New Application

```
URL: https://coolify.enubys.de/project/pwos0c0cks8wk0ckg4084w0o/environment/ikw0c8ko0cgkscc0cgkscckk

Click: "+ New" → "Private Repository (with Deploy Key)"
```

### 2. Configure Repository

```
Git Repository: https://gitlab.enubys.de/finn/tenant-template.git
Branch: main
Build Pack: Docker Compose
Docker Compose Location: /docker-compose.yml
```

### 3. Set Domain

```
Domain: app.cloudfreedom.de
```

### 4. Add Environment Variables

**Copy-Paste diese Werte in Coolify:**

```bash
# Tenant Configuration
TENANT_SLUG=app
TENANT_NAME=CloudFreedom Internal
TENANT_ID=internal-001

# LiteLLM Master Key
LITELLM_MASTER_KEY=Wn1iHJzCsGGwzmByhO7uzxU0SoJ6oOlVH5si999qJS4=

# Google Vertex AI (Gemini) - EU Frankfurt
GOOGLE_API_KEY=AIzaSyDyAEJrnNnVYlt5IgfVleMwAzJO4dSz8Dw
VERTEX_PROJECT=complead-crawl
VERTEX_LOCATION=europe-west3

# CloudFreedom Integration
POCKETBASE_URL=https://api.cloudfreedom.de
BILLING_API_URL=https://billing.cloudfreedom.de
BILLING_API_KEY=hU/qikq0/vumeqVUHjsngQlLFUPYzP543tyZsd+ZYwU=

# Database
POSTGRES_DB=cloudfreedom_app
POSTGRES_USER=cloudfreedom
POSTGRES_PASSWORD=yryImXCdZv3jVz7BbeX+WKdd47r6tMAxVIsyU5s4E34=

# Redis
REDIS_PASSWORD=rAIBUohtAdTw9psdHG7qUiVP3mfTD1Y0kMv1jikPqKs=

# OpenWebUI
ENABLE_SIGNUP=false
```

### 5. Deploy!

```
Click: "Deploy" button
Wait: ~5-10 minutes for build & deployment
```

---

## ✅ **POST-DEPLOYMENT TESTING:**

### 1. Check Service Health

```bash
# LiteLLM Health
curl https://app.cloudfreedom.de/health

# OpenWebUI
curl -I https://app.cloudfreedom.de
```

### 2. Test Gemini API via LiteLLM

```bash
curl https://app.cloudfreedom.de/v1/chat/completions \
  -H "Authorization: Bearer Wn1iHJzCsGGwzmByhO7uzxU0SoJ6oOlVH5si999qJS4=" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gemini-1.5-flash",
    "messages": [
      {"role": "user", "content": "Hello from CloudFreedom!"}
    ]
  }'
```

### 3. Create First User in PocketBase

```
URL: https://api.cloudfreedom.de/_/
Login: admin@cloudfreedom.de / CloudFr33dom2025!

Go to: Collections > users
Click: "+ New Record"
Fill:
  - email: test@cloudfreedom.de
  - password: Test123456
  - status: active
  - product_id: (select a product)
  - tenant_id: internal-001
  - budget_total: 100.00
  - budget_remaining: 100.00
```

### 4. Login to OpenWebUI

```
URL: https://app.cloudfreedom.de
Login: test@cloudfreedom.de / Test123456

Test Chat:
  - Select Model: Gemini 1.5 Flash
  - Send Message: "Hallo, bitte antworte auf Deutsch!"
  - Check Response
```

---

## 📊 **AVAILABLE MODELS (Gemini):**

| Model | Name in LiteLLM | Input Cost | Output Cost | Context |
|-------|-----------------|------------|-------------|---------|
| Gemini 1.5 Flash | `gemini-1.5-flash` | $0.075 / 1M tokens | $0.30 / 1M tokens | 1M tokens |
| Gemini 1.5 Pro | `gemini-1.5-pro` | $1.25 / 1M tokens | $5.00 / 1M tokens | 2M tokens |

**Region:** EU Frankfurt (europe-west3) ✅ DSGVO-konform

---

## 🔧 **TROUBLESHOOTING:**

### Problem: Services nicht erreichbar
```bash
# Check Coolify Logs
Coolify UI → Application → Logs

# Check DNS
dig app.cloudfreedom.de +short
# Should return: 46.243.203.26

# Check Port Exposure
docker ps | grep app
```

### Problem: Gemini API Error
```bash
# Verify API Key
curl "https://generativelanguage.googleapis.com/v1beta/models?key=AIzaSyDyAEJrnNnVYlt5IgfVleMwAzJO4dSz8Dw"

# Check LiteLLM Logs
docker logs app-litellm
```

### Problem: Budget Check Failed
```bash
# Check Billing API
curl https://billing.cloudfreedom.de/health

# Check User in PocketBase
# Ensure budget_total > 0 and status = 'active'
```

---

## 🎉 **ERFOLG!**

Wenn alles funktioniert:
1. ✅ OpenWebUI läuft auf `https://app.cloudfreedom.de`
2. ✅ Gemini API antwortet über LiteLLM
3. ✅ Budget Tracking funktioniert
4. ✅ EU-Hosting in Frankfurt

---

## 📅 **NÄCHSTE SCHRITTE:**

### Phase 2: AWS Bedrock (Claude)
- AWS Account einloggen
- Bedrock in eu-central-1 aktivieren
- Claude Access beantragen
- Keys generieren und hinzufügen

### Phase 3: Azure OpenAI (GPT-4o)
- Azure Subscription aktivieren
- OpenAI Service erstellen
- Germany West Central Deployment
- Keys generieren und hinzufügen

### Phase 4: Privacy Features
- Presidio PII Detection
- Data Masking Layer
- Audit Logging erweitern

### Phase 5: Storage & RAG
- Garage S3 Storage
- Vector Database (Qdrant/Weaviate)
- RAG Pipeline

---

**🚀 BEREIT ZUM DEPLOYEN? Los geht's!**

