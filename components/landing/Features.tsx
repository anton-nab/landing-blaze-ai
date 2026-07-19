import { FEATURES } from "@/lib/landing-content";

export function Features() {
  return (
    <div id="features" className="mx-auto max-w-[1120px] px-6 py-[72px]">
      <div className="mb-3.5 text-xs font-semibold uppercase tracking-[.12em] text-brand">
        Fonctionnalités
      </div>
      <h2 className="mb-12 text-[34px] font-bold tracking-[-.025em] text-white">
        Un audit complet. Huit dimensions.
      </h2>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-px overflow-hidden rounded-2xl border border-white/[.07] bg-white/[.07]">
        {FEATURES.map((f) => (
          <div
            key={f.num}
            className="bg-surface-alt p-7 transition-colors duration-200 hover:bg-[#101014]"
          >
            <div className="mb-4 flex h-[34px] w-[34px] items-center justify-center rounded-[9px] border border-brand/25 bg-brand/[.12] font-mono text-[13px] font-semibold text-brand">
              {f.num}
            </div>
            <div className="mb-2 text-[15px] font-semibold text-white">{f.title}</div>
            <div className="text-[13.5px] leading-[1.6] text-muted-foreground">{f.body}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
