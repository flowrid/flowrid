"use client";

// 报表中心

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { authedFetch } from "@/lib/authed-fetch";

export default function ReportsContent() {
  const t = useTranslations("reportsContent");
  const [reportType, setReportType] = useState("orders");
  const [range, setRange] = useState("30d");
  const [warehouseId, setWarehouseId] = useState("");
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<any>(null);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    authedFetch("/api/saas/warehouses")
      .then((r) => (r.ok ? r.json() : { data: [] }))
      .then((d) => setWarehouses(d.data || []))
      .catch(() => setWarehouses([]));
  }, []);

  async function generate() {
    setLoading(true);
    setError(null);
    setReport(null);

    try {
      const params = new URLSearchParams({ type: reportType, range });
      if (warehouseId) params.set("warehouse_id", warehouseId);
      const r = await authedFetch(`/api/saas/reports?${params}`);
      if (!r.ok) {
        const d = await r.json().catch(() => ({}));
        throw new Error(d.error || `Request failed (${r.status})`);
      }
      const d = await r.json();
      setReport(d);
    } catch (e: any) {
      setError(e.message || t("failedToGenerate"));
    } finally {
      setLoading(false);
    }
  }

  const reportData = report?.data;

  return (
    <div className="p-6 md:p-8 max-w-[1280px]">
      <h1 className="text-[28px] font-bold tracking-tight text-[#1D1D1F] mb-6">{t("title")}</h1>

      <div className="bg-white rounded-2xl shadow-sm border border-black/5 p-6 mb-6">
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-[11px] font-medium text-[#86868B] uppercase mb-1">{t("reportType")}</label>
            <select value={reportType} onChange={(e) => setReportType(e.target.value)}
              className="bg-[#F5F5F7] border-0 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ed6d00]/20">
              <option value="orders">{t("orders")}</option>
              <option value="inventory">{t("inventory")}</option>
              <option value="picking">{t("picking")}</option>
              <option value="revenue">{t("revenue")}</option>
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-medium text-[#86868B] uppercase mb-1">{t("period")}</label>
            <select value={range} onChange={(e) => setRange(e.target.value)}
              className="bg-[#F5F5F7] border-0 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ed6d00]/20">
              <option value="7d">{t("last7Days")}</option>
              <option value="30d">{t("last30Days")}</option>
              <option value="90d">{t("last90Days")}</option>
              <option value="12m">{t("last12Months")}</option>
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-medium text-[#86868B] uppercase mb-1">{t("warehouse")}</label>
            <select value={warehouseId} onChange={(e) => setWarehouseId(e.target.value)}
              className="bg-[#F5F5F7] border-0 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ed6d00]/20">
              <option value="">{t("allWarehouses")}</option>
              {warehouses.map((w: any) => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
          </div>
          <button onClick={generate} disabled={loading}
            className="bg-[#ed6d00] text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-[#FF8A1F] disabled:opacity-50 transition-colors">
            {loading ? t("generating") : t("generateReport")}
          </button>
        </div>
      </div>

      {error && <p className="mb-6 rounded-xl bg-[#FF3B30]/5 px-4 py-3 text-sm text-[#FF3B30]">{error}</p>}

      {reportData && (
        <div className="space-y-6">
          {/* KPI cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {reportType === "orders" && (
              <>
                <KpiCard label="Total Orders" value={reportData.totalOrders || 0} />
                <KpiCard label="Shipped" value={reportData.byStatus?.shipped || reportData.byStatus?.delivered || 0} />
                <KpiCard label="Pending" value={reportData.byStatus?.pending || 0} />
                <KpiCard label="Active Days" value={reportData.byDay?.length || 0} />
              </>
            )}
            {reportType === "inventory" && (
              <>
                <KpiCard label="Total SKUs" value={reportData.totalSkus || 0} />
                <KpiCard label="On Hand" value={reportData.totalOnHand || 0} />
                <KpiCard label="Utilization" value={`${reportData.utilizationRate || 0}%`} />
                <KpiCard label="Low Stock" value={reportData.lowStockCount || 0} warn={(reportData.lowStockCount || 0) > 0} />
              </>
            )}
            {reportType === "picking" && (
              <>
                <KpiCard label="Total Tasks" value={reportData.totalTasks || 0} />
                <KpiCard label="Completed" value={reportData.completedCount || 0} />
                <KpiCard label="Avg Pick Time" value={`${reportData.avgPickTimeMin || 0}m`} />
                <KpiCard label="Accuracy" value={`${reportData.accuracy || 0}%`} />
              </>
            )}
            {reportType === "revenue" && (
              <>
                <KpiCard label="Total Revenue" value={`$${reportData.totalRevenue?.toLocaleString() || 0}`} />
                <KpiCard label="Transaction Types" value={reportData.byType?.length || 0} />
              </>
            )}
          </div>

          {/* Chart / table */}
          {reportData.byDay && (
            <div className="bg-white rounded-2xl shadow-sm border border-black/5 p-6">
              <h3 className="text-sm font-semibold text-[#1D1D1F] mb-4">{t("dailyBreakdown")}</h3>
              <div className="flex items-end gap-1 h-32">
                {reportData.byDay.slice(-30).map((d: any, i: number) => {
                  const max = Math.max(...reportData.byDay.map((x: any) => x.count || x.amount || 0), 1);
                  const val = d.count || d.amount || 0;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full bg-[#ed6d00]/20 rounded-t" style={{ height: `${(val / max) * 100}%`, minHeight: val > 0 ? 2 : 0 }}>
                        <div className="w-full h-full bg-[#ed6d00] rounded-t" />
                      </div>
                      {reportData.byDay.length <= 14 && <span className="text-[8px] text-[#86868B] rotate-90 origin-left whitespace-nowrap">{d.date?.slice(5)}</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {reportData.byStatus && (
            <div className="bg-white rounded-2xl shadow-sm border border-black/5 p-6">
              <h3 className="text-sm font-semibold text-[#1D1D1F] mb-4">{t("byStatus")}</h3>
              <table className="w-full">
                <thead><tr className="text-left text-xs text-[#86868B] border-b"><th className="py-2">{t("statusCol")}</th><th className="py-2 text-right">{t("countCol")}</th></tr></thead>
                <tbody>
                  {Object.entries(reportData.byStatus).map(([k, v]) => (
                    <tr key={k} className="border-b border-black/[0.02]">
                      <td className="py-2.5 text-sm capitalize">{k.replace(/_/g, " ")}</td>
                      <td className="py-2.5 text-sm text-right font-medium">{v as number}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function KpiCard({ label, value, warn }: { label: string; value: string | number; warn?: boolean }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-black/5 p-5">
      <div className="text-[11px] font-medium text-[#86868B] uppercase mb-1">{label}</div>
      <div className={`text-2xl font-bold ${warn ? "text-[#FF3B30]" : "text-[#1D1D1F]"}`}>{value}</div>
    </div>
  );
}
