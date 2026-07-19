"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { FAQS } from "@/lib/landing-content";

export function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div id="faq" className="mx-auto max-w-[720px] px-6 pb-24 pt-[72px]">
      <div className="mb-3.5 text-center text-xs font-semibold uppercase tracking-[.12em] text-brand">
        FAQ
      </div>
      <h2 className="mb-10 text-center text-[34px] font-bold tracking-[-.025em] text-white">
        Questions fréquentes
      </h2>
      <div className="flex flex-col gap-2.5">
        {FAQS.map((faq, i) => {
          const open = openIndex === i;
          return (
            <div
              key={faq.q}
              className="overflow-hidden rounded-xl border border-white/[.08] bg-white/[.02]"
            >
              <button
                onClick={() => setOpenIndex(open ? null : i)}
                className="flex w-full items-center justify-between gap-4 px-5 py-[18px] text-left text-[14.5px] font-semibold text-white"
              >
                <span>{faq.q}</span>
                <span
                  className={cn(
                    "shrink-0 font-mono text-base text-[#71717A] transition-transform duration-200",
                    open && "rotate-45",
                  )}
                >
                  +
                </span>
              </button>
              <div
                className="grid transition-[grid-template-rows] duration-[280ms] ease-out"
                style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
              >
                <div className="overflow-hidden">
                  <div className="px-5 pb-[18px] text-[13.5px] leading-[1.65] text-muted-foreground">
                    {faq.a}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
