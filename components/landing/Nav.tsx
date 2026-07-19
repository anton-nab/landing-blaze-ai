"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Wordmark } from "./Logo";
import { NAV_LINKS } from "@/lib/landing-content";
import { focusAuditInput } from "@/lib/focus-audit-input";

export function Nav() {
  return (
    <div className="sticky top-0 z-50 border-b border-white/[.06] bg-background/72 backdrop-blur-[14px]">
      <div className="mx-auto flex h-[60px] max-w-[1120px] items-center justify-between gap-6 px-6">
        <Wordmark />
        <div className="hidden items-center gap-[26px] text-[13.5px] font-medium md:flex">
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href} className="text-muted-foreground transition-colors hover:text-white">
              {link.label}
            </a>
          ))}
          <Link href="/historique" className="text-muted-foreground transition-colors hover:text-white">
            Historique
          </Link>
          <Link href="/avis" className="text-muted-foreground transition-colors hover:text-white">
            Avis
          </Link>
        </div>
        <Button
          onClick={focusAuditInput}
          className="rounded-[8px] bg-white px-[15px] py-2 text-[13px] font-semibold text-background hover:bg-zinc-200"
        >
          Auditer ma page
        </Button>
      </div>
    </div>
  );
}
