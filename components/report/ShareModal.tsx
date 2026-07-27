"use client";

import { useState } from "react";

export function ShareModal({
  onClose,
  shareUrl,
  ogImageUrl,
  score,
}: {
  onClose: () => void;
  shareUrl: string;
  ogImageUrl?: string;
  score: number;
}) {
  const [copied, setCopied] = useState(false);

  function copy() {
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
    navigator.clipboard?.writeText(shareUrl).catch(() => {});
  }

  function shareX() {
    const text = `Ma landing page vient de se faire auditer : ${score}/100 sur LandingBlaze 🔥`;
    window.open(
      `https://x.com/intent/post?text=${encodeURIComponent(`${text} ${shareUrl}`)}`,
      "_blank",
      "noopener,noreferrer",
    );
  }

  function shareLinkedIn() {
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      "_blank",
      "noopener,noreferrer",
    );
  }

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/72 p-6 backdrop-blur-[8px]"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[600px] rounded-[20px] border border-white/[.12] bg-surface-alt p-5"
        style={{ boxShadow: "0 40px 100px -20px rgba(0,0,0,.8)" }}
      >
        <div className="mb-4 flex items-center justify-between px-1">
          <div className="text-[14.5px] font-semibold text-white">Partager ce rapport</div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-xl leading-none text-[#6E7299] hover:text-white"
            aria-label="Fermer"
          >
            ×
          </button>
        </div>

        {ogImageUrl ? (
          <div
            className="overflow-hidden rounded-[14px] border border-white/[.08] bg-background"
            style={{ aspectRatio: "1200/630" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={ogImageUrl} alt="Aperçu du partage" className="h-full w-full object-cover" />
          </div>
        ) : null}

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={copy}
            className="min-w-[160px] flex-1 whitespace-nowrap rounded-[9px] bg-brand px-4 py-[11px] text-[13.5px] font-semibold text-white hover:brightness-110"
          >
            {copied ? "Lien copié ✓" : "Copier le lien"}
          </button>
          <button
            type="button"
            onClick={shareX}
            className="whitespace-nowrap rounded-[9px] border border-white/[.12] bg-white/5 px-[18px] py-[11px] text-[13.5px] font-semibold text-white hover:bg-white/10"
          >
            X
          </button>
          <button
            type="button"
            onClick={shareLinkedIn}
            className="whitespace-nowrap rounded-[9px] border border-white/[.12] bg-white/5 px-[18px] py-[11px] text-[13.5px] font-semibold text-white hover:bg-white/10"
          >
            LinkedIn
          </button>
        </div>

        <div className="mt-3 overflow-hidden text-ellipsis whitespace-nowrap text-center font-mono text-[11.5px] text-[#52525B]">
          {shareUrl}
        </div>
      </div>
    </div>
  );
}
