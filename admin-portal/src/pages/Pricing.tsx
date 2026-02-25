import { useState } from 'react';
import { createCheckoutSession, PRODUCTS, STRIPE_PRICES } from '../lib/stripe';

export default function Pricing() {
  const [isYearly, setIsYearly] = useState(false);

  const handleSubscribe = async (priceId: string) => {
    const result = await createCheckoutSession(STRIPE_PRICES[priceId as keyof typeof STRIPE_PRICES], isYearly);
    
    if (!result.success) {
      alert(`Fehler: ${result.error}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/30 to-gray-950 text-white">
      {/* Header Navigation */}
      <nav className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            CloudFreedom
          </div>
        </div>
        <div className="hidden md:flex items-center gap-6">
          <a href="/" className="text-gray-300 hover:text-white transition">Produkte</a>
          <a href="/pricing" className="text-purple-400 font-medium">Preise</a>
          <a href="#" className="text-gray-300 hover:text-white transition">Über uns</a>
          <a href="/login" className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium hover:bg-purple-500 transition">
            Login
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-6 py-16 text-center">
        <h1 className="mb-4 text-4xl md:text-5xl font-bold">
          Transparente <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Preise</span>
        </h1>
        <p className="mx-auto mb-8 max-w-2xl text-lg text-gray-300">
          Wählen Sie den Plan, der zu Ihrem Unternehmen passt. Jederzeit kündbar, keine versteckten Kosten.
        </p>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <span className={`text-sm font-medium ${!isYearly ? 'text-white' : 'text-gray-400'}`}>
            Monatlich
          </span>
          <button
            onClick={() => setIsYearly(!isYearly)}
            className="relative h-6 w-11 rounded-full bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900"
          >
            <div
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-purple-500 transition-transform ${
                isYearly ? 'translate-x-5' : 'translate-x-0.5'
              }`}
            />
          </button>
          <span className={`text-sm font-medium ${isYearly ? 'text-white' : 'text-gray-400'}`}>
            Jährlich
          </span>
          {isYearly && (
            <span className="ml-2 rounded-full bg-green-500/10 px-2 py-1 text-xs font-medium text-green-400">
              20% Rabatt
            </span>
          )}
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="mx-auto max-w-7xl px-6 pb-16">
        <div className="space-y-12">
          {PRODUCTS.map((product) => (
            <div key={product.id} className="rounded-2xl border border-gray-800 bg-gray-900/40 overflow-hidden">
              {/* Product Header */}
              <div className={`p-6 ${product.popular ? 'bg-purple-950/20' : 'bg-gray-800/30'}`}>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl">{product.emoji}</span>
                  <h3 className="text-2xl font-bold">{product.name}</h3>
                  {product.popular && (
                    <span className="rounded-full bg-purple-600 px-3 py-1 text-xs font-bold">
                      BELIEBT
                    </span>
                  )}
                </div>
                <p className="text-gray-300 mb-4">{product.description}</p>
                <p className="text-sm text-gray-400">{product.cta}</p>
              </div>

              {/* Pricing Comparison */}
              <div className="p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Starter Plan */}
                  <div className="border border-gray-700 rounded-xl p-6 hover:border-purple-500/50 transition">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-xl font-bold">Starter</h4>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-purple-400">
                          {isYearly ? product.prices.starter.yearly : product.prices.starter.monthly}€
                        </div>
                        <div className="text-sm text-gray-500">
                          /{isYearly ? 'Jahr' : 'Monat'}
                        </div>
                        {isYearly && (
                          <div className="text-xs text-green-400">
                            Sparen Sie {((product.prices.starter.monthly * 12) - (product.prices.starter.yearly * 12)) / 12}€/Monat
                          </div>
                        )}
                      </div>
                    </div>

                    <ul className="space-y-2 mb-6">
                      {product.starterFeatures.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <span className="mt-0.5 text-purple-400">✓</span>
                          <span className="text-gray-300">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <button
                      onClick={() => handleSubscribe(isYearly ? product.prices.starter.yearlyPriceId : product.prices.starter.monthlyPriceId)}
                      className="w-full rounded-lg border border-purple-500 py-3 font-medium text-purple-400 hover:bg-purple-500/10 transition"
                    >
                      Jetzt starten
                    </button>
                  </div>

                  {/* Pro Plan */}
                  <div className="border border-purple-500/50 rounded-xl p-6 bg-purple-950/10 relative">
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-purple-600 px-3 py-1 text-xs font-bold">
                      EMPFOHLEN
                    </div>
                    
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-xl font-bold">Pro</h4>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-purple-400">
                          {isYearly ? product.prices.pro.yearly : product.prices.pro.monthly}€
                        </div>
                        <div className="text-sm text-gray-500">
                          /{isYearly ? 'Jahr' : 'Monat'}
                        </div>
                        {isYearly && (
                          <div className="text-xs text-green-400">
                            Sparen Sie {((product.prices.pro.monthly * 12) - (product.prices.pro.yearly * 12)) / 12}€/Monat
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="text-sm text-gray-400 mb-2">Alles aus Starter, plus:</div>
                    </div>

                    <ul className="space-y-2 mb-6">
                      {product.proFeatures.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <span className="mt-0.5 text-purple-400">✓</span>
                          <span className="text-gray-300">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <button
                      onClick={() => handleSubscribe(isYearly ? product.prices.pro.yearlyPriceId : product.prices.pro.monthlyPriceId)}
                      className="w-full rounded-lg bg-purple-600 py-3 font-medium text-white hover:bg-purple-500 transition shadow-lg"
                    >
                      Jetzt upgraden
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Feature Comparison Matrix */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="mb-8 text-center text-3xl font-bold">Detaillierter Feature-Vergleich</h2>
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse rounded-2xl border border-gray-800 overflow-hidden">
            <thead className="bg-gray-900/80">
              <tr>
                <th className="px-6 py-4 text-left text-gray-400">Feature</th>
                <th className="px-6 py-4 text-center text-gray-400">Starter</th>
                <th className="px-6 py-4 text-center text-purple-400">Pro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {/* General Features */}
              <tr className="bg-gray-800/20">
                <td colSpan={3} className="px-6 py-3 font-bold text-purple-400">Allgemeine Features</td>
              </tr>
              <tr>
                <td className="px-6 py-3 text-gray-300">24/7 Verfügbarkeit</td>
                <td className="px-6 py-3 text-center text-green-400">✓</td>
                <td className="px-6 py-3 text-center text-green-400">✓</td>
              </tr>
              <tr className="bg-gray-900/20">
                <td className="px-6 py-3 text-gray-300">DSGVO-konforme Datenverarbeitung</td>
                <td className="px-6 py-3 text-center text-green-400">✓</td>
                <td className="px-6 py-3 text-center text-green-400">✓</td>
              </tr>
              <tr>
                <td className="px-6 py-3 text-gray-300">Deutschland-basierte Server</td>
                <td className="px-6 py-3 text-center text-green-400">✓</td>
                <td className="px-6 py-3 text-center text-green-400">✓</td>
              </tr>
              <tr className="bg-gray-900/20">
                <td className="px-6 py-3 text-gray-300">API-Zugang</td>
                <td className="px-6 py-3 text-center text-red-400">✗</td>
                <td className="px-6 py-3 text-center text-green-400">✓</td>
              </tr>
              <tr>
                <td className="px-6 py-3 text-gray-300">Custom Integrations</td>
                <td className="px-6 py-3 text-center text-red-400">✗</td>
                <td className="px-6 py-3 text-center text-green-400">✓</td>
              </tr>
              
              {/* Support */}
              <tr className="bg-gray-800/20">
                <td colSpan={3} className="px-6 py-3 font-bold text-purple-400">Support & Service</td>
              </tr>
              <tr>
                <td className="px-6 py-3 text-gray-300">E-Mail Support</td>
                <td className="px-6 py-3 text-center text-green-400">✓ (Mo-Fr)</td>
                <td className="px-6 py-3 text-center text-green-400">✓ (24/7)</td>
              </tr>
              <tr className="bg-gray-900/20">
                <td className="px-6 py-3 text-gray-300">Telefon Support</td>
                <td className="px-6 py-3 text-center text-red-400">✗</td>
                <td className="px-6 py-3 text-center text-green-400">✓</td>
              </tr>
              <tr>
                <td className="px-6 py-3 text-gray-300">Dedicated Account Manager</td>
                <td className="px-6 py-3 text-center text-red-400">✗</td>
                <td className="px-6 py-3 text-center text-green-400">✓</td>
              </tr>
              <tr className="bg-gray-900/20">
                <td className="px-6 py-3 text-gray-300">Onboarding & Training</td>
                <td className="px-6 py-3 text-center">Self-Service</td>
                <td className="px-6 py-3 text-center text-green-400">✓ Persönlich</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-4xl px-6 py-16">
        <h2 className="mb-12 text-center text-3xl font-bold">Häufig gestellte Fragen</h2>
        <div className="space-y-6">
          {[
            {
              question: 'Kann ich jederzeit kündigen?',
              answer: 'Ja, Sie können Ihr Abonnement jederzeit zum Ende des aktuellen Abrechnungszeitraums kündigen. Keine Kündigungsfristen.'
            },
            {
              question: 'Gibt es einen kostenlosen Test?',
              answer: 'Ja, jeder Plan kommt mit einer 14-tägigen Geld-zurück-Garantie. Testen Sie unsere Agenten risikofrei.'
            },
            {
              question: 'Wo werden meine Daten gespeichert?',
              answer: 'Alle Daten werden ausschließlich in deutschen Rechenzentren verarbeitet und gespeichert. Keine US-Cloud, keine Datenabflüsse.'
            },
            {
              question: 'Kann ich zwischen den Plänen wechseln?',
              answer: 'Ja, Sie können jederzeit up- oder downgraden. Änderungen gelten ab dem nächsten Abrechnungszeitraum.'
            },
            {
              question: 'Gibt es Rabatte für gemeinnützige Organisationen?',
              answer: 'Ja, NGOs und Bildungseinrichtungen erhalten 50% Rabatt auf alle Pläne. Kontaktieren Sie uns für Details.'
            },
          ].map((faq, idx) => (
            <details key={idx} className="group rounded-2xl border border-gray-800 bg-gray-900/30 p-6">
              <summary className="flex cursor-pointer items-center justify-between font-medium text-white">
                {faq.question}
                <span className="ml-2 text-gray-400 transition group-open:rotate-180">▼</span>
              </summary>
              <p className="mt-4 text-gray-300">{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20 text-center">
        <h2 className="mb-4 text-3xl font-bold">Noch Fragen?</h2>
        <p className="mb-8 text-gray-400">Unser Team hilft Ihnen gerne bei der Auswahl des richtigen Plans.</p>
        <a
          href="mailto:info@cloudfreedom.de"
          className="inline-block rounded-xl bg-purple-600 px-10 py-4 text-lg font-semibold shadow-lg shadow-purple-500/25 transition hover:bg-purple-500"
        >
          Kostenlose Beratung →
        </a>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 px-6 py-8">
        <div className="mx-auto max-w-6xl flex flex-col md:flex-row items-center justify-between">
          <div className="mb-4 md:mb-0 text-sm text-gray-500">
            © 2026 CloudFreedom · fmhconsulting × CloudCourse GmbH
          </div>
          <div className="flex gap-6 text-sm">
            <a href="#" className="text-gray-400 hover:text-white transition">Impressum</a>
            <a href="#" className="text-gray-400 hover:text-white transition">Datenschutz</a>
            <a href="#" className="text-gray-400 hover:text-white transition">AGB</a>
          </div>
        </div>
      </footer>
    </div>
  );
}