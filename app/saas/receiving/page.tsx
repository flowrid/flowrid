"use client";

import { useEffect, useState } from "react";

interface ReceivingItem {
  id: string;
  supplier: string;
  expected: string;
  items: number;
  status: string;
}

const STATUS_STYLES: Record<string, string> = {
  "In Transit": "bg-[#ed6d00]/10 text-[#ed6d00]",
  Arrived: "bg-[#FF9500]/10 text-[#FF9500]",
  Received: "bg-[#AF52DE]/10 text-[#AF52DE]",
  Complete: "bg-[#34C759]/10 text-[#34C759]",
  pending: "bg-[#8E8E93]/10 text-[#8E8E93]",
};

function capStatus(s: string): string {
  if (!s) return "Pending";
  if (s === s.toUpperCase()) return s.charAt(0) + s.slice(1).toLowerCase();
  return s;
}

export default function ReceivingPage() {
  const [items, setItems] = useState<ReceivingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [supplier, setSupplier] = useState("");
  const [expectedDate, setExpectedDate] = useState("");
  const [itemCount, setItemCount] = useState("");
  const [asnNumber, setAsnNumber] = useState(`ASN-${Date.now().toString(36).toUpperCase()}`);
  const [creating, setCreating] = useState(false);
  const [createMsg, setCreateMsg] = useState<string | null>(null);

  async function load() {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/saas/receiving");
      if (res.ok) {
        const d = await res.json();
        if (d.data?.length) {
          setItems(d.data.map((r: any) => ({
            id: r.order_number || r.id,
            supplier: r.customer_name || r.supplier || "—",
            expected: r.expected_date ? new Date(r.expected_date).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—",
            items: r.item_count || 0,
            status: capStatus(r.status || "pending"),
          })));
          return;
        }
      }
      setItems([]);
    } catch {
      setError("Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreateASN(e: React.FormEvent) {
    e.preventDefault();
    if (!asnNumber.trim()) {
      setCreateMsg("ASN number is required");
      return;
    }
    setCreating(true);
    setCreateMsg(null);
    try {
      const res = await fetch("/api/saas/receiving", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_number: asnNumber.trim(),
          supplier: supplier || undefined,
          expected_date: expectedDate || undefined,
          item_count: itemCount ? parseInt(itemCount) : undefined,
        }),
      });
      if (res.ok) {
        setSupplier("");
        setExpectedDate("");
        setItemCount("");
        setAsnNumber(`ASN-${Date.now().toString(36).toUpperCase()}`);
        load();
      } else {
        const d = await res.json();
        setCreateMsg(d.error || "Failed to create");
      }
    } catch {
      setCreateMsg("Network error");
    } finally {
      setCreating(false);
    }
  }

  if (loading) return (
    <div className="p-8 space-y-4 animate-pulse">
      <div className="h-8 w-36 bg-black/5 rounded-xl" />
      {[...Array(5)].map((_, i) => <div key={i} className="h-14 bg-white/50 rounded-xl" />)}
    </div>
  );

  if (error) return (
    <div className="p-8 text-center">
      <p className="text-[#FF3B30] text-sm mb-3">{error}</p>
      <button onClick={() => window.location.reload()} className="text-sm text-[#ed6d00] font-medium hover:text-[#FF8A1F]">重试</button>
    </div>
  );

  return (
    <div className="p-6 md:p-8 max-w-[1280px]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight text-[#1D1D1F]">Receiving</h1>
          <p className="text-[#86868B] text-sm mt-0.5">Inbound shipments</p>
        </div>
      </div>

      {/* New ASN form — always visible */}
      <div className="mb-6 bg-white rounded-2xl shadow-sm border border-black/5 p-6">
        <h2 className="text-[15px] font-semibold text-[#1D1D1F] mb-4">New ASN (Advance Shipment Notice)</h2>
        <form onSubmit={handleCreateASN} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-medium text-[#86868B] uppercase tracking-wide mb-1">ASN Number</label>
              <input type="text" value={asnNumber} onChange={(e) => setAsnNumber(e.target.value)} placeholder="ASN-XXXX" className="w-full bg-[#F5F5F7] border-0 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ed6d00]/20" />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-[#86868B] uppercase tracking-wide mb-1">Supplier</label>
              <input type="text" value={supplier} onChange={(e) => setSupplier(e.target.value)} placeholder="Supplier name" className="w-full bg-[#F5F5F7] border-0 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ed6d00]/20" />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-[#86868B] uppercase tracking-wide mb-1">Expected Date</label>
              <input type="date" value={expectedDate} onChange={(e) => setExpectedDate(e.target.value)} className="w-full bg-[#F5F5F7] border-0 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ed6d00]/20" />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-[#86868B] uppercase tracking-wide mb-1">Item Count</label>
              <input type="number" value={itemCount} onChange={(e) => setItemCount(e.target.value)} placeholder="0" className="w-full bg-[#F5F5F7] border-0 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ed6d00]/20" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button type="submit" disabled={creating} className="bg-[#ed6d00] text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-[#FF8A1F] disabled:opacity-50 transition-colors">
              {creating ? "Creating..." : "Create ASN"}
            </button>
            {createMsg && <span className="text-xs text-[#FF3B30]">{createMsg}</span>}
          </div>
        </form>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-black/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-medium text-[#86868B] border-b border-black/5">
                <th className="px-5 py-3.5">ASN</th>
                <th className="px-5 py-3.5">Supplier</th>
                <th className="px-5 py-3.5">Expected</th>
                <th className="px-5 py-3.5">Items</th>
                <th className="px-5 py-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.04]">
              {items.map((r) => (
                <tr key={r.id} className="hover:bg-black/[0.01] transition-colors">
                  <td className="px-5 py-3.5 text-sm font-medium text-[#1D1D1F]">{r.id}</td>
                  <td className="px-5 py-3.5 text-sm text-[#1D1D1F]">{r.supplier}</td>
                  <td className="px-5 py-3.5 text-xs text-[#86868B]">{r.expected}</td>
                  <td className="px-5 py-3.5 text-sm text-[#1D1D1F]">{r.items.toLocaleString()}</td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-medium ${STATUS_STYLES[r.status] || ""}`}>
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan={5} className="px-5 py-12 text-center text-[#86868B] text-sm">No ASNs yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
