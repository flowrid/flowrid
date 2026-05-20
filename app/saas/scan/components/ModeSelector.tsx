"use client";

import type { ScanMode } from "@/types/saas";

const MODES: { mode: ScanMode; label: string; icon: string; desc: string }[] = [
  { mode: "receive", label: "Receive", icon: "📦", desc: "Scan product UPC to receive inventory" },
  { mode: "pick", label: "Pick", icon: "📋", desc: "Scan location & product to confirm picks" },
  { mode: "lookup", label: "Lookup", icon: "🔍", desc: "Scan any barcode to view item info" },
];

export default function ModeSelector({ onSelect }: { onSelect: (mode: ScanMode) => void }) {
  return (
    <div className="p-6">
      <h1 className="text-[28px] font-bold tracking-tight text-[#1D1D1F] mb-2">Warehouse Scanner</h1>
      <p className="text-[#86868B] text-sm mb-8">Select scan mode to begin</p>

      <div className="space-y-3">
        {MODES.map((m) => (
          <button
            key={m.mode}
            onClick={() => onSelect(m.mode)}
            className="w-full bg-white rounded-2xl p-5 shadow-sm border border-black/5 hover:border-[#ed6d00]/30 hover:shadow-md transition-all text-left flex items-center gap-4"
          >
            <span className="text-3xl shrink-0">{m.icon}</span>
            <div>
              <p className="text-[17px] font-semibold text-[#1D1D1F]">{m.label}</p>
              <p className="text-xs text-[#86868B] mt-0.5">{m.desc}</p>
            </div>
            <span className="ml-auto text-[#86868B]">→</span>
          </button>
        ))}
      </div>
    </div>
  );
}
