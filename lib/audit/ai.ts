import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { AUDIT_SYSTEM_PROMPT, buildAuditUserPrompt } from "./prompt";
import { GRADE, type Category, type CategoryKey, type Report } from "./types";
import type { ExtractedPage } from "./extract";

const CATEGORY_KEYS: CategoryKey[] = [
  "headline",
  "cta",
  "social_proof",
  "copywriting",
  "ux",
  "seo",
  "accessibility",
  "performance",
];

const CATEGORY_LABELS: Record<CategoryKey, string> = {
  headline: "Headline",
  cta: "CTA",
  social_proof: "Social Proof",
  copywriting: "Copywriting",
  ux: "UX",
  seo: "SEO",
  accessibility: "Accessibilité",
  performance: "Performance",
};

const AIReportSchema = z.object({
  verdict: z.string().min(1),
  categories: z
    .array(
      z.object({
        key: z.enum(CATEGORY_KEYS as [CategoryKey, ...CategoryKey[]]),
        score: z.number().min(0).max(100),
        explanation: z.string().min(1),
        recommendations: z.array(z.string().min(1)).length(3),
      }),
    )
    .length(8),
  topImprovements: z
    .array(
      z.object({
        categoryKey: z.enum(CATEGORY_KEYS as [CategoryKey, ...CategoryKey[]]),
        action: z.string().min(1),
      }),
    )
    .length(5),
  conversion: z.object({
    currentPct: z.number().min(0).max(100),
  }),
});

// JSON Schema for Anthropic tool-use — mirrors AIReportSchema above (kept separate
// because tool input_schema must be plain JSON Schema, not a zod object).
const REPORT_TOOL = {
  name: "submit_report",
  description: "Soumet le rapport d'audit structuré de la landing page.",
  input_schema: {
    type: "object" as const,
    properties: {
      verdict: {
        type: "string",
        description: "1-2 phrases de synthèse en français, ton direct.",
      },
      categories: {
        type: "array",
        minItems: 8,
        maxItems: 8,
        description: "Exactement les 8 dimensions, une fois chacune.",
        items: {
          type: "object",
          properties: {
            key: { type: "string", enum: CATEGORY_KEYS },
            score: { type: "integer", minimum: 0, maximum: 100 },
            explanation: { type: "string" },
            recommendations: {
              type: "array",
              minItems: 3,
              maxItems: 3,
              items: { type: "string" },
            },
          },
          required: ["key", "score", "explanation", "recommendations"],
        },
      },
      topImprovements: {
        type: "array",
        minItems: 5,
        maxItems: 5,
        description: "Les 5 actions au meilleur ratio impact/effort, triées par impact décroissant.",
        items: {
          type: "object",
          properties: {
            categoryKey: { type: "string", enum: CATEGORY_KEYS },
            action: { type: "string", description: "1 phrase impérative." },
          },
          required: ["categoryKey", "action"],
        },
      },
      conversion: {
        type: "object",
        properties: {
          currentPct: {
            type: "number",
            description: "Estimation réaliste du taux de conversion actuel (1-4% pour la plupart des pages).",
          },
        },
        required: ["currentPct"],
      },
    },
    required: ["verdict", "categories", "topImprovements", "conversion"],
  },
};

let cachedClient: Anthropic | null = null;
function getClient() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY manquant — ajoutez-le dans .env.local");
  }
  if (!cachedClient) cachedClient = new Anthropic({ apiKey });
  return cachedClient;
}

export async function generateReport(url: string, extracted: ExtractedPage): Promise<Report> {
  const anthropic = getClient();

  const message = await anthropic.messages.create({
    model: process.env.ANTHROPIC_AUDIT_MODEL || "claude-sonnet-5",
    max_tokens: 4096,
    system: AUDIT_SYSTEM_PROMPT,
    messages: [{ role: "user", content: buildAuditUserPrompt(extracted) }],
    tools: [REPORT_TOOL],
    tool_choice: { type: "tool", name: "submit_report" },
  });

  const toolUse = message.content.find(
    (block): block is Anthropic.Messages.ToolUseBlock => block.type === "tool_use",
  );
  if (!toolUse) throw new Error("Le modèle n'a pas retourné de rapport structuré.");

  const parsed = AIReportSchema.parse(toolUse.input);

  // L'ordre et l'unicité des 8 catégories sont verrouillés par le contrat (types.ts) —
  // on réordonne/valide plutôt que de faire confiance à l'ordre renvoyé par le modèle.
  const byKey = new Map(parsed.categories.map((c) => [c.key, c]));
  const categories: Category[] = CATEGORY_KEYS.map((key) => {
    const c = byKey.get(key);
    if (!c) throw new Error(`Catégorie manquante dans la réponse IA : ${key}`);
    return {
      key,
      name: CATEGORY_LABELS[key],
      score: Math.round(c.score),
      explanation: c.explanation,
      recommendations: c.recommendations,
    };
  });

  const score = Math.round(categories.reduce((sum, c) => sum + c.score, 0) / categories.length);
  const grade = GRADE(score);

  const scoreByKey = new Map(categories.map((c) => [c.key, c.score]));
  const topImprovements = parsed.topImprovements.map((t) => {
    const catScore = scoreByKey.get(t.categoryKey) ?? 50;
    const impact: "high" | "medium" | "low" = catScore < 55 ? "high" : catScore < 70 ? "medium" : "low";
    return { categoryKey: t.categoryKey, action: t.action, impact };
  });

  // conversion.upliftPct / projectedPct sont dérivés déterministiquement du score
  // (règle du prompt system) plutôt que laissés au jugement libre du modèle.
  const currentPct = Math.round(parsed.conversion.currentPct * 10) / 10;
  const upliftPct = Math.round((100 - score) * 0.9);
  const projectedPct = Math.round(currentPct * (1 + upliftPct / 100) * 10) / 10;

  return {
    reportVersion: 1,
    url,
    score,
    grade,
    verdict: parsed.verdict,
    categories,
    topImprovements,
    conversion: { currentPct, projectedPct, upliftPct },
    createdAt: new Date().toISOString(),
  };
}
