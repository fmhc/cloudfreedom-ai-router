# 🚀 CloudFreedom AI Router - Local Development

Quick guide to run the entire CloudFreedom AI Router platform locally for development and testing.

## ✅ System Status

All services are **running successfully** on safe ports (92xx range to avoid conflicts):

| Service | Port | Status | URL |
|---------|------|--------|-----|
| **PocketBase** | 9200 | ✅ Healthy | http://localhost:9200 |
| **Billing API** | 9201 | ✅ Running | http://localhost:9201 |
| **Admin Portal** | 9202 | ✅ Running | http://localhost:9202 |

---

## 🎯 Quick Start

### 1. Start All Services

```bash
./start-local.sh
```

This will:
- ✅ Check for port conflicts
- ✅ Start PocketBase on port 9200 (safe, high port)
- ✅ Start Billing API on port 9201 (safe, high port)
- ✅ Start Admin Portal on port 9202 (safe, high port)

### 2. Stop All Services

```bash
./stop-local.sh
```

---

## 🔧 Manual Setup (Alternative)

If you prefer manual control:

### Start Backend Services (Docker)

```bash
docker compose -f docker-compose.local.yml up -d
```

### Start Admin Portal (Dev Server)

```bash
cd admin-portal
npm run dev
```

---

## 📖 First-Time Setup

### 1. Create Admin User in PocketBase

1. Open http://localhost:9200/_/
2. Create an admin account (first visit auto-prompts)
3. Email: `admin@localhost`
4. Password: Choose a strong password

### 2. Access Admin Portal

1. Open http://localhost:9202
2. Login with PocketBase credentials
3. Start managing tenants, users, products!

---

## 🔍 Health Checks

Test all services:

```bash
# PocketBase
curl http://localhost:9200/api/health
# Response: {"message":"API is healthy.","code":200,"data":{}}

# Billing API
curl http://localhost:9201/health
# Response: {"status":"ok","service":"cloudfreedom-billing-api",...}

# Admin Portal
curl http://localhost:9202
# Response: HTML page
```

---

## 📊 View Logs

### Docker Services

```bash
# All services
docker compose -f docker-compose.local.yml logs -f

# Individual services
docker logs -f pocketbase-core-local
docker logs -f billing-api-local
```

### Admin Portal

```bash
tail -f /tmp/admin-portal-dev.log
```

---

## 🐛 Troubleshooting

### Port Already in Use

The system uses 92xx ports to avoid conflicts with common services:

- ✅ Port 9200 → PocketBase
- ✅ Port 9201 → Billing API  
- ✅ Port 9202 → Admin Portal

These high ports (9200+) are rarely used by other services. If you still get conflicts:

```bash
sudo lsof -i :9200
sudo lsof -i :9201
sudo lsof -i :9202
```

### Services Not Starting

```bash
# Check Docker status
docker compose -f docker-compose.local.yml ps

# Restart services
docker compose -f docker-compose.local.yml restart

# Rebuild if needed
docker compose -f docker-compose.local.yml up -d --build
```

### Admin Portal Build Errors

The Docker build has TypeScript errors, so we run it in dev mode instead:

```bash
cd admin-portal
npm install  # If first time
npm run dev  # Development server (no build needed)
```

---

## 🗄️ Database Management

### PocketBase Data Location

```
pocketbase-core/pb_data/
```

### Reset Database

```bash
./stop-local.sh
cd pocketbase-core
mv pb_data pb_data_backup_$(date +%Y%m%d_%H%M%S)
mkdir pb_data
cd ..
./start-local.sh
```

### Migrations

Migrations are currently **disabled** for local development due to compatibility issues with PocketBase 0.30.2.

Collections are created manually via PocketBase Admin UI: http://localhost:8090/_/

---

## 📝 Configuration

### Environment Variables

#### PocketBase (docker-compose.local.yml)
- No configuration needed for local dev

#### Billing API (docker-compose.local.yml)
```yaml
POCKETBASE_URL=http://pocketbase:8090
BILLING_API_KEY=local-test-key-123456
ADMIN_SECRET_KEY=local-admin-secret-789012
```

#### Admin Portal (.env)
```bash
VITE_POCKETBASE_URL=http://localhost:9200
VITE_BILLING_API_URL=http://localhost:9201
```

---

## 🔐 Security Notes

⚠️ **This is a local development setup** - the API keys and secrets are for testing only!

For production deployment, use:
- Strong, randomly generated secrets
- HTTPS endpoints
- Proper authentication
- Firewall rules

---

## 🎊 What's Working

✅ **PocketBase Core** - Database & Authentication  
✅ **Billing API** - Budget management endpoints  
✅ **Admin Portal** - React frontend with Vite dev server  
✅ **Port Safety** - No conflicts with existing services (Port 80, 3000)  
✅ **Health Checks** - All APIs responding correctly  

---

## 📚 Next Steps

1. ✅ **System is running** - All services started successfully
2. 🔧 **Create test data** - Add tenants, users, products via Admin Portal
3. 🧪 **Test API flows** - Try budget checks, usage logging
4. 🚀 **Deploy** - Follow DEPLOYMENT_GUIDE.md for production setup

---

## 🆘 Need Help?

- **Port conflicts?** Check with `sudo lsof -i :PORT`
- **Services not responding?** Check logs with `docker logs -f SERVICE_NAME`
- **Frontend issues?** Check `/tmp/admin-portal-dev.log`
- **Database issues?** Access PocketBase UI at http://localhost:8090/_/

---

**Status:** ✅ All services running locally and working correctly!

**Last Updated:** October 22, 2025

