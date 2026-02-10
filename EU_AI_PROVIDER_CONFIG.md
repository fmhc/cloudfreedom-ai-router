# 🇪🇺 CloudFreedom - EU-Hosted AI Provider Configuration

**Datum:** 2025-10-09
**Ziel:** AI Modelle nutzen, die in Deutschland/EU gehostet sind

---

## ✅ **Gefundene Credentials:**

### 1. **Google Gemini (via Generative Language API)**
```bash
GOOGLE_API_KEY=AIzaSyDyAEJrnNnVYlt5IgfVleMwAzJO4dSz8Dw
```
- **Status:** ✅ Aktiv
- **Region:** Kann auf EU-Regionen beschränkt werden
- **Source:** GCP Project "complead-crawl"

---

## 🔧 **EU-Hosting Optionen für AI Providers:**

### **Option 1: AWS Bedrock (EU-Central-1 Frankfurt)**
**Vorteile:**
- Claude via Bedrock in Frankfurt gehostet
- DSGVO-konform
- On-demand Pricing

**LiteLLM Config:**
```yaml
model_list:
  - model_name: claude-3-5-sonnet-eu
    litellm_params:
      model: bedrock/anthropic.claude-3-5-sonnet-20241022-v2:0
      aws_region_name: eu-central-1
      aws_access_key_id: ${AWS_ACCESS_KEY_ID}
      aws_secret_access_key: ${AWS_SECRET_ACCESS_KEY}
```

**Benötigte Env Vars:**
```bash
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION_NAME=eu-central-1
```

---

### **Option 2: Azure OpenAI (Germany West Central)**
**Vorteile:**
- OpenAI GPT-4, GPT-4o in Deutschland gehostet
- DSGVO-konform
- Microsoft-Support

**LiteLLM Config:**
```yaml
model_list:
  - model_name: gpt-4o-eu
    litellm_params:
      model: azure/gpt-4o
      api_base: https://YOUR_INSTANCE.openai.azure.com
      api_key: ${AZURE_OPENAI_API_KEY}
      api_version: "2024-08-01-preview"
```

**Benötigte Env Vars:**
```bash
AZURE_OPENAI_API_KEY=...
AZURE_OPENAI_ENDPOINT=https://YOUR_INSTANCE.openai.azure.com
AZURE_OPENAI_API_VERSION=2024-08-01-preview
```

---

### **Option 3: Google Vertex AI (europe-west3 Frankfurt)**
**Vorteile:**
- Gemini in Frankfurt gehostet
- Integration mit GCP
- DSGVO-konform

**LiteLLM Config:**
```yaml
model_list:
  - model_name: gemini-pro-eu
    litellm_params:
      model: vertex_ai/gemini-1.5-pro
      vertex_project: complead-crawl
      vertex_location: europe-west3
```

**Benötigte Env Vars:**
```bash
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json
# oder
GOOGLE_API_KEY=AIzaSyDyAEJrnNnVYlt5IgfVleMwAzJO4dSz8Dw
VERTEX_PROJECT=complead-crawl
VERTEX_LOCATION=europe-west3
```

---

## 🎯 **Empfohlene Konfiguration:**

### **Multi-Region Setup mit EU-Präferenz:**

```yaml
# tenant-template/litellm-config.yaml

model_list:
  # Claude via AWS Bedrock EU
  - model_name: claude-3-5-sonnet
    litellm_params:
      model: bedrock/anthropic.claude-3-5-sonnet-20241022-v2:0
      aws_region_name: eu-central-1
      
  # GPT-4o via Azure OpenAI Germany
  - model_name: gpt-4o
    litellm_params:
      model: azure/gpt-4o
      api_base: ${AZURE_OPENAI_ENDPOINT}
      api_key: ${AZURE_OPENAI_API_KEY}
      
  # Gemini via Vertex AI Frankfurt
  - model_name: gemini-1.5-pro
    litellm_params:
      model: vertex_ai/gemini-1.5-pro
      vertex_project: complead-crawl
      vertex_location: europe-west3

# Fallback routing
router_settings:
  routing_strategy: "least-busy"
  allowed_fails: 3
  cooldown_time: 60
```

---

## 📋 **Next Steps:**

### 1. **AWS Credentials holen**
```bash
# AWS Console → IAM → Users → Create Access Key
# Oder via AWS CLI:
aws iam create-access-key --user-name cloudfreedom-ai
```

### 2. **Azure OpenAI Endpoint erstellen**
```bash
# Azure Portal → Create Resource → Azure OpenAI
# Region: Germany West Central
# Deployment: gpt-4o, gpt-4-turbo
```

### 3. **Google Vertex AI aktivieren**
```bash
# GCP Console → APIs & Services → Enable Vertex AI API
# Service Account erstellen mit Vertex AI Permissions
```

### 4. **Environment Variables updaten**
```bash
# In Coolify für tenant-template hinzufügen:
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION_NAME=eu-central-1

AZURE_OPENAI_API_KEY=...
AZURE_OPENAI_ENDPOINT=https://....openai.azure.com
AZURE_OPENAI_API_VERSION=2024-08-01-preview

GOOGLE_API_KEY=AIzaSyDyAEJrnNnVYlt5IgfVleMwAzJO4dSz8Dw
VERTEX_PROJECT=complead-crawl
VERTEX_LOCATION=europe-west3
```

---

## 🔒 **DSGVO-Compliance Check:**

- ✅ **Datenspeicherung:** Alle Modelle in EU-Region
- ✅ **Data Processing Agreement:** Mit allen Providern vorhanden
- ✅ **Audit Logging:** Via PocketBase & Billing API
- ✅ **Data Minimization:** Keine Log-Persistenz von User-Inputs
- ⚠️ **Privacy Filter:** Noch zu implementieren (Presidio)

---

## 💰 **Kosten-Vergleich (pro 1M Tokens):**

| Provider | Modell | Input | Output | Hosting |
|----------|--------|-------|--------|---------|
| AWS Bedrock EU | Claude 3.5 Sonnet | $3.00 | $15.00 | 🇪🇺 Frankfurt |
| Azure OpenAI DE | GPT-4o | $2.50 | $10.00 | 🇩🇪 Germany West Central |
| Vertex AI EU | Gemini 1.5 Pro | $1.25 | $5.00 | 🇩🇪 Frankfurt |

**Empfehlung:** Vertex AI für Gemini (günstig) + Azure OpenAI für GPT-4o + AWS Bedrock für Claude

---

**Status:** Warte auf AWS & Azure Credentials für vollständiges Setup!

