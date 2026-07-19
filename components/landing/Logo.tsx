import { Flame } from "lucide-react";
import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-[6px] bg-gradient-to-br from-brand to-brand-light",
        className,
      )}
    >
      <Flame className="h-[55%] w-[55%] text-background" strokeWidth={2.6} />
    </span>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-[9px] text-[15px] font-bold tracking-[-.01em] text-white", className)}>
      <LogoMark className="h-[22px] w-[22px]" />
      LandingRoast
    </div>
  );
}
