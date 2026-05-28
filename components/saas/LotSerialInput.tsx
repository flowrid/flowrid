"use client";

// 批次/序列号输入组件 — Lot / Serial Number Input
// 收货/拣货环节中采集批次号和序列号

import { useState } from "react";

export interface LotSerialEntry {
  type: "lot" | "serial";
  value: string;
  quantity?: number;
  expirationDate?: string;
}

interface Props {
  onEntriesChange: (entries: LotSerialEntry[]) => void;
  initialEntries?: LotSerialEntry[];
  mode?: "lot" | "serial" | "both";
  maxEntries?: number;
  compact?: boolean;
}

export default function LotSerialInput({ onEntriesChange, initialEntries, mode = "both", maxEntries = 50, compact }: Props) {
  const [entries, setEntries] = useState<LotSerialEntry[]>(initialEntries || []);
  const [inputValue, setInputValue] = useState("");
  const [entryType, setEntryType] = useState<"lot" | "serial">(mode === "serial" ? "serial" : "lot");
  const [expirationDate, setExpirationDate] = useState("");
  const [quantity, setQuantity] = useState("1");

  function addEntry() {
    if (!inputValue.trim()) return;
    const newEntries = [...entries, {
      type: entryType,
      value: inputValue.trim(),
      quantity: entryType === "lot" ? parseInt(quantity) || 1 : 1,
      expirationDate: expirationDate || undefined,
    }];
    setEntries(newEntries);
    onEntriesChange(newEntries);
    setInputValue("");
    if (entryType === "serial") {
      // 序列号模式下保持类型
    }
  }

  function removeEntry(idx: number) {
    const newEntries = entries.filter((_, i) => i !== idx);
    setEntries(newEntries);
    onEntriesChange(newEntries);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      addEntry();
    }
  }

  return (
    <div className={compact ? "" : "space-y-3"}>
      {/* Input row */}
      <div className="flex flex-wrap items-end gap-2">
        {mode === "both" && (
          <div>
            <label className="block text-[10px] font-medium text-[#86868B] uppercase mb-0.5">Type</label>
            <select value={entryType} onChange={(e) => setEntryType(e.target.value as any)}
              className="bg-[#F5F5F7] border-0 rounded-lg px-2.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#ed6d00]/20">
              <option value="lot">Lot</option>
              <option value="serial">Serial</option>
            </select>
          </div>
        )}

        <div className="flex-1 min-w-[140px]">
          <label className="block text-[10px] font-medium text-[#86868B] uppercase mb-0.5">
            {entryType === "serial" ? "Serial Number" : "Lot Number"}
          </label>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={entryType === "serial" ? "Scan or type serial..." : "Scan or type lot..."}
            className="w-full bg-[#F5F5F7] border-0 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ed6d00]/20"
          />
        </div>

        {entryType === "lot" && (
          <div className="w-20">
            <label className="block text-[10px] font-medium text-[#86868B] uppercase mb-0.5">Qty</label>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full bg-[#F5F5F7] border-0 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ed6d00]/20"
            />
          </div>
        )}

        <div className="w-36">
          <label className="block text-[10px] font-medium text-[#86868B] uppercase mb-0.5">Expiry</label>
          <input
            type="date"
            value={expirationDate}
            onChange={(e) => setExpirationDate(e.target.value)}
            className="w-full bg-[#F5F5F7] border-0 rounded-lg px-2 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#ed6d00]/20"
          />
        </div>

        <button
          type="button"
          onClick={addEntry}
          disabled={!inputValue.trim() || entries.length >= maxEntries}
          className="bg-[#ed6d00] text-white px-3 py-2 rounded-lg text-xs font-semibold hover:bg-[#FF8A1F] disabled:opacity-40 transition-colors"
        >
          + Add
        </button>
      </div>

      {/* Entries list */}
      {entries.length > 0 && (
        <div className="space-y-1 max-h-48 overflow-y-auto">
          {entries.map((entry, i) => (
            <div key={i} className="flex items-center gap-2 bg-[#F5F5F7] rounded-lg px-3 py-1.5 text-sm">
              <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${entry.type === "lot" ? "bg-[#007AFF]/10 text-[#007AFF]" : "bg-[#AF52DE]/10 text-[#AF52DE]"}`}>
                {entry.type === "lot" ? "LOT" : "SN"}
              </span>
              <span className="flex-1 text-[#1D1D1F] font-mono text-xs">{entry.value}</span>
              {entry.quantity && entry.quantity > 1 && (
                <span className="text-[#86868B] text-xs">x{entry.quantity}</span>
              )}
              {entry.expirationDate && (
                <span className="text-[#86868B] text-xs">{entry.expirationDate}</span>
              )}
              <button onClick={() => removeEntry(i)} className="text-[#FF3B30]/60 hover:text-[#FF3B30] text-xs">&times;</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
