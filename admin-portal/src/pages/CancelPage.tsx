import { Link } from 'react-router-dom';

export default function CancelPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/30 to-gray-950 text-white">
      {/* Header */}
      <nav className="flex items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            CloudFreedom
          </div>
        </Link>
      </nav>

      {/* Cancel Content */}
      <div className="flex min-h-[80vh] items-center justify-center px-6">
        <div className="mx-auto max-w-md text-center">
          {/* Cancel Icon */}
          <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-orange-500/10">
            <svg
              className="h-10 w-10 text-orange-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.99-.833-2.66 0L4.154 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>

          <h1 className="mb-4 text-3xl font-bold">
            Zahlung abgebrochen
          </h1>

          <p className="mb-8 text-lg text-gray-300">
            Kein Problem! Sie können jederzeit zurückkehren, wenn Sie bereit sind.
          </p>

          {/* Why Cancel? */}
          <div className="mb-8 rounded-2xl border border-gray-800 bg-gray-900/40 p-6 text-left">
            <h3 className="mb-4 font-bold text-purple-400">Haben Sie noch Fragen?</h3>
            <ul className="space-y-3 text-sm text-gray-300">
              <li className="flex items-start gap-3">
                <span className="text-purple-400">💬</span>
                <div>
                  <strong>Persönliche Beratung:</strong> Unser Team hilft bei der Auswahl des richtigen Plans
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-purple-400">🔒</span>
                <div>
                  <strong>Sicherheit:</strong> Alle Zahlungen sind 100% sicher über Stripe abgewickelt
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-purple-400">↩️</span>
                <div>
                  <strong>Geld-zurück-Garantie:</strong> 14 Tage kostenlos testen, jederzeit kündbar
                </div>
              </li>
            </ul>
          </div>

          {/* Contact Options */}
          <div className="mb-8 rounded-2xl border border-gray-800 bg-gray-900/40 p-6">
            <h3 className="mb-4 font-bold text-purple-400">Kontakt für Fragen</h3>
            <div className="space-y-3 text-sm text-gray-300">
              <div className="flex items-center gap-3">
                <span className="text-purple-400">📧</span>
                <a href="mailto:info@cloudfreedom.de" className="hover:text-white transition">
                  info@cloudfreedom.de
                </a>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-purple-400">📞</span>
                <a href="tel:+4930123456" className="hover:text-white transition">
                  +49 30 123 456
                </a>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-purple-400">💬</span>
                <span>Live-Chat auf unserer Website</span>
              </div>
            </div>
          </div>

          {/* Alternative Options */}
          <div className="mb-8 rounded-2xl border border-gray-800 bg-gray-900/40 p-6 text-left">
            <h3 className="mb-4 font-bold text-purple-400">Andere Optionen</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>• Demo vereinbaren und das Produkt erst kennenlernen</li>
              <li>• Individuelle Preise für größere Projekte anfragen</li>
              <li>• Kostenlose Proof-of-Concept Entwicklung</li>
              <li>• Upgrade-Pfad von Open-Source-Lösung</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link
              to="/pricing"
              className="rounded-xl bg-purple-600 px-8 py-3 font-semibold text-white shadow-lg shadow-purple-500/25 transition hover:bg-purple-500"
            >
              Preise ansehen
            </Link>
            <a
              href="mailto:info@cloudfreedom.de"
              className="rounded-xl border border-gray-700 px-8 py-3 font-semibold text-gray-300 transition hover:border-purple-500 hover:text-white"
            >
              Kontakt aufnehmen
            </a>
          </div>

          {/* Back to Home */}
          <div className="mt-6">
            <Link to="/" className="text-sm text-gray-400 hover:text-purple-400 transition">
              ← Zurück zur Startseite
            </Link>
          </div>

          {/* Security Note */}
          <div className="mt-8 text-xs text-gray-500">
            🔒 Ihre Daten sind sicher · Keine Speicherung von Zahlungsinformationen
          </div>
        </div>
      </div>

      {/* Special Offer */}
      <section className="border-t border-gray-800 bg-gray-900/30 px-6 py-12">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="mb-4 text-2xl font-bold">Noch nicht überzeugt?</h2>
          <p className="mb-6 text-gray-300">
            Bleiben Sie auf dem Laufenden über neue Features und exklusive Angebote.
          </p>
          
          <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Ihre E-Mail-Adresse"
              className="flex-1 rounded-lg border border-gray-700 bg-gray-800/50 px-4 py-2 text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
            />
            <button
              type="submit"
              className="rounded-lg bg-purple-600 px-6 py-2 font-medium text-white transition hover:bg-purple-500"
            >
              Newsletter
            </button>
          </form>
          
          <p className="mt-3 text-xs text-gray-500">
            Kein Spam, jederzeit abbestellbar
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 px-6 py-8 text-center text-sm text-gray-500">
        © 2026 CloudFreedom · Bei Fragen: info@cloudfreedom.de
      </footer>
    </div>
  );
}