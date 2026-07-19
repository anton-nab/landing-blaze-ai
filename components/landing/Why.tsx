import { WHYS } from "@/lib/landing-content";

export function Why() {
  return (
    <div id="why" className="mx-auto max-w-[1120px] px-6 pb-10 pt-[88px]">
      <div className="mb-3.5 text-xs font-semibold uppercase tracking-[.12em] text-brand">
        Pourquoi cet outil
      </div>
      <h2 className="mb-12 max-w-[560px] text-[34px] font-bold tracking-[-.025em] text-balance text-white">
        La plupart des landing pages perdent 9 visiteurs sur 10. Sans savoir pourquoi.
      </h2>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-5">
        {WHYS.map((w) => (
          <div
            key={w.title}
            className="rounded-[14px] border border-white/[.08] bg-white/[.02] p-[26px] transition-colors duration-200 hover:border-white/[.18]"
          >
            <div className="mb-2.5 font-mono text-[30px] font-semibold text-white">{w.stat}</div>
            <div className="mb-2 text-[14.5px] font-semibold text-white">{w.title}</div>
            <div className="text-[13.5px] leading-[1.6] text-muted-foreground">{w.body}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
