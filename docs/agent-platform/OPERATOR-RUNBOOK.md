# CloudFreedom Agent Platform — Operator Runbook

## 1. Core Commands

### 1.1 Deploy New Stack
```bash
# Example deployment
provision deploy \
  --tenant="tenant123" \
  --project-name="my-project" \
  --template="openclaw-agent" \
  --stack-name="my-agent" \
  --domain="webui=agent.example.com" \
  --env="ANTHROPIC_API_KEY=sk-..."
```

### 1.2 List Stacks
```bash
# List stacks for tenant
provision list --tenant="tenant123"
```

### 1.3 Delete Stack
```bash
# Delete stack
provision delete \
  --tenant="tenant123" \
  --stack-name="my-agent"
```

## 2. PocketBase Administration
- **URL:** https://api.cloudfreedom.de
- **Credentials:**
  - Email: `admin@cloudfreedom.de`
  - Password: `CloudFreedom2026!Admin` (stored in `workspace/cloudfreedom-credentials.env`)
- **Collections:**
  - `tenants` (auth collection)
  - `agent_stacks` (base collection)

## 3. Troubleshooting

### 3.1 Traefik
- Check dashboard: `http://traefik.example.com`
- Verify service routing rules
- Check ACME certificate status

### 3.2 PocketBase
- Check API status: `curl -I https://api.cloudfreedom.de/api` (should return 401)
- Review logs: `journalctl -u pocketbase`
- Database connection issues: verify PostgreSQL connectivity

### 3.3 Coolify
- Check service status: `systemctl status coolify`
- Review deployment logs in Coolify UI
- Verify server connection: `curl -H "Authorization: Bearer $TOKEN" $COOLIFY_URL/api/v1/servers`

## 4. Security Notes
- All containers:
  - `cap_drop: [ALL]`
  - `no-new-privileges` enabled
  - Read-only root filesystems with tmpfs `/tmp`
  - Resource limits: max 2GB RAM, 1 CPU
  - Non-root user (UID 1000) in containers
- Secrets management:
  - API keys handled through environment variables
  - PB admin credentials stored in .env file
- Network:
  - Traefik handles TLS termination
  - Internal services exposed on private networks only

## 5. Maintenance Procedures
- **Template Updates:**
  - Modify templates in `/mnt/private1/ai-projects/cloudfreedom-ai-router/templates/`
  - Test changes with `--dry-run` flag
- **Service Restart:**
  ```bash
  systemctl restart coolify pocketbase traefik
  ```
- **Emergency Rollback:**
  - Restore previous template version
  - Redeploy with known-good configuration

## 6. Emergency Procedures
- **Data Loss Recovery:**
  - Restore from PB database backups
  - Recreate services from backup configurations
- **Security Incident:**
  - Rotate API keys immediately
  - Revoke compromised credentials
  - Review audit logs in PB and Coolify

Last updated: 2026-02-18