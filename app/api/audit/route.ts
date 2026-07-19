import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { extractSignals } from "@/lib/audit/extract";
import { generateReport } from "@/lib/audit/ai";
import { auditStore, findRecentAuditByUrl } from "@/lib/audit/store";
import { getSupabaseServiceClient } from "@/lib/supabase/server";
import { fetchPageHtml, FetchPageError } from "@/lib/audit/fetch-page";
import { checkAuditRateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/get-client-ip";
import { captureScreenshot } from "@/lib/screenshot/capture";
import { uploadScreenshot } from "@/lib/screenshot/upload";

export const maxDuration = 60; // Vercel: audit > 10s → passer en background function/Inngest si besoin

function parseTargetUrl(raw: unknown): URL | null {
  if (typeof raw !== "string" || !raw.trim()) return null;
  try {
    const target = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
    if (!target.hostname.includes(".")) return null;
    return target;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  let body: { url?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corps de requête invalide." }, { status: 400 });
  }

  const target = parseTargetUrl(body.url);
  if (!target) {
    return NextResponse.json({ error: "URL invalide." }, { status: 400 });
  }

  // Cache : même URL < 24h → renvoyer l'audit existant (contrôle du coût IA,
  // et ne consomme pas le quota puisqu'aucun appel IA n'est refait).
  const cached = findRecentAuditByUrl(target.href);
  if (cached) {
    return NextResponse.json({ id: cached.id, report: cached.report });
  }

  let html: string;
  let screenshot: Buffer | null;
  try {
    // Le screenshot ne rejette jamais (voir capture.ts) — seul fetchPageHtml peut faire échouer ce bloc.
    const [fetched, shot] = await Promise.all([
      fetchPageHtml(target),
      captureScreenshot(target.href),
    ]);
    html = fetched.html;
    screenshot = shot;
  } catch (err) {
    const message =
      err instanceof FetchPageError
        ? err.message
        : "Impossible de récupérer cette page. Vérifiez qu'elle est publique et accessible.";
    return NextResponse.json({ error: message }, { status: 422 });
  }

  if (!html.trim()) {
    return NextResponse.json(
      { error: "La page semble vide — impossible de l'analyser." },
      { status: 422 },
    );
  }

  // Le quota ne se consomme qu'ici, juste avant l'étape coûteuse (appel IA) —
  // une URL invalide, bloquée (SSRF) ou inaccessible ne compte pas dans le quota.
  const ip = getClientIp(req);
  const rateLimit = await checkAuditRateLimit(`ip:${ip}`);
  if (!rateLimit.success) {
    return NextResponse.json(
      {
        error:
          "Vous avez atteint votre quota d'audits gratuits (1/mois). Passez en Pro pour des audits illimités.",
      },
      { status: 429, headers: { "Retry-After": String(Math.ceil((rateLimit.resetAt - Date.now()) / 1000)) } },
    );
  }

  const extracted = extractSignals(html, target.href);

  let report;
  try {
    report = await generateReport(target.href, extracted, screenshot);
  } catch (err) {
    console.error("[api/audit] AI generation failed", err);
    return NextResponse.json(
      { error: "L'audit a échoué pendant l'analyse IA. Réessayez dans un instant." },
      { status: 502 },
    );
  }

  const id = randomUUID();

  if (screenshot) {
    const screenshotUrl = await uploadScreenshot(id, screenshot);
    if (screenshotUrl) report.screenshotUrl = screenshotUrl;
  }

  auditStore.set(id, { id, url: target.href, report, createdAt: Date.now() });

  const supabase = getSupabaseServiceClient();
  if (supabase) {
    const { error } = await supabase.from("audits").insert({
      id,
      url: target.href,
      score: report.score,
      report,
      screenshot_url: report.screenshotUrl ?? null,
    });
    if (error) console.error("[api/audit] Supabase insert failed", error);
  }

  return NextResponse.json({ id, report });
}
