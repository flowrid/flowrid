"use client";

// QC 检查清单组件 — 打包环节质检
// 嵌入式表单：选择订单 → 逐项检查 → 提交

import { useState } from "react";

interface QCCheckItem {
  category: "packing" | "product" | "labeling" | "documentation";
  check_name: string;
  passed: boolean;
  notes?: string;
}

const DEFAULT_CHECKLIST: QCCheckItem[] = [
  { category: "packing", check_name: "Outer box undamaged", passed: true },
  { category: "packing", check_name: "Proper cushioning / void fill", passed: true },
  { category: "packing", check_name: "Sealed securely (tape / strap)", passed: true },
  { category: "product", check_name: "Correct product picked", passed: true },
  { category: "product", check_name: "Quantity matches order", passed: true },
  { category: "product", check_name: "No visible damage or defects", passed: true },
  { category: "labeling", check_name: "Shipping label correct & legible", passed: true },
  { category: "labeling", check_name: "Barcode scannable", passed: true },
  { category: "labeling", check_name: "Hazmat label (if applicable)", passed: true },
  { category: "documentation", check_name: "Packing slip included", passed: true },
  { category: "documentation", check_name: "Customs docs (if international)", passed: true },
];

const CAT_LABELS: Record<string, string> = {
  packing: "Packing",
  product: "Product",
  labeling: "Labeling",
  documentation: "Documents",
};

interface Props {
  orderId?: string;
  onComplete?: (passed: boolean) => void;
  compact?: boolean;
}

export default function QCChecklist({ orderId: initialOrderId, onComplete, compact }: Props) {
  const [orderId, setOrderId] = useState(initialOrderId || "");
  const [checklist, setChecklist] = useState<QCCheckItem[]>(
    DEFAULT_CHECKLIST.map((c) => ({ ...c }))
  );
  const [inspectorName, setInspectorName] = useState("");
  const [packerName, setPackerName] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  function toggleCheck(index: number) {
    setChecklist((prev) =>
      prev.map((c, i) => (i === index ? { ...c, passed: !c.passed } : c))
    );
  }

  function updateNote(index: number, note: string) {
    setChecklist((prev) =>
      prev.map((c, i) => (i === index ? { ...c, notes: note } : c))
    );
  }

  const failedCount = checklist.filter((c) => !c.passed).length;
  const allPassed = failedCount === 0;

  async function handleSubmit() {
    if (!orderId.trim()) {
      setResult({ success: false, message: "Order ID is required" });
      return;
    }
    setSubmitting(true);
    setResult(null);
    try {
      const r = await fetch("/api/saas/qc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_id: orderId.trim(),
          checklist,
          inspector_name: inspectorName.trim() || undefined,
          packer_name: packerName.trim() || undefined,
          notes: notes.trim() || undefined,
          passed: allPassed,
        }),
      });
      const d = await r.json();
      if (r.ok) {
        setResult({ success: true, message: allPassed ? "QC passed — order advanced to packed" : "QC recorded with failures" });
        onComplete?.(allPassed);
      } else {
        setResult({ success: false, message: d.error || "Failed to submit QC" });
      }
    } catch {
      setResult({ success: false, message: "Network error" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={compact ? "" : "bg-white rounded-2xl shadow-sm border border-black/5 p-6"}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[15px] font-semibold text-[#1D1D1F]">QC Checklist</h3>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
          allPassed ? "bg-[#34C759]/10 text-[#34C759]" : "bg-[#FF3B30]/10 text-[#FF3B30]"
        }`}>
          {allPassed ? "All Passed" : `${failedCount} Failed`}
        </span>
      </div>

      {!initialOrderId && (
        <div className="mb-4">
          <label className="block text-[11px] font-medium text-[#86868B] uppercase tracking-wide mb-1">Order ID *</label>
          <input
            type="text"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            placeholder="Paste order ID..."
            className="w-full bg-[#F5F5F7] border-0 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ed6d00]/20"
          />
        </div>
      )}

      {/* Category groups */}
      <div className="space-y-3 mb-5">
        {(["packing", "product", "labeling", "documentation"] as const).map((cat) => {
          const items = checklist.filter((c) => c.category === cat);
          if (items.length === 0) return null;
          return (
            <div key={cat}>
              <div className="text-[11px] font-semibold text-[#86868B] uppercase tracking-wide mb-1.5">
                {CAT_LABELS[cat]}
              </div>
              <div className="space-y-1">
                {items.map((item, i) => {
                  const globalIdx = checklist.findIndex((c) => c.category === cat && c.check_name === item.check_name);
                  return (
                    <div key={i} className="flex items-center gap-2 group">
                      <button
                        type="button"
                        onClick={() => toggleCheck(globalIdx)}
                        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${
                          item.passed
                            ? "bg-[#34C759] border-[#34C759]"
                            : "bg-[#FF3B30]/10 border-[#FF3B30]"
                        }`}
                      >
                        {item.passed ? (
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg className="w-3 h-3 text-[#FF3B30]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        )}
                      </button>
                      <span className={`text-sm flex-1 ${item.passed ? "text-[#1D1D1F]" : "text-[#FF3B30]"}`}>
                        {item.check_name}
                      </span>
                      <input
                        type="text"
                        value={item.notes || ""}
                        onChange={(e) => updateNote(globalIdx, e.target.value)}
                        placeholder="Note..."
                        className="w-24 opacity-0 group-hover:opacity-100 focus:opacity-100 bg-[#F5F5F7] border-0 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-[#ed6d00]/20 transition-opacity"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Inspector & notes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        <div>
          <label className="block text-[11px] font-medium text-[#86868B] uppercase tracking-wide mb-1">Inspector</label>
          <input
            type="text"
            value={inspectorName}
            onChange={(e) => setInspectorName(e.target.value)}
            placeholder="Name"
            className="w-full bg-[#F5F5F7] border-0 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ed6d00]/20"
          />
        </div>
        <div>
          <label className="block text-[11px] font-medium text-[#86868B] uppercase tracking-wide mb-1">Packer</label>
          <input
            type="text"
            value={packerName}
            onChange={(e) => setPackerName(e.target.value)}
            placeholder="Name"
            className="w-full bg-[#F5F5F7] border-0 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ed6d00]/20"
          />
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-[11px] font-medium text-[#86868B] uppercase tracking-wide mb-1">Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          placeholder="Additional observations..."
          className="w-full bg-[#F5F5F7] border-0 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ed6d00]/20 resize-none"
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting}
          className="bg-[#ed6d00] text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-[#FF8A1F] disabled:opacity-50 transition-colors"
        >
          {submitting ? "Submitting..." : "Submit QC Check"}
        </button>
        {result && (
          <span className={`text-xs ${result.success ? "text-[#34C759]" : "text-[#FF3B30]"}`}>
            {result.message}
          </span>
        )}
      </div>
    </div>
  );
}
