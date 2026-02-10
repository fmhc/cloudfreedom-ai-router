# 🏗️ CloudFreedom - Korrekte Architektur mit Coolify

**Datum:** 2025-10-10  
**Status:** FINAL DESIGN

---

## 🎯 RICHTIGE LÖSUNG

### Coolify + Traefik macht ALLES für uns!

```yaml
Was Coolify/Traefik macht:
✅ SSL/TLS Zertifikate (Let's Encrypt automatisch)
✅ Domain Routing (via Labels)
✅ Load Balancing
✅ Health Checks
✅ Port Mapping

Was WIR machen müssen:
✅ Einen Port nach außen exposen (80 oder 8080)
✅ Traefik Labels setzen
✅ Fertig!
```

---

## 📦 TENANT CONTAINER SETUP

### Alle Tenants - IDENTISCHER Aufbau!

```yaml
version: '3.8'

services:
  # LiteLLM - AI Routing
  litellm:
    build: .
    container_name: ${TENANT_SLUG}-litellm
    restart: unless-stopped
    expose:
      - "4000"  # NUR intern sichtbar!
    environment:
      - LITELLM_MASTER_KEY=${LITELLM_MASTER_KEY}
      - DATABASE_URL=postgresql://...
    labels:
      # Coolify/Traefik macht den Rest!
      - "traefik.enable=true"
      - "traefik.http.routers.${TENANT_SLUG}-api.rule=Host(`api-${TENANT_SLUG}.cloudfreedom.de`)"
      - "traefik.http.routers.${TENANT_SLUG}-api.entrypoints=websecure"
      - "traefik.http.routers.${TENANT_SLUG}-api.tls.certresolver=letsencrypt"
      - "traefik.http.services.${TENANT_SLUG}-api.loadbalancer.server.port=4000"
    networks:
      - default

  # OpenWebUI - Chat Interface  
  openwebui:
    image: ghcr.io/open-webui/open-webui:main
    container_name: ${TENANT_SLUG}-openwebui
    restart: unless-stopped
    expose:
      - "8080"  # NUR intern sichtbar!
    environment:
      - WEBUI_NAME=${TENANT_NAME}
      - OPENAI_API_BASE_URL=http://litellm:4000/v1
      - OPENAI_API_KEY=${LITELLM_MASTER_KEY}
    labels:
      # Coolify/Traefik macht SSL + Routing
      - "traefik.enable=true"
      - "traefik.http.routers.${TENANT_SLUG}-chat.rule=Host(`${TENANT_SLUG}.cloudfreedom.de`)"
      - "traefik.http.routers.${TENANT_SLUG}-chat.entrypoints=websecure"
      - "traefik.http.routers.${TENANT_SLUG}-chat.tls.certresolver=letsencrypt"
      - "traefik.http.services.${TENANT_SLUG}-chat.loadbalancer.server.port=8080"
    volumes:
      - openwebui-data:/app/backend/data
    networks:
      - default

  # PostgreSQL - NUR intern!
  postgres:
    image: postgres:16-alpine
    container_name: ${TENANT_SLUG}-postgres
    restart: unless-stopped
    # KEIN expose! Nur intern im Container-Netzwerk
    environment:
      - POSTGRES_USER=${POSTGRES_USER}
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
      - POSTGRES_DB=${POSTGRES_DB}
    volumes:
      - postgres-data:/var/lib/postgresql/data
    networks:
      - default

  # Redis - NUR intern!
  redis:
    image: redis:7-alpine
    container_name: ${TENANT_SLUG}-redis
    restart: unless-stopped
    # KEIN expose! Nur intern
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis-data:/data
    networks:
      - default

volumes:
  postgres-data:
  redis-data:
  openwebui-data:

networks:
  default:
    name: ${TENANT_SLUG}-network
```

---

## 🌐 DOMAIN MAPPING

### Alle Tenants auf HTTPS via Coolify/Traefik

```
Internal Tenant:
  https://chat.cloudfreedom.de → Port 8080 (intern)
  https://api-internal.cloudfreedom.de → Port 4000 (intern)

Demo Tenant:
  https://demo.cloudfreedom.de → Port 8080 (intern)
  https://api-demo.cloudfreedom.de → Port 4000 (intern)

Public Tenant:
  https://public.cloudfreedom.de → Port 8080 (intern)
  https://api-public.cloudfreedom.de → Port 4000 (intern)

Enterprise Customer:
  https://acme.cloudfreedom.de → Port 8080 (intern)
  https://api-acme.cloudfreedom.de → Port 4000 (intern)
```

**Wie Traefik routet:**
```
User → https://demo.cloudfreedom.de
      ↓
Traefik sieht: Host(`demo.cloudfreedom.de`)
      ↓
Routet zu: demo-openwebui Container Port 8080
      ↓
SSL Termination (Let's Encrypt)
      ↓
User sieht: Chat Interface
```

---

## 🔧 COOLIFY DEPLOYMENT

### In Coolify UI:

**Service erstellen:**
1. Resource → New Resource → Docker Compose
2. Name: `CloudFreedom - Demo Tenant`
3. Docker Compose: (obiges YAML)
4. Environment Variables:
   ```
   TENANT_SLUG=demo
   TENANT_NAME=CloudFreedom Demo
   LITELLM_MASTER_KEY=sk-...
   POSTGRES_USER=cloudfreedom
   POSTGRES_PASSWORD=...
   POSTGRES_DB=cloudfreedom_demo
   REDIS_PASSWORD=...
   ```
5. Domains:
   - `demo.cloudfreedom.de` (OpenWebUI)
   - `api-demo.cloudfreedom.de` (LiteLLM)
6. Deploy!

**Coolify macht automatisch:**
- ✅ Let's Encrypt Zertifikate
- ✅ SSL Termination
- ✅ Traefik Labels
- ✅ Health Checks
- ✅ Auto-Restart bei Failure

---

## 🚀 VEREINFACHTES DEPLOYMENT

### Von kompliziert zu simpel:

**❌ ALTE Idee (zu kompliziert):**
```
9100: Internal LiteLLM
9101: Internal OpenWebUI
9110: Demo LiteLLM
9111: Demo OpenWebUI
9120: Public LiteLLM
9121: Public OpenWebUI
... 90 verschiedene Ports verwalten
```

**✅ NEUE Lösung (einfach):**
```
Alle Tenants:
  - LiteLLM auf Port 4000 (intern)
  - OpenWebUI auf Port 8080 (intern)
  - Traefik routet via Domain
  - Coolify managed SSL
```

---

## 📝 .ENV TEMPLATE (Vereinfacht)

```bash
# tenant-template/.env.demo

# Tenant Info
TENANT_SLUG=demo
TENANT_NAME=CloudFreedom Demo
TENANT_ID=tenant_demo

# Secrets (generate with: openssl rand -hex 32)
LITELLM_MASTER_KEY=sk-...
POSTGRES_USER=cloudfreedom
POSTGRES_PASSWORD=...
POSTGRES_DB=cloudfreedom_demo
REDIS_PASSWORD=...

# CloudFreedom Integration
POCKETBASE_URL=https://api.cloudfreedom.de
BILLING_API_URL=https://billing.cloudfreedom.de
BILLING_API_KEY=...

# OpenWebUI Config
ENABLE_SIGNUP=true
WEBUI_AUTH=true

# KEINE PORTS MEHR! Traefik macht das!
```

---

## 🔐 SECURITY

### Network Isolation

```yaml
# Jeder Tenant hat sein eigenes Network
networks:
  default:
    name: ${TENANT_SLUG}-network

# PostgreSQL & Redis sind NUR im Tenant-Network erreichbar
# Kein expose = nicht von außen zugreifbar
# LiteLLM & OpenWebUI können intern auf DB/Redis zugreifen
```

### Port Exposure

```
EXPOSE:     Nur für Container im gleichen Network
PORTS:      Öffnet Port auf Host (brauchen wir NICHT)
LABELS:     Traefik routet, Coolify managed SSL
```

---

## 📊 DEPLOYMENT CHECKLIST

### Neuen Tenant deployen:

- [ ] DNS Records anlegen (demo.cloudfreedom.de → Coolify Server IP)
- [ ] In Coolify: New Resource → Docker Compose
- [ ] docker-compose.yml hochladen
- [ ] Environment Variables setzen
- [ ] Domains konfigurieren
- [ ] Deploy klicken
- [ ] Warten auf SSL Zertifikat (2-3 Min)
- [ ] Testen: https://demo.cloudfreedom.de
- [ ] ✅ Fertig!

**Zeit: ~5 Minuten pro Tenant**

---

## 🎯 VORTEILE DIESER ARCHITEKTUR

```
✅ Einfach: Alle Tenants identisch
✅ Skalierbar: Unbegrenzt viele Tenants
✅ Sicher: Network Isolation per Tenant
✅ Automatisch: SSL via Let's Encrypt
✅ Wartbar: Ein docker-compose.yml für alle
✅ Schnell: Deployment in 5 Minuten
✅ Standard Ports: 4000 (LiteLLM), 8080 (OpenWebUI)
```

---

## 🔄 UPDATE: Was sich ändert

### Löschen/Ignorieren:

- ❌ ~~Port Range 9000-9999~~
- ❌ ~~Unterschiedliche Ports pro Tenant~~
- ❌ ~~Komplexe Port-Mappings~~

### Behalten:

- ✅ Security Strategy (Secrets, Encryption)
- ✅ User Onboarding Flow (Magic Links)
- ✅ Domain-basiertes Routing
- ✅ Coolify Deployment

---

## 📚 NEXT STEPS

1. ✅ Architektur verstanden
2. ⏳ docker-compose.yml finalisieren
3. ⏳ Ersten Tenant deployen (Demo)
4. ⏳ OpenWebUI testen
5. ⏳ Magic Link System implementieren
6. ⏳ Weitere Tenants nach gleichem Schema

---

**Status:** ✅ Final Architecture  
**Complexity:** LOW 🎉  
**Time to Deploy:** 5 minutes per tenant  
**Maintenance:** MINIMAL


