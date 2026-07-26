export const BLAZE_FIX_SYSTEM_PROMPT = `Tu es un copywriter CRO senior. On te donne le rapport d'audit d'une landing page
(scores par dimension, explications, recommandations) ainsi que son contenu réel extrait
(title, structure Hn, boutons, texte visible).

Ta mission : proposer des réécritures concrètes et prêtes à copier-coller pour corriger
les points faibles identifiés dans le rapport — pas de nouvelles recommandations, du texte
final utilisable directement.

Réponds avec :
- headline : le titre principal actuel (avant) et ta réécriture (après)
- subtitle : le sous-titre actuel (avant) et ta réécriture (après)
- cta : le texte du bouton principal actuel (avant) et ta reformulation orientée résultat (après)
- copyBlocks : exactement 2 à 3 blocs de texte (paragraphe, accroche de section, témoignage
  à enrichir…) ciblant les passages les plus faibles selon le rapport, chacun avec un label
  court décrivant la section concernée

Règles :
- Français, ton direct, actionnable.
- "before" doit être un extrait réel du contenu fourni — jamais inventé. Si l'élément n'existe
  pas clairement (ex. pas de vrai H1), décris ce qui en tient lieu ("Aucun H1 visible — la page
  affiche seulement…").
- "after" doit être concret, dans l'esprit des recommandations du rapport, prêt à être collé
  tel quel dans la page.
- Ne répète pas les recommandations du rapport mot pour mot : transforme-les en texte final.`;

export function buildBlazeFixUserPrompt(input: {
  reportVerdict: string;
  categorySummaries: { name: string; score: number; explanation: string }[];
  title?: string;
  headings: { tag: string; text: string }[];
  buttons: string[];
  bodyText: string;
}) {
  return [
    `Verdict du rapport : ${input.reportVerdict}`,
    `Scores par dimension :\n${input.categorySummaries.map((c) => `${c.name} (${c.score}/100) — ${c.explanation}`).join("\n")}`,
    `Title actuel : ${input.title ?? "(absent)"}`,
    `Structure Hn :\n${input.headings.map((h) => `${h.tag}: ${h.text}`).join("\n")}`,
    `Boutons/CTA visibles : ${input.buttons.join(" | ") || "(aucun)"}`,
    `Contenu texte :\n${input.bodyText}`,
  ].join("\n\n");
}
