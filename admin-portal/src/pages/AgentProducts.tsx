import { Link } from 'react-router-dom';
import { createCheckoutSession, PRODUCTS } from '../lib/stripe';

interface ProductTier {
  name: string;
  emoji: string;
  price: string;
  description: string;
  features: string[];
  cta: string;
  popular?: boolean;
}

const products: ProductTier[] = [
  {
    name: 'JobHunter Agent',
    emoji: '🎯',
    price: '49–99',
    description: 'Autonomer KI-Agent für Jobsuche & Bewerbung',
    features: [
      'Crawlt FreelancerMap, StepStone, Indeed, LinkedIn',
      'Automatisches Profil-Matching & Scoring',
      'Bewerbung mit Approval-Workflow',
      'Follow-up Tracking & Erinnerungen',
      'Tägliche Reports per E-Mail/Chat',
      'CV-Optimierung pro Stelle',
    ],
    cta: 'Ideal für Freelancer & IT-Berater',
  },
  {
    name: 'Recruiting Agent',
    emoji: '👥',
    price: '149–199',
    description: 'KI-Recruiter für KMU ohne eigene HR-Abteilung',
    features: [
      'Kandidaten-Sourcing aus Datenbanken',
      'Automatische Erstansprache (E-Mail/LinkedIn)',
      'KI-gestütztes Screening & Ranking',
      'Interview-Scheduling',
      'Talent-Pool Management',
      'DSGVO-konforme Datenhaltung',
    ],
    cta: 'Ideal für KMU & Personalvermittler',
    popular: true,
  },
  {
    name: 'Document Intelligence',
    emoji: '📄',
    price: '99–149',
    description: 'Autonome Dokumentenverarbeitung & Analyse',
    features: [
      'Automatische Klassifikation & Extraktion',
      'OCR + KI-Zusammenfassung',
      'Compliance-Checks & Audit-Trail',
      'Integration in bestehende DMS',
      'Multi-Format (PDF, Scan, E-Mail)',
      'Basierend auf cc-dms Stack',
    ],
    cta: 'Ideal für Kanzleien & Steuerberater',
  },
  {
    name: 'DevOps Agent',
    emoji: '🛡️',
    price: '79–129',
    description: '24/7 Infrastruktur-Monitoring & Incident Response',
    features: [
      'Echtzeit-Monitoring aller Services',
      'Automatische Incident-Response',
      'Log-Analyse & Anomalie-Erkennung',
      'Security Audits & Reports',
      'Slack/Mattermost Integration',
      'Runbook-Automatisierung',
    ],
    cta: 'Ideal für MSPs & IT-Teams',
  },
  {
    name: 'Content Agent',
    emoji: '✍️',
    price: '59–99',
    description: 'Automatische Content-Erstellung & Social Media',
    features: [
      'Blog-Posts & Artikel generieren',
      'Social Media Scheduling',
      'SEO-Optimierung',
      'Bild- & Grafik-Vorschläge',
      'Redaktionsplan-Management',
      'Multi-Plattform (LinkedIn, X, Instagram)',
    ],
    cta: 'Ideal für Agenturen & KMU Marketing',
  },
];

const stats = [
  { label: 'Verfügbare GPU-Leistung', value: '192 GB VRAM', sub: '8x RTX A5000' },
  { label: 'Token-Kapazität', value: '490M+', sub: 'Tokens/Monat' },
  { label: 'Parallele Agents', value: '50+', sub: 'gleichzeitig' },
  { label: 'Standort', value: '🇩🇪 Deutschland', sub: 'NATO-Bunker, DSGVO' },
];

  const handleGetStarted = async (productId: string, tier: 'starter' | 'pro' = 'starter') => {
    // Find the product configuration
    const product = PRODUCTS.find(p => p.id === productId);
    if (!product) {
      console.error('Product not found:', productId);
      return;
    }

    // Get the appropriate price ID
    const priceId = tier === 'starter' 
      ? product.prices.starter.monthlyPriceId 
      : product.prices.pro.monthlyPriceId;

    // Trigger Stripe Checkout
    const result = await createCheckoutSession(priceId);
    
    if (!result.success) {
      alert(`Fehler beim Starten des Checkouts: ${result.error}`);
    }
  };

export default function AgentProducts() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/30 to-gray-950 text-white">
      {/* Navigation Header */}
      <nav className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            CloudFreedom
          </div>
        </div>
        <div className="hidden md:flex items-center gap-6">
          <a href="#products" className="text-gray-300 hover:text-white transition">Produkte</a>
          <Link to="/pricing" className="text-gray-300 hover:text-white transition">Preise</Link>
          <a href="#about" className="text-gray-300 hover:text-white transition">Über uns</a>
          <Link to="/login" className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium hover:bg-purple-500 transition">
            Login
          </Link>
        </div>
        {/* Mobile menu button */}
        <button className="md:hidden text-gray-300 hover:text-white">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden px-6 py-20 text-center">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-4xl">
          <div className="mb-4 inline-block rounded-full bg-purple-500/10 px-4 py-1.5 text-sm font-medium text-purple-300 ring-1 ring-purple-500/20">
            🔒 Sovereign AI · Made in Germany
          </div>
          <h1 className="mb-6 text-5xl font-bold tracking-tight md:text-6xl">
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
              Agent-as-a-Service
            </span>
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-gray-300">
            Autonome KI-Agenten für Ihr Unternehmen — gehostet in einem deutschen Rechenzentrum.
            Keine US-Cloud. Keine Datenabflüsse. DSGVO by Design.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="#products" className="rounded-xl bg-purple-600 px-8 py-3 font-semibold text-white shadow-lg shadow-purple-500/25 transition hover:bg-purple-500">
              Produkte entdecken
            </a>
            <Link to="/pricing" className="rounded-xl border border-gray-700 px-8 py-3 font-semibold text-gray-300 transition hover:border-purple-500 hover:text-white">
              Preise vergleichen
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="mx-auto grid max-w-5xl grid-cols-2 gap-6 px-6 pb-16 md:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-gray-800 bg-gray-900/50 p-6 text-center backdrop-blur">
            <div className="text-2xl font-bold text-purple-400">{s.value}</div>
            <div className="text-xs text-gray-500">{s.sub}</div>
            <div className="mt-1 text-sm text-gray-400">{s.label}</div>
          </div>
        ))}
      </section>

      {/* Products */}
      <section id="products" className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="mb-12 text-center text-3xl font-bold">Agent-Produkte</h2>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <div
              key={p.name}
              className={`relative flex flex-col rounded-2xl border p-6 transition hover:border-purple-500/50 ${
                p.popular
                  ? 'border-purple-500/40 bg-purple-950/20 shadow-lg shadow-purple-500/10'
                  : 'border-gray-800 bg-gray-900/40'
              }`}
            >
              {p.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-purple-600 px-3 py-0.5 text-xs font-bold">
                  BELIEBT
                </div>
              )}
              <div className="mb-3 text-3xl">{p.emoji}</div>
              <h3 className="mb-1 text-xl font-bold">{p.name}</h3>
              <p className="mb-4 text-sm text-gray-400">{p.description}</p>
              <div className="mb-4">
                <span className="text-3xl font-bold text-purple-400">{p.price}</span>
                <span className="text-sm text-gray-500"> €/Monat</span>
              </div>
              <ul className="mb-6 flex-1 space-y-2">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-gray-300">
                    <span className="mt-0.5 text-purple-400">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleGetStarted(PRODUCTS.find(prod => prod.name === p.name)?.id || 'jobhunter')}
                className="w-full rounded-lg bg-purple-600 px-4 py-3 font-medium text-white hover:bg-purple-500 transition shadow-lg"
              >
                Jetzt starten
              </button>
              <div className="mt-2 rounded-lg bg-gray-800/50 px-4 py-2 text-center text-xs text-gray-400">
                {p.cta}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Cost Comparison */}
      <section id="pricing" className="mx-auto max-w-4xl px-6 py-16">
        <h2 className="mb-8 text-center text-3xl font-bold">Kosten-Vergleich</h2>
        <p className="mb-8 text-center text-gray-400">
          Was 259M Tokens/Monat kosten — bei uns vs. kommerzielle APIs:
        </p>
        <div className="overflow-hidden rounded-2xl border border-gray-800">
          <table className="w-full text-sm">
            <thead className="bg-gray-900/80">
              <tr>
                <th className="px-6 py-3 text-left text-gray-400">Anbieter</th>
                <th className="px-6 py-3 text-right text-gray-400">Kosten/Monat</th>
                <th className="px-6 py-3 text-right text-gray-400">Faktor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              <tr className="bg-purple-950/20">
                <td className="px-6 py-3 font-bold text-purple-400">☁️ CloudFreedom (KI-Bunker)</td>
                <td className="px-6 py-3 text-right font-bold text-purple-400">~406 €</td>
                <td className="px-6 py-3 text-right font-bold text-green-400">1x (Basis)</td>
              </tr>
              <tr>
                <td className="px-6 py-3 text-gray-300">OpenAI GPT-4o</td>
                <td className="px-6 py-3 text-right text-gray-300">~2.400 €</td>
                <td className="px-6 py-3 text-right text-red-400">6x teurer</td>
              </tr>
              <tr>
                <td className="px-6 py-3 text-gray-300">Anthropic Claude Sonnet 4</td>
                <td className="px-6 py-3 text-right text-gray-300">~3.600 €</td>
                <td className="px-6 py-3 text-right text-red-400">9x teurer</td>
              </tr>
              <tr>
                <td className="px-6 py-3 text-gray-300">Anthropic Claude Opus 4</td>
                <td className="px-6 py-3 text-right text-gray-300">~18.000 €</td>
                <td className="px-6 py-3 text-right text-red-400">44x teurer</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* USPs */}
      <section className="mx-auto max-w-4xl px-6 py-16">
        <h2 className="mb-8 text-center text-3xl font-bold">Warum CloudFreedom?</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {[
            { icon: '🇩🇪', title: 'Sovereign AI', desc: 'Hosting in deutschem NATO-Bunker. Ihre Daten verlassen nie das Land.' },
            { icon: '🔒', title: 'DSGVO by Design', desc: 'Keine US-Cloud-Abhängigkeit. Kein FISA, kein CLOUD Act.' },
            { icon: '⚡', title: 'State-of-the-Art Modelle', desc: 'Qwen3.5 MoE, Llama, Mistral — neueste Open-Source-Modelle auf Enterprise-Hardware.' },
            { icon: '🔧', title: 'Full-Stack Agent Platform', desc: 'vLLM Inference + LiteLLM Proxy + OpenClaw Orchestration — alles aus einer Hand.' },
          ].map((u) => (
            <div key={u.title} className="rounded-2xl border border-gray-800 bg-gray-900/30 p-6">
              <div className="mb-2 text-2xl">{u.icon}</div>
              <h3 className="mb-1 font-bold">{u.title}</h3>
              <p className="text-sm text-gray-400">{u.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="mx-auto max-w-4xl px-6 py-16">
        <h2 className="mb-12 text-center text-3xl font-bold">Häufig gestellte Fragen</h2>
        <div className="space-y-6">
          {[
            {
              question: 'Wie schnell kann ich mit meinem KI-Agenten starten?',
              answer: 'Nach der Buchung wird Ihr Agent innerhalb von 24 Stunden bereitgestellt. Unser Team begleitet Sie beim Onboarding und der Konfiguration.'
            },
            {
              question: 'Wo werden meine Daten gespeichert und verarbeitet?',
              answer: 'Alle Daten werden ausschließlich in deutschen Rechenzentren verarbeitet und gespeichert. Wir verwenden keine US-Cloud-Services und sind vollständig DSGVO-konform.'
            },
            {
              question: 'Kann ich den Agent an meine spezifischen Bedürfnisse anpassen?',
              answer: 'Ja, alle unsere Agenten sind konfigurierbar. Je nach Plan können Sie Workflows, Datenquellen und Ausgabeformate individuell anpassen.'
            },
            {
              question: 'Gibt es eine kostenlose Testphase?',
              answer: 'Ja, jeder Plan kommt mit einer 14-tägigen Geld-zurück-Garantie. Sie können den Agent risikofrei testen und bei Nichtgefallen stornieren.'
            },
            {
              question: 'Welche Integrationen sind möglich?',
              answer: 'Unsere Agenten unterstützen über 100 Standard-Integrationen (Slack, E-Mail, CRM-Systeme, APIs). Custom-Integrationen sind im Pro-Plan verfügbar.'
            },
            {
              question: 'Was unterscheidet CloudFreedom von anderen KI-Services?',
              answer: 'Wir bieten echte Souveränität: Deutsche Server, Open-Source-Modelle, transparente Preise und kein Vendor-Lock-in. Plus 90% Kostenersparnis vs. US-APIs.'
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
        <h2 className="mb-4 text-3xl font-bold">Bereit für Ihren eigenen KI-Agenten?</h2>
        <p className="mb-8 text-gray-400">Kontaktieren Sie uns für ein individuelles Angebot.</p>
        <a
          href="mailto:info@cloudfreedom.de"
          className="inline-block rounded-xl bg-purple-600 px-10 py-4 text-lg font-semibold shadow-lg shadow-purple-500/25 transition hover:bg-purple-500"
        >
          Kontakt aufnehmen →
        </a>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 px-6 py-12">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-8 md:grid-cols-4">
            {/* Company Info */}
            <div className="md:col-span-2">
              <div className="mb-4 text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                CloudFreedom
              </div>
              <p className="mb-4 text-gray-400 max-w-md">
                Sovereign AI Infrastructure für Deutschland. Autonome KI-Agenten ohne US-Cloud-Abhängigkeit.
                DSGVO by Design.
              </p>
              <div className="flex gap-4">
                <a href="mailto:info@cloudfreedom.de" className="text-gray-400 hover:text-purple-400 transition">
                  📧 info@cloudfreedom.de
                </a>
              </div>
            </div>

            {/* Products */}
            <div>
              <h3 className="mb-4 font-bold text-white">Produkte</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#products" className="hover:text-white transition">JobHunter Agent</a></li>
                <li><a href="#products" className="hover:text-white transition">Recruiting Agent</a></li>
                <li><a href="#products" className="hover:text-white transition">Document Intelligence</a></li>
                <li><a href="#products" className="hover:text-white transition">DevOps Agent</a></li>
                <li><a href="#products" className="hover:text-white transition">Content Agent</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="mb-4 font-bold text-white">Rechtliches</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="/impressum" className="hover:text-white transition">Impressum</a></li>
                <li><a href="/datenschutz" className="hover:text-white transition">Datenschutz</a></li>
                <li><a href="/agb" className="hover:text-white transition">AGB</a></li>
                <li><Link to="/webhooks" className="hover:text-white transition">Webhook API</Link></li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-8 border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between">
            <div className="mb-4 md:mb-0 text-sm text-gray-500">
              © 2026 CloudFreedom · fmhconsulting × CloudCourse GmbH
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-2">
                🇩🇪 Made in Germany
              </span>
              <span className="flex items-center gap-2">
                🔒 DSGVO-konform
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
