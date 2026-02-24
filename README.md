# CloudFreedom AI Router

🚀 **Multi-Tenant SaaS Platform für AI Services mit deutscher Datenhoheit und transparenter Abrechnung**

## 📋 Übersicht

CloudFreedom AI Router ist eine selbst-gehostete, privacy-first Alternative zu kommerziellen AI-Diensten. Die Plattform ermöglicht es Unternehmen und Entwicklern, verschiedene AI-Modelle (ChatGPT, Claude, Gemini) über eine einzige, deutsche Infrastruktur zu nutzen - mit vollständiger DSGVO-Konformität und transparenter, budget-basierter Abrechnung.

### ✨ Hauptfeatures

- 🇩🇪 **Deutsche Datenhoheit**: Alle Daten bleiben in Deutschland
- 🔒 **Privacy-First**: Keine Datenweitergabe an Dritte
- 💰 **Budget-basiert**: Monatliches Budget statt Abo-Modell
- 🤖 **Multi-Model**: ChatGPT, Claude, Gemini in einem System
- 🏢 **Multi-Tenant**: Separate Instanzen pro Kunde/Team
- 📊 **Transparente Analytics**: Detaillierte Nutzungsstatistiken
- 🔄 **API-kompatibel**: Drop-in replacement für OpenAI API
- ⚡ **High Performance**: <500ms Response Time
- 🛡️ **Enterprise-Ready**: SLA, Support, On-Premise Option

## 🏗️ Architektur

```
CloudFreedom AI Router
├── Core Services (Backend)
│   ├── PocketBase Core (api.cloudfreedom.de) ✅
│   │   ├── User Authentication
│   │   ├── Database (Users, Tenants, Products, Usage)
│   │   └── REST API + Realtime
│   │
│   └── Billing API (billing.cloudfreedom.de) 🚧
│       ├── Budget Checks
│       ├── Usage Logging
│       └── Payment Processing
│
├── Management (Frontend)
│   ├── Admin Portal (admin.cloudfreedom.de) 🚧
│   │   ├── User Management
│   │   ├── Product Configuration
│   │   ├── Tenant Management
│   │   └── Analytics Dashboard
│   │
│   └── Web Entry (cloudfreedom.de) 📋
│       ├── Landing Page
│       ├── Registration
│       └── Documentation
│
└── Tenant Instances (*.cloudfreedom.de) 📋
    ├── LiteLLM Proxy (AI Routing)
    ├── OpenWebUI (Chat Interface)
    └── Budget Integration
```

## 🤖 Agent Hosting (CloudFreedom Agent Platform)

CloudFreedom wird um **Agent-/Bot-Hosting** erweitert: neben dem Managed LLM Routing (Router) können Tenant-spezifische **Bots, Worker und Agenten** sicher auf derselben souveränen Infrastruktur betrieben werden.

Technische Basis:

- **Coolify + Docker** als Deployment-Orchestrierung
- **Traefik** als gemeinsamer Ingress/TLS (automatisches HTTPS pro Subdomain)
- **PocketBase** als Source of Truth (Tenants, Tokens, Bot-Instanzen, Deploy-Logs)

### MVP (dieses Repo)

- **OpenClaw Bot Template**: `templates/openclaw-agent/docker-compose.yml`
  - Raw-Compose-fähig (Coolify Service)
  - Healthcheck + Ressourcengrenzen
  - Persistenz via Volume (`/data`)
  - Traefik Labels für tenant-spezifische Subdomain
  - Per-Tenant Netzwerkisolation

- **Provisioner API (Bun/Hono)**: `src/provisioner/`
  - Deploy/Status/Stop/Restart/Destroy via **Coolify API**
  - Optional: PocketBase Integration für Token/State/Logs

👉 Relevante Doku:

- `docs/MVP-PLAN.md`
- `docs/USER-FLOWS.md`
- `docs/pocketbase-schema-extension.json`

## 🚀 Quick Start

### Voraussetzungen

- Docker & Docker Compose
- GitLab Account (für Code-Zugriff)
- Coolify Instance (für Deployment)
- AI Provider API Keys (OpenAI, Anthropic, Google)

### Deployment

#### 1. PocketBase Core (bereits deployed ✅)
```bash
git clone https://gitlab.enubys.de/finn/pocketbase-core.git
cd pocketbase-core
docker-compose up -d
```

#### 2. Billing API
```bash
git clone https://gitlab.enubys.de/finn/billing-api.git
cd billing-api
cp env.example .env
# Edit .env with your API keys
docker-compose up -d
```

#### 3. Admin Portal (in Entwicklung)
```bash
git clone https://gitlab.enubys.de/finn/admin-portal.git
cd admin-portal
bun install
bun run dev  # Development
bun run build && docker-compose up -d  # Production
```

#### 4. Tenant Instance
```bash
git clone https://gitlab.enubys.de/finn/tenant-template.git
cd tenant-template
cp env.example .env
# Edit .env with tenant-specific config
docker-compose up -d
```

## 📊 Tech Stack

### Backend
- **PocketBase** (Go) - Auth & Database
- **Hono + Bun** (TypeScript) - Billing API
- **LiteLLM** (Python) - AI Proxy
- **OpenWebUI** (Python/Node.js) - Chat Interface

### Frontend
- **React 19** - UI Framework
- **Vite 6** - Build Tool
- **TanStack Router** - Routing
- **TanStack Query** - Data Fetching
- **Zustand** - State Management
- **Shadcn/UI** - UI Components
- **Tailwind CSS** - Styling

### Infrastructure
- **Docker** - Containerization
- **Coolify** - Deployment Platform
- **Traefik** - Reverse Proxy
- **GitLab** - Source Control
- **PostgreSQL** - LiteLLM & OpenWebUI DB
- **Redis** - Caching (planned)

## 💰 Pricing

### Starter (€9.99/month)
- 25€ AI Budget included
- 1 User
- ChatGPT 4o-mini, Claude 3.5 Haiku
- Email Support

### Professional (€29.99/month)
- 100€ AI Budget included
- 5 Users
- All AI Models (GPT-4, Claude 3.5 Sonnet, Gemini Pro)
- Priority Support
- Custom Branding

### Enterprise (Custom)
- Custom AI Budget
- Unlimited Users
- Dedicated Tenant
- Custom Domain
- SLA & 24/7 Support
- On-Premise Option

### AI Model Costs (Pass-through + 20% Margin)
Wir berechnen die tatsächlichen Kosten der AI-Provider + 20% Service-Gebühr:

| Model | Input (per 1K tokens) | Output (per 1K tokens) |
|-------|----------------------|------------------------|
| GPT-4o | €0.036 | €0.072 |
| GPT-4o-mini | €0.0018 | €0.0072 |
| Claude 3.5 Sonnet | €0.0036 | €0.018 |
| Claude 3.5 Haiku | €0.00096 | €0.0048 |
| Gemini 1.5 Pro | €0.0015 | €0.006 |

## 📚 Dokumentation

- **[Implementation Roadmap](IMPLEMENTATION_ROADMAP.md)** - Detaillierter Implementierungsplan
- **[Deployment Progress](DEPLOYMENT_PROGRESS.md)** - Aktueller Deployment-Status
- **[Status Summary](STATUS_SUMMARY.md)** - Echtzeit-Fortschritt
- **[Next Steps](NEXT_STEPS.md)** - Nächste Schritte & Anleitungen

### API Dokumentation

#### PocketBase Core (api.cloudfreedom.de)
- **Health**: `GET /api/health`
- **Auth**: `POST /api/collections/users/auth-with-password`
- **Users**: `GET /api/collections/users/records`
- **Products**: `GET /api/collections/products/records`
- **Tenants**: `GET /api/collections/tenants/records`

#### Billing API (billing.cloudfreedom.de)
- **Health**: `GET /`
- **Check Budget**: `POST /api/check-budget`
- **Log Usage**: `POST /api/log-usage`
- **Reset Budgets**: `POST /api/admin/reset-budgets` (Admin only)

#### LiteLLM Proxy (app.cloudfreedom.de)
- **Models**: `GET /v1/models`
- **Chat Completion**: `POST /v1/chat/completions`
- **Streaming**: `POST /v1/chat/completions` (with `stream: true`)

## 🔐 Security

### Authentifizierung
- OAuth 2.0 (Google, GitHub, GitLab)
- Email/Password with verification
- JWT Tokens (via PocketBase)
- API Keys for service-to-service

### Datenverarbeitung
- DSGVO-konform
- Daten in Deutschland
- Keine Weitergabe an Dritte
- Audit Logs für alle Operationen

### Netzwerk
- HTTPS only
- CORS konfiguriert
- Rate Limiting pro User
- IP Whitelisting (Enterprise)

## 📈 Monitoring & Analytics

### Service Health
- Uptime Monitoring
- Response Time Tracking
- Error Rate Monitoring
- Resource Usage (CPU, RAM, Disk)

### Business Metrics
- Active Users (DAU, MAU)
- Revenue (MRR, ARR)
- Churn Rate
- Customer Acquisition Cost (CAC)
- Lifetime Value (LTV)

### Usage Analytics
- AI Requests per Day
- Model Distribution
- Budget Usage
- Token Consumption
- Response Times

## 🛠️ Development

### Local Development

```bash
# PocketBase Core
cd pocketbase-core
docker-compose up

# Billing API
cd billing-api
bun install
bun run index.js

# Admin Portal
cd admin-portal
bun install
bun run dev

# Tenant Template
cd tenant-template
docker-compose up
```

### Testing

```bash
# Unit Tests
bun test

# Integration Tests
bun test:integration

# E2E Tests
bun test:e2e
```

### Code Quality

```bash
# Linting
bun run lint

# Type Checking
bun run typecheck

# Formatting
bun run format
```

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

- **Email**: support@cloudfreedom.de
- **Discord**: [Join our Discord](https://discord.gg/cloudfreedom)
- **Documentation**: [docs.cloudfreedom.de](https://docs.cloudfreedom.de)
- **Status Page**: [status.cloudfreedom.de](https://status.cloudfreedom.de)

## 🎯 Roadmap

### Q4 2025 (Current)
- [x] Core Infrastructure (PocketBase, Billing API)
- [x] Documentation & Architecture
- [ ] Admin Portal MVP
- [ ] First Tenant Instance
- [ ] Private Beta Launch

### Q1 2026
- [ ] Payment Integration (Stripe)
- [ ] Web Entry Point
- [ ] Public Beta
- [ ] First 100 Users

### Q2 2026
- [ ] Enterprise Features
- [ ] Advanced Analytics
- [ ] Mobile App
- [ ] API Marketplace

## 📊 Status

**Current Phase**: Week 1 - Core Infrastructure
**Progress**: ~20% Complete
**Next Milestone**: Admin Portal MVP (Week 2)
**Estimated MVP**: 16. Oktober 2025
**Estimated Launch**: 30. Oktober 2025

---

**Built with ❤️ by CloudFreedom Team**
**Powered by Open Source** | **Hosted in Germany** | **DSGVO Compliant**


