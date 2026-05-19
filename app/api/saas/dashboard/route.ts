import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

/**
 * SaaS Dashboard API — KPI 数据
 */
export async function GET() {
  const supabase = createServerClient();

  // 默认 demo 数据
  const demo = {
    orders_today: 142,
    orders_30d: 3847,
    pending_orders: 28,
    total_inventory_units: 125430,
    avg_pick_time_minutes: 12,
    revenue_mtd: 28750,
    recent_orders: [
      { id: "ORD-2024", customer: "Acme Apparel", items: 12, status: "Shipped", time: "2m ago", source: "Shopify" },
      { id: "ORD-2023", customer: "Zen Beauty", items: 3, status: "Picking", time: "5m ago", source: "Amazon" },
      { id: "ORD-2022", customer: "Peak Nutrition", items: 45, status: "Allocated", time: "8m ago", source: "TikTok" },
      { id: "ORD-2021", customer: "Gear Up Sports", items: 8, status: "Packed", time: "15m ago", source: "Shopify" },
      { id: "ORD-2020", customer: "Luxe Jewelry", items: 2, status: "Pending", time: "22m ago", source: "Manual" },
    ],
  };

  if (!supabase) return NextResponse.json(demo);

  try {
    const today = new Date().toISOString().split("T")[0];
    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString().split("T")[0];

    const { count: ordersToday } = await supabase
      .from("orders").select("*", { count: "exact", head: true })
      .gte("created_at", today);

    const { count: orders30d } = await supabase
      .from("orders").select("*", { count: "exact", head: true })
      .gte("created_at", thirtyDaysAgo);

    const { count: pending } = await supabase
      .from("orders").select("*", { count: "exact", head: true })
      .in("status", ["pending", "allocated", "picking"]);

    const { count: inventory } = await supabase
      .from("inventory").select("*", { count: "exact", head: true })
      .gt("quantity_on_hand", 0);

    const { data: recent } = await supabase
      .from("orders").select("*").order("created_at", { ascending: false }).limit(5);

    return NextResponse.json({
      orders_today: ordersToday || demo.orders_today,
      orders_30d: orders30d || demo.orders_30d,
      pending_orders: pending || demo.pending_orders,
      total_inventory_units: inventory || demo.total_inventory_units,
      avg_pick_time_minutes: demo.avg_pick_time_minutes,
      revenue_mtd: demo.revenue_mtd,
      recent_orders: recent?.length ? recent.map((o: Record<string, unknown>) => ({
        id: o.order_number,
        customer: o.customer_name || "—",
        items: 0,
        status: o.status,
        time: "—",
        source: o.source || "—",
      })) : demo.recent_orders,
    });
  } catch {
    return NextResponse.json(demo);
  }
}
