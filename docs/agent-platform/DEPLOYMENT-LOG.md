# Deployment Log — CloudFreedom Agent Platform

## 2026-02-16: First Successful OpenClaw Agent Deployment

### What happened
- Successfully deployed OpenClaw agent container on Coolify (cf-agent-demo)
- Service UUID: `dwkgwgw8kckwkgsw4k8csgok`
- Project: cf-tenant-openclaw-demo (UUID: `uscck4wggo80oco8sk80co8g`)
- Container: `agent-dwkgwgw8kckwkgsw4k8csgok`

### Key Learnings

1. **Coolify API requires base64-encoded docker_compose_raw** — raw YAML gets rejected with validation error
2. **Don't override entrypoint/command** — OpenClaw Docker image has correct defaults:
   - Entrypoint: `docker-entrypoint.sh`
   - CMD: `node openclaw.mjs gateway --allow-unconfigured`
3. **OpenClaw needs ≥2GB RAM** — OOMs at 1GB. Set `NODE_OPTIONS=--max-old-space-size=1536` + 2G container limit
4. **Volume permissions** — Coolify creates volumes as root; OpenClaw runs as `node` user. Fix: `docker exec -u root <container> chown -R node:node /home/node/.openclaw` after first start
5. **Wildcard DNS** — cloudfreedom.de has wildcard A record → `*.cloudfreedom.de` resolves to 152.53.179.226. No need to create individual DNS records!
6. **`type` field is NOT allowed** in Coolify service creation API — just omit it
7. **Domain/FQDN** — Coolify doesn't support setting FQDN via API on service sub-applications easily. For Traefik routing, include labels in the compose template.

### Template Fix
Updated `templates/openclaw-agent/docker-compose.yml`:
- Removed over-engineered config (OPENCLAW_CONFIG JSON, wrong health checks, wrong ports)
- Simple compose: just image + env + volume + resource limits
- Let OpenClaw's built-in entrypoint handle everything
- Minimum 2G memory limit

### Current Status
- ✅ Container running stable
- ✅ Gateway listening on ws://127.0.0.1:18789
- ✅ Heartbeat started
- ⚠️ No Traefik routing yet (no FQDN set on service app)
- ⚠️ No LLM provider keys configured (empty agent)

### Next Steps
- Configure Traefik domain routing for demo-agent.cloudfreedom.de
- Add LLM provider keys via Coolify env vars
- Add init script for volume permission fix
- Test with actual Telegram bot channel
