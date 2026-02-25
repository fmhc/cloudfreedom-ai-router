# CloudFreedom Agent-as-a-Service

Eine vollständige React/Vite/TypeScript Produktseite mit Stripe-Integration für CloudFreedom's Agent-as-a-Service Platform.

## 🚀 Features

### Landing Page (`/`)
- **Navigation Header** mit CloudFreedom Logo und Links
- **Hero Section** mit Gradient-Design und Call-to-Action
- **Produkt-Übersicht** für 5 KI-Agent-Typen:
  - JobHunter Agent (🎯)
  - Recruiting Agent (👥) - BELIEBT
  - Document Intelligence (📄)
  - DevOps Agent (🛡️)
  - Content Agent (✍️)
- **Statistiken** und **USPs** (Sovereign AI, DSGVO, etc.)
- **Kosten-Vergleich** vs. kommerzielle APIs
- **FAQ Section** mit häufigen Fragen
- **Footer** mit Links und Rechtlichem

### Pricing Page (`/pricing`)
- **Interaktiver Billing-Toggle** (Monatlich/Jährlich mit 20% Rabatt)
- **Detaillierte Feature-Vergleichstabelle**
- **Starter vs. Pro Plans** für jedes Produkt
- **Feature-Matrix** mit allen Details
- **FAQ Section** für Preisfragen

### Stripe Integration
- **Checkout Sessions** (redirect-basiert, nicht embedded)
- **Konfigurierbare Price IDs** für alle Produkte (Platzhalter)
- **Success Page** (`/success`) mit Onboarding-Infos
- **Cancel Page** (`/cancel`) mit Alternativen
- **Webhook Documentation** (`/webhooks`) für Entwickler

### Backend API
- **Express.js Webhook-Handler** (`billing-api/stripe-webhook.ts`)
- **Event-Handler** für alle wichtigen Stripe Events:
  - `checkout.session.completed`
  - `invoice.payment_succeeded`
  - `invoice.payment_failed`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
- **Database-Stubs** für Kunden/Abonnement-Management
- **Agent-Provisioning** Logik
- **E-Mail-Notifications**

## 🛠️ Tech Stack

- **Frontend:** React 19, TypeScript, Tailwind CSS
- **Build:** Vite, PostCSS
- **Router:** React Router DOM v6
- **Payments:** Stripe.js, Stripe Checkout Sessions
- **Backend:** Node.js, Express, TypeScript
- **Styling:** Dunkles Theme mit Purple/Pink Gradienten

## 📁 Projektstruktur

```
admin-portal/
├── src/
│   ├── pages/
│   │   ├── AgentProducts.tsx    # Landing Page (/)
│   │   ├── Pricing.tsx          # Pricing Page (/pricing)
│   │   ├── SuccessPage.tsx      # After successful payment (/success)
│   │   ├── CancelPage.tsx       # After canceled payment (/cancel)
│   │   ├── WebhookInfo.tsx      # Webhook documentation (/webhooks)
│   │   ├── Login.tsx            # Login (existing)
│   │   └── Dashboard.tsx        # Dashboard (existing)
│   ├── lib/
│   │   └── stripe.ts            # Stripe integration & configuration
│   ├── components/              # UI components (existing)
│   └── App.tsx                  # Router setup
├── billing-api/
│   ├── stripe-webhook.ts        # Webhook event handler
│   └── package.json             # Backend dependencies
└── README.md
```

## 🔧 Setup

### 1. Dependencies installieren

```bash
cd admin-portal
npm install
```

### 2. Environment Variables

`.env` Datei erstellen/erweitern:

```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your_publishable_key
```

Für das Backend (`billing-api/.env`):

```env
STRIPE_SECRET_KEY=sk_live_your_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
DATABASE_URL=postgresql://your_database_url
```

### 3. Stripe Konfiguration

1. **Stripe Dashboard** → Developers → Webhooks
2. Endpoint hinzufügen: `https://api.cloudfreedom.de/webhooks/stripe`
3. Events auswählen:
   - `checkout.session.completed`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `customer.created`

4. **Price IDs ersetzen** in `src/lib/stripe.ts`:

```typescript
export const STRIPE_PRICES = {
  JOBHUNTER_STARTER_MONTHLY: 'price_real_jobhunter_49',
  // ... weitere Price IDs
};
```

## 🚀 Development

```bash
# Frontend starten
npm run dev

# Build erstellen
npm run build

# Backend starten (optional)
cd billing-api
npm install
npm run dev
```

## 🔄 Routing

| Route        | Komponente     | Zugriff  | Beschreibung                    |
|------------- |--------------- |--------- |-------------------------------- |
| `/`          | AgentProducts  | Öffentlich | Landing Page mit Produkten      |
| `/pricing`   | Pricing        | Öffentlich | Detaillierte Preisübersicht     |
| `/success`   | SuccessPage    | Öffentlich | Nach erfolgreicher Zahlung     |
| `/cancel`    | CancelPage     | Öffentlich | Nach abgebrochener Zahlung     |
| `/login`     | Login          | Öffentlich | Login (redirect wenn auth)      |
| `/dashboard` | Dashboard      | Geschützt  | Admin Dashboard                 |
| `/webhooks`  | WebhookInfo    | Geschützt  | Webhook-Dokumentation          |

## 💳 Stripe Integration

### Frontend (Checkout)

```typescript
import { createCheckoutSession } from '../lib/stripe';

// Benutzer zu Stripe Checkout weiterleiten
const handleSubscribe = async (priceId: string) => {
  const result = await createCheckoutSession(priceId);
  // Redirect erfolgt automatisch
};
```

### Backend (Webhook)

Der Webhook-Handler in `billing-api/stripe-webhook.ts` verarbeitet automatisch:

- ✅ Neue Abonnements → Agent-Provisioning
- 💰 Erfolgreiche Zahlungen → Service verlängern  
- ❌ Fehlgeschlagene Zahlungen → Benachrichtigungen
- 🔄 Plan-Änderungen → Agent-Konfiguration anpassen
- 🗑️ Kündigungen → Agent deaktivieren

## 🎨 Design System

- **Farben:** Dunkles Theme mit Purple (#9333EA) und Pink (#EC4899) Akzenten
- **Typography:** System-Font Stack mit gestuften Schriftgrößen
- **Layout:** Responsive Grid mit Mobile-first Approach
- **Animation:** Subtile Hover-Effekte und Transitions
- **Icons:** Unicode Emojis für Produkte, Lucide für Interface

## 📋 Produkt-Konfiguration

Alle 5 Agenten sind in `src/lib/stripe.ts` konfiguriert:

```typescript
export const PRODUCTS: ProductConfig[] = [
  {
    id: 'jobhunter',
    name: 'JobHunter Agent',
    emoji: '🎯',
    prices: {
      starter: { monthly: 49, yearly: 39 },
      pro: { monthly: 99, yearly: 79 }
    },
    // ... Features, etc.
  }
  // ... weitere Produkte
];
```

## 🔒 Sicherheit

- **Webhook-Signatur-Verifikation** mit Stripe-Signing-Secret
- **Protected Routes** mit Authentifizierung
- **Environment Variables** für sensitive Daten
- **HTTPS-Only** für Webhook-Endpoints

## 🧪 Testing

### Stripe CLI (Lokal)

```bash
# Webhooks an lokalen Server weiterleiten
stripe listen --forward-to localhost:3001/webhooks/stripe

# Test-Events triggern
stripe trigger checkout.session.completed
```

### Checkout Testing

1. Test-Price-IDs in Stripe Dashboard erstellen
2. Price-IDs in `stripe.ts` ersetzen
3. Checkout-Flow mit Stripe Test-Karten testen

## 📈 Deployment

### Frontend (Vercel/Netlify)

```bash
npm run build
# Upload dist/ Verzeichnis
```

### Backend (Railway/Render)

```bash
cd billing-api
npm install
npm run build
npm start
```

Webhook-URL in Stripe Dashboard auf Production-URL ändern.

## ✅ Status

- [x] **Landing Page** mit Navigation, Hero, Produkten, FAQ, Footer
- [x] **Stripe Integration** mit Checkout Sessions
- [x] **Pricing Page** mit Monatlich/Jährlich Toggle
- [x] **Success/Cancel Pages** mit gutem UX
- [x] **Routing** mit React Router DOM
- [x] **Webhook Backend-Stub** mit allen Event-Handlern
- [x] **TypeScript** ohne Fehler, Build erfolgreich
- [x] **Responsive Design** für Mobile und Desktop
- [x] **Dokumentation** und Deployment-Guides

## 🔮 Nächste Schritte

1. **Echte Stripe-Keys** und Price-IDs einsetzen
2. **Backend deployen** und Webhook-URL konfigurieren
3. **Datenbank** für Kunden/Abonnements einrichten
4. **E-Mail-Service** für Notifications implementieren
5. **Agent-Provisioning** mit echter Infrastruktur
6. **Monitoring** und **Logging** einrichten

---

**Made with ❤️ for CloudFreedom** · Sovereign AI Infrastructure · DSGVO by Design