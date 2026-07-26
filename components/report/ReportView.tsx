"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Share2, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { SCORE_COLOR, type Report } from "@/lib/audit/types";
import type { Plan } from "@/lib/auth/get-current-user";
import { BlazeFixSection } from "./BlazeFixSection";

const RING_RADIUS = 84;
const CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;
const ANIM_MS = 1400;

const IMPACT_LABEL = { high: "Impact élevé", medium: "Impact moyen", low: "Impact modéré" } as const;
const IMPACT_STYLE = {
  high: "text-danger bg-danger/10",
  medium: "text-warning bg-warning/10",
  low: "text-muted-foreground bg-white/[.06]",
} as const;

export function ReportView({
  report,
  shareUrl,
  plan,
  auditId,
}: {
  report: Report;
  shareUrl: string;
  plan: Plan;
  auditId: string;
}) {
  const isPro = plan === "pro" || plan === "agency";
  const [shown, setShown] = useState(0);
  const [ringOffset, setRingOffset] = useState(CIRCUMFERENCE);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const t0 = performance.now();
    let raf: number;
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / ANIM_MS);
      const eased = 1 - Math.pow(1 - p, 3);
      const current = report.score * eased;
      setShown(Math.round(current));
      setRingOffset(CIRCUMFERENCE * (1 - current / 100));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [report.score]);

  const strengths = report.categories.filter((c) => c.score >= 75).length;
  const warnings = report.categories.filter((c) => c.score >= 55 && c.score < 75).length;
  const criticals = report.categories.filter((c) => c.score < 55).length;

  function copyLink() {
    navigator.clipboard?.writeText(shareUrl).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  }

  return (
    <>
      <div className="no-print sticky top-0 z-50 border-b border-white/[.06] bg-background/72 backdrop-blur-[14px]">
        <div className="mx-auto flex h-[60px] max-w-[1120px] items-center justify-between gap-4 px-6">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              href="/"
              className="shrink-0 whitespace-nowrap rounded-[8px] border border-white/10 bg-white/5 px-3 py-[7px] text-[13px] font-medium text-[#C7CBE8] hover:bg-white/10"
            >
              ← Accueil
            </Link>
            <span className="overflow-hidden text-ellipsis whitespace-nowrap font-mono text-[12.5px] text-[#6E7299]">
              {report.url}
            </span>
          </div>
          <div className="flex shrink-0 gap-2">
            {isPro ? (
              <button
                onClick={() => window.print()}
                className="hidden whitespace-nowrap rounded-[8px] border border-white/10 bg-white/5 px-3.5 py-2 text-[13px] font-semibold text-[#C7CBE8] hover:bg-white/10 sm:inline-flex"
              >
                Exporter en PDF
              </button>
            ) : null}
            <button
              onClick={copyLink}
              className="inline-flex items-center gap-[7px] whitespace-nowrap rounded-[8px] border border-white/10 bg-white/5 px-3.5 py-2 text-[13px] font-semibold text-[#C7CBE8] hover:bg-white/10"
            >
              <Share2 className="h-[13px] w-[13px]" strokeWidth={2.2} />
              {copied ? "Lien copié ✓" : "Partager"}
            </button>
            <Link
              href="/"
              className="whitespace-nowrap rounded-[8px] bg-brand px-[15px] py-2 text-[13px] font-semibold text-white hover:brightness-110"
            >
              Nouvel audit
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1120px] px-6 pb-24 pt-12">
        <div className="print-only mb-8 items-center justify-between gap-4 border-b border-white/[.08] pb-5">
          <span className="text-[15px] font-bold tracking-[-.01em] text-white">LandingBlaze</span>
          <div className="text-right">
            <div className="font-mono text-[12.5px] text-[#6E7299]">{report.url}</div>
            <div className="text-[11.5px] text-[#6E7299]">
              {new Date(report.createdAt).toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </div>
          </div>
        </div>

        {/* Score hero */}
        <div
          className="print-avoid-break flex flex-wrap items-center gap-12 rounded-[20px] border border-white/[.08] bg-white/[.02] p-10 animate-fade-up"
          style={{ background: "radial-gradient(500px 260px at 20% 0%, rgba(91, 110, 232,.1), transparent), rgba(255,255,255,.02)" }}
        >
          <div className="relative h-[196px] w-[196px] shrink-0">
            <svg width="196" height="196" viewBox="0 0 196 196">
              <circle cx="98" cy="98" r={RING_RADIUS} fill="none" stroke="rgba(255,255,255,.07)" strokeWidth="12" />
              <circle
                cx="98"
                cy="98"
                r={RING_RADIUS}
                fill="none"
                stroke="var(--brand)"
                strokeWidth="12"
                strokeLinecap="round"
                transform="rotate(-90 98 98)"
                style={{ strokeDasharray: CIRCUMFERENCE, strokeDashoffset: ringOffset }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="font-mono text-[52px] font-semibold leading-none text-white">{shown}</div>
              <div className="mt-1 text-xs text-[#6E7299]">/ 100</div>
            </div>
          </div>
          <div className="min-w-[280px] flex-1">
            <div className="mb-2.5 text-xs font-semibold uppercase tracking-[.12em] text-brand">
              Landing Score
            </div>
            <h1 className="mb-3 text-[32px] font-bold tracking-[-.025em] text-white">{report.grade}</h1>
            <p className="mb-5 max-w-[520px] text-[14.5px] leading-relaxed text-muted-foreground">
              {report.verdict}
            </p>
            <div className="flex flex-wrap gap-2.5">
              <span className="whitespace-nowrap rounded-full border border-success/30 bg-success/10 px-3 py-[5px] text-xs font-semibold text-success">
                {strengths} points forts
              </span>
              <span className="whitespace-nowrap rounded-full border border-warning/30 bg-warning/10 px-3 py-[5px] text-xs font-semibold text-warning">
                {warnings} à améliorer
              </span>
              <span className="whitespace-nowrap rounded-full border border-danger/30 bg-danger/10 px-3 py-[5px] text-xs font-semibold text-danger">
                {criticals} critiques
              </span>
            </div>
          </div>
          {report.screenshotUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={report.screenshotUrl}
              alt={`Capture d'écran de ${report.url}`}
              className="h-[150px] w-[220px] shrink-0 rounded-xl border border-white/[.08] object-cover object-top"
            />
          ) : null}
        </div>

        {/* Category cards */}
        <h2 className="mb-[22px] mt-[52px] text-[22px] font-bold tracking-[-.02em] text-white">
          Analyse détaillée
        </h2>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-[18px]">
          {report.categories.map((c) => {
            const color = SCORE_COLOR(c.score);
            return (
              <div
                key={c.key}
                className="print-avoid-break rounded-2xl border border-white/[.08] bg-white/[.02] p-6 transition-[border-color,transform] duration-200 hover:-translate-y-0.5 hover:border-white/20"
              >
                <div className="mb-3.5 flex items-center justify-between">
                  <div className="text-[15px] font-semibold text-white">{c.name}</div>
                  <div className="font-mono text-lg font-semibold" style={{ color }}>
                    {c.score}
                  </div>
                </div>
                <div className="mb-4 h-[5px] rounded-full bg-white/[.07]">
                  <div
                    className="h-full rounded-full transition-[width] duration-1000 ease-out"
                    style={{ width: `${c.score}%`, background: color }}
                  />
                </div>
                <p
                  className={cn(
                    "mb-4 text-[13px] leading-relaxed text-muted-foreground",
                    !isPro && "select-none blur-[3px]",
                  )}
                >
                  {c.explanation}
                </p>
                <div
                  className={cn(
                    "flex flex-col gap-2 border-t border-white/[.06] pt-3.5",
                    !isPro && "pointer-events-none select-none blur-[3px]",
                  )}
                >
                  {c.recommendations.map((r) => (
                    <div key={r} className="flex items-start gap-2.5 text-[12.5px] leading-relaxed text-[#C7CBE8]">
                      <span className="shrink-0 font-mono text-brand">→</span>
                      <span>{r}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        {!isPro ? (
          <div className="mt-[18px] flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-brand/30 bg-brand/5 px-6 py-5">
            <div className="flex items-center gap-3">
              <Lock className="h-4 w-4 shrink-0 text-brand" />
              <p className="text-[13px] text-[#C7CBE8]">
                Débloquez l&apos;explication et les recommandations complètes des 8 dimensions.
              </p>
            </div>
            <Link
              href="/#pricing"
              className="shrink-0 whitespace-nowrap rounded-[8px] bg-brand px-4 py-2 text-[13px] font-semibold text-white hover:brightness-110"
            >
              Passer en Pro
            </Link>
          </div>
        ) : null}

        {/* Top 5 (Top 3 en Free) */}
        <h2 className="mb-[22px] mt-14 text-[22px] font-bold tracking-[-.02em] text-white">
          {isPro ? "Top 5 améliorations" : "Top 3 améliorations"}
        </h2>
        <div className="overflow-hidden rounded-2xl border border-white/[.08]">
          {(isPro ? report.topImprovements : report.topImprovements.slice(0, 3)).map((t, i) => {
            const cat = report.categories.find((c) => c.key === t.categoryKey);
            return (
              <div
                key={`${t.categoryKey}-${i}`}
                className="flex flex-wrap items-center gap-4.5 border-b border-white/[.06] bg-white/[.02] px-6 py-[18px] last:border-b-0 hover:bg-white/[.045]"
              >
                <span className="w-6 shrink-0 font-mono text-[13px] font-semibold text-brand">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="min-w-[220px] flex-1">
                  <div className="mb-[3px] text-sm font-semibold text-white">{t.action}</div>
                  <div className="text-[12.5px] text-[#6E7299]">
                    {cat?.name ?? t.categoryKey} · score actuel {cat?.score ?? "—"}/100
                  </div>
                </div>
                <span
                  className={cn(
                    "shrink-0 whitespace-nowrap rounded-full px-[11px] py-1 text-[11.5px] font-semibold",
                    IMPACT_STYLE[t.impact],
                  )}
                >
                  {IMPACT_LABEL[t.impact]}
                </span>
              </div>
            );
          })}
          {!isPro ? (
            <div className="flex flex-wrap items-center justify-between gap-4 bg-brand/5 px-6 py-[18px]">
              <div className="flex items-center gap-3">
                <Lock className="h-4 w-4 shrink-0 text-brand" />
                <span className="text-[13px] text-[#C7CBE8]">
                  2 corrections supplémentaires réservées au plan Pro.
                </span>
              </div>
              <Link
                href="/#pricing"
                className="shrink-0 whitespace-nowrap rounded-[8px] bg-brand px-4 py-2 text-[13px] font-semibold text-white hover:brightness-110"
              >
                Passer en Pro
              </Link>
            </div>
          ) : null}
        </div>

        {/* Conversion impact */}
        <h2 className="mb-[22px] mt-14 text-[22px] font-bold tracking-[-.02em] text-white">
          Estimated Conversion Impact
        </h2>
        <div className="print-avoid-break rounded-2xl border border-white/[.08] bg-white/[.02] p-8">
          <div className="mb-7 flex flex-wrap gap-10">
            <div>
              <div className="mb-1.5 text-xs text-[#6E7299]">Conversion estimée actuelle</div>
              <div className="font-mono text-[30px] font-semibold text-white">
                {report.conversion.currentPct}%
              </div>
            </div>
            <div>
              <div className="mb-1.5 text-xs text-[#6E7299]">Après corrections</div>
              <div className="font-mono text-[30px] font-semibold text-success">
                {report.conversion.projectedPct}%
              </div>
            </div>
            <div>
              <div className="mb-1.5 text-xs text-[#6E7299]">Gain potentiel</div>
              <div className="font-mono text-[30px] font-semibold text-brand">
                +{report.conversion.upliftPct}%
              </div>
            </div>
          </div>
          <div className="relative h-3.5 overflow-hidden rounded-[7px] bg-white/[.06]">
            <div
              className="absolute inset-0 rounded-[7px]"
              style={{
                width: `${Math.min(100, Math.round((report.conversion.projectedPct / 5) * 100))}%`,
                background: "linear-gradient(90deg, rgba(48,164,108,.25), rgba(48,164,108,.55))",
              }}
            />
            <div
              className="absolute inset-0 rounded-[7px] bg-brand"
              style={{ width: `${Math.round((report.conversion.currentPct / 5) * 100)}%` }}
            />
          </div>
          <div className="mt-2.5 flex justify-between text-[11.5px] text-[#6E7299]">
            <span>Aujourd&apos;hui</span>
            <span>Potentiel après les 5 corrections prioritaires</span>
          </div>
          <p className="mt-[22px] text-[12.5px] leading-relaxed text-[#6E7299]">
            Estimation basée sur les benchmarks de conversion par dimension. Les résultats réels
            dépendent de votre trafic et de votre offre.
          </p>
        </div>

        <BlazeFixSection auditId={auditId} isPro={isPro} />
      </div>
    </>
  );
}
