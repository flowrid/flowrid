// 报表引擎 — Reports Engine
// 订单/库存/拣货/收入四大报表类型

import { createServiceClient } from "@/lib/supabase";

export type ReportType = "orders" | "inventory" | "picking" | "revenue";
export type ReportRange = "7d" | "30d" | "90d" | "12m";

export interface ReportParams {
  type: ReportType;
  range?: ReportRange;
  dateFrom?: string;
  dateTo?: string;
  warehouseId?: string;
  clientId?: string;
}

function dateRange(range: ReportRange | undefined, from?: string, to?: string): { start: Date; end: Date } {
  const end = to ? new Date(to) : new Date();
  if (from) return { start: new Date(from), end };
  const days = range === "7d" ? 7 : range === "30d" ? 30 : range === "90d" ? 90 : 365;
  const start = new Date();
  start.setDate(start.getDate() - days);
  return { start, end };
}

export async function generateReport(
  tenantId: string,
  params: ReportParams
): Promise<{ type: ReportType; generatedAt: string; data: any }> {
  const supabase = createServiceClient();
  if (!supabase) return { type: params.type, generatedAt: new Date().toISOString(), data: {} };

  const { start, end } = dateRange(params.range, params.dateFrom, params.dateTo);

  switch (params.type) {
    case "orders":
      return { type: "orders", generatedAt: new Date().toISOString(), data: await ordersReport(supabase, tenantId, start, end, params) };
    case "inventory":
      return { type: "inventory", generatedAt: new Date().toISOString(), data: await inventoryReport(supabase, tenantId, params) };
    case "picking":
      return { type: "picking", generatedAt: new Date().toISOString(), data: await pickingReport(supabase, tenantId, start, end, params) };
    case "revenue":
      return { type: "revenue", generatedAt: new Date().toISOString(), data: await revenueReport(supabase, tenantId, start, end, params) };
  }
}

async function ordersReport(supabase: any, tenantId: string, start: Date, end: Date, params: ReportParams) {
  let query = supabase
    .from("orders")
    .select("status, created_at, warehouse_id", { count: "exact" })
    .eq("tenant_id", tenantId)
    .gte("created_at", start.toISOString())
    .lte("created_at", end.toISOString());

  if (params.warehouseId) query = query.eq("warehouse_id", params.warehouseId);
  if (params.clientId) query = query.eq("client_id", params.clientId);

  const { data, count } = await query;

  // 按状态分组
  const byStatus: Record<string, number> = {};
  const byDay: Record<string, number> = {};
  for (const o of data || []) {
    const s = o.status || "unknown";
    byStatus[s] = (byStatus[s] || 0) + 1;
    const day = o.created_at?.split("T")[0];
    if (day) byDay[day] = (byDay[day] || 0) + 1;
  }

  return {
    totalOrders: count || 0,
    byStatus,
    byDay: Object.entries(byDay).sort(([a], [b]) => a.localeCompare(b)).map(([date, count]) => ({ date, count })),
    raw: data || [],
  };
}

async function inventoryReport(supabase: any, tenantId: string, params: ReportParams) {
  let query = supabase
    .from("inventory")
    .select("quantity_on_hand, quantity_available, warehouse_id, products(name, sku)");

  if (params.warehouseId) query = query.eq("warehouse_id", params.warehouseId);

  const { data } = await query;

  const totalOnHand = (data || []).reduce((sum: number, i: any) => sum + (i.quantity_on_hand || 0), 0);
  const totalAvailable = (data || []).reduce((sum: number, i: any) => sum + (i.quantity_available || 0), 0);

  const lowStock = (data || []).filter((i: any) => i.quantity_available <= (i.products as any)?.min_quantity || 0);

  return {
    totalSkus: data?.length || 0,
    totalOnHand,
    totalAvailable,
    utilizationRate: totalOnHand > 0 ? Math.round((totalAvailable / totalOnHand) * 100) : 0,
    lowStockCount: lowStock.length,
    lowStockItems: lowStock.slice(0, 20),
  };
}

async function pickingReport(supabase: any, tenantId: string, start: Date, end: Date, params: ReportParams) {
  let query = supabase
    .from("pick_tasks")
    .select("status, started_at, completed_at, assigned_to")
    .eq("tenant_id", tenantId)
    .gte("created_at", start.toISOString())
    .lte("created_at", end.toISOString());

  if (params.warehouseId) query = query.eq("warehouse_id", params.warehouseId);

  const { data } = await query;

  const byStatus: Record<string, number> = {};
  let totalPickTime = 0;
  let completedCount = 0;

  for (const t of data || []) {
    const s = t.status || "unknown";
    byStatus[s] = (byStatus[s] || 0) + 1;
    if (t.started_at && t.completed_at) {
      totalPickTime += new Date(t.completed_at).getTime() - new Date(t.started_at).getTime();
      completedCount++;
    }
  }

  return {
    totalTasks: data?.length || 0,
    byStatus,
    completedCount,
    avgPickTimeMin: completedCount > 0 ? Math.round(totalPickTime / completedCount / 60000) : 0,
    accuracy: completedCount > 0 ? Math.round(((data || []).filter((t: any) => t.status === "complete").length / (data || []).length) * 100) : 0,
  };
}

async function revenueReport(supabase: any, tenantId: string, start: Date, end: Date, params: ReportParams) {
  let query = supabase
    .from("billing_transactions")
    .select("amount, transaction_type, created_at, client_id")
    .eq("tenant_id", tenantId)
    .gte("created_at", start.toISOString())
    .lte("created_at", end.toISOString());

  const { data } = await query;

  const byType: Record<string, number> = {};
  const byDay: Record<string, number> = {};
  let totalRevenue = 0;

  for (const t of data || []) {
    const amt = parseFloat(t.amount) || 0;
    totalRevenue += amt;
    const type = t.transaction_type || "other";
    byType[type] = (byType[type] || 0) + amt;
    const day = t.created_at?.split("T")[0];
    if (day) byDay[day] = (byDay[day] || 0) + amt;
  }

  return {
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    byType: Object.entries(byType).map(([type, amount]) => ({ type, amount: Math.round(amount * 100) / 100 })),
    byDay: Object.entries(byDay).sort(([a], [b]) => a.localeCompare(b)).map(([date, amount]) => ({ date, amount: Math.round(amount * 100) / 100 })),
  };
}
