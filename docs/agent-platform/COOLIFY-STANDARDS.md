# CloudFreedom Agent Platform - Coolify Standards

## 📊 **Current Coolify Organization Analysis**

### Projects Structure
- **Project 17**: `cloudfreedom` (main platform)
- **Project 21**: `test-agent-project` (testing/dev)
- **Other Projects**: Various client projects (katzenmalen, tunecity, etc.)

### CloudFreedom Services Currently Running
- **Core Platform:**
  - `cf-pocketbase` → api.cloudfreedom.de
  - `cf-billing-api` → billing.cloudfreedom.de  
  - `cf-admin-portal` → admin.cloudfreedom.de
  - `cloudfreedom-website` → cloudfreedom.de

- **Tenant Services (Example):**
  - `cf-tenant-app-chat` → app.cloudfreedom.de
  - `cf-tenant-app-litellm` → api-app.cloudfreedom.de

- **Test Containers:**
  - `nginx-u84og8kcoo4848c0s4o0ko0s` (nginx:alpine) - **CLEANUP NEEDED**
  - `test-co8cwos4csckkwwwk00484s8` (nginx:alpine) - **CLEANUP NEEDED**
  - `openclaw-xgc00gog8gkkc8ks0sck8c4k` - **CLEANUP NEEDED**

## 🏗️ **Coolify Standards for Agent Platform**

### 1. Project Naming Convention

**Pattern:** `cf-tenant-{tenant-id}`

**Examples:**
- ✅ `cf-tenant-demo01`
- ✅ `cf-tenant-startup-xyz`
- ❌ `test-agent-project` (rename to `cf-testing`)

### 2. Service Naming Convention

**Platform Services:**
- `cf-{service}` (e.g., `cf-pocketbase`, `cf-billing`, `cf-admin`)

**Tenant Services:**
- `cf-{tenant-id}-{service}` (e.g., `cf-demo01-openclaw`, `cf-demo01-telegram-bot`)

### 3. Required Labels for All Services

```yaml
labels:
  - "coolify.managed=true"
  - "coolify.version=${COOLIFY_VERSION}"
  - "coolify.project=cf-tenant-${TENANT_ID}"
  - "cf.platform=agent-platform"
  - "cf.tenant=${TENANT_ID}"
  - "cf.service-type=${SERVICE_TYPE}" # openclaw-agent, telegram-bot, base-llm
  - "cf.deployed-by=provisioner-cli"
  - "cf.deployed-at=${DEPLOY_TIMESTAMP}"
```

### 4. Environment Configuration Standards

**Required Environment Variables:**
- `TENANT_ID` - Unique tenant identifier
- `ENVIRONMENT` - development/staging/production
- `CF_API_URL` - PocketBase API URL
- `CF_BILLING_URL` - Billing API URL
- `LOG_LEVEL` - info/debug/error

**Health Check Standards:**
- All services MUST have health checks
- Path: `/health` or `/api/health`
- Interval: 10s
- Timeout: 5s
- Retries: 3

### 5. Resource Limits (per Template)

**openclaw-agent:**
- CPU: 0.5 cores
- Memory: 1GB
- Storage: 2GB

**telegram-bot:**
- CPU: 0.2 cores
- Memory: 512MB
- Storage: 1GB

**base-llm (LiteLLM + OpenWebUI):**
- CPU: 2 cores
- Memory: 4GB
- Storage: 10GB

### 6. Network Configuration

**All agent services must:**
- Connect to `coolify` network
- Have Traefik labels for HTTPS
- Use Let's Encrypt certificates
- Follow pattern: `{service}.{tenant-id}.cloudfreedom.de`

### 7. Persistent Storage

**Required Persistent Volumes:**
- `cf-{tenant-id}-data` - Main application data
- `cf-{tenant-id}-logs` - Application logs
- `cf-{tenant-id}-config` - Configuration files

### 8. Deployment Standards

**Before Deploy:**
1. Validate tenant exists in PocketBase
2. Check resource limits
3. Verify domain availability
4. Generate secure credentials

**After Deploy:**
1. Update PocketBase with deployment info
2. Run health checks
3. Configure monitoring
4. Send notification to tenant

### 9. Cleanup Standards

**Test containers to remove:**
- `nginx-u84og8kcoo4848c0s4o0ko0s`
- `test-co8cwos4csckkwwwk00484s8`
- `openclaw-xgc00gog8gkkc8ks0sck8c4k`
- Any container with status `exited:unhealthy` > 24h

**Cleanup commands:**
```bash
# List test containers
curl -H "Authorization: Bearer ${COOLIFY_TOKEN}" \
  http://localhost:8000/api/v1/applications | jq '.[] | select(.name | contains("test") or contains("nginx-")) | {uuid, name, status}'

# Delete via Coolify API or provisioner CLI
```

### 10. Monitoring Labels

**Required for all CF services:**
- `monitoring.enabled=true`
- `monitoring.service=${SERVICE_TYPE}`
- `monitoring.tenant=${TENANT_ID}`
- `logging.enabled=true`
- `logging.level=info`

## 🔧 **Implementation Checklist**

- [ ] Clean up test containers
- [ ] Rename `test-agent-project` to `cf-testing`
- [ ] Standardize existing CF services with proper labels
- [ ] Update provisioner CLI to follow naming conventions
- [ ] Implement resource limit validation
- [ ] Add monitoring labels to all services
- [ ] Update templates with standard configurations

## 📝 **Provisioner CLI Integration**

The provisioner CLI should validate these standards before deployment:

```javascript
// Example validation in provisioner
const validateDeployment = (config) => {
  // Check naming convention
  if (!config.projectName.startsWith('cf-tenant-')) {
    throw new Error('Project name must follow cf-tenant-{id} pattern');
  }
  
  // Check resource limits
  if (config.memory > TEMPLATE_LIMITS[config.template].memory) {
    throw new Error('Memory limit exceeded for template');
  }
  
  // Validate environment variables
  const required = ['TENANT_ID', 'CF_API_URL'];
  required.forEach(env => {
    if (!config.env[env]) throw new Error(`Missing required env: ${env}`);
  });
};
```

---

**Last Updated:** 2026-02-16  
**Status:** In Implementation  
**Next Review:** 2026-03-01