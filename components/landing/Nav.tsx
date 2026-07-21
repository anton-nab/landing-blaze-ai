"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Wordmark } from "./Logo";
import { NAV_LINKS } from "@/lib/landing-content";
import { focusAuditInput } from "@/lib/focus-audit-input";
import { createClient } from "@/lib/supabase/client";

export function Nav({ user }: { user: { email: string } | null }) {
  const router = useRouter();
  const supabase = createClient();

  async function signOut() {
    await supabase.auth.signOut();
    router.refresh();
  }

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
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="hidden max-w-[160px] truncate text-[13px] text-muted-foreground sm:inline">
                {user.email}
              </span>
              <button
                onClick={signOut}
                className="whitespace-nowrap rounded-[8px] border border-white/10 bg-white/5 px-3 py-2 text-[13px] font-medium text-[#C7CBE8] hover:bg-white/10"
              >
                Se déconnecter
              </button>
            </>
          ) : (
            <Link
              href="/connexion"
              className="hidden whitespace-nowrap text-[13.5px] font-medium text-muted-foreground transition-colors hover:text-white sm:inline"
            >
              Se connecter
            </Link>
          )}
          <Button
            onClick={focusAuditInput}
            className="rounded-[8px] bg-white px-[15px] py-2 text-[13px] font-semibold text-background hover:bg-zinc-200"
          >
            Auditer ma page
          </Button>
        </div>
      </div>
    </div>
  );
}
