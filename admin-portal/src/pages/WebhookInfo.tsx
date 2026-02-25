import { Link } from 'react-router-dom';

export default function WebhookInfo() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/30 to-gray-950 text-white">
      {/* Header */}
      <nav className="flex items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            CloudFreedom
          </div>
        </Link>
        <div className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-gray-300 hover:text-white transition">Startseite</Link>
          <Link to="/dashboard" className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium hover:bg-purple-500 transition">
            Dashboard
          </Link>
        </div>
      </nav>

      <div className="mx-auto max-w-4xl px-6 py-12">
        {/* Title */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold">
            Stripe Webhook <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Setup</span>
          </h1>
          <p className="text-lg text-gray-300">
            Dokumentation zur Einrichtung der Stripe Webhook-Integration für automatisierte Billing-Events
          </p>
        </div>

        {/* Overview */}
        <section className="mb-12 rounded-2xl border border-gray-800 bg-gray-900/40 p-8">
          <h2 className="mb-6 text-2xl font-bold text-purple-400">Überblick</h2>
          <p className="mb-4 text-gray-300">
            CloudFreedom nutzt Stripe Webhooks zur automatischen Verarbeitung von Billing-Events wie erfolgreiche Zahlungen,
            Abonnement-Änderungen und fehlgeschlagene Zahlungen. Diese Integration gewährleistet eine nahtlose
            Synchronisation zwischen Stripe und unserem System.
          </p>
          
          <div className="rounded-lg bg-purple-500/10 border border-purple-500/20 p-4">
            <h3 className="mb-2 font-bold text-purple-300">🎯 Wichtige Events</h3>
            <ul className="space-y-1 text-sm text-gray-300">
              <li>• <code className="text-purple-300">checkout.session.completed</code> - Neue Abonnements aktivieren</li>
              <li>• <code className="text-purple-300">invoice.payment_succeeded</code> - Erfolgreiche Zahlungen verarbeiten</li>
              <li>• <code className="text-purple-300">invoice.payment_failed</code> - Fehlgeschlagene Zahlungen handhaben</li>
              <li>• <code className="text-purple-300">customer.subscription.updated</code> - Plan-Änderungen synchronisieren</li>
              <li>• <code className="text-purple-300">customer.subscription.deleted</code> - Kündigungen verarbeiten</li>
            </ul>
          </div>
        </section>

        {/* Setup Guide */}
        <section className="mb-12">
          <h2 className="mb-6 text-2xl font-bold text-purple-400">Einrichtung</h2>
          
          <div className="space-y-6">
            {/* Step 1 */}
            <div className="rounded-2xl border border-gray-800 bg-gray-900/40 p-6">
              <div className="mb-4 flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-600 text-sm font-bold">1</span>
                <h3 className="text-xl font-bold">Backend-Endpoint erstellen</h3>
              </div>
              <p className="mb-4 text-gray-300">
                Der Webhook-Handler befindet sich unter <code className="rounded bg-gray-800 px-2 py-1 text-purple-300">billing-api/stripe-webhook.ts</code>
              </p>
              <div className="rounded-lg bg-gray-800/50 p-4">
                <div className="mb-2 text-sm text-gray-400">Endpoint URL:</div>
                <code className="text-green-400">https://api.cloudfreedom.de/webhooks/stripe</code>
              </div>
            </div>

            {/* Step 2 */}
            <div className="rounded-2xl border border-gray-800 bg-gray-900/40 p-6">
              <div className="mb-4 flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-600 text-sm font-bold">2</span>
                <h3 className="text-xl font-bold">Stripe Dashboard Konfiguration</h3>
              </div>
              <ol className="space-y-3 text-sm text-gray-300">
                <li>1. Stripe Dashboard → <strong>Developers</strong> → <strong>Webhooks</strong></li>
                <li>2. <strong>"Add endpoint"</strong> klicken</li>
                <li>3. Endpoint URL eingeben: <code className="text-purple-300">https://api.cloudfreedom.de/webhooks/stripe</code></li>
                <li>4. Events auswählen (siehe unten)</li>
                <li>5. Webhook erstellen und <strong>Signing Secret</strong> kopieren</li>
              </ol>
            </div>

            {/* Step 3 */}
            <div className="rounded-2xl border border-gray-800 bg-gray-900/40 p-6">
              <div className="mb-4 flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-600 text-sm font-bold">3</span>
                <h3 className="text-xl font-bold">Environment Variables</h3>
              </div>
              <div className="rounded-lg bg-gray-800/50 p-4">
                <pre className="text-sm text-gray-300"><code>{`# .env (Backend)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
DATABASE_URL=postgresql://...

# .env (Frontend) 
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...`}</code></pre>
              </div>
            </div>
          </div>
        </section>

        {/* Required Events */}
        <section className="mb-12 rounded-2xl border border-gray-800 bg-gray-900/40 p-8">
          <h2 className="mb-6 text-2xl font-bold text-purple-400">Erforderliche Webhook Events</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="mb-3 text-lg font-bold">Checkout & Subscriptions</h3>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-lg border border-gray-700 p-4">
                  <code className="mb-2 block text-purple-300">checkout.session.completed</code>
                  <p className="text-sm text-gray-400">Neue Kunden nach erfolgreicher Zahlung aktivieren</p>
                </div>
                <div className="rounded-lg border border-gray-700 p-4">
                  <code className="mb-2 block text-purple-300">customer.subscription.created</code>
                  <p className="text-sm text-gray-400">Abonnement in der Datenbank erstellen</p>
                </div>
                <div className="rounded-lg border border-gray-700 p-4">
                  <code className="mb-2 block text-purple-300">customer.subscription.updated</code>
                  <p className="text-sm text-gray-400">Plan-Änderungen, Upgrades/Downgrades</p>
                </div>
                <div className="rounded-lg border border-gray-700 p-4">
                  <code className="mb-2 block text-purple-300">customer.subscription.deleted</code>
                  <p className="text-sm text-gray-400">Kündigungen verarbeiten, Zugang deaktivieren</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="mb-3 text-lg font-bold">Payments & Invoices</h3>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-lg border border-gray-700 p-4">
                  <code className="mb-2 block text-purple-300">invoice.payment_succeeded</code>
                  <p className="text-sm text-gray-400">Erfolgreiche Zahlungen loggen, Service verlängern</p>
                </div>
                <div className="rounded-lg border border-gray-700 p-4">
                  <code className="mb-2 block text-purple-300">invoice.payment_failed</code>
                  <p className="text-sm text-gray-400">Fehlgeschlagene Zahlungen behandeln</p>
                </div>
                <div className="rounded-lg border border-gray-700 p-4">
                  <code className="mb-2 block text-purple-300">invoice.finalized</code>
                  <p className="text-sm text-gray-400">Rechnungen an Kunden weiterleiten</p>
                </div>
                <div className="rounded-lg border border-gray-700 p-4">
                  <code className="mb-2 block text-purple-300">customer.created</code>
                  <p className="text-sm text-gray-400">Neue Kunden in der Datenbank anlegen</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Security */}
        <section className="mb-12 rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-8">
          <h2 className="mb-6 text-2xl font-bold text-yellow-400">🔒 Sicherheit</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="mb-2 font-bold text-yellow-300">Webhook Signatur-Verifizierung</h3>
              <p className="mb-3 text-sm text-gray-300">
                Alle Webhooks MÜSSEN mit dem Stripe Signing Secret verifiziert werden, um Manipulation zu verhindern.
              </p>
              <div className="rounded-lg bg-gray-800/50 p-4">
                <pre className="text-sm text-gray-300"><code>{`const sig = request.headers['stripe-signature'];
const event = stripe.webhooks.constructEvent(
  request.body, 
  sig, 
  process.env.STRIPE_WEBHOOK_SECRET
);`}</code></pre>
              </div>
            </div>

            <div>
              <h3 className="mb-2 font-bold text-yellow-300">HTTPS & IP-Whitelist</h3>
              <ul className="space-y-1 text-sm text-gray-300">
                <li>• Webhook-Endpoint MUSS über HTTPS erreichbar sein</li>
                <li>• Optionale IP-Whitelist für Stripe-IPs implementieren</li>
                <li>• Rate Limiting zum Schutz vor Spam einrichten</li>
                <li>• Idempotenz-Keys für doppelte Events verwenden</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Testing */}
        <section className="mb-12 rounded-2xl border border-blue-500/20 bg-blue-500/5 p-8">
          <h2 className="mb-6 text-2xl font-bold text-blue-400">🧪 Testing</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="mb-2 font-bold text-blue-300">Stripe CLI</h3>
              <p className="mb-3 text-sm text-gray-300">Lokales Testing mit dem Stripe CLI:</p>
              <div className="rounded-lg bg-gray-800/50 p-4">
                <pre className="text-sm text-gray-300"><code>{`# Webhook-Events an lokalen Server weiterleiten
stripe listen --forward-to localhost:3001/webhooks/stripe

# Spezifische Events testen
stripe trigger checkout.session.completed`}</code></pre>
              </div>
            </div>

            <div>
              <h3 className="mb-2 font-bold text-blue-300">Test Events</h3>
              <p className="text-sm text-gray-300">
                Im Stripe Dashboard unter <strong>Developers → Events</strong> können Sie Test-Events manuell
                an Ihren Webhook senden.
              </p>
            </div>
          </div>
        </section>

        {/* Implementation Status */}
        <section className="rounded-2xl border border-gray-800 bg-gray-900/40 p-8">
          <h2 className="mb-6 text-2xl font-bold text-purple-400">Implementation Status</h2>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-green-400">✅</span>
              <span className="text-gray-300">Frontend Stripe Integration (Checkout Sessions)</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-green-400">✅</span>
              <span className="text-gray-300">Backend Webhook-Endpoint Stub erstellt</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-orange-400">🔄</span>
              <span className="text-gray-300">Webhook Event-Handler implementieren</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-orange-400">🔄</span>
              <span className="text-gray-300">Datenbank-Schema für Subscriptions</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-orange-400">🔄</span>
              <span className="text-gray-300">E-Mail-Notifications für Events</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-red-400">❌</span>
              <span className="text-gray-300">Produktions-Deployment & Testing</span>
            </div>
          </div>

          <div className="mt-6 rounded-lg bg-purple-500/10 border border-purple-500/20 p-4">
            <p className="text-sm text-purple-300">
              <strong>Next Steps:</strong> Implementierung der Event-Handler in <code>billing-api/stripe-webhook.ts</code>
              und Datenbankverbindung für Subscription-Management.
            </p>
          </div>
        </section>

        {/* Back to Dashboard */}
        <div className="mt-12 text-center">
          <Link
            to="/dashboard"
            className="inline-block rounded-xl bg-purple-600 px-8 py-3 font-semibold text-white shadow-lg shadow-purple-500/25 transition hover:bg-purple-500"
          >
            Zurück zum Dashboard
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-800 px-6 py-8 text-center text-sm text-gray-500">
        © 2026 CloudFreedom · Webhook-Dokumentation
      </footer>
    </div>
  );
}