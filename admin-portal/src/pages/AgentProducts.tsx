import { useState } from 'react';

interface Product {
  name: string;
  emoji: string;
  monthlyPrice: number;
  yearlyPrice: number;
  setupFee: number;
  tagline: string;
  description: string;
  features: string[];
  ideal: string;
  popular?: boolean;
}

const products: Product[] = [
  {
    name: 'Scout',
    emoji: '🔍',
    monthlyPrice: 79,
    yearlyPrice: 63,
    setupFee: 149,
    tagline: 'Ihr persönlicher Recherche-Assistent',
    description: 'Findet Leads, Jobs, Marktdaten und Wettbewerber — rund um die Uhr, vollautomatisch.',
    features: [
      'Automatisches Web-Monitoring & Crawling',
      'Tägliche Reports per E-Mail oder Chat',
      'Individuelle Suchprofile & Filter',
      'Lead-Scoring & Priorisierung',
      'Integration in Slack, Teams, E-Mail',
      'Bis zu 500 Anfragen/Tag',
    ],
    ideal: 'Freelancer · Vertrieb · Recruiting',
  },
  {
    name: 'Operator',
    emoji: '⚙️',
    monthlyPrice: 149,
    yearlyPrice: 119,
    setupFee: 299,
    tagline: 'Automatisierung für Ihr Tagesgeschäft',
    description: 'Übernimmt wiederkehrende Aufgaben: Dokumente verarbeiten, E-Mails beantworten, Daten pflegen.',
    features: [
      'Dokumenten-Klassifikation & Extraktion',
      'Automatische E-Mail-Verarbeitung',
      'CRM- & Datenbank-Pflege',
      'Workflow-Automatisierung',
      'Compliance-Checks & Audit-Trail',
      'Bis zu 2.000 Anfragen/Tag',
      'Eigene Wissensdatenbank',
    ],
    ideal: 'KMU · Kanzleien · Verwaltung',
    popular: true,
  },
  {
    name: 'Sentinel',
    emoji: '🛡️',
    monthlyPrice: 249,
    yearlyPrice: 199,
    setupFee: 499,
    tagline: 'Ihr digitaler Wächter',
    description: 'Überwacht Systeme, analysiert Daten und reagiert auf Vorfälle — 24/7, ohne Pause.',
    features: [
      'Echtzeit-Monitoring & Alerting',
      'Automatische Incident-Response',
      'Log-Analyse & Anomalie-Erkennung',
      'Security-Audits & Berichte',
      'Multi-System-Integration',
      'Unbegrenzte Anfragen',
      'Dedizierte Rechenkapazität',
      'Individuelles Fine-Tuning',
    ],
    ideal: 'IT-Teams · MSPs · Enterprise',
  },
];

const comparisons = [
  { provider: 'CloudFreedom Agent', cost: '79–249', factor: '—', highlight: true },
  { provider: 'Vergleichbare SaaS-Tools', cost: '300–800', factor: '3–4×', highlight: false },
  { provider: 'Eigenes KI-Team (1 FTE)', cost: '5.000+', factor: '25–60×', highlight: false },
  { provider: 'Agentur / Beratung', cost: '2.000–10.000', factor: '15–40×', highlight: false },
];

const faqs = [
  {
    q: 'Was genau ist ein KI-Agent?',
    a: 'Ein KI-Agent ist ein autonomes Software-System, das eigenständig Aufgaben erledigt — wie ein digitaler Mitarbeiter. Er arbeitet rund um die Uhr, lernt aus Feedback und integriert sich in Ihre bestehenden Tools.',
  },
  {
    q: 'Wo laufen meine Daten?',
    a: 'Ausschließlich auf deutschen Servern. Keine US-Cloud, kein Drittanbieter-Zugriff. Ihre Daten verlassen nie Deutschland — DSGVO by Design.',
  },
  {
    q: 'Was beinhaltet die Einrichtungspauschale?',
    a: 'Wir konfigurieren Ihren Agent individuell: Anbindung an Ihre Systeme, Einrichtung der Workflows, Training auf Ihre Daten und ein persönliches Onboarding-Gespräch.',
  },
  {
    q: 'Kann ich den Agent an meine Bedürfnisse anpassen?',
    a: 'Ja. Jeder Agent wird auf Ihre Anforderungen konfiguriert. Im Sentinel-Tarif ist zusätzlich individuelles Fine-Tuning des KI-Modells enthalten.',
  },
  {
    q: 'Gibt es eine Mindestlaufzeit?',
    a: 'Nein. Monatlich kündbar. Bei jährlicher Zahlung sparen Sie 20%.',
  },
  {
    q: 'Wie schnell ist mein Agent einsatzbereit?',
    a: 'In der Regel innerhalb von 2–5 Werktagen nach Auftragseingang, abhängig von der Komplexität der Integration.',
  },
];

export default function AgentProducts() {
  const [yearly, setYearly] = useState(false);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Nav */}
      <nav className="border-b border-gray-800/50 px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-2 text-lg font-bold">
            <span className="text-purple-400">☁️</span> CloudFreedom
          </div>
          <div className="hidden gap-6 text-sm text-gray-400 md:flex">
            <a href="#products" className="transition hover:text-white">Produkte</a>
            <a href="#pricing" className="transition hover:text-white">Preise</a>
            <a href="#faq" className="transition hover:text-white">FAQ</a>
          </div>
          <a href="mailto:info@cloudfreedom.de" className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium transition hover:bg-purple-500">
            Kontakt
          </a>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 py-24 text-center">
        <div className="mx-auto max-w-3xl">
          <div className="mb-6 inline-block rounded-full border border-purple-500/20 bg-purple-500/5 px-4 py-1.5 text-sm text-purple-300">
            🇩🇪 Sovereign AI — Hosted in Deutschland
          </div>
          <h1 className="mb-6 text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
            KI-Agenten, die für Sie arbeiten
          </h1>
          <p className="mx-auto mb-10 max-w-xl text-lg text-gray-400">
            Autonome digitale Mitarbeiter für Recherche, Automatisierung und Monitoring.
            DSGVO-konform. Keine US-Cloud.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="#products" className="rounded-xl bg-purple-600 px-8 py-3.5 font-semibold shadow-lg shadow-purple-600/20 transition hover:bg-purple-500">
              Agents entdecken
            </a>
            <a href="#pricing" className="rounded-xl border border-gray-700 px-8 py-3.5 font-semibold text-gray-300 transition hover:border-gray-500 hover:text-white">
              Preise ansehen
            </a>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="border-y border-gray-800/50 px-6 py-8">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-8 text-sm text-gray-500">
          <span>🔒 DSGVO-konform</span>
          <span className="hidden text-gray-700 sm:inline">·</span>
          <span>🇩🇪 Deutsche Server</span>
          <span className="hidden text-gray-700 sm:inline">·</span>
          <span>⚡ 24/7 verfügbar</span>
          <span className="hidden text-gray-700 sm:inline">·</span>
          <span>🚫 Keine US-Cloud</span>
          <span className="hidden text-gray-700 sm:inline">·</span>
          <span>📅 Monatlich kündbar</span>
        </div>
      </section>

      {/* Products */}
      <section id="products" className="mx-auto max-w-5xl px-6 py-20">
        <h2 className="mb-4 text-center text-3xl font-bold">Drei Agents. Ein Ziel: Ihre Entlastung.</h2>
        <p className="mb-12 text-center text-gray-400">Wählen Sie den Agent, der zu Ihrem Bedarf passt.</p>

        {/* Billing Toggle */}
        <div className="mb-10 flex items-center justify-center gap-3">
          <span className={`text-sm ${!yearly ? 'text-white' : 'text-gray-500'}`}>Monatlich</span>
          <button
            onClick={() => setYearly(!yearly)}
            className={`relative h-7 w-12 rounded-full transition ${yearly ? 'bg-purple-600' : 'bg-gray-700'}`}
          >
            <span className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform ${yearly ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </button>
          <span className={`text-sm ${yearly ? 'text-white' : 'text-gray-500'}`}>
            Jährlich <span className="text-green-400 text-xs font-medium">−20%</span>
          </span>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {products.map((p) => (
            <div
              key={p.name}
              className={`relative flex flex-col rounded-2xl border p-7 ${
                p.popular
                  ? 'border-purple-500/30 bg-gray-900/80 ring-1 ring-purple-500/10'
                  : 'border-gray-800 bg-gray-900/40'
              }`}
            >
              {p.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-purple-600 px-3 py-0.5 text-xs font-bold uppercase tracking-wide">
                  Beliebt
                </div>
              )}
              <div className="mb-2 text-3xl">{p.emoji}</div>
              <h3 className="text-xl font-bold">{p.name}</h3>
              <p className="mb-4 text-sm text-purple-300">{p.tagline}</p>
              <p className="mb-5 text-sm text-gray-400">{p.description}</p>

              <div className="mb-1">
                <span className="text-4xl font-bold">{yearly ? p.yearlyPrice : p.monthlyPrice}</span>
                <span className="text-gray-500"> €/Monat</span>
              </div>
              <p className="mb-6 text-xs text-gray-600">
                zzgl. einmalig {p.setupFee} € Einrichtungspauschale
              </p>

              <ul className="mb-8 flex-1 space-y-2.5">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-gray-300">
                    <span className="mt-0.5 text-green-400">✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              <a
                href="mailto:info@cloudfreedom.de?subject=Anfrage: CloudFreedom Agent — ${p.name}"
                className={`block rounded-xl py-3 text-center font-semibold transition ${
                  p.popular
                    ? 'bg-purple-600 text-white hover:bg-purple-500'
                    : 'bg-gray-800 text-gray-200 hover:bg-gray-700'
                }`}
              >
                Agent anfragen →
              </a>
              <p className="mt-3 text-center text-xs text-gray-600">{p.ideal}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Comparison */}
      <section id="pricing" className="mx-auto max-w-3xl px-6 py-16">
        <h2 className="mb-8 text-center text-2xl font-bold">Was kostet die Alternative?</h2>
        <div className="overflow-hidden rounded-xl border border-gray-800">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-900">
                <th className="px-5 py-3 text-left font-medium text-gray-400">Lösung</th>
                <th className="px-5 py-3 text-right font-medium text-gray-400">€/Monat</th>
                <th className="px-5 py-3 text-right font-medium text-gray-400">Faktor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {comparisons.map((c) => (
                <tr key={c.provider} className={c.highlight ? 'bg-purple-950/30' : ''}>
                  <td className={`px-5 py-3 ${c.highlight ? 'font-semibold text-purple-300' : 'text-gray-300'}`}>
                    {c.highlight && '☁️ '}{c.provider}
                  </td>
                  <td className={`px-5 py-3 text-right ${c.highlight ? 'font-semibold text-purple-300' : 'text-gray-300'}`}>
                    {c.cost} €
                  </td>
                  <td className={`px-5 py-3 text-right ${c.highlight ? 'text-green-400 font-semibold' : 'text-red-400'}`}>
                    {c.factor}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-4xl px-6 py-16">
        <h2 className="mb-10 text-center text-2xl font-bold">So funktioniert's</h2>
        <div className="grid gap-8 md:grid-cols-3">
          {[
            { step: '1', title: 'Anfrage senden', desc: 'Erzählen Sie uns, was Ihr Agent können soll. Wir beraten Sie kostenlos.' },
            { step: '2', title: 'Einrichtung', desc: 'Wir konfigurieren Ihren Agent, binden Ihre Systeme an und trainieren ihn auf Ihre Daten.' },
            { step: '3', title: 'Loslegen', desc: 'Ihr Agent arbeitet ab Tag 1. Sie behalten volle Kontrolle über ein Dashboard.' },
          ].map((s) => (
            <div key={s.step} className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-purple-600/10 text-lg font-bold text-purple-400 ring-1 ring-purple-500/20">
                {s.step}
              </div>
              <h3 className="mb-2 font-bold">{s.title}</h3>
              <p className="text-sm text-gray-400">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-3xl px-6 py-16">
        <h2 className="mb-10 text-center text-2xl font-bold">Häufige Fragen</h2>
        <div className="space-y-4">
          {faqs.map((f) => (
            <details key={f.q} className="group rounded-xl border border-gray-800 bg-gray-900/30">
              <summary className="cursor-pointer px-6 py-4 font-medium text-gray-200 transition hover:text-white">
                {f.q}
              </summary>
              <p className="px-6 pb-4 text-sm text-gray-400">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20 text-center">
        <h2 className="mb-4 text-3xl font-bold">Bereit für Ihren digitalen Mitarbeiter?</h2>
        <p className="mb-8 text-gray-400">Kostenlose Erstberatung — unverbindlich und persönlich.</p>
        <a
          href="mailto:info@cloudfreedom.de?subject=Erstberatung CloudFreedom Agent"
          className="inline-block rounded-xl bg-purple-600 px-10 py-4 text-lg font-semibold shadow-lg shadow-purple-600/20 transition hover:bg-purple-500"
        >
          Jetzt Beratung anfragen →
        </a>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800/50 px-6 py-8">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 text-sm text-gray-600 md:flex-row">
          <span>© 2026 CloudFreedom · Sovereign AI Infrastructure</span>
          <div className="flex gap-6">
            <a href="/impressum" className="transition hover:text-gray-400">Impressum</a>
            <a href="/datenschutz" className="transition hover:text-gray-400">Datenschutz</a>
            <a href="mailto:info@cloudfreedom.de" className="transition hover:text-gray-400">Kontakt</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
