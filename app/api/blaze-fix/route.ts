import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { getAuditById } from "@/lib/audit/get-audit";
import { fetchPageHtml, FetchPageError } from "@/lib/audit/fetch-page";
import { extractSignals } from "@/lib/audit/extract";
import { generateBlazeFix } from "@/lib/blaze-fix/generate";
import { getSupabaseServiceClient } from "@/lib/supabase/server";

export const maxDuration = 60;

// "Illimité raisonnable" pour Agency, per roadmap — un plafond haut plutôt qu'un vrai
// illimité, pour garder un filet de sécurité sur le coût IA.
const MONTHLY_QUOTA: Record<string, number> = { pro: 20, agency: 200 };

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Connectez-vous d'abord." }, { status: 401 });
  }
  if (user.plan === "free") {
    return NextResponse.json(
      { error: "Blaze Fix est réservé aux plans Pro et Agency." },
      { status: 403 },
    );
  }

  const body = await req.json().catch(() => null);
  const auditId = body?.auditId as string | undefined;
  const checkOnly = body?.checkOnly === true;
  if (!auditId) {
    return NextResponse.json({ error: "auditId manquant." }, { status: 400 });
  }

  const audit = await getAuditById(auditId);
  if (!audit) {
    return NextResponse.json({ error: "Audit introuvable." }, { status: 404 });
  }

  const supabase = getSupabaseServiceClient();
  if (!supabase) {
    return NextResponse.json({ error: "Service indisponible pour le moment." }, { status: 503 });
  }

  // Cache partagé par audit : si déjà généré (par n'importe quel utilisateur), on renvoie
  // directement — pas de nouveau coût IA, pas de décompte de quota.
  const { data: cached } = await supabase
    .from("blaze_fixes")
    .select("content")
    .eq("audit_id", auditId)
    .maybeSingle();
  if (cached) {
    return NextResponse.json({ blazeFix: cached.content, cached: true });
  }

  // checkOnly : appelé silencieusement au chargement de la page pour afficher un résultat
  // déjà en cache — ne déclenche jamais de génération (génération = uniquement sur clic).
  if (checkOnly) {
    return NextResponse.json({ blazeFix: null, cached: false });
  }

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { count } = await supabase
    .from("blaze_fixes")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .gte("created_at", startOfMonth.toISOString());

  const quota = MONTHLY_QUOTA[user.plan] ?? 0;
  if ((count ?? 0) >= quota) {
    return NextResponse.json(
      { error: `Quota Blaze Fix atteint pour ce mois (${quota}/mois).` },
      { status: 429 },
    );
  }

  let extracted;
  try {
    const { html } = await fetchPageHtml(new URL(audit.url));
    extracted = extractSignals(html, audit.url);
  } catch (err) {
    const message =
      err instanceof FetchPageError
        ? err.message
        : "Impossible de récupérer la page pour générer les corrections.";
    return NextResponse.json({ error: message }, { status: 422 });
  }

  let blazeFix;
  try {
    blazeFix = await generateBlazeFix(audit.report, extracted);
  } catch (err) {
    console.error("[blaze-fix] AI generation failed", err);
    return NextResponse.json({ error: "La génération a échoué. Réessayez." }, { status: 502 });
  }

  const { error } = await supabase.from("blaze_fixes").insert({
    audit_id: auditId,
    user_id: user.id,
    content: blazeFix,
  });
  if (error) console.error("[blaze-fix] insert failed", error);

  return NextResponse.json({ blazeFix, cached: false });
}
