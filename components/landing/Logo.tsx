"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  // useId (not a module counter) so the gradient id matches between SSR and
  // hydration, and stays unique when nav + footer both render a logo.
  const gradId = `lr-logo-bg-${useId()}`;

  return (
    <svg
      viewBox="0 0 24 24"
      className={cn("shrink-0", className)}
      role="img"
      aria-label="LandingBlaze"
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FF7A3D" />
          <stop offset="55%" stopColor="#FF5C28" />
          <stop offset="100%" stopColor="#E24A1C" />
        </linearGradient>
      </defs>
      <rect width="24" height="24" rx="7" fill={`url(#${gradId})`} />
      <ellipse cx="8" cy="6" rx="7" ry="5" fill="#fff" opacity="0.12" />
      {/* Outer flame */}
      <path
        d="M12 3.5C9.3 7.6 7 10.3 7 13.7A5 5 0 0 0 17 13.7C17 10.3 14.7 7.6 12 3.5Z"
        fill="#fff"
      />
      {/* Inner core — offset right for a subtle flicker/asymmetry */}
      <path
        d="M12.6 9.2C11.2 11.2 10.2 12.7 10.2 14.6A2.4 2.4 0 0 0 15 14.6C15 12.7 14 11.2 12.6 9.2Z"
        fill="#FFE3BE"
      />
    </svg>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-[9px] text-[15px] font-bold tracking-[-.01em] text-white", className)}>
      <LogoMark className="h-[22px] w-[22px]" />
      LandingBlaze
    </div>
  );
}
