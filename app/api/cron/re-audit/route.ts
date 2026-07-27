import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { extractSignals } from "@/lib/audit/extract";
import { generateReport } from "@/lib/audit/ai";
import { fetchPageHtml, FetchPageError } from "@/lib/audit/fetch-page";
import { captureScreenshot } from "@/lib/screenshot/capture";
import { uploadScreenshot } from "@/lib/screenshot/upload";
import { getSupabaseServiceClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/resend/send";
import { scoreEvolutionEmail } from "@/lib/resend/templates";
import { getPosthogServerClient } from "@/lib/posthog/server";

export const maxDuration = 300; // re-audits run sequentially — needs a Vercel Pro plan (Hobby caps at 10s)
export const dynamic = "force-dynamic";

const RE_AUDIT_AFTER_DAYS = 7;
const MAX_PER_RUN = 25; // cost guard — each candidate is a full AI + screenshot pass

interface AuditRow {
  id: string;
  user_id: string;
  url: string;
  score: number;
  created_at: string;
}

function isDue(createdAt: string): boolean {
  const ageMs = Date.now() - new Date(createdAt).getTime();
  return ageMs >= RE_AUDIT_AFTER_DAYS * 24 * 60 * 60 * 1000;
}

export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && req.headers.get("authorization") !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabaseServiceClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase non configuré." }, { status: 500 });
  }

  const { data: proProfiles, error: profilesError } = await supabase
    .from("profiles")
    .select("id")
    .in("plan", ["pro", "agency"]);
  if (profilesError) {
    console.error("[cron/re-audit] échec lecture profiles", profilesError);
    return NextResponse.json({ error: "Échec lecture des profils." }, { status: 500 });
  }

  const proUserIds = (proProfiles ?? []).map((p) => p.id);
  if (proUserIds.length === 0) {
    return NextResponse.json({ candidates: 0, processed: 0, failed: 0, skippedNoChange: 0 });
  }

  // Un utilisateur peut avoir plusieurs audits pour la même URL — on ne garde que
  // le plus récent par (user_id, url), et seulement s'il date d'au moins
  // RE_AUDIT_AFTER_DAYS (évite de re-auditer une page relancée manuellement hier).
  const { data: rows, error: auditsError } = await supabase
    .from("audits")
    .select("id, user_id, url, score, created_at")
    .in("user_id", proUserIds)
    .order("created_at", { ascending: false })
    .limit(2000);
  if (auditsError) {
    console.error("[cron/re-audit] échec lecture audits", auditsError);
    return NextResponse.json({ error: "Échec lecture des audits." }, { status: 500 });
  }

  const latestByKey = new Map<string, AuditRow>();
  for (const row of (rows ?? []) as AuditRow[]) {
    const key = `${row.user_id}|${row.url}`;
    if (!latestByKey.has(key)) latestByKey.set(key, row);
  }

  const due = [...latestByKey.values()].filter((row) => isDue(row.created_at));
  const capped = due.length > MAX_PER_RUN;
  const batch = due.slice(0, MAX_PER_RUN);
  if (capped) {
    console.warn(`[cron/re-audit] ${due.length} candidats dus, seulement ${MAX_PER_RUN} traités ce run`);
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const posthog = getPosthogServerClient();
  let processed = 0;
  let failed = 0;
  let skippedNoChange = 0;

  for (const candidate of batch) {
    try {
      const target = new URL(candidate.url);
      const { html } = await fetchPageHtml(target);
      const extracted = extractSignals(html, target.href);
      const screenshot = await captureScreenshot(target.href);
      const report = await generateReport(target.href, extracted, screenshot);

      const id = randomUUID();
      if (screenshot) {
        const screenshotUrl = await uploadScreenshot(id, screenshot);
        if (screenshotUrl) report.screenshotUrl = screenshotUrl;
      }

      const { data: inserted, error: insertError } = await supabase
        .from("audits")
        .insert({
          id,
          user_id: candidate.user_id,
          url: target.href,
          score: report.score,
          report,
          screenshot_url: report.screenshotUrl ?? null,
        })
        .select("share_slug")
        .single();
      if (insertError) {
        console.error("[cron/re-audit] échec insertion", candidate.url, insertError);
        failed++;
        continue;
      }

      const delta = report.score - candidate.score;
      if (delta === 0) {
        skippedNoChange++;
        continue;
      }

      const { data: authUser } = await supabase.auth.admin.getUserById(candidate.user_id);
      const email = authUser?.user?.email;
      if (email) {
        const reportUrl = inserted.share_slug ? `${siteUrl}/r/${inserted.share_slug}` : `${siteUrl}/audit/${id}`;
        const { subject, html: emailHtml } = scoreEvolutionEmail({
          url: target.href,
          previousScore: candidate.score,
          newScore: report.score,
          reportUrl,
        });
        await sendEmail(email, subject, emailHtml);
      }

      posthog?.capture({
        distinctId: candidate.user_id,
        event: "score_evolution_email_sent",
        properties: { url: target.href, previousScore: candidate.score, newScore: report.score, delta },
      });

      processed++;
    } catch (err) {
      const message = err instanceof FetchPageError ? err.message : err;
      console.error("[cron/re-audit] échec re-audit", candidate.url, message);
      failed++;
    }
  }

  return NextResponse.json({
    candidates: due.length,
    processed,
    failed,
    skippedNoChange,
    cappedAt: capped ? MAX_PER_RUN : null,
  });
}
