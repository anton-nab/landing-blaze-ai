import { LogoMark } from "./Logo";

export function Footer() {
  return (
    <div className="border-t border-white/[.06]">
      <div className="mx-auto flex max-w-[1120px] flex-wrap items-center justify-between gap-5 px-6 py-9">
        <div className="flex items-center gap-2 text-[14px] font-bold text-white">
          <LogoMark className="h-[18px] w-[18px]" />
          LandingRoast <span className="text-[12.5px] font-normal text-[#52525B]">© 2026</span>
        </div>
        <div className="flex gap-[22px] text-[13px]">
          <a href="#why" className="text-muted-foreground hover:text-white">Pourquoi</a>
          <a href="#pricing" className="text-muted-foreground hover:text-white">Tarifs</a>
          <a href="#faq" className="text-muted-foreground hover:text-white">FAQ</a>
          <a href="#" className="text-muted-foreground hover:text-white">Confidentialité</a>
        </div>
      </div>
    </div>
  );
}
