"use client";

import { useEffect, useState } from "react";

const DT = { invoices: [], rates: [], stats: { totalRevenue: 0, invoiced: 0, outstanding: 0, invoiceCount: 0 } };

const STATUS_STYLES: Record<string, string> = {
  paid: "bg-[#34C759]/10 text-[#34C759]", sent: "bg-[#ed6d00]/10 text-[#ed6d00]",
  overdue: "bg-[#FF3B30]/10 text-[#FF3B30]", draft: "bg-[#8E8E93]/10 text-[#8E8E93]",
};

export default function BillingPage() {
  const [data, setData] = useState(DT);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"invoices" | "rates">("invoices");

  useEffect(() => {
    fetch("/api/saas/billing").then(r => r.json()).then(setData).finally(() => setLoading(false));
  }, []);

  const { invoices, rates, stats } = data;
  const fmt = (n: number) => `$${n.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

  if (loading) return (
    <div className="p-8 space-y-4 animate-pulse">
      <div className="h-8 w-36 bg-black/5 rounded-xl" />
      {[...Array(4)].map((_, i) => <div key={i} className="h-20 bg-white/50 rounded-2xl" />)}
    </div>
  );

  return (
    <div className="p-6 md:p-8 max-w-[1280px]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight text-[#1D1D1F]">Billing</h1>
          <p className="text-[#86868B] text-sm mt-0.5">{stats.invoiceCount} invoices</p>
        </div>
        <button className="inline-flex items-center gap-2 bg-[#ed6d00] text-white px-4 py-2.5 rounded-full text-sm font-semibold hover:bg-[#FF8A1F] transition-colors shadow-sm">+ Generate Invoice</button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Tile label="Total Revenue" value={fmt(stats.totalRevenue)} accent="green" />
        <Tile label="Invoiced" value={fmt(stats.invoiced)} accent="blue" />
        <Tile label="Outstanding" value={fmt(stats.outstanding)} accent="red" />
        <Tile label="Invoices" value={stats.invoiceCount} />
      </div>

      <div className="flex gap-1 mb-6 bg-black/[0.03] rounded-full p-1 w-fit">
        {(["invoices", "rates"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-full text-xs font-medium capitalize transition-all ${tab === t ? "bg-white text-[#1D1D1F] shadow-sm" : "text-[#86868B]"}`}>{t}</button>
        ))}
      </div>

      {tab === "invoices" ? (
        <div className="bg-white rounded-2xl shadow-sm border border-black/5 overflow-hidden">
          <table className="w-full">
            <thead><tr className="text-left text-xs font-medium text-[#86868B] border-b border-black/5">
              <th className="px-5 py-3.5">Invoice</th><th className="px-5 py-3.5">Client</th>
              <th className="px-5 py-3.5">Amount</th><th className="px-5 py-3.5">Status</th>
            </tr></thead>
            <tbody className="divide-y divide-black/[0.04]">
              {invoices.map((inv: any) => (
                <tr key={inv.id} className="hover:bg-black/[0.01]">
                  <td className="px-5 py-3.5 text-xs font-mono text-[#86868B]">{inv.invoice_number}</td>
                  <td className="px-5 py-3.5 text-sm text-[#1D1D1F]">{inv.clients?.name || "—"}</td>
                  <td className="px-5 py-3.5 text-sm font-semibold">${(inv.total_amount || 0).toLocaleString()}</td>
                  <td className="px-5 py-3.5"><span className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-medium ${STATUS_STYLES[inv.status] || ""}`}>{inv.status}</span></td>
                </tr>
              ))}
              {invoices.length === 0 && <tr><td colSpan={4} className="px-5 py-12 text-center text-[#86868B] text-sm">No invoices yet</td></tr>}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {rates.map((r: any) => (
            <div key={r.id} className="bg-white rounded-2xl p-5 shadow-sm border border-black/5">
              <p className="text-sm font-medium text-[#1D1D1F]">{r.charge_type}</p>
              <p className="text-xs text-[#86868B] mt-1">${r.rate} / {r.charge_unit}</p>
            </div>
          ))}
          {rates.length === 0 && <p className="text-[#86868B] text-sm col-span-4 text-center py-8">No rates configured</p>}
        </div>
      )}
    </div>
  );
}

function Tile({ label, value, accent }: { label: string; value: any; accent?: string }) {
  const c: Record<string, string> = { green: "text-[#34C759]", red: "text-[#FF3B30]", blue: "text-[#ed6d00]" };
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-black/5">
      <p className="text-[11px] font-medium text-[#86868B] uppercase tracking-wide">{label}</p>
      <p className={`text-[22px] font-bold tracking-tight mt-1.5 ${c[accent||""] || "text-[#1D1D1F]"}`}>{value}</p>
    </div>
  );
}
