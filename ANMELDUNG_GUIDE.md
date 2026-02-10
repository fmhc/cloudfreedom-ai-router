# 🚀 CloudFreedom - Anmeldung & Test Guide

**Datum:** 2025-10-10  
**Status:** ✅ PocketBase läuft bereits!

---

## 📋 **1. SERVICES IN COOLIFY UMBENENNEN**

Gehe zu: **https://coolify.enubys.de**

### **Service 1: PocketBase Core**
```
UUID: xc884osk40k4o00w4w4gowo4
Aktueller Name: smiling-snail-xc884osk40k4o00w4w4gowo4

👉 UMBENENNEN ZU:
Name: CloudFreedom - PocketBase Core (API Backend)
Description: PocketBase Backend für User-, Tenant- und Product-Management
URL: https://api.cloudfreedom.de
Status: ✅ LÄUFT BEREITS!
```

### **Service 2: Admin Portal**
```
UUID: aoc4s8gc084wkcckogocok8s
Aktueller Name: cloudy-cheetah-aoc4s8gc084wkcckogocok8s

👉 UMBENENNEN ZU:
Name: CloudFreedom - Admin Portal (Frontend)
Description: React Admin Portal mit User-, Tenant-, Product-Management & Analytics
URL: https://admin.cloudfreedom.de
Status: ⏳ Wird gerade deployed
```

### **Service 3: Billing API**
```
UUID: fokcc0c4www08wowckog8c4c
Aktueller Name: successful-seal-fokcc0c4www08wowckog8c4c

👉 UMBENENNEN ZU:
Name: CloudFreedom - Billing API
Description: Node.js Billing API für Budget-Tracking und Usage-Logs
URL: https://billing.cloudfreedom.de
Status: ⏳ Braucht Neustart
```

### **Service 4: Tenant #1 (AI Router)**
```
UUID: m00k008skc88swso0gk8wksk
Aktueller Name: tough-tarsier-m00k008skc88swso0gk8wksk

👉 UMBENENNEN ZU:
Name: CloudFreedom - Tenant #1 (AI Router + OpenWebUI)
Description: LiteLLM mit GPT-5, Gemini 2.5 Pro (1M Context), Claude 4 + OpenWebUI
URL: https://app.cloudfreedom.de
Status: ⏳ Wird gerade deployed mit 2025 Models
```

---

## 🔐 **2. ADMIN USER ERSTELLEN**

### **Option A: Via PocketBase Admin UI (Empfohlen, 2 Min)**

1. **Öffne PocketBase Admin:**
   ```
   https://api.cloudfreedom.de/_/
   ```

2. **Erstelle einen Admin Account:**
   - Email: `admin@cloudfreedom.de`
   - Password: [wähle ein sicheres Passwort]
   - Klick "Create"

3. **Login mit Admin Account**

4. **Gehe zu Collections → `users`**

5. **Erstelle ersten User:**
   ```
   Email:    admin@cloudfreedom.de
   Password: [wähle ein sicheres Passwort]
   Name:     Admin
   Status:   active
   Tenant:   [Wähle "CloudFreedom Internal" aus Dropdown]
   Product:  [Wähle "Professional" aus Dropdown]
   ```

6. **Klick "Create"**

### **Option B: Via Script (wenn du SSH-Zugang hast)**

```bash
# SSH zum Server
ssh root@dein-server

# Gehe zum PocketBase Verzeichnis
cd /var/lib/docker/volumes/[pocketbase-volume]/data

# Führe Script aus
./create_admin_user.sh
```

---

## 🎯 **3. ADMIN PORTAL TESTEN**

### **Warte bis Admin Portal fertig deployed ist:**

```bash
# Check Status (alle paar Sekunden):
curl -s https://admin.cloudfreedom.de 2>/dev/null | head -c 50

# Wenn du HTML siehst → Portal ist online!
```

### **Login:**

1. **Öffne Admin Portal:**
   ```
   https://admin.cloudfreedom.de
   ```

2. **Login-Daten eingeben:**
   ```
   Email:    admin@cloudfreedom.de
   Password: [dein gewähltes Passwort]
   ```

3. **Klick "Sign In"**

---

## ✅ **4. ALLE FEATURES TESTEN**

### **A) Dashboard (Übersicht)**
```
Tab: Dashboard
Was du siehst:
- Total Requests (letzte 7 Tage)
- Total Cost
- Token Usage
- Top Models Chart
- Recent Requests Table
```

### **B) User Management**
```
Tab: Users

Was du tun kannst:
✅ Liste aller User sehen
✅ Neuen User erstellen:
   - Email: test@example.com
   - Password: [sicheres Passwort]
   - Name: Test User
   - Status: active
   - Tenant: CloudFreedom Internal
   - Product: Starter

✅ User bearbeiten (Klick auf Edit)
✅ User löschen (Klick auf Delete)
✅ Status ändern (active ↔ suspended)
```

### **C) Tenant Management**
```
Tab: Tenants

Was du tun kannst:
✅ Liste aller Tenants sehen
✅ Neuen Tenant erstellen:
   - Name: Test Company
   - Status: active
   - Budget: 100.00 EUR

✅ Tenant bearbeiten
✅ API Key sehen (wird automatisch generiert)
✅ Budget ändern
```

### **D) Product Management (Pricing)**
```
Tab: Products

Standardmäßig vorhanden:
✅ Starter - €9.99/month
   - 10,000 tokens/month
   - 100 requests/day
   - Standard models

✅ Professional - €29.99/month
   - 100,000 tokens/month
   - 1,000 requests/day
   - All models + priority

✅ Enterprise - €299.99/month
   - Unlimited tokens
   - Unlimited requests
   - All models + dedicated support

Was du tun kannst:
✅ Neues Produkt erstellen
✅ Preise ändern
✅ Features bearbeiten
✅ Token/Request Limits anpassen
```

### **E) Provider Keys Management**
```
Tab: Provider Keys

Was du hinzufügen kannst:
✅ Google API Key (für Gemini 2.5)
   - Provider: google
   - API Key: [dein Google AI Studio Key]
   - Tenant: CloudFreedom Internal

✅ Azure OpenAI Key (für GPT-5)
   - Provider: azure
   - API Key: [dein Azure Key]
   - Endpoint: [dein Azure Endpoint]
   - Tenant: CloudFreedom Internal

✅ AWS Bedrock Key (für Claude 4)
   - Provider: aws
   - Access Key: [dein AWS Access Key]
   - Secret Key: [dein AWS Secret Key]
   - Region: eu-central-1
   - Tenant: CloudFreedom Internal
```

### **F) Password Change**
```
Klick auf "Change Password" (oben rechts, neben Logout)

✅ Old Password: [aktuelles Passwort]
✅ New Password: [neues Passwort, min. 8 Zeichen]
✅ Confirm Password: [nochmal neues Passwort]
✅ Klick "Change Password"
```

---

## 🤖 **5. AI MODELS TESTEN (Optional)**

### **Warte bis Tenant deployed ist:**

```bash
# Check Status:
curl -s https://app.cloudfreedom.de 2>/dev/null | head -c 50
```

### **Teste die neuen 2025 Models:**

#### **A) Via OpenWebUI:**
```
1. Öffne: https://app.cloudfreedom.de
2. Erstelle Account
3. Wähle Model aus Dropdown:
   - gpt-5
   - gemini-2.5-pro (1M Context!)
   - claude-4-opus
4. Stelle eine Frage!
```

#### **B) Via API (cURL):**

```bash
# Test GPT-5
curl -X POST https://ai.cloudfreedom.de/v1/chat/completions \
  -H "Authorization: Bearer sk-YOUR_TENANT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-5",
    "messages": [
      {"role": "user", "content": "Hallo! Erkläre mir GPT-5 in einem Satz."}
    ]
  }'

# Test Gemini 2.5 Pro (1M Context!)
curl -X POST https://ai.cloudfreedom.de/v1/chat/completions \
  -H "Authorization: Bearer sk-YOUR_TENANT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gemini-2.5-pro",
    "messages": [
      {"role": "user", "content": "Was sind die Vorteile von 1 Million Token Context?"}
    ]
  }'

# Test Claude 4 Opus
curl -X POST https://ai.cloudfreedom.de/v1/chat/completions \
  -H "Authorization: Bearer sk-YOUR_TENANT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "claude-4-opus",
    "messages": [
      {"role": "user", "content": "Welche neuen Features hat Claude 4?"}
    ]
  }'

# Test Smart Routing - "long-context"
curl -X POST https://ai.cloudfreedom.de/v1/chat/completions \
  -H "Authorization: Bearer sk-YOUR_TENANT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "long-context",
    "messages": [
      {"role": "user", "content": "Analysiere diesen langen Text..."}
    ]
  }'
```

---

## 📊 **6. ANALYTICS DASHBOARD CHECKEN**

### **Nach ein paar API-Calls:**

```
Gehe zu: Admin Portal → Dashboard

Du solltest sehen:
✅ Total Requests: [Anzahl deiner Requests]
✅ Total Cost: [Kosten in EUR]
✅ Tokens Used: [Input + Output Tokens]
✅ Top Models Chart (Balkendiagramm)
✅ Recent Requests Table:
   - Timestamp
   - User
   - Model
   - Tokens
   - Cost
   - Status
```

---

## 🐛 **7. TROUBLESHOOTING**

### **Problem: Admin Portal lädt nicht**
```bash
# Check Deployment Status:
https://coolify.enubys.de
→ CloudFreedom - Admin Portal
→ Schau auf "Deployments"
→ Warte bis Status "running:healthy"

# Falls Fehler:
→ Klick "Logs" und check Fehlermeldungen
→ Klick "Restart" um neu zu deployen
```

### **Problem: Login funktioniert nicht**
```
1. Check ob User in PocketBase existiert:
   https://api.cloudfreedom.de/_/
   → Collections → users
   → Suche nach deiner Email

2. Check User Status:
   → Status muss "active" sein
   → Tenant muss gesetzt sein
   → Product muss gesetzt sein

3. Password zurücksetzen:
   → In PocketBase Admin
   → User auswählen
   → "Change Password"
```

### **Problem: Collections nicht vorhanden**
```bash
# PocketBase neustarten:
https://coolify.enubys.de
→ CloudFreedom - PocketBase Core
→ "Restart"

# Check nach ~2 Min:
curl https://api.cloudfreedom.de/api/collections/tenants/records

# Sollte Default Tenant zeigen
```

### **Problem: AI Models antworten nicht**
```
1. Check Provider Keys:
   Admin Portal → Provider Keys
   → Mindestens 1 Key pro Provider hinzufügen

2. Check Tenant API Key:
   Admin Portal → Tenants
   → Kopiere API Key vom Tenant

3. Test mit korrektem API Key:
   curl -X POST https://ai.cloudfreedom.de/v1/chat/completions \
     -H "Authorization: Bearer sk-CORRECT_KEY" \
     ...
```

---

## 🎯 **QUICK CHECKLIST**

### **Setup (einmalig):**
- [ ] Services in Coolify umbenennen
- [ ] Admin User in PocketBase erstellen
- [ ] Login ins Admin Portal
- [ ] Passwort ändern

### **Testen:**
- [ ] Dashboard anschauen
- [ ] Test-User erstellen
- [ ] Test-Tenant erstellen
- [ ] Test-Product erstellen
- [ ] Provider Keys hinzufügen
- [ ] AI Model API-Call testen
- [ ] Analytics Dashboard checken

---

## 📞 **SUPPORT**

### **URLs:**
- 🌐 Admin Portal: https://admin.cloudfreedom.de
- 🔧 API Backend: https://api.cloudfreedom.de
- 🔐 PocketBase Admin: https://api.cloudfreedom.de/_/
- 🚀 Coolify: https://coolify.enubys.de
- 🤖 AI Router: https://ai.cloudfreedom.de
- 💬 OpenWebUI: https://app.cloudfreedom.de

### **Git Repos:**
- Admin Portal: https://gitlab.enubys.de/finn/admin-portal
- Tenant Template: https://gitlab.enubys.de/finn/tenant-template
- PocketBase Core: https://gitlab.enubys.de/finn/pocketbase-core

### **Dokumentation:**
- ALLES_ERLEDIGT.md - Komplette Übersicht
- DEPLOYMENT_DONE.md - Deployment Details
- CONFIGURATION_COMPARISON.md - AI Models Vergleich

---

## 🎉 **VIEL ERFOLG!**

**Du hast jetzt Zugriff auf:**
- ✅ Modernste AI Models (GPT-5, Gemini 2.5, Claude 4)
- ✅ 1 Million Token Context (62x mehr als vorher!)
- ✅ Complete Admin Portal MVP
- ✅ 20+ Management Features
- ✅ Live Analytics Dashboard
- ✅ Multi-Tenant Architecture

**LET'S GO!** 🚀🚀🚀

