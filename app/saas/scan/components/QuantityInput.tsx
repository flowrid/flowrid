"use client";

export default function QuantityInput({ value, onChange, onConfirm }: { value: number; onChange: (v: number) => void; onConfirm: () => void }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-black/5">
      <p className="text-[11px] font-medium text-[#86868B] uppercase tracking-wide mb-3">Quantity</p>
      <div className="flex items-center gap-4">
        <button
          onClick={() => onChange(Math.max(1, value - 1))}
          className="w-12 h-12 rounded-full bg-[#F5F5F7] text-[#1D1D1F] text-xl font-bold flex items-center justify-center active:bg-black/10 transition-colors"
        >
          −
        </button>
        <span className="text-[32px] font-bold text-[#1D1D1F] min-w-[60px] text-center">{value}</span>
        <button
          onClick={() => onChange(value + 1)}
          className="w-12 h-12 rounded-full bg-[#F5F5F7] text-[#1D1D1F] text-xl font-bold flex items-center justify-center active:bg-black/10 transition-colors"
        >
          +
        </button>
      </div>
      <button
        onClick={onConfirm}
        className="w-full mt-4 bg-[#ed6d00] text-white rounded-full py-3 text-sm font-semibold hover:bg-[#FF8A1F] transition-colors active:scale-[0.98]"
      >
        Confirm Add to Receiving
      </button>
    </div>
  );
}
