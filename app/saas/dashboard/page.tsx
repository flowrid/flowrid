"use client";

import { useEffect, useState, useCallback } from "react";
import { useTranslations } from "next-intl";

interface KPI {
  orders_today: number;
  orders_30d: number;
  pending_orders: number;
  total_products: number;
  total_clients: number;
  active_integrations: number;
  warehouses: { id: string; name: string; code: string; city: string; state: string }[];
  warehouse_breakdown: { id: string; name: string; code: string; city: string; state: string; pending: number; shipped: number }[];
  recent_orders: { id: string; customer: string; source: string; status: string; time: string }[];
}

const STATUS_STYLES: Record<string, string> = {
  shipped:"bg-[#34C759]/10 text-[#34C759]",delivered:"bg-[#34C759]/10 text-[#34C759]",
  picking:"bg-[#ed6d00]/10 text-[#ed6d00]",allocated:"bg-[#AF52DE]/10 text-[#AF52DE]",
  packed:"bg-[#FF9500]/10 text-[#FF9500]",pending:"bg-[#8E8E93]/10 text-[#8E8E93]",
  returned:"bg-[#FF3B30]/10 text-[#FF3B30]",
};

export default function DashboardPage() {
  const t = useTranslations();
  const [kpi, setKpi] = useState<KPI | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedWh, setSelectedWh] = useState<string>("all");

  const fetchData = useCallback((whId?: string) => {
    setLoading(true);
    const params = whId && whId !== "all" ? `?warehouse_id=${whId}` : "?global=true";
    fetch(`/api/saas/dashboard${params}`).then(r => r.json()).then(setKpi).finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchData(); }, []);

  const handleWhChange = (whId: string) => {
    setSelectedWh(whId);
    fetchData(whId);
  };

  if (loading) return <Skeleton />;
  if (!kpi) return null;

  const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  return (
    <div className="p-6 md:p-8 max-w-[1280px]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight text-[#1D1D1F]">{t("saas.dashboard")}</h1>
          <p className="text-[#86868B] text-sm mt-0.5">
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </p>
        </div>
        {/* Warehouse Switcher */}
        <select
          value={selectedWh}
          onChange={(e) => handleWhChange(e.target.value)}
          className="bg-white border border-black/5 rounded-xl px-4 py-2.5 text-sm text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-[#ed6d00]/20 shadow-sm"
        >
          <option value="all">{t("saas.allWarehouses", { n: kpi.warehouses.length })}</option>
          {kpi.warehouses.map((w) => (
            <option key={w.id} value={w.id}>{w.name} — {w.city}, {cap(w.state)}</option>
          ))}
        </select>
      </div>

      {/* Global KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <Tile label={t("saas.ordersToday")} value={kpi.orders_today} subtitle={t("saas.sinceMidnight")} />
        <Tile label={t("saas.thirtyDay")} value={kpi.orders_30d.toLocaleString()} subtitle={t("saas.orders")} />
        <Tile label={t("saas.pending")} value={kpi.pending_orders} subtitle={t("saas.needsAction")} accent="amber" />
        <Tile label={t("saas.products")} value={kpi.total_products} subtitle={t("saas.skus")} accent="green" />
        <Tile label={t("saas.integrations")} value={kpi.active_integrations} subtitle={t("saas.connected")} accent="blue" />
      </div>

      {/* Per-Warehouse Breakdown */}
      {selectedWh === "all" && kpi.warehouse_breakdown.length > 1 && (
        <div className="mb-8">
          <h2 className="text-[17px] font-semibold text-[#1D1D1F] mb-3">{t("saas.warehouseBreakdown")}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {kpi.warehouse_breakdown.map((w) => (
              <div key={w.id} className="bg-white rounded-2xl p-5 shadow-sm border border-black/5 hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleWhChange(w.id)}>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm font-semibold text-[#1D1D1F]">{w.name}</p>
                    <p className="text-[11px] text-[#86868B]">{w.city}, {cap(w.state)} · {w.code}</p>
                  </div>
                  <span className="text-[11px] text-[#ed6d00] font-medium">View &rarr;</span>
                </div>
                <div className="flex gap-4">
                  <div><p className="text-[22px] font-bold text-[#FF9500]">{w.pending}</p><p className="text-[10px] text-[#86868B] uppercase">{t("saas.pending")}</p></div>
                  <div><p className="text-[22px] font-bold text-[#34C759]">{w.shipped}</p><p className="text-[10px] text-[#86868B] uppercase">{t("saas.shipped")}</p></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Orders */}
      <div className="bg-white rounded-2xl shadow-sm border border-black/5 overflow-hidden">
        <div className="px-5 py-4 border-b border-black/5 flex items-center justify-between">
          <h2 className="text-[17px] font-semibold text-[#1D1D1F]">{t("saas.recentOrders")}</h2>
          <a href="/saas/orders" className="text-[13px] text-[#ed6d00] hover:underline font-medium">{t("saas.viewAll")}</a>
        </div>
        <table className="w-full">
          <thead><tr className="text-left text-xs font-medium text-[#86868B] border-b border-black/5">
            <th className="px-5 py-3">{t("saas.order")}</th><th className="px-5 py-3">{t("saas.customer")}</th>
            <th className="px-5 py-3">{t("saas.source")}</th><th className="px-5 py-3">{t("saas.status")}</th>
            <th className="px-5 py-3 text-right">{t("saas.time")}</th>
          </tr></thead>
          <tbody className="divide-y divide-black/5">
            {kpi.recent_orders.map((o) => {
              const s = (o.status||"").toLowerCase();
              return (
                <tr key={o.id} className="hover:bg-black/[0.02] transition-colors">
                  <td className="px-5 py-3 text-sm font-medium text-[#1D1D1F]">{o.id}</td>
                  <td className="px-5 py-3 text-sm text-[#1D1D1F]">{o.customer}</td>
                  <td className="px-5 py-3 text-xs"><span className="bg-black/5 text-[#86868B] px-2 py-0.5 rounded-full">{o.source}</span></td>
                  <td className="px-5 py-3"><span className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-medium ${STATUS_STYLES[s]||""}`}>{cap(s)}</span></td>
                  <td className="px-5 py-3 text-xs text-[#86868B] text-right">{o.time}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Tile({ label, value, subtitle, accent }: { label: string; value: any; subtitle: string; accent?: string }) {
  const c: Record<string,string> = { blue:"text-[#ed6d00]",green:"text-[#34C759]",amber:"text-[#FF9500]" };
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-black/5 hover:shadow-md transition-shadow">
      <p className="text-[11px] font-medium text-[#86868B] uppercase tracking-wide">{label}</p>
      <p className={`text-[28px] font-bold tracking-tight mt-1.5 ${c[accent||""]||"text-[#1D1D1F]"}`}>{value}</p>
      <p className="text-[11px] text-[#86868B] mt-1">{subtitle}</p>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="p-8 space-y-6 animate-pulse">
      <div className="h-8 w-48 bg-black/5 rounded-xl" />
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">{[...Array(5)].map((_,i)=><div key={i} className="h-24 bg-white/50 rounded-2xl"/>)}</div>
      <div className="h-64 bg-white/50 rounded-2xl" />
    </div>
  );
}
