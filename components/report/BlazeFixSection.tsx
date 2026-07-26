"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Lock, Sparkles, Loader2 } from "lucide-react";
import type { BlazeFix, BlazeFixRewrite } from "@/lib/blaze-fix/types";

function RewriteCard({ label, rewrite }: { label: string; rewrite: BlazeFixRewrite }) {
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard?.writeText(rewrite.after).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="print-avoid-break rounded-2xl border border-white/[.08] bg-white/[.02] p-6">
      <div className="mb-4 text-[12px] font-semibold uppercase tracking-[.08em] text-brand">{label}</div>
      <div className="mb-3 rounded-xl border border-white/[.06] bg-white/[.02] p-4">
        <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-[.06em] text-[#6E7299]">Avant</div>
        <p className="text-[13.5px] leading-relaxed text-muted-foreground">{rewrite.before}</p>
      </div>
      <div className="rounded-xl border border-success/25 bg-success/5 p-4">
        <div className="mb-1.5 flex items-center justify-between gap-3">
          <span className="text-[11px] font-semibold uppercase tracking-[.06em] text-success">Après</span>
          <button onClick={copy} className="no-print shrink-0 text-[11.5px] font-semibold text-success hover:underline">
            {copied ? "Copié ✓" : "Copier"}
          </button>
        </div>
        <p className="text-[13.5px] leading-relaxed text-white">{rewrite.after}</p>
      </div>
    </div>
  );
}

function LockedTeaser() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/[.08]">
      <div className="pointer-events-none select-none blur-[3px]">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-[18px] p-1">
          <RewriteCard
            label="Headline"
            rewrite={{
              before: "Bienvenue sur notre plateforme de gestion de projet",
              after: "Livrez vos projets 2x plus vite, sans réunion inutile.",
            }}
          />
          <RewriteCard
            label="CTA"
            rewrite={{ before: "Commencer", after: "Essayer gratuitement — 2 min chrono" }}
          />
        </div>
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background/60 px-6 text-center">
        <Lock className="h-5 w-5 text-brand" />
        <p className="max-w-[280px] text-[13px] text-[#C7CBE8]">
          Débloquez des réécritures prêtes à copier pour votre headline, votre CTA et vos
          blocs de texte les plus faibles.
        </p>
        <Link
          href="/#pricing"
          className="rounded-[8px] bg-brand px-4 py-2 text-[13px] font-semibold text-white hover:brightness-110"
        >
          Passer en Pro
        </Link>
      </div>
    </div>
  );
}

export function BlazeFixSection({ auditId, isPro }: { auditId: string; isPro: boolean }) {
  const [blazeFix, setBlazeFix] = useState<BlazeFix | null>(null);
  const [checked, setChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isPro) return;
    let cancelled = false;
    fetch("/api/blaze-fix", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ auditId, checkOnly: true }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled && data.blazeFix) setBlazeFix(data.blazeFix);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setChecked(true);
      });
    return () => {
      cancelled = true;
    };
  }, [auditId, isPro]);

  async function generate() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/blaze-fix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ auditId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "La génération a échoué.");
        return;
      }
      setBlazeFix(data.blazeFix);
    } catch {
      setError("La génération a échoué. Réessayez.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="print-avoid-break">
      <h2 className="mb-[22px] mt-14 flex items-center gap-2.5 text-[22px] font-bold tracking-[-.02em] text-white">
        <Sparkles className="h-5 w-5 text-brand" />
        Corrections proposées
      </h2>

      {!isPro ? (
        <LockedTeaser />
      ) : blazeFix ? (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-[18px]">
          <RewriteCard label="Headline" rewrite={blazeFix.headline} />
          <RewriteCard label="Sous-titre" rewrite={blazeFix.subtitle} />
          <RewriteCard label="CTA" rewrite={blazeFix.cta} />
          {blazeFix.copyBlocks.map((block, i) => (
            <RewriteCard key={`${block.label}-${i}`} label={block.label} rewrite={block} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-white/[.08] bg-white/[.02] p-8 text-center">
          <p className="mx-auto mb-5 max-w-[440px] text-[13.5px] leading-relaxed text-muted-foreground">
            Générez des réécritures prêtes à copier pour votre headline, votre sous-titre,
            votre CTA et 2 à 3 blocs de texte — basées sur les points faibles de votre audit.
          </p>
          {error ? <p className="mb-4 text-[13px] text-danger">{error}</p> : null}
          <button
            onClick={generate}
            disabled={loading || !checked}
            className="no-print inline-flex items-center gap-2 rounded-[9px] bg-brand px-5 py-2.5 text-[13.5px] font-semibold text-white hover:brightness-110 disabled:opacity-60"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {loading ? "Génération en cours… (~15 s)" : "Générer les corrections"}
          </button>
        </div>
      )}
    </div>
  );
}
