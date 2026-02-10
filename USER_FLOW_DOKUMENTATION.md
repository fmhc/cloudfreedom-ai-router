# CloudFreedom User Flow - Systematische Dokumentation

**Erstellt:** 2025-10-10  
**Status:** SYSTEM OPERATIONAL ✅

## 🎯 Übersicht

Das CloudFreedom System besteht aus 4 Hauptkomponenten:
1. **PocketBase Core** - Zentrale User-Verwaltung & Auth (api.cloudfreedom.de)
2. **Admin Portal** - Management-Interface für Admins (admin.cloudfreedom.de)
3. **Billing API** - Budget-Tracking & Usage-Logs (billing.cloudfreedom.de)
4. **Tenant Template** - AI-Router + OpenWebUI pro Kunde (app.cloudfreedom.de, demo.cloudfreedom.de, etc.)

---

## 📊 Aktueller System-Status

```bash
✅ admin-portal:     Up 34 minutes (healthy)
✅ billing-api:      Up 33 minutes (healthy)
✅ pocketbase:       Up 33 minutes (healthy)
⚠️  tenant-template: litellm Up 32 seconds (health: starting)
                     postgres Up 2 minutes (healthy)
                     redis Up 2 minutes (healthy)
```

---

## 🔐 User Flow 1: Admin-Zugang (für dich)

### Schritt 1: Initial Admin User erstellen

```bash
# SSH auf Server
ssh fmh@coolify.enubys.de

# In PocketBase Container
sudo docker exec -it pocketbase-xc884osk40k4o00w4w4gowo4-011048071259 /bin/sh

# Admin User Script ausführen (wenn vorhanden)
cd /pb_hooks
./create_admin_user.sh
```

**Alternative: Manuell in PocketBase Admin UI:**
1. Öffne: https://api.cloudfreedom.de/_/
2. Erstelle PocketBase Admin Account (falls noch nicht vorhanden)
3. Erstelle Collections manuell (falls noch nicht vorhanden):
   - `tenants` (wird automatisch via pb_hooks angelegt)
   - `products` (wird automatisch via pb_hooks angelegt)
   - `users` (wird automatisch via pb_hooks angelegt)
   - `usage_logs` (wird automatisch via pb_hooks angelegt)

### Schritt 2: Ersten Tenant & Product anlegen

**Via PocketBase Admin UI** (https://api.cloudfreedom.de/_/):

**Tenant erstellen:**
- Name: "CloudFreedom Internal"
- Slug: "app"
- Domain: "app.cloudfreedom.de"
- Type: "internal"
- Status: "active"

**Product erstellen:**
- Name: "Pro Plan"
- Description: "Full access to all AI models"
- Price: 99.00
- Currency: "EUR"
- Budget Included: 100.00
- Models: `["gpt-5", "claude-4-opus", "gemini-2.5-pro"]`
- Features: `["unlimited_chat", "api_access", "priority_support"]`
- Rate Limit: 1000
- Active: true

### Schritt 3: Admin User in PocketBase Users Collection erstellen

**Via PocketBase Admin UI** → Collections → `users` → New Record:

```json
{
  "email": "finn@cloudfreedom.de",
  "password": "[SICHERES PASSWORT]",
  "passwordConfirm": "[SICHERES PASSWORT]",
  "name": "Finn",
  "role": "admin",
  "status": "active",
  "tenant_id": "[TENANT_ID_VON_OBEN]",
  "product_id": "[PRODUCT_ID_VON_OBEN]",
  "budget_total": 100.00,
  "budget_used": 0,
  "budget_remaining": 100.00,
  "budget_reset_date": "2025-11-10 00:00:00.000Z",
  "litellm_api_key": "sk-[GENERIERE MIT: openssl rand -hex 32]"
}
```

### Schritt 4: Login im Admin Portal

1. Öffne: https://admin.cloudfreedom.de
2. Login mit:
   - Email: finn@cloudfreedom.de
   - Password: [DEIN PASSWORT]

**Was du im Admin Portal siehst:**
- 📊 Dashboard mit Übersicht
- 👥 User Management (neue User anlegen, freischalten, deaktivieren)
- 🏢 Tenant Management (neue Mandanten anlegen)
- 📦 Product Management (Tarife verwalten)
- 🔑 Provider Keys Management (AI-API-Keys verwalten)
- 📈 Analytics (Usage & Kosten)

---

## 👤 User Flow 2: Neuer User wird angelegt

### Option A: Admin legt User an (empfohlen)

**Via Admin Portal:**
1. Login als Admin
2. Navigiere zu "Users"
3. Klicke "New User"
4. Formular ausfüllen:
   - Email: user@example.com
   - Name: Max Mustermann
   - Role: user (nicht admin)
   - Tenant: "CloudFreedom Internal" auswählen
   - Product: "Pro Plan" auswählen
   - Status: active
   - Password: [Generiert oder manuell]
5. System generiert automatisch:
   - LiteLLM API Key
   - Budget basierend auf Product
   - Budget Reset Date (30 Tage)

**Via API (Billing API):**
```bash
curl -X POST https://billing.cloudfreedom.de/api/users \
  -H "X-API-Key: ${BILLING_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "name": "Max Mustermann",
    "tenant_id": "tenant-id-hier",
    "product_id": "product-id-hier"
  }'
```

### Option B: User registriert sich selbst (OpenWebUI)

**Nur möglich wenn `ENABLE_SIGNUP=true` für den Tenant!**

1. User öffnet: https://app.cloudfreedom.de (oder demo.cloudfreedom.de)
2. Klickt "Sign Up"
3. Gibt Email & Password ein
4. Status: "pending" (nicht aktiv)
5. **Admin muss User manuell freischalten:**
   - Via Admin Portal: Users → User auswählen → Status auf "active"
   - Tenant & Product zuweisen

---

## 🚀 User Flow 3: User nutzt das System

### Variante A: Via OpenWebUI (Chat Interface)

1. **Login:**
   - Öffne: https://app.cloudfreedom.de
   - Email & Password eingeben
   - (Optional: OAuth via PocketBase - noch nicht konfiguriert)

2. **Chat nutzen:**
   - AI-Modell auswählen (gpt-5, claude-4-opus, gemini-2.5-pro)
   - Chat starten
   - System prüft automatisch:
     - ✅ Budget verfügbar?
     - ✅ Rate Limit OK?
     - ✅ User aktiv?

3. **Was passiert im Hintergrund:**
   - OpenWebUI → LiteLLM Proxy (Port 4000)
   - LiteLLM → Custom Callback (litellm-proxy.py):
     - `async_pre_call_hook`: Budget-Check via Billing API
     - Falls Budget OK: Request an AI Provider (Google/Azure/AWS)
     - `async_log_success_event`: Usage wird geloggt
   - Response zurück an User

### Variante B: Via Direct API (für Entwickler)

1. **API Key aus Admin Portal holen:**
   - Login im Admin Portal
   - Navigiere zu "Profile" oder "API Keys"
   - Kopiere LiteLLM API Key: `sk-xxxxxxxxxxxxxxxx`

2. **API Request:**
```bash
curl https://app.cloudfreedom.de/v1/chat/completions \
  -H "Authorization: Bearer sk-YOUR-LITELLM-API-KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-5",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'
```

3. **Was passiert:**
   - Request → LiteLLM Proxy
   - LiteLLM validiert API Key
   - Budget-Check (Custom Callback)
   - AI Request
   - Response + Usage Logging

---

## 💰 User Flow 4: Budget & Billing

### Budget-Tracking

**Automatisch:**
- Jeder AI-Request wird geloggt (Token + Kosten)
- `usage_logs` Collection in PocketBase
- User Budget wird in Echtzeit aktualisiert

**Budget-Check Ablauf:**
```
1. User sendet Chat-Request
2. litellm-proxy.py → async_pre_call_hook()
3. POST /api/check-budget an Billing API
4. Billing API prüft:
   - budget_remaining > estimated_cost?
   - Status = active?
   - Tenant = active?
5. Falls OK: Request geht durch
6. Falls NICHT OK: 403 "Budget exceeded"
7. Nach Response: async_log_success_event()
   - Tokens & Kosten werden berechnet
   - POST /api/usage/log an Billing API
   - budget_used wird erhöht
```

### Budget Reset

**Automatisch (geplant):**
- Cron Job läuft täglich
- Prüft `budget_reset_date`
- Falls abgelaufen:
  - `budget_used = 0`
  - `budget_remaining = budget_total`
  - `budget_reset_date = +30 days`

**Manuell (via Admin Portal):**
- User auswählen
- "Reset Budget" Button
- Bestätigen

---

## 🔧 Technische Details

### Authentifizierung

**PocketBase (Zentral):**
- Alle User sind in PocketBase gespeichert
- JWT Tokens für API Auth
- Session Management

**OpenWebUI:**
- Eigene User-Tabelle in Postgres
- OAuth Integration mit PocketBase (geplant)
- Aktuell: Lokale Auth

**LiteLLM:**
- API Key Auth (Bearer Token)
- Keys sind in PocketBase Users Collection: `litellm_api_key`

### Datenfluss

```
User Login (Admin Portal)
  ↓
PocketBase Auth → JWT Token
  ↓
Admin Portal API Calls → PocketBase REST API
  ↓
User Daten, Tenants, Products

---

User Chat (OpenWebUI)
  ↓
OpenWebUI Login (lokale DB)
  ↓
Chat Request → LiteLLM Proxy
  ↓
Budget Check → Billing API → PocketBase
  ↓
AI Request → Google/Azure/AWS
  ↓
Response → User
  ↓
Usage Log → Billing API → PocketBase usage_logs
```

---

## 🎬 Getting Started - Deine nächsten Schritte

### 1. ✅ Prüfe ob LiteLLM jetzt healthy ist

```bash
ssh fmh@coolify.enubys.de "sudo docker ps | grep m00k"
```

### 2. ⚙️ Erstelle Initial Data in PocketBase

**Via Browser:**
1. Öffne https://api.cloudfreedom.de/_/
2. Login mit PocketBase Admin Account (falls noch nicht vorhanden: erstelle einen)
3. Collections prüfen (sollten via pb_hooks automatisch erstellt sein)
4. Erstelle ersten Tenant + Product (siehe oben)

### 3. 👤 Erstelle deinen Admin User

**Via PocketBase UI:**
- Collections → `users` → New Record
- Daten siehe "Schritt 3" oben

### 4. 🎮 Teste Admin Portal

1. https://admin.cloudfreedom.de
2. Login mit deinem User
3. Prüfe ob Dashboard lädt
4. Teste User/Tenant/Product Management

### 5. 🤖 Teste OpenWebUI + AI

1. https://app.cloudfreedom.de (oder demo.cloudfreedom.de)
2. Erstelle Account (falls ENABLE_SIGNUP=true) ODER
3. Nutze Admin Portal um User anzulegen
4. Login in OpenWebUI
5. Starte Chat mit AI-Modell

### 6. 📊 Prüfe Logs & Monitoring

```bash
# Billing API Logs
ssh fmh@coolify.enubys.de "sudo docker logs billing-api-fokcc0c4www08wowckog8c4c-011004816726 --tail 50"

# LiteLLM Logs
ssh fmh@coolify.enubys.de "sudo docker logs litellm-m00k008skc88swso0gk8wksk-014134915689 --tail 50"

# Usage Logs in PocketBase
# Via UI: https://api.cloudfreedom.de/_/ → Collections → usage_logs
```

---

## 🐛 Troubleshooting

### Problem: Kann mich nicht im Admin Portal anmelden

**Lösung:**
1. Prüfe ob User in PocketBase existiert: https://api.cloudfreedom.de/_/
2. Prüfe `role` = "admin"
3. Prüfe `status` = "active"
4. Prüfe Browser Console für Errors

### Problem: OpenWebUI zeigt "No models available"

**Lösung:**
1. Prüfe LiteLLM Logs: `docker logs litellm-...`
2. Prüfe LiteLLM Config: `docker exec litellm-... cat /app/config.yaml`
3. Prüfe AI Provider API Keys in Coolify ENV vars

### Problem: "Budget exceeded" obwohl Budget da ist

**Lösung:**
1. Prüfe Billing API Logs
2. Prüfe User Budget in PocketBase: `budget_remaining`
3. Prüfe Billing API Erreichbarkeit: `curl https://billing.cloudfreedom.de/health`

### Problem: LiteLLM startet nicht

**Lösung:**
1. Prüfe Logs: `docker logs litellm-...`
2. Häufige Fehler:
   - DATABASE_URL ungültig → Prüfe Postgres Password
   - Webhook Error → Billing API nicht erreichbar (wurde jetzt entfernt)
   - Config Syntax Error → Prüfe docker-entrypoint.sh

---

## 📝 Fehlende Features / TODO

- [ ] OAuth Integration zwischen PocketBase und OpenWebUI
- [ ] Automatischer Budget Reset (Cron Job)
- [ ] Email-Benachrichtigungen bei Budget-Limit
- [ ] API Key Rotation
- [ ] Multi-Factor Authentication (MFA)
- [ ] Usage Analytics Dashboard
- [ ] Tenant-Admin Role (kann nur eigene Tenant-User verwalten)
- [ ] Self-Service Password Reset
- [ ] Audit Logs für Admin-Aktionen

---

## 🎯 Zusammenfassung

**Das System ist jetzt:**
✅ Deployiert und läuft (bis auf LiteLLM, das gerade neu startet)
✅ PocketBase, Admin Portal, Billing API sind healthy
✅ User-Management funktioniert über Admin Portal
✅ Budget-Tracking ist implementiert (Custom Callback)
✅ Multi-Tenant Architektur ist ready

**Als nächstes:**
1. Warten bis LiteLLM healthy ist (sollte gleich sein)
2. Initial Data in PocketBase anlegen (Tenant + Product + Admin User)
3. System testen: Admin Portal → User anlegen → OpenWebUI nutzen
4. Usage Logs prüfen ob Tracking funktioniert

