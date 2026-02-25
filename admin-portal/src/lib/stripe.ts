import { loadStripe, Stripe } from '@stripe/stripe-js';

// Stripe Public Key from environment
const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder';

// Initialize Stripe
let stripePromise: Promise<Stripe | null>;

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(stripePublishableKey);
  }
  return stripePromise;
};

// Price IDs configuration - placeholders to be replaced with real ones
export const STRIPE_PRICES = {
  // JobHunter Agent
  JOBHUNTER_STARTER_MONTHLY: 'price_placeholder_jobhunter_49',
  JOBHUNTER_STARTER_YEARLY: 'price_placeholder_jobhunter_49_yearly',
  JOBHUNTER_PRO_MONTHLY: 'price_placeholder_jobhunter_99', 
  JOBHUNTER_PRO_YEARLY: 'price_placeholder_jobhunter_99_yearly',

  // Recruiting Agent
  RECRUITING_STARTER_MONTHLY: 'price_placeholder_recruiting_149',
  RECRUITING_STARTER_YEARLY: 'price_placeholder_recruiting_149_yearly',
  RECRUITING_PRO_MONTHLY: 'price_placeholder_recruiting_199',
  RECRUITING_PRO_YEARLY: 'price_placeholder_recruiting_199_yearly',

  // Document Intelligence
  DOCINT_STARTER_MONTHLY: 'price_placeholder_docint_99',
  DOCINT_STARTER_YEARLY: 'price_placeholder_docint_99_yearly',
  DOCINT_PRO_MONTHLY: 'price_placeholder_docint_149',
  DOCINT_PRO_YEARLY: 'price_placeholder_docint_149_yearly',

  // DevOps Agent
  DEVOPS_STARTER_MONTHLY: 'price_placeholder_devops_79',
  DEVOPS_STARTER_YEARLY: 'price_placeholder_devops_79_yearly',
  DEVOPS_PRO_MONTHLY: 'price_placeholder_devops_129',
  DEVOPS_PRO_YEARLY: 'price_placeholder_devops_129_yearly',

  // Content Agent
  CONTENT_STARTER_MONTHLY: 'price_placeholder_content_59',
  CONTENT_STARTER_YEARLY: 'price_placeholder_content_59_yearly',
  CONTENT_PRO_MONTHLY: 'price_placeholder_content_99',
  CONTENT_PRO_YEARLY: 'price_placeholder_content_99_yearly',
};

export type PriceId = keyof typeof STRIPE_PRICES;

// Checkout session creation
export const createCheckoutSession = async (priceId: string, isYearly = false) => {
  try {
    const stripe = await getStripe();
    if (!stripe) {
      throw new Error('Stripe failed to initialize');
    }

    // In a real app, this would call your backend API to create a checkout session
    // For now, we'll simulate the redirect URL structure
    const checkoutUrl = `/checkout-session?price=${priceId}&mode=${isYearly ? 'yearly' : 'monthly'}`;
    
    console.log('Would redirect to checkout for price:', priceId);
    console.log('Checkout URL would be:', checkoutUrl);
    
    // In production, you would:
    // 1. Call your backend API to create a checkout session
    // 2. Get the session URL back
    // 3. Redirect to Stripe Checkout
    
    // For demo purposes, show an alert
    alert(`Demo: Would redirect to Stripe Checkout for ${priceId}\n\nIn production, this would call your backend API to create a Stripe Checkout Session and redirect the user.`);
    
    return { success: true, url: checkoutUrl };
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// Product configuration for easier management
export interface ProductConfig {
  id: string;
  name: string;
  emoji: string;
  description: string;
  features: string[];
  cta: string;
  popular?: boolean;
  prices: {
    starter: {
      monthly: number;
      yearly: number;
      monthlyPriceId: PriceId;
      yearlyPriceId: PriceId;
    };
    pro: {
      monthly: number;
      yearly: number;
      monthlyPriceId: PriceId;
      yearlyPriceId: PriceId;
    };
  };
  starterFeatures: string[];
  proFeatures: string[];
}

export const PRODUCTS: ProductConfig[] = [
  {
    id: 'jobhunter',
    name: 'JobHunter Agent',
    emoji: '🎯',
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
    prices: {
      starter: {
        monthly: 49,
        yearly: 39, // 20% discount
        monthlyPriceId: 'JOBHUNTER_STARTER_MONTHLY',
        yearlyPriceId: 'JOBHUNTER_STARTER_YEARLY',
      },
      pro: {
        monthly: 99,
        yearly: 79, // 20% discount
        monthlyPriceId: 'JOBHUNTER_PRO_MONTHLY',
        yearlyPriceId: 'JOBHUNTER_PRO_YEARLY',
      },
    },
    starterFeatures: [
      'Basis Job-Crawling',
      '10 Bewerbungen/Monat',
      'E-Mail Reports',
      'Standard CV-Templates',
    ],
    proFeatures: [
      'Erweiterte Suche & Filter',
      'Unbegrenzte Bewerbungen',
      'Slack/Teams Integration',
      'Custom CV-Anpassungen',
      'LinkedIn-Integration',
      'Priority Support',
    ],
  },
  {
    id: 'recruiting',
    name: 'Recruiting Agent',
    emoji: '👥',
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
    prices: {
      starter: {
        monthly: 149,
        yearly: 119,
        monthlyPriceId: 'RECRUITING_STARTER_MONTHLY',
        yearlyPriceId: 'RECRUITING_STARTER_YEARLY',
      },
      pro: {
        monthly: 199,
        yearly: 159,
        monthlyPriceId: 'RECRUITING_PRO_MONTHLY',
        yearlyPriceId: 'RECRUITING_PRO_YEARLY',
      },
    },
    starterFeatures: [
      'Basis Kandidatensuche',
      '50 Ansprachen/Monat',
      'Standard Screening',
      'E-Mail Templates',
    ],
    proFeatures: [
      'Multi-Platform Sourcing',
      'Unbegrenzte Ansprachen',
      'KI-Personality Matching',
      'Custom Interview Guides',
      'ATS Integration',
      'Dedicated Account Manager',
    ],
  },
  {
    id: 'docint',
    name: 'Document Intelligence',
    emoji: '📄',
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
    prices: {
      starter: {
        monthly: 99,
        yearly: 79,
        monthlyPriceId: 'DOCINT_STARTER_MONTHLY',
        yearlyPriceId: 'DOCINT_STARTER_YEARLY',
      },
      pro: {
        monthly: 149,
        yearly: 119,
        monthlyPriceId: 'DOCINT_PRO_MONTHLY',
        yearlyPriceId: 'DOCINT_PRO_YEARLY',
      },
    },
    starterFeatures: [
      '1.000 Dokumente/Monat',
      'Standard OCR',
      'Basis Klassifikation',
      'E-Mail Support',
    ],
    proFeatures: [
      'Unbegrenzte Dokumente',
      'Advanced OCR + KI',
      'Custom Compliance Rules',
      'API-Zugang',
      'Batch Processing',
      'Telefon Support',
    ],
  },
  {
    id: 'devops',
    name: 'DevOps Agent',
    emoji: '🛡️',
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
    prices: {
      starter: {
        monthly: 79,
        yearly: 63,
        monthlyPriceId: 'DEVOPS_STARTER_MONTHLY',
        yearlyPriceId: 'DEVOPS_STARTER_YEARLY',
      },
      pro: {
        monthly: 129,
        yearly: 103,
        monthlyPriceId: 'DEVOPS_PRO_MONTHLY',
        yearlyPriceId: 'DEVOPS_PRO_YEARLY',
      },
    },
    starterFeatures: [
      'Basic Monitoring (5 Services)',
      'Standard Alerts',
      'Weekly Reports',
      'E-Mail Integration',
    ],
    proFeatures: [
      'Unlimited Services',
      'Smart Incident Response',
      'Real-time Analytics',
      'Custom Runbooks',
      'Multi-Channel Alerts',
      '24/7 Phone Support',
    ],
  },
  {
    id: 'content',
    name: 'Content Agent',
    emoji: '✍️',
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
    prices: {
      starter: {
        monthly: 59,
        yearly: 47,
        monthlyPriceId: 'CONTENT_STARTER_MONTHLY',
        yearlyPriceId: 'CONTENT_STARTER_YEARLY',
      },
      pro: {
        monthly: 99,
        yearly: 79,
        monthlyPriceId: 'CONTENT_PRO_MONTHLY',
        yearlyPriceId: 'CONTENT_PRO_YEARLY',
      },
    },
    starterFeatures: [
      '10 Posts/Monat',
      'Basic Templates',
      'Standard SEO',
      '2 Social Accounts',
    ],
    proFeatures: [
      'Unbegrenzte Posts',
      'Custom Brand Voice',
      'Advanced SEO & Analytics',
      'Unlimited Social Accounts',
      'Image Generation',
      'Content Calendar',
    ],
  },
];