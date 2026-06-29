"use client";

/**
 * 运费一键对比器 — 公开交互工具
 * 输入包裹信息 → 实时对比 USPS/UPS/FedEx 三家费率
 */

import { useState } from "react";
import Link from "next/link";

interface RateQuote {
  carrier: string; carrierName: string; carrierLogo: string;
  serviceLevel: string; serviceName: string;
  totalCost: number; baseRate: number; fuelSurcharge: number; residentialSurcharge: number;
  dimensionalWeight: number; billableWeight: number;
  estimatedDays: number; deliveryDate: string;
}

const PRESETS = [
  { label: "Small (1 lb, shoebox)", weight: 1, l: 10, w: 7, h: 5 },
  { label: "Medium (5 lbs, 12×8×6)", weight: 5, l: 12, w: 8, h: 6 },
  { label: "Large (15 lbs, 18×12×10)", weight: 15, l: 18, w: 12, h: 10 },
  { label: "Heavy (40 lbs, 24×18×16)", weight: 40, l: 24, w: 18, h: 16 },
];

export default function ShippingCalculatorPage() {
  const [originZip, setOriginZip] = useState("60601");
  const [destZip, setDestZip] = useState("90210");
  const [weightLbs, setWeightLbs] = useState("5");
  const [lengthIn, setLengthIn] = useState("12");
  const [widthIn, setWidthIn] = useState("8");
  const [heightIn, setHeightIn] = useState("6");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ quotes: RateQuote[]; cheapest: RateQuote; fastest: RateQuote; bestValue: RateQuote; zone: number; billableWeight: number; savingsMsg: string } | null>(null);
  const [error, setError] = useState("");

  async function calculate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError(""); setResult(null);
    try {
      const res = await fetch("/api/tools/shipping-calculator", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ originZip, destZip, weightLbs: Number(weightLbs), lengthIn: Number(lengthIn), widthIn: Number(widthIn), heightIn: Number(heightIn) }),
      });
      if (res.ok) setResult(await res.json());
      else setError("Failed to calculate rates. Please check your inputs and try again.");
    } catch { setError("Network error. Please try again."); }
    finally { setLoading(false); }
  }

  function applyPreset(p: typeof PRESETS[0]) {
    setWeightLbs(String(p.weight)); setLengthIn(String(p.l)); setWidthIn(String(p.w)); setHeightIn(String(p.h));
  }

  const inputClass = "w-full px-4 py-2.5 bg-white border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all";

  return (
    <div className="max-w-[960px] mx-auto px-4 py-8 md:py-12">
      <nav className="flex items-center gap-2 text-sm text-text-secondary mb-8"><Link href="/" className="hover:text-text transition-colors">Home</Link><span>/</span><Link href="/tools" className="hover:text-text transition-colors">Tools</Link><span>/</span><span className="text-text font-medium">Shipping Calculator</span></nav>

      <section className="mb-10">
        <h1 className="text-3xl md:text-[40px] font-bold tracking-tight text-text leading-[1.15] mb-4">Shipping Rate Calculator</h1>
        <p className="text-lg text-text-secondary max-w-[600px] leading-relaxed">Compare live rates from USPS, UPS, and FedEx. Enter your package details and see which carrier saves you the most.</p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Form */}
        <div className="lg:col-span-2">
          <form onSubmit={calculate} className="bg-card border border-border rounded-2xl p-6 sticky top-8">
            <h2 className="text-lg font-bold text-text mb-4">Package Details</h2>

            {/* Presets */}
            <div className="mb-5">
              <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">Quick Fill</p>
              <div className="flex flex-wrap gap-1.5">
                {PRESETS.map((p) => (
                  <button key={p.label} type="button" onClick={() => applyPreset(p)} className="text-xs px-2.5 py-1.5 rounded-lg bg-gray-100 text-text-secondary hover:bg-primary/10 hover:text-primary transition-colors">{p.label}</button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div><label className="block text-xs font-semibold text-text-secondary mb-1">Origin ZIP *</label><input type="text" value={originZip} onChange={(e) => setOriginZip(e.target.value)} placeholder="60601" className={inputClass} maxLength={5} required /></div>
              <div><label className="block text-xs font-semibold text-text-secondary mb-1">Destination ZIP *</label><input type="text" value={destZip} onChange={(e) => setDestZip(e.target.value)} placeholder="90210" className={inputClass} maxLength={5} required /></div>
            </div>

            <div className="mb-3"><label className="block text-xs font-semibold text-text-secondary mb-1">Weight (lbs) *</label><input type="number" value={weightLbs} onChange={(e) => setWeightLbs(e.target.value)} min="0.1" step="0.1" className={inputClass} required /></div>

            <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">Dimensions (inches)</p>
            <div className="grid grid-cols-3 gap-2 mb-5">
              <div><label className="block text-[10px] text-text-secondary mb-0.5">Length</label><input type="number" value={lengthIn} onChange={(e) => setLengthIn(e.target.value)} min="1" className={inputClass} /></div>
              <div><label className="block text-[10px] text-text-secondary mb-0.5">Width</label><input type="number" value={widthIn} onChange={(e) => setWidthIn(e.target.value)} min="1" className={inputClass} /></div>
              <div><label className="block text-[10px] text-text-secondary mb-0.5">Height</label><input type="number" value={heightIn} onChange={(e) => setHeightIn(e.target.value)} min="1" className={inputClass} /></div>
            </div>

            <button type="submit" disabled={loading} className="w-full py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark disabled:opacity-50 transition-colors text-sm">
              {loading ? "Calculating..." : "Compare Rates →"}
            </button>
            <p className="text-[10px] text-text-secondary/60 text-center mt-2">Simulated rates based on 2025 commercial pricing. Actual rates may vary.</p>

            {error && <p className="mt-3 text-sm text-[#FF3B30] text-center">{error}</p>}
          </form>
        </div>

        {/* Results */}
        <div className="lg:col-span-3">
          {!result && !loading && (
            <div className="bg-gray-50 border border-dashed border-border rounded-2xl p-12 text-center">
              <div className="text-4xl mb-3">📦</div>
              <p className="text-text-secondary">Enter your package details and click <strong>Compare Rates</strong> to see results.</p>
            </div>
          )}

          {loading && (
            <div className="bg-gray-50 rounded-2xl p-12 text-center">
              <div className="animate-pulse text-4xl mb-3">🔍</div>
              <p className="text-text-secondary">Calculating rates across 3 carriers...</p>
            </div>
          )}

          {result && (
            <>
              {/* Highlights */}
              <div className="grid grid-cols-3 gap-3 mb-5">
                <HighlightCard label="Cheapest" quote={result.cheapest} color="#34C759" />
                <HighlightCard label="Fastest" quote={result.fastest} color="#ed6d00" />
                <HighlightCard label="Best Value" quote={result.bestValue} color="#2563EB" />
              </div>

              {result.savingsMsg && (
                <div className="mb-5 p-3 bg-[#34C759]/5 border border-[#34C759]/20 rounded-xl text-sm text-text flex items-start gap-2">
                  <span>💰</span>
                  <span>{result.savingsMsg}</span>
                </div>
              )}

              {/* All Quotes Table */}
              <div className="bg-card border border-border rounded-2xl overflow-hidden">
                <div className="px-5 py-3 border-b border-border bg-gray-50 flex items-center justify-between">
                  <p className="text-sm font-semibold text-text">All Rates — {result.quotes.length} options</p>
                  <p className="text-xs text-text-secondary">Zone {result.zone} · Billable: {result.billableWeight} lbs</p>
                </div>
                <table className="w-full">
                  <thead><tr className="text-left text-[10px] font-semibold text-text-secondary uppercase tracking-wider border-b border-border">
                    <th className="px-4 py-2.5">Carrier</th><th className="px-4 py-2.5">Service</th><th className="px-4 py-2.5">Delivery</th><th className="px-4 py-2.5 text-right">Base</th><th className="px-4 py-2.5 text-right">Fuel</th><th className="px-4 py-2.5 text-right font-bold">Total</th>
                  </tr></thead>
                  <tbody className="divide-y divide-border">
                    {result.quotes.map((q, i) => (
                      <tr key={`${q.carrier}-${q.serviceLevel}`} className={i === 0 ? "bg-[#34C759]/5" : "hover:bg-gray-50 transition-colors"}>
                        <td className="px-4 py-2.5"><span className="text-sm font-semibold text-text">{q.carrierLogo} {q.carrierName}</span></td>
                        <td className="px-4 py-2.5"><span className="text-sm text-text">{q.serviceName}</span></td>
                        <td className="px-4 py-2.5">
                          <span className="text-sm font-medium text-text">{q.estimatedDays} days</span>
                          <span className="text-xs text-text-secondary block">{q.deliveryDate}</span>
                        </td>
                        <td className="px-4 py-2.5 text-right text-sm text-text-secondary">${q.baseRate}</td>
                        <td className="px-4 py-2.5 text-right text-sm text-text-secondary">${q.fuelSurcharge}</td>
                        <td className="px-4 py-2.5 text-right">
                          <span className={`text-sm font-bold ${i === 0 ? "text-[#34C759]" : "text-text"}`}>${q.totalCost}</span>
                          {i === 0 && <span className="ml-1 text-[10px] text-[#34C759] font-medium">BEST</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p className="mt-3 text-[10px] text-text-secondary/60 text-center">Simulated rates for comparison purposes. Actual rates depend on negotiated carrier contracts, fuel surcharges, and additional fees.</p>
            </>
          )}

          {/* CTA */}
          <div className="mt-8 p-5 bg-primary/5 border border-primary/20 rounded-2xl text-center">
            <p className="text-sm font-semibold text-text mb-1">Want to save even more on shipping?</p>
            <p className="text-sm text-text-secondary mb-3">3PLs with strategic warehouse locations can reduce your Zone 8 shipments by 60%.</p>
            <Link href="/3pl" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline">Browse 3PL Directory →</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function HighlightCard({ label, quote, color }: { label: string; quote: RateQuote; color: string }) {
  return (
    <div className="bg-card border border-border rounded-xl p-4" style={{ borderTop: `3px solid ${color}` }}>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary mb-1">{label}</p>
      <p className="text-2xl font-bold text-text">${quote.totalCost}</p>
      <p className="text-xs text-text-secondary mt-0.5">{quote.carrierName} {quote.serviceName}</p>
      <p className="text-xs text-text-secondary">{quote.estimatedDays} days — {quote.deliveryDate}</p>
    </div>
  );
}
