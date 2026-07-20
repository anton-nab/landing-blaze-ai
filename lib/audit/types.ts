// Contrat verrouillé du rapport — l'IA DOIT renvoyer exactement cette forme.
// Toute évolution = migration versionnée (reportVersion).

export type CategoryKey =
  | 'headline' | 'cta' | 'social_proof' | 'copywriting'
  | 'ux' | 'seo' | 'accessibility' | 'performance';

export interface Category {
  key: CategoryKey;
  name: string;            // libellé FR affiché ("Headline", "Accessibilité"…)
  score: number;           // 0–100
  explanation: string;     // 1–2 phrases, FR, ton direct
  recommendations: string[]; // exactement 3, actionnables, impératif
}

export interface TopImprovement {
  categoryKey: CategoryKey;
  action: string;          // 1 phrase impérative
  impact: 'high' | 'medium' | 'low'; // <55 high, <70 medium, sinon low
}

export interface Report {
  reportVersion: 1;
  url: string;
  score: number;           // moyenne pondérée des 8 catégories
  grade: string;           // dérivé du score (voir seuils README)
  verdict: string;         // 1–2 phrases de synthèse
  categories: Category[];  // exactement 8, ordre fixe ci-dessus
  topImprovements: TopImprovement[]; // exactement 5, triées par impact
  conversion: {
    currentPct: number;    // ex. 1.8
    projectedPct: number;  // ex. 2.9
    upliftPct: number;     // ex. 61
  };
  screenshotUrl?: string;
  createdAt: string;       // ISO
}

export const SCORE_COLOR = (s: number) =>
  s >= 75 ? '#5FA98C' : s >= 55 ? '#D9A054' : '#D9667A';

export const GRADE = (s: number) =>
  s >= 80 ? 'Excellente base.' : s >= 65 ? 'Solide, mais perfectible.'
  : s >= 50 ? 'Potentiel inexploité.' : 'Il y a du travail.';
