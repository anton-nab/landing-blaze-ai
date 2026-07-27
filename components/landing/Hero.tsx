"use client";

import { useState, type FormEvent, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { AUDIT_INPUT_ID } from "@/lib/focus-audit-input";
import posthog from "posthog-js";

function validateUrl(raw: string): { url: string } | { error: string } {
  const trimmed = raw.trim();
  if (!trimmed) return { error: "Collez une URL pour lancer l'audit." };
  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const parsed = new URL(withProtocol);
    if (!parsed.hostname.includes(".")) throw new Error("invalid");
    return { url: withProtocol };
  } catch {
    return { error: "URL invalide — exemple : https://monsite.com" };
  }
}

export function Hero() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [err, setErr] = useState("");

  function submit() {
    const result = validateUrl(url);
    if ("error" in result) {
      setErr(result.error);
      return;
    }
    setErr("");
    posthog.capture("audit_submitted", { url: result.url });
    router.push(`/audit/loading?url=${encodeURIComponent(result.url)}`);
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    submit();
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") submit();
  }

  return (
    <div className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(600px 320px at 50% -60px, rgba(91, 110, 232,.16), transparent 70%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.03) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage: "radial-gradient(560px 380px at 50% 0, #000, transparent)",
          WebkitMaskImage: "radial-gradient(560px 380px at 50% 0, #000, transparent)",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative mx-auto max-w-[820px] px-6 pb-[72px] pt-24 text-center"
      >
        <div className="inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-white/10 bg-white/[.04] px-3.5 py-1.5 text-[12.5px] font-medium text-muted-foreground">
          <span className="h-1.5 w-1.5 animate-soft-pulse rounded-full bg-brand" />
          Audit de conversion propulsé par l&apos;IA
        </div>

        <h1 className="mx-auto mt-[26px] mb-[18px] max-w-[820px] text-[clamp(38px,6vw,62px)] font-extrabold leading-[1.05] tracking-[-.035em] text-balance text-white">
          Votre landing page mérite un blaze honnête.
        </h1>
        <p className="mx-auto mb-9 max-w-[560px] text-[17px] leading-[1.6] text-pretty text-muted-foreground">
          Collez une URL. En 30 secondes, l&apos;IA note votre page sur 100, décortique
          headline, CTA, copywriting, UX — et vous dit exactement quoi corriger pour
          convertir plus.
        </p>

        <form onSubmit={onSubmit} className="mx-auto max-w-[560px]">
          <div
            className="flex flex-wrap gap-2 rounded-[14px] border border-white/[.12] bg-white/[.04] p-2"
            style={{ boxShadow: "0 20px 60px -20px rgba(91, 110, 232,.25)" }}
          >
            <input
              id={AUDIT_INPUT_ID}
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setErr("");
              }}
              onKeyDown={onKeyDown}
              placeholder="https://votre-landing-page.com"
              className="min-w-[220px] flex-1 bg-transparent px-3 py-2.5 font-mono text-[15px] text-white outline-none placeholder:text-[#4E5270]"
            />
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-[9px] bg-brand px-[22px] py-3 text-[14.5px] font-semibold text-white transition-[filter,transform] duration-150 hover:brightness-110 hover:-translate-y-px active:scale-[.98]"
            >
              Lancer l&apos;audit <ArrowRight className="h-4 w-4" />
            </button>
          </div>
          {err ? <div className="mt-2.5 text-[13px] text-danger">{err}</div> : null}
          <div className="mt-3.5 text-[12.5px] text-[#6E7299]">
            Gratuit · Sans carte bancaire · Résultat en ~30 s
          </div>
        </form>

        <MiniPreview />
      </motion.div>
    </div>
  );
}

const MINI_BARS = [
  { label: "Headline", width: 58, color: "var(--brand)" },
  { label: "CTA", width: 72, color: "var(--success)" },
  { label: "Copy", width: 64, color: "var(--warning)" },
  { label: "UX", width: 81, color: "var(--success)" },
];

function MiniPreview() {
  return (
    <div
      className="mx-auto mt-16 flex max-w-[640px] flex-wrap items-center gap-6 rounded-2xl border border-white/[.09] px-6 py-[22px] text-left"
      style={{
        background: "linear-gradient(180deg, rgba(255,255,255,.045), rgba(255,255,255,.015))",
      }}
    >
      <div className="flex items-baseline gap-1.5">
        <span className="font-mono text-[44px] font-semibold text-white">67</span>
        <span className="text-[13px] text-[#6E7299]">/100</span>
      </div>
      <div className="grid min-w-[260px] flex-1 grid-cols-2 gap-3.5 sm:grid-cols-4">
        {MINI_BARS.map((bar) => (
          <div key={bar.label}>
            <div className="mb-1.5 text-[11px] text-[#6E7299]">{bar.label}</div>
            <div className="h-1 rounded-full bg-white/[.08]">
              <div
                className="h-full rounded-full"
                style={{ width: `${bar.width}%`, background: bar.color }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
