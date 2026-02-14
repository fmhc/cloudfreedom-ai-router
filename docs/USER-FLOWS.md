# User Flows — CloudFreedom Agent Platform

## Flow 1: Neuer Kunde deployt OpenClaw Bot

```
1. Signup auf cloudfreedom.de (Email + Passwort)
2. Tenant wird in PocketBase angelegt
3. Plan wählen (Starter €49 / Team €199 / Business €799)
4. Bot-Template auswählen (MVP: OpenClaw)
5. Secrets eingeben:
   - LLM API Key (Anthropic/OpenAI/Google)
   - Optional: Telegram/Discord Token
   - Agent Name + Beschreibung
6. "Deploy" klicken
7. Provisioner erstellt:
   - Docker Compose aus Template + Tenant-Config
   - Coolify Projekt + Service
   - Traefik Route: {tenant}.cloudfreedom.de
8. Status: queued → deploying → running
9. Ergebnis:
   - Bot URL: https://{tenant}.cloudfreedom.de
   - Agent Token für API-Zugriff
   - Monitoring Link
```

**Zeit: < 5 Minuten** vom Signup bis zum laufenden Bot.

## Flow 2: Tenant verwaltet seinen Bot

```
1. Login → Admin Portal (admin.cloudfreedom.de)
2. Dashboard zeigt:
   - Bot Status (healthy / unhealthy / stopped)
   - Uptime + letzte Aktivität
   - Resource Usage (CPU/RAM/Disk)
   - Token Usage (LLM API Calls)
   - Aktueller Verbrauch vs Budget
3. Aktionen:
   - Logs einsehen (letzte 100 Zeilen)
   - Bot stoppen / starten / redeployen
   - Secrets rotieren (API Keys ändern)
   - Config ändern (Model, Name, Channels)
   - Plan upgraden/downgraden
4. Billing:
   - Aktueller Monat: Base + Usage
   - Rechnungshistorie
   - Zahlungsmethode verwalten
```

## Flow 3: Operator fügt Worker Node hinzu

```
1. Admin Login (Operator-Rolle)
2. Node Management → "Add Node"
3. Eingabe:
   - Hostname / IP
   - SSH Key oder Passwort
   - Region (DE/EU)
   - Capacity (max Tenants, CPU, RAM)
4. System verifiziert:
   - SSH Zugang funktioniert
   - Docker installiert + läuft
   - Netzwerk erreichbar
5. Node wird registriert:
   - Capacity Limits gesetzt
   - In Coolify als Server hinzugefügt
   - Health Monitoring aktiviert
6. Neue Tenant-Deployments können auf Node landen
```

## Flow 4: Bot-Template hinzufügen (Operator)

```
1. Template-Katalog → "Neues Template"
2. Eingabe:
   - Name + Beschreibung
   - Docker Compose YAML
   - Required Secrets (Schema)
   - Default Config
   - Resource Defaults (CPU/RAM)
3. Template wird in PocketBase gespeichert
4. Ab sofort im Onboarding-Wizard verfügbar
```
