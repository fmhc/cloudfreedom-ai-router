# 🚀 CloudFreedom - Port Management & API Key Security Strategy

**Erstellt:** 2025-10-10  
**Status:** MVP Implementation Plan  
**Version:** 1.0

---

## 📡 PORT MANAGEMENT STRATEGY

### Port Range Selection

**Gewählte Range: 9000-9999**
- ✅ Nicht standardmäßig von gängigen Services verwendet
- ✅ Außerhalb der "Well-Known Ports" (0-1023)
- ✅ Außerhalb der "Registered Ports" für häufige Services (3000-8999)
- ✅ Leicht zu merken und zu dokumentieren

### Port Allocation Schema

**⚠️ UPDATE: Tenants brauchen KEINE eigenen Ports!**

Traefik routet via Domain, nicht via Port. Alle Tenants nutzen die gleichen internen Ports.

```
Core Services (Standard Ports):
├── 8090: PocketBase Core API (intern)
├── 80: Admin Portal (intern)
└── 3000: Billing API (intern)

Tenant Services (ALLE gleiche Ports intern!):
├── 4000: LiteLLM Proxy (intern, alle Tenants)
├── 8080: OpenWebUI (intern, alle Tenants)
├── 5432: PostgreSQL (intern, nur Container-Netzwerk)
└── 6379: Redis (intern, nur Container-Netzwerk)

Extern (Traefik HTTPS):
├── 443 → api.cloudfreedom.de (PocketBase)
├── 443 → admin.cloudfreedom.de (Admin Portal)
├── 443 → billing.cloudfreedom.de (Billing API)
├── 443 → chat.cloudfreedom.de (Internal Tenant OpenWebUI)
├── 443 → demo.cloudfreedom.de (Demo Tenant OpenWebUI)
└── 443 → public.cloudfreedom.de (Public Tenant OpenWebUI)

Development & Testing (Lokale Port-Mappings):
├── 9000: Local PocketBase → 8090
├── 9001: Local Admin Portal → 80
├── 9002: Local Billing API → 3000
├── 9100: Local Tenant LiteLLM → 4000
└── 9101: Local Tenant OpenWebUI → 8080
```

### Port Mapping Rules

**Production (Coolify/Traefik):**
```yaml
# Internal Port → External HTTPS via Traefik
9000 → https://api.cloudfreedom.de
9001 → https://admin.cloudfreedom.de
9002 → https://billing.cloudfreedom.de
9100 → https://app.cloudfreedom.de (LiteLLM)
9101 → https://chat.cloudfreedom.de (OpenWebUI)
9110 → https://demo.cloudfreedom.de (LiteLLM)
9111 → https://demo-chat.cloudfreedom.de (OpenWebUI)
```

**Local Development:**
```yaml
# Direct Port Access
localhost:9000 → PocketBase Admin UI
localhost:9001 → Admin Portal
localhost:9002 → Billing API
localhost:9910 → Local LiteLLM
localhost:9911 → Local OpenWebUI
```

---

## 🔐 API KEY SECURITY STRATEGY

### Option 1: Centralized Secret Management (HashiCorp Vault)

**Pros:**
- ✅ Industry-standard encryption
- ✅ Automatic key rotation
- ✅ Audit logging
- ✅ Fine-grained access control
- ✅ Dynamic secrets generation

**Cons:**
- ❌ Additional infrastructure complexity
- ❌ Learning curve
- ❌ Overkill for MVP
- ❌ Cost/Resource overhead

**Verdict:** ⚠️ **Too complex for MVP** - Phase 2 feature

---

### Option 2: PocketBase Encrypted Fields + Doppler/Infisical

**Pros:**
- ✅ PocketBase native encryption
- ✅ Modern secret management UI
- ✅ Team collaboration features
- ✅ CI/CD integration
- ✅ Version control for secrets

**Cons:**
- ❌ Additional service dependency
- ❌ Monthly cost ($5-15/month)
- ❌ Extra configuration step

**Verdict:** ⚠️ **Good for Scale** - Consider for Phase 1.5

---

### Option 3: Environment Variables + PocketBase Field Encryption (MVP)

**Pros:**
- ✅ Simple implementation
- ✅ No additional services
- ✅ Works with existing infrastructure
- ✅ PocketBase has built-in encryption
- ✅ Easy to audit and debug
- ✅ **RECOMMENDED FOR MVP**

**Cons:**
- ⚠️ Manual secret rotation
- ⚠️ Secrets in .env files (but encrypted in DB)

**Verdict:** ✅ **BEST FOR MVP** - Implement immediately

---

### Option 4: AWS Secrets Manager / GCP Secret Manager

**Pros:**
- ✅ Cloud-native integration
- ✅ Automatic key rotation
- ✅ IAM-based access control
- ✅ Audit logging

**Cons:**
- ❌ Vendor lock-in
- ❌ Additional cost
- ❌ Complexity
- ❌ Not needed for self-hosted

**Verdict:** ❌ **Not suitable** - We're on self-hosted infrastructure

---

## 🎯 CHOSEN MVP STRATEGY: Option 3

### Implementation Plan

#### 1. Secret Types & Storage Locations

```yaml
Secret Categories:
  1. Core Infrastructure Secrets (Environment Variables)
     - POCKETBASE_ADMIN_PASSWORD
     - BILLING_API_KEY
     - POSTGRES_MASTER_PASSWORD
     - REDIS_MASTER_PASSWORD
     Storage: Coolify encrypted env vars + Local .env (gitignored)

  2. AI Provider API Keys (PocketBase Encrypted Fields)
     - OPENAI_API_KEY
     - ANTHROPIC_API_KEY
     - GOOGLE_API_KEY
     - AZURE_OPENAI_API_KEY
     Storage: PocketBase `tenant_provider_keys` collection

  3. User API Keys (PocketBase Encrypted Fields)
     - User litellm_api_key in `cf_users` collection
     Storage: PocketBase with automatic hashing/encryption

  4. Tenant Secrets (Environment Variables per Tenant)
     - LITELLM_MASTER_KEY (per tenant)
     - POSTGRES_PASSWORD (per tenant)
     - REDIS_PASSWORD (per tenant)
     Storage: Coolify per-service env vars
```

#### 2. Encryption Strategy

**PocketBase Built-in Encryption:**
```javascript
// cf_users collection
{
  "api_key": {
    "type": "text",
    "required": true,
    "hidden": true,  // Never exposed in API responses
    "system": false
  }
}
```

**Field-Level Security:**
```javascript
// API Rules in PocketBase
listRule: "@request.auth.id != ''" // Authenticated only
viewRule: "@request.auth.id = id"  // Owner only
createRule: "@request.auth.role = 'admin'" // Admin only
updateRule: "@request.auth.id = id || @request.auth.role = 'admin'"
deleteRule: "@request.auth.role = 'admin'"
```

#### 3. Secret Generation Standards

```bash
# API Keys (64 char hex)
openssl rand -hex 32

# Passwords (32 char base64)
openssl rand -base64 32

# JWT Secrets (256 bit)
openssl rand -base64 32

# LiteLLM Master Keys (with prefix)
echo "sk-$(openssl rand -hex 32)"
```

#### 4. Secret Rotation Policy

```yaml
Rotation Schedule:
  - Admin Passwords: Every 90 days
  - Billing API Key: Every 180 days
  - User API Keys: On user request
  - AI Provider Keys: As per provider policy
  - Database Passwords: Every 365 days (with downtime window)

Rotation Process:
  1. Generate new secret
  2. Update in PocketBase/Coolify
  3. Restart affected services
  4. Verify connectivity
  5. Archive old secret (for rollback)
  6. Document in change log
```

#### 5. Access Control Matrix

```
+--------------------------+--------+-------+-------+-------+
| Secret Type              | Admin  | User  | Tenant| Public|
+--------------------------+--------+-------+-------+-------+
| POCKETBASE_ADMIN_PASS    |  R/W   |   -   |   -   |   -   |
| BILLING_API_KEY          |  R/W   |   -   |   -   |   -   |
| User API Keys            |  R/W   |  R*   |   -   |   -   |
| AI Provider Keys         |  R/W   |   -   |  R**  |   -   |
| Tenant Master Keys       |  R/W   |   -   |   -   |   -   |
| DB Passwords             |  R/W   |   -   |   -   |   -   |
+--------------------------+--------+-------+-------+-------+
*  Users can only read their own API key once at creation
** Tenants can read keys via LiteLLM config (internal only)
```

---

## 📝 IMPLEMENTATION CHECKLIST

### Phase 1: Port Standardization (Week 1)

- [ ] Update all docker-compose.yml files with new port scheme
- [ ] Update Coolify service configurations
- [ ] Update nginx.conf files
- [ ] Update .env.example templates
- [ ] Update API client configurations
- [ ] Test all service connectivity
- [ ] Update documentation

### Phase 2: Secret Management MVP (Week 1-2)

- [ ] Audit current secret locations
- [ ] Implement PocketBase field encryption for API keys
- [ ] Create secret generation scripts
- [ ] Update Admin Portal to show/hide sensitive fields
- [ ] Implement "Copy API Key" button (show once)
- [ ] Add API key regeneration endpoint
- [ ] Update Billing API authentication
- [ ] Create secret rotation runbook
- [ ] Document security policies

### Phase 3: Monitoring & Audit (Week 2-3)

- [ ] Add secret access logging
- [ ] Implement failed auth alerts
- [ ] Create security dashboard in Admin Portal
- [ ] Set up automated secret expiry warnings
- [ ] Document incident response process

---

## 🔧 TECHNICAL IMPLEMENTATION

### 1. Update docker-compose.yml (Core Services)

```yaml
# admin-portal/docker-compose.yml
services:
  admin-portal:
    ports:
      - "9001:80"
    expose:
      - "9001"
    labels:
      - "traefik.http.services.admin-portal.loadbalancer.server.port=9001"

# billing-api/docker-compose.yml
services:
  billing-api:
    ports:
      - "9002:3000"
    expose:
      - "9002"
    labels:
      - "traefik.http.services.billing-api.loadbalancer.server.port=9002"

# pocketbase-core/docker-compose.yml
services:
  pocketbase:
    ports:
      - "9000:8090"
    expose:
      - "9000"
    labels:
      - "traefik.http.services.pocketbase.loadbalancer.server.port=9000"
```

### 2. Update tenant-template/docker-compose.yml

```yaml
services:
  litellm:
    ports:
      - "${LITELLM_PORT:-9100}:4000"
    environment:
      - PORT=4000
      - INTERNAL_PORT=4000
    labels:
      - "traefik.http.services.${TENANT_SLUG}-litellm.loadbalancer.server.port=4000"

  openwebui:
    ports:
      - "${OPENWEBUI_PORT:-9101}:8080"
    environment:
      - PORT=8080
    labels:
      - "traefik.http.services.${TENANT_SLUG}-openwebui.loadbalancer.server.port=8080"

  postgres:
    ports:
      - "${POSTGRES_PORT:-9102}:5432"  # Internal only
    networks:
      - internal

  redis:
    ports:
      - "${REDIS_PORT:-9103}:6379"  # Internal only
    networks:
      - internal
```

### 3. Tenant Configuration (.env)

```bash
# tenant-template/.env.internal
TENANT_SLUG=app
TENANT_NAME=CloudFreedom Internal
TENANT_ID=internal_001

# Port Allocation (9100 block)
LITELLM_PORT=9100
OPENWEBUI_PORT=9101
POSTGRES_PORT=9102
REDIS_PORT=9103

# Secrets (generated with: openssl rand -hex 32)
LITELLM_MASTER_KEY=sk-$(openssl rand -hex 32)
POSTGRES_PASSWORD=$(openssl rand -base64 32)
REDIS_PASSWORD=$(openssl rand -base64 32)
```

### 4. PocketBase Security Rules Update

```javascript
// cf_users collection - API Key field security
{
  "name": "api_key",
  "type": "text",
  "required": true,
  "presentable": false,
  "options": {
    "min": 64,
    "max": 128,
    "pattern": "^sk-[a-f0-9]{64}$"
  }
}

// Collection Rules
{
  "listRule": "@request.auth.role = 'admin'",
  "viewRule": "@request.auth.id = id || @request.auth.role = 'admin'",
  "createRule": "@request.auth.role = 'admin'",
  "updateRule": "@request.auth.id = id || @request.auth.role = 'admin'",
  "deleteRule": "@request.auth.role = 'admin'"
}
```

### 5. Admin Portal - API Key Display (One-Time Show)

```typescript
// admin-portal/src/components/users/UserDialog.tsx

const [apiKeyVisible, setApiKeyVisible] = useState(false)
const [apiKeyShown, setApiKeyShown] = useState(false)

const handleShowApiKey = () => {
  if (!apiKeyShown) {
    setApiKeyVisible(true)
    setApiKeyShown(true)
    
    // Auto-hide after 30 seconds
    setTimeout(() => {
      setApiKeyVisible(false)
    }, 30000)
  }
}

return (
  <div className="space-y-2">
    <Label>API Key</Label>
    {!apiKeyShown ? (
      <Button onClick={handleShowApiKey} variant="outline">
        Show API Key (One Time Only)
      </Button>
    ) : (
      <div className="flex gap-2">
        <Input
          type={apiKeyVisible ? "text" : "password"}
          value={user.api_key}
          readOnly
        />
        <Button onClick={() => navigator.clipboard.writeText(user.api_key)}>
          Copy
        </Button>
      </div>
    )}
    <p className="text-xs text-muted-foreground text-red-600">
      ⚠️ Save this key now! It will never be shown again.
    </p>
  </div>
)
```

---

## 📊 SECURITY METRICS & MONITORING

### Key Metrics to Track

```yaml
Security KPIs:
  - Failed authentication attempts per hour
  - API key usage by user
  - Budget exceeded events
  - Unauthorized access attempts
  - Secret rotation compliance (% on schedule)
  - Secrets older than 90 days (alert)
  - Users without API keys
  - Inactive users with active API keys

Alerts:
  - > 10 failed auth attempts in 5 minutes
  - API key used from new IP address
  - Budget usage > 90%
  - Secret rotation overdue
  - Suspicious API call patterns
```

### Audit Log Structure

```json
{
  "timestamp": "2025-10-10T08:30:00Z",
  "event_type": "api_key_accessed",
  "user_id": "user_123",
  "admin_id": "admin_456",
  "resource": "cf_users.api_key",
  "action": "read",
  "ip_address": "192.168.1.100",
  "user_agent": "Mozilla/5.0...",
  "success": true,
  "metadata": {
    "masked_key": "sk-***...***abc",
    "reason": "user_creation"
  }
}
```

---

## 🚀 ROLLOUT PLAN

### Week 1: Port Migration
```
Day 1-2: Update all configuration files
Day 3-4: Test local environment
Day 5: Deploy to staging
Day 6: Deploy to production (maintenance window)
Day 7: Monitor and verify
```

### Week 2: Security Hardening
```
Day 1-2: Implement PocketBase encryption
Day 3-4: Update Admin Portal UI
Day 5: Add secret rotation scripts
Day 6-7: Documentation and training
```

### Week 3: Monitoring & Audit
```
Day 1-2: Implement logging
Day 3-4: Create security dashboard
Day 5: Set up alerts
Day 6-7: Security audit and pentesting
```

---

## ✅ SUCCESS CRITERIA

- [ ] All services accessible on new port range (9000-9999)
- [ ] Zero secrets in git history
- [ ] API keys encrypted in PocketBase
- [ ] One-time API key display working
- [ ] Secret rotation scripts tested
- [ ] Audit logging functional
- [ ] Security dashboard showing metrics
- [ ] Documentation complete
- [ ] Team trained on new procedures
- [ ] Backup/recovery process documented

---

## 📚 REFERENCES

- [PocketBase Security Best Practices](https://pocketbase.io/docs/security/)
- [OWASP API Security Top 10](https://owasp.org/www-project-api-security/)
- [NIST Password Guidelines](https://pages.nist.gov/800-63-3/)
- [Docker Security Best Practices](https://docs.docker.com/engine/security/)

---

**Status:** Ready for Implementation  
**Next Action:** Start with Phase 1 - Port Standardization

