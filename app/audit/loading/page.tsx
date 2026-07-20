"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { LOADING_STEPS } from "@/lib/landing-content";

const STEP_MS = 800;

function LoadingContent() {
  const router = useRouter();
  const params = useSearchParams();
  const url = params.get("url") ?? "";

  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const started = useRef(false);

  useEffect(() => {
    if (!url) {
      router.replace("/");
      return;
    }
    if (started.current) return;
    started.current = true;

    const stepTimers = LOADING_STEPS.map((_, i) =>
      setTimeout(() => setStep(i + 1), STEP_MS * (i + 1)),
    );

    const minDisplay = new Promise((resolve) =>
      setTimeout(resolve, STEP_MS * LOADING_STEPS.length),
    );

    const request = fetch("/api/audit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    }).then(async (res) => {
      const data = await res.json();
      return { status: res.status, data };
    });

    Promise.all([request, minDisplay])
      .then(([{ status, data }]) => {
        if (status === 429) {
          // Quota gratuit atteint : direct vers la page de paiement (section Tarifs
          // tant que le vrai checkout Stripe n'est pas branché — semaine 3).
          router.replace("/#pricing");
          return;
        }
        if (status >= 400) {
          throw new Error(data.error || "Une erreur est survenue.");
        }
        setStep(LOADING_STEPS.length);
        router.replace(`/audit/${data.id}`);
      })
      .catch((err: Error) => {
        stepTimers.forEach(clearTimeout);
        setError(err.message || "L'audit a échoué. Réessayez dans un instant.");
      });

    return () => stepTimers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  const pct = Math.min(100, Math.round((step / LOADING_STEPS.length) * 100));

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-[440px] animate-fade-up">
        <div className="mb-2 flex items-center gap-2.5">
          {error ? (
            <span className="text-[15px] font-semibold text-danger">Échec de l&apos;audit</span>
          ) : (
            <>
              <Loader2 className="h-[18px] w-[18px] animate-spin text-brand" strokeWidth={2.4} />
              <span className="text-[15px] font-semibold text-white">Blaze en cours…</span>
            </>
          )}
        </div>
        <div className="mb-[26px] overflow-hidden text-ellipsis whitespace-nowrap font-mono text-[12.5px] text-[#6E7299]">
          {url}
        </div>

        {error ? (
          <div className="space-y-4">
            <p className="text-[13.5px] leading-relaxed text-muted-foreground">{error}</p>
            <button
              onClick={() => router.replace("/")}
              className="rounded-[8px] bg-white px-4 py-2 text-[13px] font-semibold text-background hover:bg-zinc-200"
            >
              ← Retour à l&apos;accueil
            </button>
          </div>
        ) : (
          <>
            <div className="mb-7 h-[5px] rounded-full bg-white/[.07]">
              <div
                className="h-full rounded-full bg-brand transition-[width] duration-700 ease-out"
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="flex flex-col gap-3.5">
              {LOADING_STEPS.map((label, i) => {
                const done = step > i;
                const active = step === i;
                return (
                  <div
                    key={label}
                    className={cn("flex items-center gap-3 transition-opacity duration-300", {
                      "opacity-100": done || active,
                      "opacity-50": !done && !active,
                    })}
                  >
                    <span
                      className={cn(
                        "flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border-[1.5px] text-[10px] font-bold text-background",
                        done ? "border-success bg-success" : active ? "border-brand" : "border-white/[.15]",
                      )}
                    >
                      {done ? <Check className="h-2.5 w-2.5" strokeWidth={3} /> : null}
                    </span>
                    <span className={cn("text-[13.5px]", done ? "text-[#C7CBE8]" : active ? "text-white" : "text-[#4E5270]")}>
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function AuditLoadingPage() {
  return (
    <Suspense>
      <LoadingContent />
    </Suspense>
  );
}
