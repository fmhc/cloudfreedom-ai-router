# 🔧 Docker Container Fix - Admin Portal

**Problem:** Container cs0k8ksoo404gksg800koc84 (admin-portal) hängt fest  
**Fehler:** "could not kill container: tried to kill container, but did not receive an exit event"

---

## ⚡ **SCHNELLE LÖSUNG (In Coolify):**

### **Option 1: Force Restart in Coolify UI**

```
1. Gehe zu: https://coolify.enubys.de
2. Suche "admin-portal"
3. Klick auf den Service
4. Gehe zu "Deployments" Tab
5. Such nach dem fehlgeschlagenen Deployment
6. Klick "Stop" (falls vorhanden)
7. Warte 10 Sekunden
8. Klick "Deploy" oder "Restart"
```

### **Option 2: Service komplett neu deployen**

```
1. In Coolify → admin-portal
2. Klick oben rechts auf "..." (Menü)
3. Wähle "Force Redeploy"
4. Das erstellt einen neuen Container und umgeht das Problem
```

---

## 🔨 **ALTERNATIVE: Docker direkt aufräumen (SSH benötigt)**

Falls du SSH-Zugang zum Server hast:

### **Schritt 1: Container force kill**
```bash
# SSH zum Server
ssh root@dein-server

# Force kill des Container-Prozesses
docker kill --signal=SIGKILL cs0k8ksoo404gksg800koc84

# Oder direkt remove mit force
docker rm -f cs0k8ksoo404gksg800koc84
```

### **Schritt 2: Alle gestoppten Container aufräumen**
```bash
# Alle exited Container löschen
docker container prune -f

# Docker aufräumen
docker system prune -f
```

### **Schritt 3: Service in Coolify neu starten**
```bash
# Zurück zu Coolify UI
# admin-portal → Deploy/Restart klicken
```

---

## 🔍 **URSACHEN-CHECK:**

Dieser Fehler tritt auf wenn:

1. **Container-Prozess zombie ist**
   - Prozess reagiert nicht auf SIGTERM/SIGKILL
   - Docker daemon verliert Kontrolle

2. **Docker Daemon überlastet**
   - Zu viele Container gleichzeitig gestartet
   - Ressourcen erschöpft (CPU/RAM)

3. **Netzwerk-Lock**
   - Container wartet auf Netzwerk-Cleanup
   - Port-Binding hängt

---

## ✅ **EMPFOHLENE VORGEHENSWEISE:**

### **FÜR DICH (ohne SSH):**

```
SCHRITT 1: Force Redeploy in Coolify
────────────────────────────────────────
1. Coolify öffnen
2. admin-portal Service
3. "..." Menü → "Force Redeploy"
4. Warten (~5 Min)

✅ Das sollte funktionieren!
```

### **FALLS DAS NICHT HILFT:**

```
SCHRITT 2: Anderen Container zuerst starten
────────────────────────────────────────────
1. Lass admin-portal erstmal
2. Check ob PocketBase läuft:
   curl https://api.cloudfreedom.de/api/health
3. Wenn PocketBase läuft → erstelle Admin User
4. Versuche admin-portal später nochmal
```

### **NOTFALL-OPTION:**

```
SCHRITT 3: Docker Daemon Neustart (braucht SSH)
────────────────────────────────────────────────
ssh root@server
systemctl restart docker
# Danach in Coolify alle Services neu starten
```

---

## 📊 **ANDERE SERVICES CHECKEN:**

Prüfe ob die anderen Services laufen:

```bash
# PocketBase
curl -s https://api.cloudfreedom.de/api/health
# Sollte: {"message":"API is healthy.","code":200,"data":{}}

# Billing API
curl -s https://billing.cloudfreedom.de/health

# Tenant Template
curl -s https://app.cloudfreedom.de 2>/dev/null | head -c 100
```

**Falls PocketBase läuft:**
→ Du kannst schon mal Admin User erstellen!  
→ Und admin-portal kommt dann später

---

## 🎯 **DEIN PLAN JETZT:**

### **Plan A: admin-portal fixen**
```
1. Coolify → admin-portal
2. Force Redeploy
3. Warten 5 Min
4. Testen: https://admin.cloudfreedom.de
```

### **Plan B: Mit anderen Services weitermachen**
```
1. Check ob PocketBase läuft
2. Erstelle Admin User in PocketBase
3. Arbeite erstmal mit PocketBase Admin UI
4. admin-portal später nochmal versuchen
```

---

## 🚀 **NÄCHSTE SCHRITTE:**

### **JETZT SOFORT:**

1. **Gehe zu Coolify:** https://coolify.enubys.de
2. **admin-portal Service** anklicken
3. **Force Redeploy** wählen
4. **Warten** (~5 Min)

### **PARALLEL CHECKEN:**

```bash
# Check ob PocketBase schon läuft:
curl https://api.cloudfreedom.de/api/health

# Wenn ja → Admin User erstellen:
https://api.cloudfreedom.de/_/
```

---

## 💡 **WICHTIG ZU WISSEN:**

**Docker Kill Fehler sind normal bei:**
- Gleichzeitigem Start vieler Container
- Ressourcen-Engpässen
- Netzwerk-Konfigurationen

**Die Lösung ist fast immer:**
✅ Force Redeploy in Coolify UI

**Das Problem löst sich durch:**
- Neuer Container mit neuer ID
- Frische Docker-Prozesse
- Clean State

---

## 📞 **FALLS ALLES NICHT HILFT:**

```
LETZTE OPTION: Docker Cleanup
──────────────────────────────────────

Wenn du SSH-Zugang hast:

ssh root@server
docker rm -f $(docker ps -aq --filter status=exited)
docker system prune -af --volumes
systemctl restart docker

Dann in Coolify alle Services neu deployen.

⚠️  ACHTUNG: Das löscht alle gestoppten Container!
```

---

## ✅ **ZUSAMMENFASSUNG:**

**Problem:** admin-portal Container hängt fest  
**Lösung:** Force Redeploy in Coolify  
**Zeit:** ~5 Minuten  
**Alternative:** Mit PocketBase weitermachen, admin-portal später

---

**MACH JETZT:**
👉 https://coolify.enubys.de → admin-portal → Force Redeploy

**DANN CHECK:**
👉 https://api.cloudfreedom.de/api/health

**VIEL ERFOLG!** 🚀

