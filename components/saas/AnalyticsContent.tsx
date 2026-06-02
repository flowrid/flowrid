"use client";

import { useEffect, useState } from "react";

interface Data { daily_volume: any[]; source_breakdown: any[]; status_distribution: Record<string,number>; warehouse_throughput: any[]; client_revenue: any[]; }

export default function AnalyticsContent() {
  const [data, setData] = useState<Data | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadAnalytics() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/saas/analytics");
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      const nextData = await res.json();
      setData(nextData);
    } catch (e: any) {
      setError(e.message || "Failed to load analytics");
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAnalytics();
  }, []);

  if (loading) return <div className="p-8 space-y-4 animate-pulse"><div className="h-8 w-40 bg-black/5 rounded-xl"/>{[...Array(4)].map((_,i)=><div key={i} className="h-48 bg-white/50 rounded-2xl"/>)}</div>;
  if (error) return <div className="p-8 text-center"><p className="text-[#FF3B30] text-sm mb-3">{error}</p><button onClick={loadAnalytics} className="text-sm text-[#ed6d00] font-medium hover:text-[#FF8A1F]">Retry</button></div>;
  if (!data) return null;

  const dailyVolume = data.daily_volume || [];
  const sourceBreakdown = data.source_breakdown || [];
  const statusDistribution = data.status_distribution || {};
  const warehouseThroughput = data.warehouse_throughput || [];
  const chartMax = Math.max(...dailyVolume.map((d:any) => d.count), 1);
  const totalOrders = Object.values(statusDistribution).reduce((a:number,b:number) => a+b, 0);

  return (
    <div className="p-6 md:p-8 max-w-[1280px]">
      <h1 className="text-[28px] font-bold tracking-tight text-[#1D1D1F] mb-2">Analytics</h1>
      <p className="text-[#86868B] text-sm mb-8">Last 30 days</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Volume Trend */}
        <section className="bg-white rounded-2xl shadow-sm border border-black/5 p-6">
          <h2 className="text-[17px] font-semibold text-[#1D1D1F] mb-4">Order Volume Trend</h2>
          <div className="flex items-end gap-[2px] h-32">
            {dailyVolume.map((d:any) => (
              <div key={d.date} className="flex-1 relative group">
                <div className="bg-[#ed6d00] hover:bg-[#FF8A1F] rounded-t transition-all" style={{height: `${(d.count/chartMax)*100}%`}} />
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#1D1D1F] text-white text-[10px] px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">{d.date}: {d.count}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Source Breakdown */}
        <section className="bg-white rounded-2xl shadow-sm border border-black/5 p-6">
          <h2 className="text-[17px] font-semibold text-[#1D1D1F] mb-4">Orders by Source</h2>
          <div className="space-y-3">
            {sourceBreakdown.map((s:any) => (
              <div key={s.source} className="flex items-center gap-3">
                <span className="text-sm text-[#1D1D1F] w-20">{s.source}</span>
                <div className="flex-1 h-6 bg-[#F5F5F7] rounded-full overflow-hidden">
                  <div className="h-full bg-[#ed6d00] rounded-full transition-all" style={{width: `${(s.count/Math.max(...sourceBreakdown.map((x:any)=>x.count), 1))*100}%`}} />
                </div>
                <span className="text-sm font-medium text-[#1D1D1F] w-8 text-right">{s.count}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Status Distribution */}
        <section className="bg-white rounded-2xl shadow-sm border border-black/5 p-6">
          <h2 className="text-[17px] font-semibold text-[#1D1D1F] mb-4">Order Status ({totalOrders} total)</h2>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(statusDistribution).map(([status, count]) => {
              const colors: Record<string,string> = {shipped:"#34C759",pending:"#8E8E93",picking:"#ed6d00",allocated:"#AF52DE",packed:"#FF9500",delivered:"#34C759",cancelled:"#FF3B30"};
              const pct = totalOrders ? Math.round((count/totalOrders)*100) : 0;
              return (
                <div key={status} className="p-4 bg-[#F5F5F7] rounded-xl">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-2 h-2 rounded-full" style={{backgroundColor: colors[status]||"#8E8E93"}}/>
                    <span className="text-sm font-medium text-[#1D1D1F] capitalize">{status}</span>
                  </div>
                  <p className="text-[22px] font-bold text-[#1D1D1F]">{count} <span className="text-xs text-[#86868B] font-normal">{pct}%</span></p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Warehouse Throughput */}
        <section className="bg-white rounded-2xl shadow-sm border border-black/5 p-6">
          <h2 className="text-[17px] font-semibold text-[#1D1D1F] mb-4">Warehouse Throughput</h2>
          <div className="space-y-4">
            {warehouseThroughput.map((w:any) => (
              <div key={w.name}>
                <div className="flex justify-between text-sm mb-1"><span className="font-medium text-[#1D1D1F]">{w.name}</span><span className="text-[#86868B]">{w.shipped}/{w.total} shipped</span></div>
                <div className="h-4 bg-[#F5F5F7] rounded-full overflow-hidden">
                  <div className="h-full bg-[#34C759] rounded-full transition-all" style={{width: `${w.total ? (w.shipped/w.total)*100 : 0}%`}} />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
