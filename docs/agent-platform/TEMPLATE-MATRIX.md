# CloudFreedom Agent Platform - Template Testing Matrix (MVP Focus)

## 📊 **Template Status Overview - MVP Templates Only**

| Template | Status | Coolify Compatible | Resource Requirements | Known Issues |
|----------|---------|-------------------|---------------------|--------------|
| **openclaw-agent** | ✅ Updated | ✅ Yes | CPU: 1.0, Memory: 1G | Health check needs OpenClaw API |
| **telegram-bot** | ✅ Updated | ✅ Yes | CPU: 0.5, Memory: 512M | Requires Telegram token validation |
| **base-llm** | ✅ Updated | ✅ Yes | CPU: 3.0, Memory: 6G | High resource usage, needs API keys |

## 🔧 **Detailed Template Analysis**

### 1. openclaw-agent
- **Description:** Advanced OpenClaw agent with CloudFreedom integration
- **Resources:** CPU: 1.0 cores, Memory: 1GB, Storage: 2GB persistent
- **Deployment Command:**
  ```bash
  ./provisioner deploy openclaw-agent --tenant-id demo01 \
    --env ANTHROPIC_API_KEY=sk-xxx \
    --env TELEGRAM_BOT_TOKEN=xxx \
    --domain demo01.cloudfreedom.de
  ```
- **Health Check:** `https://demo01.cloudfreedom.de/health`
- **Known Issues:** 
  - Requires valid Anthropic API key
  - Health check depends on OpenClaw startup time (30s)

### 2. telegram-bot
- **Description:** Secure Telegram bot with CloudFreedom routing
- **Resources:** CPU: 0.5 cores, Memory: 512MB, Storage: 1GB
- **Deployment Command:**
  ```bash
  ./provisioner deploy telegram-bot --tenant-id demo01 \
    --env TELEGRAM_BOT_TOKEN=123456:ABC-DEF \
    --env CF_API_KEY=cf_xxx \
    --no-domain  # No HTTP endpoint needed
  ```
- **Health Check:** Telegram API validation
- **Known Issues:**
  - Bot token must be valid and unique
  - Webhook mode requires additional domain setup

### 3. base-llm (LiteLLM + OpenWebUI)
- **Description:** Full LLM stack with multiple provider support
- **Resources:** CPU: 3.0 cores, Memory: 6GB, Storage: 10GB
- **Deployment Command:**
  ```bash
  ./provisioner deploy base-llm --tenant-id demo01 \
    --env LITELLM_MASTER_KEY=sk-litellm-xxx \
    --env OPENAI_API_KEY=sk-xxx \
    --env ANTHROPIC_API_KEY=sk-ant-xxx \
    --domain demo01-chat.cloudfreedom.de \
    --api-domain demo01-api.cloudfreedom.de
  ```
- **Health Check:** 
  - LiteLLM: `https://demo01-api.cloudfreedom.de/health`
  - OpenWebUI: `https://demo01-chat.cloudfreedom.de/health`
- **Known Issues:**
  - High memory usage during model loading
  - Requires at least one valid LLM provider API key
  - OpenWebUI startup can take 60+ seconds

## 🚀 **Deployment Testing Checklist**

### Pre-Deployment Tests
- [ ] **Template Validation:** Verify docker-compose.yml syntax
- [ ] **Environment Variables:** Check all required variables are defined
- [ ] **Domain Availability:** Ensure domains are not already in use
- [ ] **Resource Limits:** Validate against tenant quotas
- [ ] **Dependencies:** Check external service availability (APIs, databases)

### Post-Deployment Tests
- [ ] **Container Status:** All containers healthy within timeout
- [ ] **Health Checks:** All health endpoints responding
- [ ] **Domain Resolution:** HTTPS certificates generated and working
- [ ] **Resource Usage:** CPU/Memory within expected ranges
- [ ] **Logging:** Application logs being generated
- [ ] **Monitoring:** Metrics collection active

## 📋 **MVP Template Test Scripts**

### Quick Template Test
```bash
#!/bin/bash
TEMPLATE=$1
TENANT_ID="test-$(date +%s)"

echo "Testing MVP template: $TEMPLATE"
case $TEMPLATE in
  "openclaw-agent"|"telegram-bot"|"base-llm")
    ./provisioner deploy $TEMPLATE --tenant-id $TENANT_ID --test-mode
    ;;
  *)
    echo "❌ Template $TEMPLATE is not part of MVP"
    exit 1
    ;;
esac

sleep 60  # Wait for startup

# Check container health
if docker ps | grep -q "cf-${TENANT_ID}"; then
  echo "✅ Container running"
else
  echo "❌ Container failed to start"
  exit 1
fi

# Cleanup
./provisioner delete --tenant-id $TENANT_ID --force
```

### Resource Usage Monitor
```bash
#!/bin/bash
TENANT_ID=$1

echo "Monitoring resources for tenant: $TENANT_ID"
docker stats $(docker ps | grep "cf-${TENANT_ID}" | cut -d' ' -f1) --no-stream
```

## 🔄 **Update Schedule**

- **Weekly:** Resource usage and health check monitoring for 3 MVP templates
- **Monthly:** Template security updates and dependency upgrades
- **Quarterly:** Full MVP template testing matrix execution
- **On-Demand:** After CloudFreedom platform updates

## 📝 **MVP Testing Commands Summary**

```bash
# Test all MVP templates
for template in openclaw-agent telegram-bot base-llm; do
  echo "Testing MVP template: $template..."
  ./test-template.sh $template
done

# Deploy specific MVP template
./provisioner deploy openclaw-agent --tenant-id demo01 \
  --env ANTHROPIC_API_KEY=sk-xxx \
  --domain demo01.cloudfreedom.de

# Monitor deployment
./provisioner status --tenant-id demo01

# Clean up test deployment
./provisioner delete --tenant-id demo01 --confirm
```

## 🎯 **MVP Scope Limitation**

**✅ Included in MVP:**
- openclaw-agent (Core AI agent)
- telegram-bot (Chat interface) 
- base-llm (LLM stack)

**❌ Not in MVP:**
- n8n-worker (automation - future phase)
- Additional integrations
- Advanced workflow templates

---

**Last Updated:** 2026-02-16  
**MVP Templates:** 3/3 completed  
**Next Review:** Post-MVP launch