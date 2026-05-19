/**
 * Flowrid SaaS — Analytics Engine
 *
 * 运营数据分析：订单趋势、库存周转、拣货效率、客户收益
 */

import { createServerClient } from "./supabase";

// ==========================================
// 核心 KPI
// ==========================================

export async function getDashboardKPIs(tenantId: string, warehouseId?: string) {
  const supabase = createServerClient();
  if (!supabase) return null;

  const today = new Date().toISOString().split("T")[0];
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  // 今日订单
  let orderQuery = supabase.from("orders").select("*", { count: "exact", head: true }).eq("tenant_id", tenantId).gte("created_at", today);
  if (warehouseId) orderQuery = orderQuery.eq("warehouse_id", warehouseId);
  const { count: ordersToday } = await orderQuery;

  // 30天订单
  let monthQuery = supabase.from("orders").select("*", { count: "exact", head: true }).eq("tenant_id", tenantId).gte("created_at", thirtyDaysAgo);
  if (warehouseId) monthQuery = monthQuery.eq("warehouse_id", warehouseId);
  const { count: orders30d } = await monthQuery;

  // 待处理
  let pendingQuery = supabase.from("orders").select("*", { count: "exact", head: true }).eq("tenant_id", tenantId).in("status", ["pending", "allocated", "picking"]);
  if (warehouseId) pendingQuery = pendingQuery.eq("warehouse_id", warehouseId);
  const { count: pendingOrders } = await pendingQuery;

  // 库存总价值（按成本估算）
  let invQuery = supabase.from("inventory").select("quantity_on_hand").gt("quantity_on_hand", 0);
  let totalUnits = 0;
  if (warehouseId) {
    const { data } = await invQuery.eq("warehouse_id", warehouseId);
    totalUnits = (data || []).reduce((s: number, i: { quantity_on_hand: number }) => s + i.quantity_on_hand, 0);
  }

  // 拣货效率
  const { data: picks } = await supabase.from("pick_tasks").select("started_at, completed_at").eq("tenant_id", tenantId).gte("completed_at", thirtyDaysAgo).not("completed_at", "is", null);
  let avgPickMinutes = 0;
  if (picks && picks.length > 0) {
    const totalMinutes = picks.reduce((s: number, p: { started_at: string; completed_at: string }) => {
      const duration = (new Date(p.completed_at).getTime() - new Date(p.started_at).getTime()) / 60000;
      return s + duration;
    }, 0);
    avgPickMinutes = Math.round(totalMinutes / picks.length);
  }

  return {
    orders_today: ordersToday || 0,
    orders_30d: orders30d || 0,
    pending_orders: pendingOrders || 0,
    total_inventory_units: totalUnits,
    avg_pick_time_minutes: avgPickMinutes,
  };
}

// ==========================================
// 订单趋势
// ==========================================

export async function getOrderTrend(tenantId: string, days = 30) {
  const supabase = createServerClient();
  if (!supabase) return [];

  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  const { data } = await supabase
    .from("orders")
    .select("created_at, status")
    .eq("tenant_id", tenantId)
    .gte("created_at", startDate)
    .order("created_at", { ascending: true });

  if (!data) return [];

  // 按天聚合
  const trend: Record<string, { total: number; shipped: number }> = {};
  for (const order of data as { created_at: string; status: string }[]) {
    const day = order.created_at.split("T")[0];
    if (!trend[day]) trend[day] = { total: 0, shipped: 0 };
    trend[day].total++;
    if (order.status === "shipped" || order.status === "delivered") trend[day].shipped++;
  }

  return Object.entries(trend).map(([date, counts]) => ({ date, ...counts }));
}

// ==========================================
// 库存周转率
// ==========================================

export async function getInventoryTurnover(tenantId: string, warehouseId?: string) {
  const supabase = createServerClient();
  if (!supabase) return null;

  let invQuery = supabase.from("inventory").select("quantity_on_hand, last_updated");
  if (warehouseId) invQuery = invQuery.eq("warehouse_id", warehouseId);
  const { data: inventory } = await invQuery;
  if (!inventory) return null;

  const totalOnHand = inventory.reduce((s: number, i: { quantity_on_hand: number }) => s + i.quantity_on_hand, 0);

  // 过去 90 天发货量
  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  let shipQuery = supabase.from("order_items").select("quantity_shipped").gte("created_at", ninetyDaysAgo);
  const { data: shipped } = await shipQuery;
  const totalShipped90d = (shipped || []).reduce((s: number, i: { quantity_shipped: number }) => s + i.quantity_shipped, 0);

  // 年度化周转率 = (90天发货量 × 4) / 平均在手库存
  const annualizedTurnover = totalOnHand > 0 ? ((totalShipped90d * 4) / totalOnHand).toFixed(2) : "0";

  return {
    total_on_hand: totalOnHand,
    shipped_90d: totalShipped90d,
    annualized_turnover: parseFloat(annualizedTurnover),
  };
}

// ==========================================
// 客户收益分析
// ==========================================

export async function getClientRevenue(tenantId: string) {
  const supabase = createServerClient();
  if (!supabase) return [];

  const { data } = await supabase
    .from("billing_transactions")
    .select("client_id, total_amount, charge_type")
    .eq("tenant_id", tenantId);

  if (!data) return [];

  const clientRevenue: Record<string, number> = {};
  for (const t of data as unknown as { client_id: string; total_amount: number }[]) {
    const id = t.client_id || "unassigned";
    clientRevenue[id] = (clientRevenue[id] || 0) + t.total_amount;
  }

  return Object.entries(clientRevenue)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10);
}

// ==========================================
// 定期快照（存入 analytics_snapshots）
// ==========================================

export async function takeDailySnapshot(tenantId: string) {
  const supabase = createServerClient();
  if (!supabase) return;

  const kpis = await getDashboardKPIs(tenantId);
  if (!kpis) return;

  const today = new Date().toISOString().split("T")[0];

  const metrics = [
    { metric_type: "orders_processed", metric_value: kpis.orders_today },
    { metric_type: "pending_orders", metric_value: kpis.pending_orders },
    { metric_type: "inventory_units", metric_value: kpis.total_inventory_units },
    { metric_type: "avg_pick_minutes", metric_value: kpis.avg_pick_time_minutes },
  ];

  for (const m of metrics) {
    await supabase.from("analytics_snapshots").insert({
      tenant_id: tenantId,
      snapshot_date: today,
      metric_type: m.metric_type,
      metric_value: m.metric_value,
    });
  }
}
