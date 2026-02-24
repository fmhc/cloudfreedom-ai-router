# Operator Runbook — CloudFreedom Agent Platform

**Last Updated:** 2026-02-16  
**Version:** MVP Week 1-2  

This runbook covers day-to-day operations for the CloudFreedom Agent Platform running on Coolify.

## 🏗️ System Overview

**Infrastructure:**
- **Coolify Server:** coolify.callthe.dev (152.53.179.226)
- **PocketBase:** api.cloudfreedom.de
- **Provisioner:** `/mnt/private1/ai-projects/cloudfreedom-ai-router/src/provisioner/`
- **Templates:** 3 hardened templates (openclaw-agent, telegram-bot, base-llm)

**Key Components:**
- Coolify API for container orchestration
- PocketBase for metadata and tenant management
- Traefik proxy for HTTPS routing
- Docker for container isolation

---

## 🚀 Common Operations

### 1. Deploy New Agent Stack

**When:** Customer requests new agent instance

**Steps:**
```bash
cd /mnt/private1/ai-projects/cloudfreedom-ai-router/src/provisioner

# 1. Dry-run first to validate template
node index.js deploy \
  --tenant customer-123 \
  --project-name "customer-123-project" \
  --template openclaw-agent \
  --stack-name customer-123-main \
  --domain webui=demo.customer123.com \
  --env ANTHROPIC_API_KEY=sk-... \
  --env TELEGRAM_BOT_TOKEN=123:ABC... \
  --dry-run

# 2. Deploy for real
node index.js deploy \
  --tenant customer-123 \
  --project-name "customer-123-project" \
  --template openclaw-agent \
  --stack-name customer-123-main \
  --domain webui=demo.customer123.com \
  --env ANTHROPIC_API_KEY=sk-... \
  --env TELEGRAM_BOT_TOKEN=123:ABC...
```

**Expected Output:**
```json
{
  "ok": true,
  "project_uuid": "abc123...",
  "service_uuid": "def456...",
  "domains": ["demo.customer123.com"],
  "pocketbase_id": "pb_record_id",
  "duration_ms": 15000
}
```

**Validation:**
- [ ] Service appears in Coolify dashboard
- [ ] Domain resolves and serves HTTPS
- [ ] PocketBase record created with status "running"
- [ ] Container logs show successful startup

---

### 2. List Customer Stacks

**When:** Support request or account review

**Steps:**
```bash
cd /mnt/private1/ai-projects/cloudfreedom-ai-router/src/provisioner

node index.js list --tenant customer-123
```

**Expected Output:**
```json
{
  "tenant": "customer-123",
  "total": 2,
  "stacks": [
    {
      "id": "pb_record_id",
      "stack_name": "customer-123-main",
      "template": "openclaw-agent",
      "status": "running",
      "created": "2026-02-16T07:00:00Z"
    }
  ]
}
```

---

### 3. Delete Agent Stack

**When:** Customer cancellation or cleanup

**⚠️ DANGEROUS OPERATION - Double check tenant and stack name!**

**Steps:**
```bash
cd /mnt/private1/ai-projects/cloudfreedom-ai-router/src/provisioner

# 1. Confirm stack exists and belongs to correct tenant
node index.js list --tenant customer-123

# 2. Delete (this removes containers, volumes, and data!)
node index.js delete \
  --tenant customer-123 \
  --stack-name customer-123-main
```

**Expected Output:**
```json
{
  "ok": true,
  "deleted": {
    "stack_name": "customer-123-main",
    "tenant": "customer-123",
    "coolify_service_uuid": "service_uuid",
    "pocketbase_id": "pb_record_id"
  },
  "duration_ms": 5000
}
```

**Validation:**
- [ ] Service removed from Coolify
- [ ] Domain no longer resolves
- [ ] PocketBase record deleted
- [ ] Docker volumes cleaned up

---

## 🔧 Troubleshooting

### Stack Deployment Fails

**Symptoms:** Deploy command returns error, status="error" in PocketBase

**Common Causes:**
1. **Template rendering failure**
2. **Coolify API timeout**  
3. **Resource limits exceeded**
4. **Domain conflicts**

**Investigation:**
```bash
# Check Coolify API status
curl -H "Authorization: Bearer $COOLIFY_TOKEN" \
  https://coolify.callthe.dev/api/v1/projects

# Check server resources
ssh root@coolify.callthe.dev "df -h && free -h"

# Check failed service logs in Coolify UI
# https://coolify.callthe.dev/project/{project_uuid}/service/{service_uuid}
```

**Solutions:**
- Retry deployment with `--dry-run` first to validate
- Check server disk space and RAM
- Verify domain DNS configuration
- Check template syntax with latest compose file

### Stack Not Responding

**Symptoms:** Domain loads but service unhealthy, 502 errors

**Investigation:**
```bash
# Check service health in Coolify
curl -H "Authorization: Bearer $COOLIFY_TOKEN" \
  https://coolify.callthe.dev/api/v1/services/{service_uuid}

# SSH to Coolify and check containers
ssh root@coolify.callthe.dev
docker ps | grep customer-123
docker logs cf-agent-customer-123-main
```

**Solutions:**
- Restart service via Coolify UI
- Check container resource limits
- Verify environment variables are set
- Check application-specific logs

### PocketBase Sync Issues

**Symptoms:** Provisioner works but PocketBase records missing/outdated

**Investigation:**
```bash
# Test PocketBase API
curl -H "Authorization: Bearer $PB_TOKEN" \
  https://api.cloudfreedom.de/api/collections/agent_stacks/records

# Check provisioner config
cat /mnt/private1/ai-projects/cloudfreedom-ai-router/src/provisioner/.env
```

**Solutions:**
- Verify POCKETBASE_ADMIN_TOKEN is set
- Manually create/update PocketBase record
- Re-run provisioner command (idempotent operations)

---

## 📊 Monitoring & Health Checks

### Daily Health Check

**Run every morning:**
```bash
cd /mnt/private1/ai-projects/cloudfreedom-ai-router/src/provisioner

# Check Coolify API health
curl -f https://coolify.callthe.dev/api/v1/projects >/dev/null && echo "✅ Coolify API OK" || echo "❌ Coolify API DOWN"

# Check PocketBase health  
curl -f https://api.cloudfreedom.de/api/health >/dev/null && echo "✅ PocketBase OK" || echo "❌ PocketBase DOWN"

# Count active stacks
echo "Active stacks: $(docker ps | grep -c cf-agent)"

# Check disk usage
ssh root@coolify.callthe.dev "df -h | grep -E '(Filesystem|/$)'"
```

### Resource Monitoring

**Weekly resource check:**
```bash
ssh root@coolify.callthe.dev

# Container resource usage
docker stats --no-stream | head -10

# Disk usage by project
du -sh /var/lib/docker/volumes/cf-* | sort -h

# Top resource consumers
docker ps --format "table {{.Names}}\\t{{.Status}}" | head -20
```

---

## 🚨 Emergency Procedures

### Complete Service Outage

**If Coolify server is down:**

1. **Immediate:** Post status update on status page
2. **SSH to server:** `ssh root@coolify.callthe.dev`
3. **Check system status:** `systemctl status coolify`  
4. **Restart if needed:** `systemctl restart coolify`
5. **Verify:** All services auto-restart via Docker

### Mass Container Failures

**If multiple stacks fail simultaneously:**

1. **Check server resources:** RAM/Disk/CPU usage
2. **Identify pattern:** Same template? Same tenant? Time-based?
3. **Emergency stop:** High-resource stacks first
   ```bash
   # Stop base-llm stacks (highest resource usage)
   docker ps | grep cf-webui | awk '{print $1}' | xargs docker stop
   ```
4. **Gradual restart:** After resource situation improves

### Data Recovery

**If customer data lost:**

1. **Don't panic** - Check if volume still exists
2. **List volumes:** `docker volume ls | grep cf-agent-{customer}`
3. **If volume exists:** Redeploy stack with same volume name
4. **If volume gone:** Check daily backups (if implemented)
5. **Communicate:** Update customer immediately with status

---

## 🔐 Security Incidents

### Suspected Container Compromise

1. **Isolate immediately:** 
   ```bash
   docker network disconnect coolify cf-agent-{suspect-stack}
   ```
2. **Capture state:** `docker exec {container} ps aux > incident-{date}.log`
3. **Stop container:** `docker stop {container}`  
4. **Preserve evidence:** Create container snapshot
5. **Notify:** Security team and customer
6. **Investigate:** Review logs, template changes, env vars

### API Key Exposure

1. **Rotate immediately:** All affected API keys
2. **Update stack:** Deploy with new keys
3. **Audit access:** Check provider API usage logs
4. **Document:** In incident tracking system

---

## 📋 Maintenance Procedures

### Weekly Template Updates

**Before deploying template changes:**

1. **Test locally:** Use dry-run with test tenant
2. **Deploy to staging:** Test tenant first
3. **Validate security:** Run security audit on new template
4. **Document changes:** Update template documentation
5. **Gradual rollout:** High-value customers last

### Monthly Coolify Updates

**Coolify maintenance window:**

1. **Announce maintenance:** 48h advance notice
2. **Backup critical data:** PocketBase + key volumes
3. **Update Coolify:** Follow upstream guide
4. **Restart services:** All containers auto-restart
5. **Health check:** Verify all stacks operational
6. **Monitor:** 24h post-update monitoring

---

## 📞 Escalation Contacts

| Issue Type | Contact | Response Time |
|------------|---------|---------------|
| Platform Down | Platform Team | 30min |
| Security Incident | Security Team | 15min |
| Customer Data Loss | Backup Team | 1h |
| Billing Issues | Billing Team | 4h business |

## 📝 Useful Commands Reference

```bash
# Provisioner shortcuts
alias provision-dry="node index.js deploy --dry-run"
alias provision-list="node index.js list"
alias provision-delete="node index.js delete"

# Coolify shortcuts
alias coolify-ssh="ssh root@coolify.callthe.dev"
alias coolify-logs="ssh root@coolify.callthe.dev 'docker logs'"
alias coolify-stats="ssh root@coolify.callthe.dev 'docker stats --no-stream'"

# PocketBase shortcuts
alias pb-stacks="curl -H 'Authorization: Bearer \$PB_TOKEN' https://api.cloudfreedom.de/api/collections/agent_stacks/records"
```

---

## 📖 Additional Resources

- **Coolify Docs:** https://coolify.io/docs
- **PocketBase Docs:** https://pocketbase.io/docs  
- **Template Security Audit:** `docs/agent-platform/SECURITY-AUDIT.md`
- **Architecture Overview:** `docs/agent-platform/ARCHITECTURE.md`
- **Emergency Contacts:** Internal team directory

---

**Remember:** When in doubt, ask for help. Document everything. Customer data is sacred.