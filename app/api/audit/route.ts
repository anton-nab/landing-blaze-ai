import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { extractSignals } from "@/lib/audit/extract";
import { generateReport } from "@/lib/audit/ai";
import { auditStore, findRecentAuditByUrl } from "@/lib/audit/store";
import { getSupabaseServiceClient } from "@/lib/supabase/server";

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

  // Cache : même URL < 24h → renvoyer l'audit existant (contrôle du coût IA).
  const cached = findRecentAuditByUrl(target.href);
  if (cached) {
    return NextResponse.json({ id: cached.id, report: cached.report });
  }

  let html: string;
  try {
    const res = await fetch(target.href, {
      headers: { "User-Agent": "LandingRoastBot/1.0 (+https://landingroast.ai)" },
      signal: AbortSignal.timeout(10_000),
      redirect: "follow",
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    html = await res.text();
  } catch {
    return NextResponse.json(
      { error: "Impossible de récupérer cette page. Vérifiez qu'elle est publique et accessible." },
      { status: 422 },
    );
  }

  if (!html.trim()) {
    return NextResponse.json(
      { error: "La page semble vide — impossible de l'analyser." },
      { status: 422 },
    );
  }

  const extracted = extractSignals(html, target.href);

  let report;
  try {
    report = await generateReport(target.href, extracted);
  } catch (err) {
    console.error("[api/audit] AI generation failed", err);
    return NextResponse.json(
      { error: "L'audit a échoué pendant l'analyse IA. Réessayez dans un instant." },
      { status: 502 },
    );
  }

  const id = randomUUID();
  auditStore.set(id, { id, url: target.href, report, createdAt: Date.now() });

  const supabase = getSupabaseServiceClient();
  if (supabase) {
    const { error } = await supabase
      .from("audits")
      .insert({ id, url: target.href, score: report.score, report });
    if (error) console.error("[api/audit] Supabase insert failed", error);
  }

  return NextResponse.json({ id, report });
}
