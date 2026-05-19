import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

const TENANT_ID = "00000000-0000-0000-0000-000000000001";

export async function GET() {
  const supabase = createServiceClient();
  if (!supabase) return NextResponse.json({});

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000).toISOString().split("T")[0];

  // 每日订单量
  const { data: orders } = await supabase.from("orders")
    .select("created_at, status, source").eq("tenant_id", TENANT_ID).gte("created_at", thirtyDaysAgo).order("created_at", { ascending: true });

  const dailyVolume: Record<string, number> = {};
  const sourceBreakdown: Record<string, number> = {};
  (orders || []).forEach((o: any) => {
    const day = (o.created_at || "").split("T")[0];
    dailyVolume[day] = (dailyVolume[day] || 0) + 1;
    const src = o.source || "other";
    sourceBreakdown[src] = (sourceBreakdown[src] || 0) + 1;
  });

  // 状态分布
  const { data: allOrders } = await supabase.from("orders").select("status").eq("tenant_id", TENANT_ID);
  const statusDist: Record<string, number> = {};
  (allOrders || []).forEach((o: any) => { statusDist[o.status] = (statusDist[o.status] || 0) + 1; });

  // 客户收益
  const { data: billing } = await supabase.from("billing_transactions")
    .select("client_id, total_amount, charge_type").eq("tenant_id", TENANT_ID);
  const clientRevenue: Record<string, number> = {};
  (billing || []).forEach((t: any) => { clientRevenue[t.client_id] = (clientRevenue[t.client_id] || 0) + (t.total_amount || 0); });

  // 仓库吞吐
  const { data: warehouses } = await supabase.from("warehouses").select("id, name").eq("tenant_id", TENANT_ID);
  const whThroughput: any[] = [];
  for (const w of (warehouses || [])) {
    const { count: wTotal } = await supabase.from("orders").select("*", { count: "exact", head: true }).eq("warehouse_id", w.id);
    const { count: wShipped } = await supabase.from("orders").select("*", { count: "exact", head: true }).eq("warehouse_id", w.id).eq("status", "shipped");
    whThroughput.push({ name: w.name, total: wTotal || 0, shipped: wShipped || 0 });
  }

  return NextResponse.json({
    daily_volume: Object.entries(dailyVolume).map(([date, count]) => ({ date, count })),
    source_breakdown: Object.entries(sourceBreakdown).map(([source, count]) => ({ source, count })),
    status_distribution: statusDist,
    warehouse_throughput: whThroughput,
    client_revenue: Object.entries(clientRevenue).slice(0, 10).map(([id, amount]) => ({ client_id: id, revenue: amount })),
  });
}
