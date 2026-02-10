# CloudFreedom AI Router - Nächste Schritte

## 🎯 Jetzt: Billing API Deployment

### Manuelle Schritte im Browser (coolify.enubys.de)

1. **Navigate zu Projekt**:
   - Gehe zu CloudFreedom AI Router Projekt
   - Klicke auf "+ New"

2. **Wähle "Private Repository (with Deploy Key)"**

3. **Konfiguration**:
   - **Repository URL**: 
     ```
     https://oauth2:$GITLAB_TOKEN@gitlab.enubys.de/finn/billing-api.git
     ```
   - **Branch**: `main`
   - **Destination**: Standalone Docker (coolify)
   - **Server**: ace-bunker

4. **Nach Erstellung - Configuration**:
   - **Name**: billing-api
   - **Build Pack**: Docker Compose
   - **Docker Compose Location**: `/docker-compose.yml`
   - **Domain**: `billing.cloudfreedom.de`

5. **Environment Variables** (in Coolify UI):
   ```
   PORT=3000
   POCKETBASE_URL=http://pocketbase-core:8090
   BILLING_API_KEY=<generiere mit openssl rand -base64 32>
   ADMIN_SECRET_KEY=<generiere mit openssl rand -base64 32>
   ```

6. **Deploy**: Klick auf "Deploy"

## 🔧 Alternative: Verwende diese Commands

```bash
# Generate secure keys
openssl rand -base64 32  # für BILLING_API_KEY
openssl rand -base64 32  # für ADMIN_SECRET_KEY
```

## 📋 Nach Billing API

### Admin Portal (React 19 + Vite 6)

**Struktur**:
```
admin-portal/
├── src/
│   ├── components/
│   │   ├── ui/ (shadcn)
│   │   ├── users/
│   │   ├── products/
│   │   ├── tenants/
│   │   └── analytics/
│   ├── lib/
│   │   ├── api.ts (PocketBase + Billing API client)
│   │   └── utils.ts
│   ├── App.tsx
│   └── main.tsx
├── package.json
├── vite.config.ts
├── Dockerfile
└── docker-compose.yml
```

**Dependencies**:
```json
{
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "@tanstack/react-router": "latest",
    "@tanstack/react-query": "latest",
    "zustand": "latest",
    "react-hook-form": "latest",
    "zod": "latest",
    "pocketbase": "^0.30.0",
    "shadcn/ui": "latest"
  }
}
```

### Tenant Template (OpenWebUI + LiteLLM)

**docker-compose.yml**:
```yaml
version: '3.8'

services:
  litellm:
    image: ghcr.io/berriai/litellm:main-latest
    ports:
      - "4000:4000"
    environment:
      - LITELLM_MASTER_KEY=${LITELLM_MASTER_KEY}
      - POCKETBASE_URL=http://pocketbase-core:8090
      - BILLING_API_URL=http://billing-api:3000
      - BILLING_API_KEY=${BILLING_API_KEY}
    volumes:
      - ./litellm-config.yaml:/app/config.yaml
    command: ["--config", "/app/config.yaml"]
    
  openwebui:
    image: ghcr.io/open-webui/open-webui:main
    ports:
      - "3000:8080"
    environment:
      - OPENAI_API_BASE_URL=http://litellm:4000/v1
      - OPENAI_API_KEY=${LITELLM_MASTER_KEY}
      - WEBUI_AUTH=true
    volumes:
      - ./openwebui-data:/app/backend/data
    depends_on:
      - litellm
```

## 🚀 Deployment Reihenfolge

1. ✅ PocketBase Core (DONE)
2. 🚧 Billing API (IN PROGRESS)
3. 📋 Admin Portal (NEXT)
4. 📋 Tenant Template (AFTER ADMIN)

---

**Stand**: 08. Oktober 2025, 23:15 Uhr


