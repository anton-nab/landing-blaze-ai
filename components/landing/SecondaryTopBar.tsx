import Link from "next/link";

export function SecondaryTopBar({ ctaLabel, ctaHref }: { ctaLabel: string; ctaHref: string }) {
  return (
    <div className="sticky top-0 z-50 border-b border-white/[.06] bg-background/72 backdrop-blur-[14px]">
      <div className="mx-auto flex h-[60px] max-w-[1120px] items-center justify-between gap-4 px-6">
        <Link
          href="/"
          className="whitespace-nowrap rounded-[8px] border border-white/10 bg-white/5 px-3 py-[7px] text-[13px] font-medium text-[#D4D4D8] hover:bg-white/10"
        >
          ← Accueil
        </Link>
        <Link
          href={ctaHref}
          className="whitespace-nowrap rounded-[8px] bg-brand px-[15px] py-2 text-[13px] font-semibold text-white hover:brightness-110"
        >
          {ctaLabel}
        </Link>
      </div>
    </div>
  );
}
