"use client";

import { useEffect, useState } from "react";

interface Order {
  id: string;
  order_number: string;
  customer_name?: string;
  customer?: string;
  source?: string;
  priority?: string;
  status: string;
  created_at?: string;
  time?: string;
  clients?: { name: string; company: string };
}

const STATUS_STYLES: Record<string, string> = {
  shipped: "bg-[#34C759]/10 text-[#34C759]", delivered: "bg-[#34C759]/10 text-[#34C759]",
  picking: "bg-[#0071E3]/10 text-[#0071E3]",
  allocated: "bg-[#AF52DE]/10 text-[#AF52DE]",
  packed: "bg-[#FF9500]/10 text-[#FF9500]",
  pending: "bg-[#8E8E93]/10 text-[#8E8E93]",
  returned: "bg-[#FF3B30]/10 text-[#FF3B30]",
  cancelled: "bg-[#FF3B30]/10 text-[#FF3B30]",
};

const DT = { orders: [], stats: { total: 0, pending: 0, shipped: 0 } };

export default function OrdersPage() {
  const [data, setData] = useState(DT);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/saas/orders").then(r => r.json()).then(setData).finally(() => setLoading(false));
  }, []);

  const { orders, stats } = data;

  if (loading) return <Skeleton />;

  return (
    <div className="p-6 md:p-8 max-w-[1280px]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight text-[#1D1D1F]">Orders</h1>
          <p className="text-[#86868B] text-sm mt-0.5">{stats.total} total · {stats.pending} pending · {stats.shipped} shipped</p>
        </div>
        <button className="inline-flex items-center gap-2 bg-[#0071E3] text-white px-4 py-2.5 rounded-full text-sm font-semibold hover:bg-[#0077ED] transition-colors shadow-sm">+ New Order</button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-black/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-medium text-[#86868B] border-b border-black/5">
                <th className="px-5 py-3.5">Order</th><th className="px-5 py-3.5">Customer</th>
                <th className="px-5 py-3.5">Source</th><th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.04]">
              {orders.map((o: any) => {
                const displayStatus = (o.status || "").toLowerCase();
                const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
                return (
                  <tr key={o.id} className="hover:bg-black/[0.01] transition-colors">
                    <td className="px-5 py-3.5 text-sm font-medium text-[#1D1D1F]">{o.order_number || o.id}</td>
                    <td className="px-5 py-3.5 text-sm text-[#1D1D1F]">{o.customer_name || o.clients?.name || "—"}</td>
                    <td className="px-5 py-3.5"><span className="text-[11px] bg-black/[0.04] text-[#86868B] px-2 py-0.5 rounded-full">{o.source || "—"}</span></td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-medium ${STATUS_STYLES[displayStatus] || ""}`}>{cap(displayStatus)}</span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-[#86868B] text-right">{o.time || "—"}</td>
                  </tr>
                );
              })}
              {orders.length === 0 && (
                <tr><td colSpan={5} className="px-5 py-12 text-center text-[#86868B] text-sm">No orders yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="p-8 space-y-4 animate-pulse">
      <div className="h-8 w-36 bg-black/5 rounded-xl" />
      {[...Array(5)].map((_, i) => <div key={i} className="h-14 bg-white/50 rounded-xl" />)}
    </div>
  );
}
