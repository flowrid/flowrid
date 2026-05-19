import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

const TENANT_ID = "00000000-0000-0000-0000-000000000001";

export async function GET() {
  const supabase = createServiceClient();
  if (!supabase) {
    return NextResponse.json({
      orders_today: 0, orders_30d: 0, pending_orders: 0,
      total_products: 0, total_clients: 0, active_integrations: 0,
      recent_orders: [],
    });
  }

  const today = new Date().toISOString().split("T")[0];
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString().split("T")[0];

  const { count: ordersToday } = await supabase
    .from("orders").select("*", { count: "exact", head: true })
    .eq("tenant_id", TENANT_ID).gte("created_at", today);

  const { count: orders30d } = await supabase
    .from("orders").select("*", { count: "exact", head: true })
    .eq("tenant_id", TENANT_ID).gte("created_at", thirtyDaysAgo);

  const { count: pending } = await supabase
    .from("orders").select("*", { count: "exact", head: true })
    .eq("tenant_id", TENANT_ID).in("status", ["pending", "allocated", "picking"]);

  const { count: products } = await supabase
    .from("products").select("*", { count: "exact", head: true })
    .eq("tenant_id", TENANT_ID);

  const { count: clients } = await supabase
    .from("clients").select("*", { count: "exact", head: true })
    .eq("tenant_id", TENANT_ID);

  const { count: integrations } = await supabase
    .from("integration_connections").select("*", { count: "exact", head: true })
    .eq("tenant_id", TENANT_ID).eq("is_active", true);

  const { data: recent } = await supabase
    .from("orders")
    .select("id, order_number, customer_name, source, status, created_at")
    .eq("tenant_id", TENANT_ID)
    .order("created_at", { ascending: false })
    .limit(10);

  return NextResponse.json({
    orders_today: ordersToday || 0,
    orders_30d: orders30d || 0,
    pending_orders: pending || 0,
    total_products: products || 0,
    total_clients: clients || 0,
    active_integrations: integrations || 0,
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
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}
