import Link from "next/link";
import { SecondaryTopBar } from "@/components/landing/SecondaryTopBar";
import { listRecentAudits } from "@/lib/audit/get-audit";
import { SCORE_COLOR } from "@/lib/audit/types";

export const metadata = { title: "Historique — LandingBlaze" };

export default async function HistoriquePage() {
  const audits = await listRecentAudits();

  return (
    <>
      <SecondaryTopBar ctaLabel="Nouvel audit" ctaHref="/" />
      <div className="mx-auto max-w-[820px] px-6 pb-24 pt-14">
        <div className="mb-3 text-xs font-semibold uppercase tracking-[.12em] text-brand">
          Historique
        </div>
        <h1 className="mb-2 text-[32px] font-bold tracking-[-.025em] text-white">
          Vos derniers audits
        </h1>
        <p className="mb-9 text-sm text-muted-foreground">
          Retrouvez chaque blaze et suivez l&apos;évolution de vos scores.
        </p>

        {audits.length === 0 ? (
          <div className="rounded-2xl border border-white/[.08] bg-white/[.02] p-10 text-center">
            <p className="mb-5 text-sm text-muted-foreground">
              Aucun audit pour l&apos;instant — lancez votre premier blaze.
            </p>
            <Link
              href="/"
              className="inline-block rounded-[8px] bg-brand px-4 py-2 text-[13px] font-semibold text-white hover:brightness-110"
            >
              Auditer ma page
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {audits.map((audit) => {
              const color = SCORE_COLOR(audit.report.score);
              let host = audit.url;
              try {
                host = new URL(audit.url).hostname;
              } catch {}
              return (
                <div
                  key={audit.id}
                  className="flex flex-wrap items-center gap-[18px] rounded-[14px] border border-white/[.08] bg-white/[.02] px-[22px] py-[18px] transition-colors duration-200 hover:border-white/20"
                >
                  <div
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-[2.5px] font-mono text-[15px] font-semibold"
                    style={{ borderColor: color, color }}
                  >
                    {audit.report.score}
                  </div>
                  <div className="min-w-[220px] flex-1">
                    <div className="mb-1 flex flex-wrap items-baseline gap-2.5">
                      <span className="font-mono text-[13.5px] text-white">{host}</span>
                      <span className="whitespace-nowrap text-[11.5px] text-[#4E5270]">
                        {new Date(audit.createdAt).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <div className="text-[12.5px] leading-relaxed text-muted-foreground">
                      {audit.report.verdict}
                    </div>
                  </div>
                  <Link
                    href={`/audit/${audit.id}`}
                    className="shrink-0 whitespace-nowrap rounded-[8px] border border-white/[.12] bg-white/5 px-3.5 py-2 text-[12.5px] font-semibold text-white hover:bg-white/10"
                  >
                    Revoir →
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
