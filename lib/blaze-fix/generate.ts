import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { BLAZE_FIX_SYSTEM_PROMPT, buildBlazeFixUserPrompt } from "./prompt";
import type { BlazeFix } from "./types";
import type { ExtractedPage } from "@/lib/audit/extract";
import type { Report } from "@/lib/audit/types";

const RewriteSchema = z.object({
  before: z.string().min(1),
  after: z.string().min(1),
});

const AIBlazeFixSchema = z.object({
  headline: RewriteSchema,
  subtitle: RewriteSchema,
  cta: RewriteSchema,
  copyBlocks: z
    .array(
      z.object({
        label: z.string().min(1),
        before: z.string().min(1),
        after: z.string().min(1),
      }),
    )
    .min(2)
    .max(3),
});

const BLAZE_FIX_TOOL = {
  name: "submit_blaze_fix",
  description: "Soumet les réécritures de copy proposées.",
  input_schema: {
    type: "object" as const,
    properties: {
      headline: {
        type: "object",
        properties: { before: { type: "string" }, after: { type: "string" } },
        required: ["before", "after"],
      },
      subtitle: {
        type: "object",
        properties: { before: { type: "string" }, after: { type: "string" } },
        required: ["before", "after"],
      },
      cta: {
        type: "object",
        properties: { before: { type: "string" }, after: { type: "string" } },
        required: ["before", "after"],
      },
      copyBlocks: {
        type: "array",
        minItems: 2,
        maxItems: 3,
        items: {
          type: "object",
          properties: {
            label: { type: "string" },
            before: { type: "string" },
            after: { type: "string" },
          },
          required: ["label", "before", "after"],
        },
      },
    },
    required: ["headline", "subtitle", "cta", "copyBlocks"],
  },
};

let cachedClient: Anthropic | null = null;
function getClient() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY manquant — ajoutez-le dans .env.local");
  if (!cachedClient) cachedClient = new Anthropic({ apiKey });
  return cachedClient;
}

export async function generateBlazeFix(report: Report, extracted: ExtractedPage): Promise<BlazeFix> {
  const anthropic = getClient();

  const userText = buildBlazeFixUserPrompt({
    reportVerdict: report.verdict,
    categorySummaries: report.categories.map((c) => ({
      name: c.name,
      score: c.score,
      explanation: c.explanation,
    })),
    title: extracted.title,
    headings: extracted.headings,
    buttons: extracted.buttons,
    bodyText: extracted.bodyText,
  });

  const message = await anthropic.messages.create({
    model: process.env.ANTHROPIC_AUDIT_MODEL || "claude-sonnet-5",
    max_tokens: 3072,
    system: BLAZE_FIX_SYSTEM_PROMPT,
    messages: [{ role: "user", content: userText }],
    tools: [BLAZE_FIX_TOOL],
    tool_choice: { type: "tool", name: "submit_blaze_fix" },
  });

  const toolUse = message.content.find(
    (block): block is Anthropic.Messages.ToolUseBlock => block.type === "tool_use",
  );
  if (!toolUse) throw new Error("Le modèle n'a pas retourné de correction structurée.");

  const parsed = AIBlazeFixSchema.parse(toolUse.input);

  return {
    ...parsed,
    createdAt: new Date().toISOString(),
  };
}
