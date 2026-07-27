"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { PLANS } from "@/lib/landing-content";
import { focusAuditInput } from "@/lib/focus-audit-input";
import posthog from "posthog-js";

export function Pricing() {
  const router = useRouter();
  const [annual, setAnnual] = useState(true);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function checkout(planKey: "pro" | "agency") {
    setError("");
    setLoadingPlan(planKey);
    posthog.capture("upgrade_clicked", { plan: planKey, interval: annual ? "annual" : "monthly" });
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planKey, interval: annual ? "annual" : "monthly" }),
      });
      const data = await res.json();

      if (res.status === 401) {
        router.push("/inscription");
        return;
      }
      if (!res.ok) {
        setError(data.error || "Une erreur est survenue.");
        setLoadingPlan(null);
        return;
      }
      window.location.assign(data.url);
    } catch {
      setError("Une erreur est survenue. Réessayez.");
      setLoadingPlan(null);
    }
  }

  return (
    <div id="pricing" className="mx-auto max-w-[1120px] px-6 py-[72px]">
      <div className="mb-11 text-center">
        <div className="mb-3.5 text-xs font-semibold uppercase tracking-[.12em] text-brand">
          Tarifs
        </div>
        <h2 className="mb-[22px] text-[34px] font-bold tracking-[-.025em] text-white">
          Simple. Sans surprise.
        </h2>
        <div className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 p-1">
          <button
            onClick={() => setAnnual(false)}
            className={cn(
              "rounded-full px-4 py-[7px] text-[13px] font-semibold transition-colors",
              annual ? "text-muted-foreground" : "bg-white text-background",
            )}
          >
            Mensuel
          </button>
          <button
            onClick={() => setAnnual(true)}
            className={cn(
              "rounded-full px-4 py-[7px] text-[13px] font-semibold transition-colors",
              annual ? "bg-white text-background" : "text-muted-foreground",
            )}
          >
            Annuel · −20%
          </button>
        </div>
        {error ? <p className="mt-4 text-[13px] text-danger">{error}</p> : null}
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] items-stretch gap-5">
        {PLANS.map((plan) => {
          const price = annual ? Math.round(plan.monthlyPrice * 0.8) : plan.monthlyPrice;
          const isPaid = plan.key === "pro" || plan.key === "agency";
          const isLoading = loadingPlan === plan.key;
          return (
            <div
              key={plan.name}
              className={cn(
                "relative flex flex-col rounded-2xl border p-[30px]",
                plan.popular
                  ? "border-brand/40 bg-brand/5"
                  : "border-white/[.08] bg-white/[.02]",
              )}
            >
              {plan.popular ? (
                <div className="absolute -top-[11px] left-1/2 -translate-x-1/2 rounded-full bg-brand px-3 py-1 text-[11px] font-bold tracking-[.04em] text-white">
                  POPULAIRE
                </div>
              ) : null}
              <div className="text-[14px] font-semibold text-white">{plan.name}</div>
              <div className="my-3.5 flex items-baseline gap-1.5">
                <span className="font-mono text-[38px] font-semibold text-white">{price}€</span>
                <span className="text-[13px] text-[#6E7299]">
                  {plan.monthlyPrice === 0 ? "/ mois" : annual ? "/ mois, facturé à l'année" : "/ mois"}
                </span>
              </div>
              <div className="mb-[22px] text-[13px] text-muted-foreground">{plan.tagline}</div>
              <div className="mb-7 flex flex-col gap-[11px]">
                {plan.feats.map((feat) => (
                  <div key={feat} className="flex items-start gap-2.5 text-[13.5px] leading-[1.45] text-[#C7CBE8]">
                    <Check className="mt-0.5 h-[15px] w-[15px] shrink-0 text-success" strokeWidth={2.4} />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={isPaid ? () => checkout(plan.key as "pro" | "agency") : focusAuditInput}
                disabled={isLoading}
                className={cn(
                  "mt-auto flex items-center justify-center gap-2 rounded-[9px] py-[11px] text-[13.5px] font-semibold transition-[filter] hover:brightness-[1.15] disabled:opacity-60",
                  plan.popular
                    ? "bg-brand text-white"
                    : "border border-white/[.14] bg-white/[.06] text-white",
                )}
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {plan.cta}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
