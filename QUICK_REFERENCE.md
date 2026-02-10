# 🚀 CloudFreedom Quick Reference

## Port Scheme (9000-9999)

```
Core:     9000-9099
Tenants:  9100-9899 (10 ports each)
Dev/Test: 9900-9999
```

## Secret Generation

```bash
./scripts/generate-secrets.sh tenant-name
```

## Service URLs

| Service | Production URL | Local Port |
|---------|---------------|------------|
| PocketBase | api.cloudfreedom.de | 9000 |
| Admin Portal | admin.cloudfreedom.de | 9001 |
| Billing API | billing.cloudfreedom.de | 9002 |
| Internal Chat | chat.cloudfreedom.de | 9101 |
| Demo Chat | demo-chat.cloudfreedom.de | 9111 |

## Test Credentials

**Admin:**
- Email: `admin@cloudfreedom.de`
- Login: https://admin.cloudfreedom.de

**Demo User:**
- Email: `demo@cloudfreedom.de`
- API Key: `sk-8e8f1187291520c81708f33d00f85d58b9bcd289465451349328a3c86918acab`
- Chat: http://localhost:3001 (local) / https://demo-chat.cloudfreedom.de (prod)

## Quick Commands

```bash
# Generate secrets
./scripts/generate-secrets.sh demo

# Start local tenant
cd tenant-template
docker-compose --env-file .env.local up -d

# Check services
docker ps --filter 'name=local-test'

# View logs
docker logs local-test-openwebui --tail 50

# Stop all
docker-compose down
```

## Next Steps

1. ✅ Port schema defined
2. ✅ Security strategy created  
3. ✅ Test user created
4. ✅ OpenWebUI tested locally
5. ⏳ Deploy OpenWebUI to production
6. ⏳ Migrate all services to new ports
7. ⏳ Implement "show once" API key UI

## Files Created

- `PORT_AND_SECURITY_STRATEGY.md` - Full strategy
- `IMPLEMENTATION_SUMMARY.md` - Summary
- `QUICK_REFERENCE.md` - This file
- `scripts/generate-secrets.sh` - Secret generator
- `tenant-template/.env.*.example` - Port templates


