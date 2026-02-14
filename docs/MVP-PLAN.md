# MVP Plan — CloudFreedom Agent Platform

## Vision
CloudFreedom wird von einer reinen LLM-Routing-Plattform zur **Sovereign Agent Hosting Platform**.
Kunden können KI-Agenten (OpenClaw, Custom Bots) mit einem Klick deployen — DSGVO-konform, auf deutscher Infrastruktur.

## Ressourcen (IST)
- **Coolify Server:** 152.53.179.226, 12 Cores, 31GB RAM, 2TB Disk
- **Frei:** ~24GB RAM, 1.9TB Disk
- **Laufende Services:** CloudFreedom Core (PocketBase, Billing, Admin, Website) + diverse Projekte
- **Pro Bot-Instanz:** ~256MB-1GB RAM, minimal CPU

## Phasen

### Phase 1: Template + Manual Deploy (JETZT)
**Dauer:** 1-2 Tage
**Was:**
- [x] OpenClaw Docker Compose Template erstellt
- [x] Provisioner API (Bun/Hono) mit Coolify Integration
- [ ] Test-Deployment eines OpenClaw Bots auf Coolify
- [ ] Verify: Bot startet, ist gesund, Traefik Route funktioniert

**Ergebnis:** Wir können manuell OpenClaw-Instanzen deployen.

### Phase 2: Provisioner API + PocketBase (1-2 Wochen)
**Was:**
- [ ] PocketBase Collections: bot_templates, bot_instances, deploy_logs
- [ ] Provisioner als Service auf Coolify deployen
- [ ] API: deploy/stop/restart/destroy per REST Call
- [ ] Billing API: Compute-Usage tracking (CPU/RAM pro Tenant)
- [ ] Basic Monitoring (health checks, alerts)

**Ergebnis:** Bots per API-Call deployen + verwalten.

### Phase 3: Admin Portal UI (2-4 Wochen)
**Was:**
- [ ] Bot-Management in bestehendem Admin Portal
- [ ] Template-Katalog (OpenClaw + custom)
- [ ] Deploy-Wizard (Secrets eingeben → Deploy)
- [ ] Status Dashboard (live health, logs, usage)
- [ ] Billing Integration (Usage → Rechnung)

**Ergebnis:** Self-Service Bot-Management im Browser.

### Phase 4: Public Launch (4-8 Wochen)
**Was:**
- [ ] Signup-Flow auf cloudfreedom.de
- [ ] Stripe/SEPA Payment Integration
- [ ] Automated Provisioning (Signup → Deploy in < 5 Min)
- [ ] Documentation + API Docs
- [ ] Landing Page Update (Agent Hosting prominent)
- [ ] First 10 paying customers

**Ergebnis:** Zahlende Kunden deployen selbständig Bots.

## Pricing (Vorschlag)

| Plan | Preis | Inkludiert | Zielgruppe |
|------|-------|-----------|------------|
| Starter | €49/Monat | 1 Bot, 1 CPU, 1GB RAM, 25€ LLM Budget | Solo/Hobby |
| Team | €199/Monat | 5 Bots, 4 CPU, 4GB RAM, 100€ LLM Budget | Startups |
| Business | €799/Monat | 20 Bots, dedizierte Ressourcen, SSO, SLA | KMU |
| Sovereign | ab €3k/Monat | Dedicated Node, On-Prem Option, Custom | Enterprise |

## Tech Stack (kein Overengineering)
- **Runtime:** Docker (via Coolify) — kein Podman, kein K8s
- **Proxy:** Traefik (bereits da) — automatisches HTTPS
- **Control Plane:** PocketBase (bereits da)
- **Billing:** Billing API (bereits da)
- **Provisioner:** Bun/Hono (neu, ~200 LOC)
- **Admin UI:** Bestehendes Admin Portal erweitern
