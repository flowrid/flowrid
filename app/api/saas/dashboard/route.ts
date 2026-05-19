import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

const TENANT_ID = "00000000-0000-0000-0000-000000000001";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const warehouseId = searchParams.get("warehouse_id");
  const global = searchParams.get("global") === "true";

  const supabase = createServiceClient();
  if (!supabase) return NextResponse.json({ orders_today: 0, orders_30d: 0, pending_orders: 0, total_products: 0, total_clients: 0, active_integrations: 0, recent_orders: [], warehouses: [], warehouse_breakdown: [] });

  const today = new Date().toISOString().split("T")[0];
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString().split("T")[0];

  // 仓库列表
  const { data: warehouses } = await supabase.from("warehouses").select("*").eq("tenant_id", TENANT_ID);

  const wFilter = (q: any) => warehouseId && !global ? q.eq("warehouse_id", warehouseId) : q;

  const { count: ordersToday } = await wFilter(supabase.from("orders").select("*", { count: "exact", head: true }).eq("tenant_id", TENANT_ID).gte("created_at", today));
  const { count: orders30d } = await wFilter(supabase.from("orders").select("*", { count: "exact", head: true }).eq("tenant_id", TENANT_ID).gte("created_at", thirtyDaysAgo));
  const { count: pending } = await wFilter(supabase.from("orders").select("*", { count: "exact", head: true }).eq("tenant_id", TENANT_ID).in("status", ["pending","allocated","picking"]));
  const { count: products } = await supabase.from("products").select("*", { count: "exact", head: true }).eq("tenant_id", TENANT_ID);
  const { count: clients } = await supabase.from("clients").select("*", { count: "exact", head: true }).eq("tenant_id", TENANT_ID);
  const { count: integrations } = await supabase.from("integration_connections").select("*", { count: "exact", head: true }).eq("tenant_id", TENANT_ID).eq("is_active", true);

  const recentQuery = supabase.from("orders").select("id, order_number, customer_name, source, status, created_at, warehouse_id").eq("tenant_id", TENANT_ID).order("created_at", { ascending: false }).limit(10);
  const { data: recent } = await (warehouseId && !global ? recentQuery.eq("warehouse_id", warehouseId) : recentQuery);

  // 每个仓库的 KPI
  const breakdown = [];
  for (const w of (warehouses || [])) {
    const { count: wPending } = await supabase.from("orders").select("*", { count: "exact", head: true }).eq("tenant_id", TENANT_ID).eq("warehouse_id", w.id).in("status", ["pending","allocated","picking"]);
    const { count: wShipped } = await supabase.from("orders").select("*", { count: "exact", head: true }).eq("tenant_id", TENANT_ID).eq("warehouse_id", w.id).eq("status", "shipped");
    breakdown.push({ id: w.id, name: w.name, code: w.code, city: w.city, state: w.state, pending: wPending || 0, shipped: wShipped || 0 });
  }

  return NextResponse.json({
    orders_today: ordersToday || 0,
    orders_30d: orders30d || 0,
    pending_orders: pending || 0,
    total_products: products || 0,
    total_clients: clients || 0,
    active_integrations: integrations || 0,
    warehouses: warehouses || [],
    warehouse_breakdown: breakdown,
    recent_orders: (recent || []).map((o: any) => ({
      id: o.order_number || o.id,
      customer: o.customer_name || "—",
      source: o.source || "—",
      status: o.status,
      time: timeAgo(o.created_at),
    })),
  });
}

function timeAgo(dateStr: string): string {
  if (!dateStr) return "—";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}
