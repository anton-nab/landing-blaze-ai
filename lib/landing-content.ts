export const NAV_LINKS = [
  { href: "#why", label: "Pourquoi" },
  { href: "#features", label: "Fonctionnalités" },
  { href: "#pricing", label: "Tarifs" },
  { href: "#faq", label: "FAQ" },
] as const;

export const WHYS = [
  {
    stat: "96 %",
    title: "des visiteurs partent sans agir",
    body: "La plupart des landing pages ne donnent ni raison claire de rester, ni action évidente à faire. Le score identifie où vous perdez l'attention.",
  },
  {
    stat: "0,05 s",
    title: "pour former une première impression",
    body: "Votre headline et votre hero décident presque tout. L'IA les évalue comme le ferait votre visiteur le plus pressé.",
  },
  {
    stat: "8×",
    title: "plus rapide qu'un audit manuel",
    body: "Un audit CRO coûte 500€ et prend une semaine. Ici : une URL, 30 secondes, des recommandations actionnables.",
  },
] as const;

export const FEATURES = [
  {
    num: "01",
    title: "Landing Score sur 100",
    body: "Une note globale de conversion, pondérée sur 8 dimensions, pour situer votre page en un coup d'œil et suivre vos progrès.",
  },
  {
    num: "02",
    title: "Blaze du copywriting",
    body: "Headline, sous-titres, ton, longueur des phrases : l'IA relève ce qui endort le lecteur et propose des reformulations.",
  },
  {
    num: "03",
    title: "Audit CTA & preuve sociale",
    body: "Visibilité, formulation et répétition de vos CTA, plus la crédibilité de vos témoignages, logos et chiffres.",
  },
  {
    num: "04",
    title: "SEO & accessibilité",
    body: "Balises, structure Hn, contrastes, attributs alt : les fondamentaux qui conditionnent trafic et expérience.",
  },
  {
    num: "05",
    title: "Performance perçue",
    body: "Poids des images, scripts bloquants, LCP estimé : chaque seconde de chargement coûte des conversions.",
  },
  {
    num: "06",
    title: "Recommandations actionnables",
    body: "Pas de blabla : un top 5 priorisé par impact estimé sur la conversion, prêt à mettre en œuvre aujourd'hui.",
  },
] as const;

export type Plan = {
  name: string;
  monthlyPrice: number;
  tagline: string;
  popular: boolean;
  feats: string[];
  cta: string;
};

export const PLANS: Plan[] = [
  {
    name: "Free",
    monthlyPrice: 0,
    tagline: "Pour tester le blaze.",
    popular: false,
    feats: [
      "1 audit par mois",
      "Landing Score global",
      "Top 3 améliorations",
      "Analyse des 8 dimensions (aperçu)",
    ],
    cta: "Commencer gratuitement",
  },
  {
    name: "Pro",
    monthlyPrice: 19,
    tagline: "Pour les makers et marketers.",
    popular: true,
    feats: [
      "Audits illimités",
      "Recommandations complètes par dimension",
      "Historique & suivi de score",
      "Export PDF & lien de partage",
    ],
    cta: "Passer en Pro",
  },
  {
    name: "Agency",
    monthlyPrice: 49,
    tagline: "Pour les agences et équipes.",
    popular: false,
    feats: [
      "Tout le plan Pro",
      "Projets clients illimités",
      "Rapports en marque blanche",
      "Accès API",
    ],
    cta: "Contacter l'équipe",
  },
];

export const FAQS = [
  {
    q: "Comment le Landing Score est-il calculé ?",
    a: "L'IA évalue votre page sur 8 dimensions (headline, CTA, preuve sociale, copywriting, UX, SEO, accessibilité, performance), chacune notée sur 100. Le score global est la moyenne pondérée de ces dimensions.",
  },
  {
    q: "Est-ce vraiment gratuit ?",
    a: "Oui. Le premier audit est gratuit, sans carte bancaire. Le plan Pro débloque les audits illimités, l'historique et l'export PDF.",
  },
  {
    q: "Analysez-vous les pages derrière un login ?",
    a: "Pas encore. L'outil analyse les pages publiques accessibles par URL. Le support des pages authentifiées est sur la roadmap du plan Agency.",
  },
  {
    q: "Quelle différence avec Lighthouse ?",
    a: "Lighthouse mesure la technique (vitesse, bonnes pratiques). LandingBlaze analyse la conversion : la force de votre message, vos CTA, votre preuve sociale — ce qui fait vraiment signer vos visiteurs.",
  },
  {
    q: "Puis-je exporter ou partager le rapport ?",
    a: "Sur le plan Pro : export PDF et lien de partage public pour vos clients ou votre équipe.",
  },
] as const;

export const REVIEWS = [
  {
    name: "Claire Fontaine",
    role: "Growth marketer · B2B SaaS",
    stars: 5,
    quote:
      "Le blaze de ma headline était brutal mais juste. Réécrite en 10 minutes, +18 % de clics sur le CTA la semaine suivante.",
    initials: "CF",
    gradient: "from-[#FF5C28] to-[#FF9D5C]",
  },
  {
    name: "Thomas Berger",
    role: "Fondateur · invoicely",
    stars: 5,
    quote:
      "Un audit CRO m'aurait coûté 500 €. Là, j'ai un top 5 priorisé en 30 secondes, et je sais exactement par quoi commencer.",
    initials: "TB",
    gradient: "from-[#6E56CF] to-[#9E8CFC]",
  },
  {
    name: "Inès Kaddour",
    role: "Freelance CRO",
    stars: 5,
    quote:
      "Je lance un blaze avant chaque call client. Le rapport sert de base de discussion — mes devis passent beaucoup mieux.",
    initials: "IK",
    gradient: "from-[#0091FF] to-[#5CBEFF]",
  },
  {
    name: "Marc Delaunay",
    role: "Head of Marketing · pulse",
    stars: 4,
    quote:
      "La partie copywriting est bluffante : elle a repéré notre tic du « nous » partout. On suit notre score à chaque itération.",
    initials: "MD",
    gradient: "from-[#30A46C] to-[#6BD49E]",
  },
  {
    name: "Sofia Almeida",
    role: "Designer produit",
    stars: 5,
    quote:
      "Enfin un outil qui parle conversion et pas seulement performance technique. Le score par dimension est très parlant.",
    initials: "SA",
    gradient: "from-[#F5A623] to-[#FFD08A]",
  },
  {
    name: "Julien Weiss",
    role: "Agence — 12 clients",
    stars: 5,
    quote:
      "Les rapports en marque blanche vont changer notre process d'onboarding client. On vend l'audit comme produit d'appel.",
    initials: "JW",
    gradient: "from-[#F87171] to-[#FCA5A5]",
  },
] as const;

export const LOADING_STEPS = [
  "Capture de la page",
  "Analyse du contenu & du copywriting",
  "Évaluation UX & hiérarchie visuelle",
  "Audit SEO, accessibilité & performance",
  "Calcul du Landing Score",
] as const;
