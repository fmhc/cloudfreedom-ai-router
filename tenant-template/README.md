# CloudFreedom Tenant Template

Complete Docker Compose stack for multi-tenant AI services with LiteLLM, OpenWebUI, PostgreSQL, and Redis.

## 🏗️ Architecture

```
Tenant Instance
├── LiteLLM Proxy (Port 4000)
│   ├── AI Model Routing (OpenAI, Anthropic, Google)
│   ├── Budget Integration (CloudFreedom Billing API)
│   ├── Usage Tracking (Automatic logging)
│   └── Load Balancing & Fallbacks
│
├── OpenWebUI (Port 3000)
│   ├── Chat Interface
│   ├── PocketBase Authentication
│   ├── LiteLLM Integration
│   └── Multi-User Support
│
├── PostgreSQL (Port 5432)
│   ├── LiteLLM Database
│   └── OpenWebUI Database
│
└── Redis (Port 6379)
    ├── Caching
    └── Rate Limiting
```

## 🚀 Quick Start

### 1. Clone & Configure

```bash
cd /home/fmh/ai/cloudfreedom-ai-router/tenant-template
cp env.example .env
nano .env  # Edit with your configuration
```

### 2. Deploy

```bash
# Start all services
docker-compose up -d

# Check logs
docker-compose logs -f

# Check health
docker-compose ps
```

### 3. Access

- **OpenWebUI**: http://localhost:3000 (or your configured domain)
- **LiteLLM API**: http://localhost:4000
- **LiteLLM Docs**: http://localhost:4000/docs

## 🔧 Configuration

### Tenant-Specific Settings

Edit `.env` for each tenant:

```bash
# Internal Tenant (app.cloudfreedom.de)
TENANT_SLUG=app
TENANT_NAME=CloudFreedom Internal
LITELLM_PORT=4000
OPENWEBUI_PORT=3000

# Demo Tenant (demo.cloudfreedom.de)
TENANT_SLUG=demo
TENANT_NAME=CloudFreedom Demo
LITELLM_PORT=4001
OPENWEBUI_PORT=3001
ENABLE_SIGNUP=true
```

### AI Provider Setup

1. **OpenAI** (https://platform.openai.com/api-keys)
   ```bash
   OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxx
   ```

2. **Anthropic** (https://console.anthropic.com/settings/keys)
   ```bash
   ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxx
   ```

3. **Google** (https://aistudio.google.com/app/apikey)
   ```bash
   GOOGLE_API_KEY=AIzaxxxxxxxxxxxxx
   ```

### Budget Integration

The tenant automatically integrates with CloudFreedom Billing API:

```bash
POCKETBASE_URL=http://pocketbase-core:8090
BILLING_API_URL=http://billing-api:3000
BILLING_API_KEY=your_billing_api_key
```

**How it works**:
1. User makes AI request via OpenWebUI
2. LiteLLM checks budget via Billing API
3. If budget available, request is processed
4. Usage is logged back to Billing API
5. User's budget is updated in real-time

## 🧪 Testing

### Test LiteLLM API

```bash
# Generate LiteLLM Master Key
LITELLM_KEY=$(grep LITELLM_MASTER_KEY .env | cut -d '=' -f2)

# List available models
curl http://localhost:4000/v1/models \
  -H "Authorization: Bearer $LITELLM_KEY"

# Test chat completion
curl http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_KEY" \
  -d '{
    "model": "gpt-4o-mini",
    "messages": [
      {"role": "user", "content": "Hello! This is a test."}
    ]
  }'
```

### Test OpenWebUI

1. Open http://localhost:3000
2. Create account (if ENABLE_SIGNUP=true)
3. Start chatting with AI models
4. Check usage in Admin Portal

### Test Budget Integration

```bash
# Create test user in PocketBase
# Make AI request in OpenWebUI
# Check usage_logs in PocketBase
# Verify budget deduction in Billing API
```

## 📊 Monitoring

### Health Checks

```bash
# Check all services
docker-compose ps

# Check LiteLLM health
curl http://localhost:4000/health

# Check OpenWebUI health
curl http://localhost:3000/health

# Check PostgreSQL
docker-compose exec postgres pg_isready

# Check Redis
docker-compose exec redis redis-cli ping
```

### Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f litellm
docker-compose logs -f openwebui

# Last 100 lines
docker-compose logs --tail=100 litellm
```

### Resource Usage

```bash
# CPU & Memory
docker stats

# Disk usage
docker-compose exec postgres du -sh /var/lib/postgresql/data
```

## 🛠️ Maintenance

### Backup

```bash
# Backup PostgreSQL
docker-compose exec postgres pg_dump -U cloudfreedom cloudfreedom_app > backup_$(date +%Y%m%d).sql

# Backup OpenWebUI data
docker-compose exec openwebui tar -czf - /app/backend/data > openwebui_backup_$(date +%Y%m%d).tar.gz

# Backup Redis
docker-compose exec redis redis-cli SAVE
docker cp $(docker-compose ps -q redis):/data/dump.rdb redis_backup_$(date +%Y%m%d).rdb
```

### Restore

```bash
# Restore PostgreSQL
docker-compose exec -T postgres psql -U cloudfreedom cloudfreedom_app < backup_20251008.sql

# Restore OpenWebUI
docker cp openwebui_backup_20251008.tar.gz $(docker-compose ps -q openwebui):/tmp/
docker-compose exec openwebui tar -xzf /tmp/openwebui_backup_20251008.tar.gz -C /

# Restore Redis
docker cp redis_backup_20251008.rdb $(docker-compose ps -q redis):/data/dump.rdb
docker-compose restart redis
```

### Update

```bash
# Pull latest images
docker-compose pull

# Restart services
docker-compose up -d

# Check logs for errors
docker-compose logs -f
```

## 🔒 Security

### Secure API Keys

- Store API keys in `.env` file (never commit to Git)
- Rotate keys regularly (monthly recommended)
- Use different keys per environment
- Enable IP whitelisting for production

### Network Security

- All services communicate via internal Docker network
- Only OpenWebUI and LiteLLM expose ports
- Use Traefik/Nginx for SSL termination
- Enable firewall rules for production

### User Authentication

- OpenWebUI integrates with PocketBase OAuth
- Users must authenticate before accessing
- Session management via JWT tokens
- Automatic logout after inactivity

## 🐛 Troubleshooting

### LiteLLM not starting

```bash
# Check logs
docker-compose logs litellm

# Common issues:
# 1. Invalid API keys -> Check .env file
# 2. Config syntax error -> Validate litellm-config.yaml
# 3. Port already in use -> Change LITELLM_PORT
```

### OpenWebUI can't connect to LiteLLM

```bash
# Check network
docker network inspect cloudfreedom-network

# Test connection
docker-compose exec openwebui curl http://litellm:4000/health

# Common issues:
# 1. Wrong LiteLLM URL -> Check OPENAI_API_BASE_URL
# 2. Wrong API key -> Check OPENAI_API_KEY matches LITELLM_MASTER_KEY
```

### Budget checks failing

```bash
# Test Billing API
curl http://billing-api:3000/

# Test PocketBase
curl http://pocketbase-core:8090/api/health

# Common issues:
# 1. Services not in same network -> Check docker-compose networks
# 2. Wrong API key -> Check BILLING_API_KEY matches
# 3. User not found -> Create user in PocketBase first
```

## 📚 Further Reading

- **LiteLLM Docs**: https://docs.litellm.ai
- **OpenWebUI Docs**: https://docs.openwebui.com
- **PocketBase Docs**: https://pocketbase.io/docs
- **CloudFreedom Docs**: [IMPLEMENTATION_ROADMAP.md](../IMPLEMENTATION_ROADMAP.md)

## 🤝 Support

- **Issues**: Create issue in GitLab
- **Email**: support@cloudfreedom.de
- **Discord**: Coming soon

---

**Built for CloudFreedom AI Router**
**Version**: 1.0.0
**Last Updated**: 08. Oktober 2025

