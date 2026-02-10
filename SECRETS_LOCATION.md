# 🔐 CloudFreedom Secrets - Storage Locations

**Date:** 2025-10-09
**Status:** ✅ All secrets safely stored locally

---

## 📁 **LOCAL FILES (NOT IN GIT):**

### 1. Master Backup (All Secrets)
```
Location: ~/cloudfreedom-secrets-20251009.env
Permissions: -rw------- (600) - Only you can read
Contains:
  - PocketBase Admin credentials
  - Billing API keys
  - All tenant secrets
  - AI provider keys (Gemini, Azure, AWS)
  - Deployment URLs
  - Coolify project IDs

Usage: Backup & reference
```

### 2. Tenant Production Config
```
Location: /home/fmh/ai/cloudfreedom-ai-router/tenant-template/.env.production
Permissions: -rw------- (600)
Contains:
  - Ready-to-deploy environment variables
  - Google Gemini API key
  - Database & Redis passwords
  - CloudFreedom integration keys

Usage: Copy values to Coolify UI
```

### 3. Git Repository
```
Location: /home/fmh/ai/cloudfreedom-ai-router/tenant-template/env.example
Permissions: -rw-r--r-- (644)
Contains:
  - Template with placeholders
  - Documentation
  - No actual secrets!

Usage: Reference for other tenants
Status: ✅ Safe to commit
```

---

## 🚫 **GITIGNORED FILES:**

Files that will NEVER be committed:

```bash
# In /home/fmh/ai/cloudfreedom-ai-router/tenant-template/.gitignore:
.env
.env.local
.env.production
*.db
```

**Verification:**
```bash
cd /home/fmh/ai/cloudfreedom-ai-router/tenant-template
git status --ignored
```

---

## 🔑 **QUICK ACCESS TO SECRETS:**

### For Deployment:
```bash
# Show all secrets for copy-paste to Coolify:
cat ~/cloudfreedom-secrets-20251009.env

# Or just tenant-specific:
cat /home/fmh/ai/cloudfreedom-ai-router/tenant-template/.env.production
```

### For New Tenants:
```bash
# Copy template and fill in new values:
cd /home/fmh/ai/cloudfreedom-ai-router/tenant-template
cp env.example .env.demo
nano .env.demo
```

---

## 🔐 **SECURITY BEST PRACTICES:**

### ✅ **DONE:**
- [x] Secrets stored locally (not in Git)
- [x] File permissions set to 600 (owner read-only)
- [x] `.gitignore` configured
- [x] Separate backup file in home directory
- [x] Master backup with all credentials

### 🔄 **FUTURE:**
- [ ] Use password manager (1Password, Bitwarden) for long-term storage
- [ ] Rotate secrets regularly (every 90 days)
- [ ] Use HashiCorp Vault or similar for production
- [ ] Implement secret scanning in CI/CD
- [ ] Enable 2FA for all cloud accounts

---

## 📋 **KEY INVENTORY:**

### Platform Secrets:
- ✅ PocketBase Admin Password
- ✅ Billing API Key
- ✅ Admin Secret Key

### Tenant Secrets (app.cloudfreedom.de):
- ✅ LiteLLM Master Key
- ✅ PostgreSQL Password
- ✅ Redis Password

### AI Provider Keys:
- ✅ Google Gemini API Key (ACTIVE)
- ⏳ Azure OpenAI API Key (PENDING)
- ⏳ AWS Bedrock Keys (PENDING)

---

## 🚨 **IF SECRETS ARE COMPROMISED:**

### Immediate Actions:
1. **Rotate all affected keys immediately**
2. **Check Coolify/GitLab access logs**
3. **Review PocketBase usage logs**
4. **Generate new keys with:**
   ```bash
   openssl rand -base64 32
   ```

### For AI Provider Keys:
- **Google:** Regenerate at https://console.cloud.google.com/apis/credentials
- **Azure:** Regenerate in Azure Portal
- **AWS:** Delete and create new IAM keys

---

## ✅ **VERIFICATION:**

Run this to verify no secrets in Git:

```bash
cd /home/fmh/ai/cloudfreedom-ai-router
git grep -i "AIzaSyDyAEJrnNnVYlt5IgfVleMwAzJO4dSz8Dw" || echo "✅ Google Key NOT in Git"
git grep -i "Wn1iHJzCsGGwzmByhO7uzxU0SoJ6oOlVH5si999qJS4=" || echo "✅ LiteLLM Key NOT in Git"
git grep -i "yryImXCdZv3jVz7BbeX" || echo "✅ DB Password NOT in Git"
```

**Expected Output:** All "✅ NOT in Git" messages

---

**🔐 All secrets are safely stored and ready for deployment!**
