"use client";

import { useTranslations } from "next-intl";
import type { ScanMode } from "@/types/saas";

export default function ModeSelector({ onSelect }: { onSelect: (mode: ScanMode) => void }) {
  const t = useTranslations("scan");

  const modes: { mode: ScanMode; label: string; icon: string; desc: string }[] = [
    { mode: "receive", label: t("receive"), icon: "📦", desc: t("receiveDesc") },
    { mode: "pick", label: t("pick"), icon: "📋", desc: t("pickDesc") },
    { mode: "lookup", label: t("lookup"), icon: "🔍", desc: t("lookupDesc") },
  ];

  return (
    <div className="p-6">
      <h1 className="text-[28px] font-bold tracking-tight text-[#1D1D1F] mb-2">{t("scanner")}</h1>
      <p className="text-[#86868B] text-sm mb-8">{t("scannerSubtitle")}</p>

      <div className="space-y-3">
        {modes.map((m) => (
          <button
            key={m.mode}
            onClick={() => onSelect(m.mode)}
            className="w-full bg-white rounded-2xl p-5 shadow-sm border border-black/5 hover:border-[#ed6d00]/30 hover:shadow-md transition-all text-left flex items-center gap-4"
          >
            <span className="text-2xl shrink-0">{m.icon}</span>
            <div>
              <p className="text-[17px] font-semibold text-[#1D1D1F]">{m.label}</p>
              <p className="text-xs text-[#86868B] mt-0.5">{m.desc}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
