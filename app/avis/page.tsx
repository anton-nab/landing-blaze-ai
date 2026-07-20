import { SecondaryTopBar } from "@/components/landing/SecondaryTopBar";
import { REVIEWS } from "@/lib/landing-content";

export const metadata = { title: "Avis — LandingBlaze" };

export default function AvisPage() {
  return (
    <>
      <SecondaryTopBar ctaLabel="Auditer ma page" ctaHref="/#" />
      <div className="mx-auto max-w-[1120px] px-6 pb-24 pt-14">
        <div className="mb-12 text-center">
          <div className="mb-3 text-xs font-semibold uppercase tracking-[.12em] text-brand">Avis</div>
          <h1 className="mb-3 text-[36px] font-bold tracking-[-.025em] text-white">
            Ce que diront vos futurs clients
          </h1>
          <p className="mx-auto max-w-[480px] text-[14.5px] text-muted-foreground">
            Témoignages illustratifs — cette place est réservée à nos premiers utilisateurs.
          </p>
        </div>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-[18px]">
          {REVIEWS.map((rv) => (
            <div
              key={rv.name}
              className="flex flex-col gap-4 rounded-2xl border border-white/[.08] bg-white/[.02] p-[26px] transition-colors duration-200 hover:border-white/20"
            >
              <div className="text-sm tracking-[2px] text-brand">{"★".repeat(rv.stars)}{"☆".repeat(5 - rv.stars)}</div>
              <p className="flex-1 text-sm leading-relaxed text-[#C7CBE8]">« {rv.quote} »</p>
              <div className="flex items-center gap-3 border-t border-white/[.06] pt-4">
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${rv.gradient} text-[12.5px] font-bold text-white`}
                >
                  {rv.initials}
                </div>
                <div>
                  <div className="text-[13px] font-semibold text-white">{rv.name}</div>
                  <div className="text-xs text-[#6E7299]">{rv.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
