"use client";

import { useEffect, useState } from "react";

interface KPI {
  orders_today: number;
  orders_30d: number;
  pending_orders: number;
  total_products: number;
  total_clients: number;
  active_integrations: number;
  recent_orders: {
    id: string;
    customer: string;
    status: string;
    time: string;
    source: string;
  }[];
}

const STATUS_STYLES: Record<string, string> = {
  Shipped: "bg-[#34C759]/10 text-[#34C759]",
  Picking: "bg-[#0071E3]/10 text-[#0071E3]",
  Allocated: "bg-[#AF52DE]/10 text-[#AF52DE]",
  Packed: "bg-[#FF9500]/10 text-[#FF9500]",
  Pending: "bg-[#8E8E93]/10 text-[#8E8E93]",
  Delivered: "bg-[#34C759]/10 text-[#34C759]",
  Returned: "bg-[#FF3B30]/10 text-[#FF3B30]",
};

export default function DashboardPage() {
  const [kpi, setKpi] = useState<KPI | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/saas/dashboard")
      .then((r) => r.json())
      .then(setKpi)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-8 space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-black/5 rounded-xl" />
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-24 bg-white/50 rounded-2xl" />
          ))}
        </div>
        <div className="h-64 bg-white/50 rounded-2xl" />
      </div>
    );
  }

  if (!kpi) return null;

  return (
    <div className="p-6 md:p-8 max-w-[1280px]">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-[28px] font-bold tracking-tight text-[#1D1D1F]">
          Dashboard
        </h1>
        <p className="text-[#86868B] text-sm mt-1">
          {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
        </p>
      </div>

      {/* KPI Tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <KPITile label="Orders Today" value={kpi.orders_today} subtitle="since midnight" />
        <KPITile label="30-Day Total" value={kpi.orders_30d.toLocaleString()} subtitle="orders processed" />
        <KPITile label="Pending" value={kpi.pending_orders} subtitle="needs action" accent="amber" />
        <KPITile label="Products" value={kpi.total_products} subtitle="active SKUs" accent="green" />
        <KPITile label="Integrations" value={kpi.active_integrations} subtitle="connected" accent="blue" />
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-2xl shadow-sm border border-black/5 overflow-hidden">
        <div className="px-5 py-4 border-b border-black/5 flex items-center justify-between">
          <h2 className="text-[17px] font-semibold text-[#1D1D1F]">Recent Orders</h2>
          <a href="/saas/orders" className="text-[13px] text-[#0071E3] hover:underline font-medium">
            View All
          </a>
        </div>
        <table className="w-full">
          <thead>
            <tr className="text-left text-xs font-medium text-[#86868B] border-b border-black/5">
              <th className="px-5 py-3">Order</th>
              <th className="px-5 py-3">Customer</th>
              <th className="px-5 py-3">Source</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3 text-right">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5">
            {kpi.recent_orders.map((o) => (
              <tr key={o.id} className="hover:bg-black/[0.02] transition-colors">
                <td className="px-5 py-3 text-sm font-medium text-[#1D1D1F]">{o.id}</td>
                <td className="px-5 py-3 text-sm text-[#1D1D1F]">{o.customer}</td>
                <td className="px-5 py-3 text-xs">
                  <span className="bg-black/5 text-[#86868B] px-2 py-0.5 rounded-full">{o.source}</span>
                </td>
                <td className="px-5 py-3">
                  <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-medium ${STATUS_STYLES[o.status] || ""}`}>
                    {o.status}
                  </span>
                </td>
                <td className="px-5 py-3 text-xs text-[#86868B] text-right">{o.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function KPITile({
  label,
  value,
  subtitle,
  accent,
}: {
  label: string;
  value: string | number;
  subtitle: string;
  accent?: string;
}) {
  const colors: Record<string, string> = {
    blue: "text-[#0071E3]",
    green: "text-[#34C759]",
    amber: "text-[#FF9500]",
  };

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-black/5 hover:shadow-md transition-shadow">
      <p className="text-[11px] font-medium text-[#86868B] uppercase tracking-wide">{label}</p>
      <p className={`text-[28px] font-bold tracking-tight mt-1.5 ${colors[accent || ""] || "text-[#1D1D1F]"}`}>
        {value}
      </p>
      <p className="text-[11px] text-[#86868B] mt-1">{subtitle}</p>
    </div>
  );
}
