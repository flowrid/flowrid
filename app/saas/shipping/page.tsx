"use client";

import { useState, useEffect } from "react";
import type { RateQuote, ShipmentRequest } from "@/types/saas";

const CARRIER_COLORS: Record<string, string> = {
  usps: "#004B87",
  ups: "#351C15",
  fedex: "#4D148C",
};

export default function ShippingPage() {
  const [originZip, setOriginZip] = useState("75201");
  const [destZip, setDestZip] = useState("10001");
  const [weight, setWeight] = useState(5);
  const [length, setLength] = useState(12);
  const [width, setWidth] = useState(8);
  const [height, setHeight] = useState(6);
  const [residential, setResidential] = useState(true);
  const [hazmat, setHazmat] = useState(false);
  const [quotes, setQuotes] = useState<RateQuote[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedQuote, setSelectedQuote] = useState<RateQuote | null>(null);
  const [creating, setCreating] = useState(false);
  const [success, setSuccess] = useState("");

  // Auto-fetch rates on mount
  useEffect(() => {
    fetchRates();
  }, []);

  async function fetchRates() {
    setLoading(true);
    setError("");
    setSelectedQuote(null);
    try {
      const res = await fetch("/api/saas/shipping/rates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ originZip, destinationZip: destZip, weightLbs: weight, lengthIn: length, widthIn: width, heightIn: height, isResidential: residential, isHazmat: hazmat }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed"); return; }
      setQuotes(data.quotes || []);
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  async function createShipment(quote: RateQuote) {
    setCreating(true);
    setSuccess("");
    try {
      const res = await fetch("/api/saas/shipping/create-shipment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: "00000000-0000-0000-0000-000000000001",
          carrier: quote.carrier,
          serviceLevel: quote.serviceLevel,
          shippingCost: quote.totalCost,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed"); return; }
      setSuccess(`Shipment created! Tracking: ${data.trackingNumber}`);
      setSelectedQuote(null);
    } catch {
      setError("Network error");
    } finally {
      setCreating(false);
    }
  }

  const grouped = quotes.reduce<Record<string, RateQuote[]>>((acc, q) => {
    (acc[q.carrierName] = acc[q.carrierName] || []).push(q);
    return acc;
  }, {});

  return (
    <div className="p-6 md:p-8 max-w-[1280px]">
      <h1 className="text-[28px] font-bold tracking-tight text-[#1D1D1F] mb-2">Shipping Rates</h1>
      <p className="text-[#86868B] text-sm mb-8">Compare carrier rates and book shipments</p>

      {/* Rate Calculator Form */}
      <div className="bg-white rounded-2xl shadow-sm border border-black/5 p-6 mb-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
          <Field label="Origin ZIP" value={originZip} onChange={setOriginZip} />
          <Field label="Destination ZIP" value={destZip} onChange={setDestZip} />
          <div>
            <label className="block text-[11px] font-medium text-[#86868B] uppercase tracking-wide mb-1.5">Weight (lbs)</label>
            <input type="number" value={weight} onChange={(e) => setWeight(Number(e.target.value))} className="w-full bg-[#F5F5F7] border-0 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ed6d00]/20" min={0.1} step={0.1} />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-[#86868B] uppercase tracking-wide mb-1.5">Dimensions (L×W×H in)</label>
            <div className="flex gap-1.5">
              <input type="number" value={length} onChange={(e) => setLength(Number(e.target.value))} className="w-full bg-[#F5F5F7] border-0 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ed6d00]/20" placeholder="L" />
              <input type="number" value={width} onChange={(e) => setWidth(Number(e.target.value))} className="w-full bg-[#F5F5F7] border-0 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ed6d00]/20" placeholder="W" />
              <input type="number" value={height} onChange={(e) => setHeight(Number(e.target.value))} className="w-full bg-[#F5F5F7] border-0 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ed6d00]/20" placeholder="H" />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-6 mb-4">
          <label className="flex items-center gap-2 text-sm text-[#1D1D1F]">
            <input type="checkbox" checked={residential} onChange={(e) => setResidential(e.target.checked)} className="rounded accent-[#ed6d00]" />
            Residential
          </label>
          <label className="flex items-center gap-2 text-sm text-[#1D1D1F]">
            <input type="checkbox" checked={hazmat} onChange={(e) => setHazmat(e.target.checked)} className="rounded accent-[#ed6d00]" />
            Hazmat
          </label>
        </div>
        <button
          onClick={fetchRates}
          disabled={loading}
          className="inline-flex items-center gap-2 bg-[#ed6d00] text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-[#FF8A1F] transition-colors disabled:opacity-50 shadow-sm"
        >
          {loading ? "Calculating..." : "Compare Rates"}
        </button>
      </div>

      {error && <p className="text-[#FF3B30] text-sm bg-[#FF3B30]/5 rounded-xl px-4 py-3 mb-6">{error}</p>}
      {success && <p className="text-[#34C759] text-sm bg-[#34C759]/10 rounded-xl px-4 py-3 mb-6">{success}</p>}

      {/* Results */}
      {quotes.length > 0 && (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-black/5 overflow-hidden mb-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs font-medium text-[#86868B] border-b border-black/5">
                    <th className="px-5 py-3.5">Carrier</th>
                    <th className="px-5 py-3.5">Service</th>
                    <th className="px-5 py-3.5">Delivery</th>
                    <th className="px-5 py-3.5">Base Rate</th>
                    <th className="px-5 py-3.5">Fuel</th>
                    <th className="px-5 py-3.5 text-right">Total</th>
                    <th className="px-5 py-3.5"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/[0.04]">
                  {quotes.map((q, i) => {
                    const isBest = i === 0;
                    const isSelected = selectedQuote?.carrier === q.carrier && selectedQuote?.serviceLevel === q.serviceLevel;
                    return (
                      <tr key={`${q.carrier}-${q.serviceLevel}`} className={`hover:bg-black/[0.01] transition-colors ${isSelected ? "bg-[#ed6d00]/5" : ""}`}>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: CARRIER_COLORS[q.carrier] || "#86868B" }} />
                            <span className="text-sm font-semibold text-[#1D1D1F]">{q.carrierName}</span>
                            {isBest && <span className="text-[10px] bg-[#34C759]/10 text-[#34C759] px-1.5 py-0.5 rounded-full font-medium">Best</span>}
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-sm text-[#1D1D1F]">{q.serviceName}</td>
                        <td className="px-5 py-3.5 text-sm text-[#86868B]">{q.estimatedDays}d <span className="text-[11px]">({q.deliveryDate})</span></td>
                        <td className="px-5 py-3.5 text-sm">${q.baseRate.toFixed(2)}</td>
                        <td className="px-5 py-3.5 text-sm">${q.fuelSurcharge.toFixed(2)}</td>
                        <td className="px-5 py-3.5 text-sm font-bold text-right">${q.totalCost.toFixed(2)}</td>
                        <td className="px-5 py-3.5">
                          <button
                            onClick={() => setSelectedQuote(isSelected ? null : q)}
                            className={`px-3 py-1.5 rounded-full text-[11px] font-medium transition-colors ${isSelected ? "bg-[#ed6d00] text-white" : "bg-black/5 text-[#86868B] hover:bg-black/10"}`}
                          >
                            {isSelected ? "Selected" : "Select"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3 mb-6">
            {quotes.map((q, i) => {
              const isBest = i === 0;
              const isSelected = selectedQuote?.carrier === q.carrier && selectedQuote?.serviceLevel === q.serviceLevel;
              return (
                <div key={`${q.carrier}-${q.serviceLevel}`} className={`bg-white rounded-2xl p-4 shadow-sm border ${isSelected ? "border-[#ed6d00]" : "border-black/5"} ${isBest ? "ring-1 ring-[#34C759]/30" : ""}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: CARRIER_COLORS[q.carrier] || "#86868B" }} />
                      <span className="text-sm font-semibold text-[#1D1D1F]">{q.carrierName} {q.serviceName}</span>
                    </div>
                    {isBest && <span className="text-[10px] bg-[#34C759]/10 text-[#34C759] px-1.5 py-0.5 rounded-full font-medium">Best</span>}
                  </div>
                  <div className="flex items-center justify-between text-xs text-[#86868B] mb-3">
                    <span>{q.estimatedDays} days · {q.deliveryDate}</span>
                    <span>{q.billableWeight} lbs billable</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-[22px] font-bold text-[#1D1D1F]">${q.totalCost.toFixed(2)}</p>
                    <button
                      onClick={() => setSelectedQuote(isSelected ? null : q)}
                      className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${isSelected ? "bg-[#ed6d00] text-white" : "bg-black/5 text-[#86868B]"}`}
                    >
                      {isSelected ? "Selected" : "Select"}
                    </button>
                  </div>
                  <div className="mt-2 text-[11px] text-[#86868B]">
                    Base ${q.baseRate.toFixed(2)} + Fuel ${q.fuelSurcharge.toFixed(2)}{q.residentialSurcharge > 0 ? ` + Residential $${q.residentialSurcharge.toFixed(2)}` : ""}
                  </div>
                  {q.isSimulated && <p className="text-[10px] text-[#FF9500] mt-1">Estimated — connect carrier for live rates</p>}
                </div>
              );
            })}
          </div>

          {selectedQuote && (
            <div className="bg-white rounded-2xl shadow-sm border border-[#ed6d00]/20 p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-[#1D1D1F]">Create shipment with {selectedQuote.carrierName} {selectedQuote.serviceName}</p>
                <p className="text-xs text-[#86868B] mt-0.5">Total: ${selectedQuote.totalCost.toFixed(2)} · {selectedQuote.estimatedDays} days · {selectedQuote.isSimulated ? "Simulated rate" : ""}</p>
              </div>
              <button
                onClick={() => createShipment(selectedQuote)}
                disabled={creating}
                className="bg-[#ed6d00] text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-[#FF8A1F] disabled:opacity-50 transition-colors shadow-sm"
              >
                {creating ? "Creating..." : "Create Shipment"}
              </button>
            </div>
          )}
        </>
      )}

      {!loading && quotes.length === 0 && !error && (
        <div className="text-center py-16">
          <p className="text-[#86868B] text-lg">Enter package details and click Compare Rates</p>
          <p className="text-[#86868B] text-sm mt-1">Real-time rate comparison across USPS, UPS, and FedEx</p>
        </div>
      )}
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-[11px] font-medium text-[#86868B] uppercase tracking-wide mb-1.5">{label}</label>
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)} className="w-full bg-[#F5F5F7] border-0 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ed6d00]/20" />
    </div>
  );
}
