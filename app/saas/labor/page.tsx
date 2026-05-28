"use client";

// 劳动力分析

import { useEffect, useState } from "react";

export default function LaborPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [warehouseId, setWarehouseId] = useState("");
  const [days, setDays] = useState(30);

  async function fetchData() {
    setLoading(true);
    try {
      const params = new URLSearchParams({ days: String(days) });
      if (warehouseId) params.set("warehouse_id", warehouseId);
      const r = await fetch(`/api/saas/labor?${params}`);
      const d = await r.json();
      setData(d);
    } catch {} finally { setLoading(false); }
  }

  useEffect(() => {
    fetch("/api/saas/warehouses").then((r) => r.json()).then((d) => setWarehouses(d.data || [])).catch(() => {});
  }, []);

  useEffect(() => { fetchData(); }, [warehouseId, days]);

  return (
    <div className="p-6 md:p-8 max-w-[1280px]">
      <h1 className="text-[28px] font-bold tracking-tight text-[#1D1D1F] mb-6">Labor Analytics</h1>

      <div className="flex items-center gap-4 mb-6">
        <select value={warehouseId} onChange={(e) => setWarehouseId(e.target.value)}
          className="bg-white border border-black/5 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ed6d00]/20">
          <option value="">All Warehouses</option>
          {warehouses.map((w: any) => <option key={w.id} value={w.id}>{w.name}</option>)}
        </select>
        <select value={days} onChange={(e) => setDays(parseInt(e.target.value))}
          className="bg-white border border-black/5 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ed6d00]/20">
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
        </select>
      </div>

      {loading ? (
        <div className="space-y-4 animate-pulse">
          {[...Array(4)].map((_, i) => <div key={i} className="h-20 bg-white/50 rounded-2xl" />)}
        </div>
      ) : data ? (
        <div className="space-y-6">
          {/* Summary KPI */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard label="Total Pickers" value={data.totalPickers} />
            <KpiCard label="Tasks Completed" value={data.totalTasks} />
            <KpiCard label="Items Picked" value={data.totalItemsPicked} />
            <KpiCard label="Avg Productivity" value={`${data.avgProductivity} items/hr`} />
          </div>

          {/* Picker table */}
          <div className="bg-white rounded-2xl shadow-sm border border-black/5 overflow-hidden">
            <div className="px-6 py-3 bg-[#F5F5F7] border-b border-black/5">
              <h3 className="text-sm font-semibold text-[#1D1D1F]">Picker Performance</h3>
            </div>
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs text-[#86868B] border-b border-black/5">
                  <th className="px-5 py-2.5">Name</th>
                  <th className="px-5 py-2.5 text-right">Tasks</th>
                  <th className="px-5 py-2.5 text-right">Items</th>
                  <th className="px-5 py-2.5 text-right">Total Time</th>
                  <th className="px-5 py-2.5 text-right">Avg/Task</th>
                  <th className="px-5 py-2.5 text-right">Accuracy</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.04]">
                {data.pickers.map((p: any) => (
                  <tr key={p.userId}>
                    <td className="px-5 py-3 text-sm font-medium">{p.userName}</td>
                    <td className="px-5 py-3 text-sm text-right">{p.tasksCompleted}</td>
                    <td className="px-5 py-3 text-sm text-right">{p.itemsPicked}</td>
                    <td className="px-5 py-3 text-sm text-right text-[#86868B]">{p.totalTimeMin}m</td>
                    <td className="px-5 py-3 text-sm text-right text-[#86868B]">{p.avgTimePerTaskMin}m</td>
                    <td className="px-5 py-3 text-sm text-right">
                      <span className={`font-medium ${p.accuracy >= 90 ? "text-[#34C759]" : p.accuracy >= 70 ? "text-[#FF9500]" : "text-[#FF3B30]"}`}>
                        {p.accuracy}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="py-12 text-center text-[#86868B] text-sm">No data available</div>
      )}
    </div>
  );
}

function KpiCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-black/5 p-5">
      <div className="text-[11px] font-medium text-[#86868B] uppercase mb-1">{label}</div>
      <div className="text-2xl font-bold text-[#1D1D1F]">{value}</div>
    </div>
  );
}
