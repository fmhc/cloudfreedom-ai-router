import { useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function SuccessPage() {
  useEffect(() => {
    // Here you could track the conversion or send analytics
    console.log('Payment successful - tracking conversion');
  }, []);

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

      {/* Success Content */}
      <div className="flex min-h-[80vh] items-center justify-center px-6">
        <div className="mx-auto max-w-md text-center">
          {/* Success Icon */}
          <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-green-500/10">
            <svg
              className="h-10 w-10 text-green-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <h1 className="mb-4 text-3xl font-bold">
            Zahlung erfolgreich! 🎉
          </h1>

          <p className="mb-8 text-lg text-gray-300">
            Vielen Dank für Ihr Vertrauen in CloudFreedom. Ihr KI-Agent wird in wenigen Minuten aktiviert.
          </p>

          {/* Next Steps */}
          <div className="mb-8 rounded-2xl border border-gray-800 bg-gray-900/40 p-6 text-left">
            <h3 className="mb-4 font-bold text-purple-400">Nächste Schritte:</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-start gap-3">
                <span className="mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-purple-600 text-xs font-bold">1</span>
                <div>
                  <strong>E-Mail prüfen:</strong> Sie erhalten eine Bestätigung mit Ihren Zugangsdaten
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-purple-600 text-xs font-bold">2</span>
                <div>
                  <strong>Dashboard:</strong> Loggen Sie sich in Ihr persönliches Dashboard ein
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-purple-600 text-xs font-bold">3</span>
                <div>
                  <strong>Konfiguration:</strong> Unser Team hilft Ihnen bei der Einrichtung
                </div>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="mb-8 rounded-2xl border border-gray-800 bg-gray-900/40 p-6">
            <h3 className="mb-4 font-bold text-purple-400">Support & Onboarding</h3>
            <div className="space-y-3 text-sm text-gray-300">
              <div className="flex items-center gap-3">
                <span className="text-purple-400">📧</span>
                <a href="mailto:support@cloudfreedom.de" className="hover:text-white transition">
                  support@cloudfreedom.de
                </a>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-purple-400">📞</span>
                <a href="tel:+4930123456" className="hover:text-white transition">
                  +49 30 123 456
                </a>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-purple-400">⏰</span>
                <span>Mo-Fr 9:00-18:00 Uhr</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link
              to="/dashboard"
              className="rounded-xl bg-purple-600 px-8 py-3 font-semibold text-white shadow-lg shadow-purple-500/25 transition hover:bg-purple-500"
            >
              Zum Dashboard
            </Link>
            <Link
              to="/"
              className="rounded-xl border border-gray-700 px-8 py-3 font-semibold text-gray-300 transition hover:border-purple-500 hover:text-white"
            >
              Zur Startseite
            </Link>
          </div>

          {/* Security Note */}
          <div className="mt-8 text-xs text-gray-500">
            🔒 Sichere Zahlung über Stripe · Alle Daten werden DSGVO-konform verarbeitet
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-800 px-6 py-8 text-center text-sm text-gray-500">
        © 2026 CloudFreedom · Bei Fragen: support@cloudfreedom.de
      </footer>
    </div>
  );
}