# ⚡ CloudFreedom AI Router - Schnelle Deployment Anleitung

**Zeit**: 10-15 Minuten für alle Services!  
**Datum**: 09. Oktober 2025, 03:30 Uhr

---

## 🎯 Was du jetzt machen musst:

### ✅ SCHRITT 1: PocketBase Core neu deployen (2 Minuten)

**Warum?** Um den neuen Hook zu aktivieren, der automatisch alle Collections erstellt!

1. Öffne: https://coolify.enubys.de/project/pwos0c0cks8wk0ckg4084w0o/environment/ikw0c8ko0cgkscc0cgkscckk/application/xc884osk40k4o00w4w4gowo4

2. Klicke oben rechts auf den **"Deploy"** Button (grün)

3. Warte ~1-2 Minuten

4. **Verifi

ziere**: Gehe zu https://api.cloudfreedom.de/_/
   - Login mit deinen Admin-Credentials
   - Prüfe ob diese Collections existieren:
     - ✅ tenants
     - ✅ products
     - ✅ users (mit erweiterten Feldern)
     - ✅ usage_logs
   - Prüfe ob Default-Daten existieren:
     - ✅ 3 Products (Starter, Professional, Enterprise)
     - ✅ 3 Tenants (app, demo, dev)

✅ **Fertig! Collections sind automatisch da!**

---

### ✅ SCHRITT 2: Billing API deployen (5 Minuten)

1. Öffne: https://coolify.enubys.de/project/pwos0c0cks8wk0ckg4084w0o/environment/ikw0c8ko0cgkscc0cgkscckk

2. Klicke **"+ New"**

3. Wähle **"Private Repository (with Deploy Key)"**

4. Server auswählen: **ace-bunker**

5. Repository URL:
   ```
   https://oauth2:$GITLAB_TOKEN@gitlab.enubys.de/finn/billing-api.git
   ```

6. Branch: **main**

7. Klicke **"Continue"**

8. Configuration:
   - Name: `billing-api`
   - Build Pack: **Docker Compose**
   - Docker Compose Location: `/docker-compose.yml`

9. Domain hinzufügen: **billing.cloudfreedom.de**

10. **Environment Variables** (Bulk Edit):
    ```env
    PORT=3000
    POCKETBASE_URL=http://pocketbase-core:8090
    BILLING_API_KEY=ph+thaW/V12UdnMDkFSlLiY0GSRQfyA9Kt4KU2c8HO4=
    ADMIN_SECRET_KEY=maSnimUURY2MqxGkSFM0zvHBfKSOlEqWu33shtisWzg=
    ```

11. Klicke **"Save"** und dann **"Deploy"**

12. **Verifiziere**: 
    ```bash
    curl https://billing.cloudfreedom.de/
    # Sollte zurückgeben: {"message":"Billing API is healthy!"}
    ```

---

### ✅ SCHRITT 3: Admin Portal deployen (5 Minuten)

1. Öffne: https://coolify.enubys.de/project/pwos0c0cks8wk0ckg4084w0o/environment/ikw0c8ko0cgkscc0cgkscckk

2. Klicke **"+ New"**

3. Wähle **"Private Repository (with Deploy Key)"**

4. Server auswählen: **ace-bunker**

5. Repository URL:
   ```
   https://oauth2:$GITLAB_TOKEN@gitlab.enubys.de/finn/admin-portal.git
   ```

6. Branch: **main**

7. Klicke **"Continue"**

8. Configuration:
   - Name: `admin-portal`
   - Build Pack: **Docker Compose**
   - Docker Compose Location: `/docker-compose.yml`

9. Domain hinzufügen: **admin.cloudfreedom.de**

10. **Environment Variables** (Bulk Edit):
    ```env
    PORT=3000
    VITE_POCKETBASE_URL=https://api.cloudfreedom.de
    VITE_BILLING_API_URL=https://billing.cloudfreedom.de
    VITE_BILLING_API_KEY=ph+thaW/V12UdnMDkFSlLiY0GSRQfyA9Kt4KU2c8HO4=
    VITE_ADMIN_SECRET_KEY=maSnimUURY2MqxGkSFM0zvHBfKSOlEqWu33shtisWzg=
    ```

11. Klicke **"Save"** und dann **"Deploy"**

12. **Verifiziere**: Öffne https://admin.cloudfreedom.de
    - Sollte Login-Seite anzeigen

---

### ✅ SCHRITT 4: Admin User erstellen (1 Minute)

1. Öffne: https://api.cloudfreedom.de/_/

2. Login mit Admin-Credentials

3. Gehe zu **"users"** Collection

4. Klicke **"+ New record"**

5. Fülle aus:
   - Email: `admin@cloudfreedom.de`
   - Password: `(dein sicheres Passwort)`
   - Verified: ✓ (Checkbox anklicken)
   - Status: `active` (Dropdown)
   - Product: (wähle einen Product-ID aus)
   - Tenant: (wähle einen Tenant-ID aus)

6. Klicke **"Create"**

7. **Teste Login**: Öffne https://admin.cloudfreedom.de
   - Login mit `admin@cloudfreedom.de`
   - Sollte Dashboard anzeigen! 🎉

---

### ✅ SCHRITT 5: Ersten Tenant deployen (10 Minuten)

**⚠️ WICHTIG**: Du brauchst deine **echten AI API Keys**!
- OpenAI: https://platform.openai.com/api-keys
- Anthropic: https://console.anthropic.com/settings/keys
- Google: https://aistudio.google.com/app/apikey

1. Öffne: https://coolify.enubys.de/project/pwos0c0cks8wk0ckg4084w0o/environment/ikw0c8ko0cgkscc0cgkscckk

2. Klicke **"+ New"**

3. Wähle **"Private Repository (with Deploy Key)"**

4. Server auswählen: **ace-bunker**

5. Repository URL:
   ```
   https://oauth2:$GITLAB_TOKEN@gitlab.enubys.de/finn/tenant-template.git
   ```

6. Branch: **main**

7. Klicke **"Continue"**

8. Configuration:
   - Name: `tenant-app`
   - Build Pack: **Docker Compose**
   - Docker Compose Location: `/docker-compose.yml`

9. Domain hinzufügen: **app.cloudfreedom.de**

10. **Environment Variables** (Bulk Edit):
    ```env
    # Tenant Config
    TENANT_SLUG=app
    TENANT_NAME=CloudFreedom Internal
    TENANT_ID=internal-001
    
    # Ports
    LITELLM_PORT=4000
    OPENWEBUI_PORT=3000
    
    # LiteLLM Master Key (generiere neu!)
    LITELLM_MASTER_KEY=DEIN_SECURE_KEY_32_CHARS
    
    # AI Provider Keys (ERSETZE MIT ECHTEN KEYS!)
    OPENAI_API_KEY=sk-proj-xxxxx
    ANTHROPIC_API_KEY=sk-ant-xxxxx
    GOOGLE_API_KEY=AIzaxxxxx
    
    # CloudFreedom Integration
    POCKETBASE_URL=http://pocketbase-core:8090
    BILLING_API_URL=http://billing-api:3000
    BILLING_API_KEY=ph+thaW/V12UdnMDkFSlLiY0GSRQfyA9Kt4KU2c8HO4=
    
    # Database (generiere neu!)
    POSTGRES_DB=cloudfreedom_app
    POSTGRES_USER=cloudfreedom
    POSTGRES_PASSWORD=DEIN_SECURE_PASSWORD
    
    # Redis (generiere neu!)
    REDIS_PASSWORD=DEIN_SECURE_PASSWORD
    
    # OpenWebUI
    ENABLE_SIGNUP=false
    ```

11. **Generiere sichere Keys**:
    ```bash
    # Im Terminal:
    openssl rand -base64 32  # Für LITELLM_MASTER_KEY
    openssl rand -base64 32  # Für POSTGRES_PASSWORD
    openssl rand -base64 32  # Für REDIS_PASSWORD
    ```

12. Klicke **"Save"** und dann **"Deploy"**

13. **Verifiziere** (dauert ~5 Minuten):
    - Öffne https://app.cloudfreedom.de
    - Sollte OpenWebUI Chat-Interface zeigen! 🚀

---

## 🎉 FERTIG! Alles deployed!

### Teste jetzt End-to-End:

1. **Erstelle Test-User** (in Admin Portal):
   - Login: https://admin.cloudfreedom.de
   - Gehe zu "Users" Tab
   - Erstelle User: test@cloudfreedom.de

2. **Teste AI Chat**:
   - Login: https://app.cloudfreedom.de
   - Erstelle Account mit test@cloudfreedom.de
   - Starte Chat: "Hello! This is a test."
   - Sollte AI-Antwort bekommen! ✨

3. **Prüfe Usage Tracking**:
   - Zurück zum Admin Portal
   - Overview Tab
   - Sollte Usage Statistics zeigen!

---

## 📊 Deployment Status

| Service | URL | Status |
|---------|-----|--------|
| PocketBase Core | https://api.cloudfreedom.de | ✅ Ready |
| Billing API | https://billing.cloudfreedom.de | ⏳ Deploy |
| Admin Portal | https://admin.cloudfreedom.de | ⏳ Deploy |
| Tenant (Internal) | https://app.cloudfreedom.de | ⏳ Deploy |

---

## 🐛 Quick Troubleshooting

### Billing API startet nicht?
```bash
# Check logs in Coolify
# Prüfe ob PocketBase erreichbar ist
docker exec billing-api curl http://pocketbase-core:8090/api/health
```

### Admin Portal zeigt "Network Error"?
```bash
# Prüfe Environment Variables
# Verifiziere URLs sind korrekt (https:// für externe)
```

### Tenant zeigt "Budget Check Failed"?
```bash
# Prüfe ob Billing API läuft
curl https://billing.cloudfreedom.de/
# Prüfe ob User Budget hat (in Admin Portal)
```

---

## 🚀 NÄCHSTE SCHRITTE

Nach erfolgreichem Deployment:

1. **Stripe Integration** (für echte Payments)
2. **Web Entry Point** (öffentliche Website)
3. **Beta User einladen**
4. **Monitoring Setup** (Uptime Kuma)

---

**Du hast es geschafft!** 🎉

Die komplette Multi-Tenant AI SaaS Plattform ist jetzt **LIVE**!

**Zeit investiert**: ~20-25 Minuten  
**Ergebnis**: Production-ready Platform  
**Nächster Schritt**: First Paying Customers! 💰

---

**Support**: support@cloudfreedom.de  
**Dokumentation**: Siehe README.md und andere Docs  
**GitLab**: https://gitlab.enubys.de/finn

---

**Created**: 09. Oktober 2025, 03:30 Uhr  
**Status**: READY TO DEPLOY! 🚀

