/**
 * Flowrid OMS — 多仓智能分拨引擎
 *
 * 订单创建时自动选择最优履约仓库。
 * 评分维度：库存覆盖率 (50%) + 距离 (30%) + 仓库负载 (20%)
 */

import { createServiceClient } from "./supabase";

export interface WarehouseScore {
  warehouseId: string;
  warehouseName: string;
  inventoryScore: number;   // 0-100
  distanceScore: number;    // 0-100
  loadScore: number;        // 0-100
  totalScore: number;       // weighted sum
  details: {
    itemsFulfillable: number;
    totalItems: number;
    estimatedDistanceMi: number;
    pendingOrderCount: number;
  };
}

export interface RoutingResult {
  selected: WarehouseScore;
  allScores: WarehouseScore[];
  reason: string;
}

/**
 * 主入口：为订单计算最优仓库
 */
export async function routeOrder(
  orderItems: Array<{ product_id: string; quantity_ordered: number }>,
  destinationZip: string,
  tenantId: string
): Promise<RoutingResult | null> {
  const supabase = createServiceClient();
  if (!supabase) return null;

  // 获取所有活跃仓库
  const { data: warehouses } = await supabase
    .from("warehouses")
    .select("id, name, city, state, zip, sq_footage")
    .eq("tenant_id", tenantId)
    .eq("is_active", true);

  if (!warehouses || warehouses.length === 0) return null;

  // 单仓场景直接返回
  if (warehouses.length === 1) {
    const wh = warehouses[0];
    const score = await scoreWarehouse(supabase, wh, orderItems, destinationZip, tenantId);
    return {
      selected: score,
      allScores: [score],
      reason: `Only one active warehouse: ${wh.name}`,
    };
  }

  // 多仓打分
  const scores = await Promise.all(
    warehouses.map((wh) => scoreWarehouse(supabase, wh, orderItems, destinationZip, tenantId))
  );

  scores.sort((a, b) => b.totalScore - a.totalScore);

  const best = scores[0];
  const runnerUp = scores[1];

  const reason =
    best.inventoryScore < 50
      ? `Best available: ${best.warehouseName} (${best.details.itemsFulfillable}/${best.details.totalItems} items in stock)`
      : `Optimal: ${best.warehouseName} — ${best.details.itemsFulfillable}/${best.details.totalItems} items in stock, ~${best.details.estimatedDistanceMi}mi away, ${best.details.pendingOrderCount} pending orders`;

  return { selected: best, allScores: scores, reason };
}

async function scoreWarehouse(
  supabase: NonNullable<ReturnType<typeof createServiceClient>>,
  warehouse: { id: string; name: string; zip?: string },
  items: Array<{ product_id: string; quantity_ordered: number }>,
  destZip: string,
  tenantId: string
): Promise<WarehouseScore> {
  const [inventoryResult, loadResult] = await Promise.all([
    calcInventoryCoverage(supabase, warehouse.id, items, tenantId),
    calcLoadScore(supabase, warehouse.id, tenantId),
  ]);

  const distanceScore = calcZipDistanceScore(warehouse.zip || "00000", destZip);
  const estimatedDistance = estimateDistanceMiles(warehouse.zip || "00000", destZip);

  const totalScore =
    inventoryResult.score * 0.5 + distanceScore * 0.3 + loadResult.score * 0.2;

  return {
    warehouseId: warehouse.id,
    warehouseName: warehouse.name,
    inventoryScore: inventoryResult.score,
    distanceScore,
    loadScore: loadResult.score,
    totalScore: Math.round(totalScore * 100) / 100,
    details: {
      itemsFulfillable: inventoryResult.fulfillable,
      totalItems: items.length,
      estimatedDistanceMi: estimatedDistance,
      pendingOrderCount: loadResult.count,
    },
  };
}

// ==========================================
// 库存覆盖率评分 (权重 50%)
// ==========================================

async function calcInventoryCoverage(
  supabase: NonNullable<ReturnType<typeof createServiceClient>>,
  warehouseId: string,
  items: Array<{ product_id: string; quantity_ordered: number }>,
  tenantId: string
): Promise<{ score: number; fulfillable: number }> {
  if (items.length === 0) return { score: 100, fulfillable: 0 };

  const productIds = items.map((i) => i.product_id);

  const { data: inventory } = await supabase
    .from("inventory")
    .select("product_id, quantity_available")
    .eq("tenant_id", tenantId)
    .eq("warehouse_id", warehouseId)
    .in("product_id", productIds);

  const stockMap = new Map<string, number>();
  for (const inv of inventory || []) {
    stockMap.set(inv.product_id, (stockMap.get(inv.product_id) || 0) + inv.quantity_available);
  }

  let fulfillable = 0;
  let partialScore = 0;

  for (const item of items) {
    const available = stockMap.get(item.product_id) || 0;
    if (available >= item.quantity_ordered) {
      fulfillable++;
    } else if (available > 0) {
      partialScore += (available / item.quantity_ordered) * 0.5;
    }
  }

  const baseScore = (fulfillable / items.length) * 100;
  const score = Math.min(100, baseScore + (partialScore / items.length) * 100);

  return { score: Math.round(score * 100) / 100, fulfillable };
}

// ==========================================
// ZIP 距离估算 (权重 30%)
// ==========================================

function calcZipDistanceScore(warehouseZip: string, destZip: string): number {
  const dist = estimateDistanceMiles(warehouseZip, destZip);
  // 距离映射到 0-100 分：<50mi = 100，<200mi = 75，<500mi = 50，<1500mi = 25，>=1500mi = 0
  if (dist <= 50) return 100;
  if (dist <= 200) return 75;
  if (dist <= 500) return 50;
  if (dist <= 1500) return 25;
  return 0;
}

export function estimateDistanceMiles(warehouseZip: string, destZip: string): number {
  const wz = warehouseZip.replace(/\D/g, "").padStart(5, "0");
  const dz = destZip.replace(/\D/g, "").padStart(5, "0");

  // 前3位相同：同一分拣中心区域 (~50 mi)
  if (wz.slice(0, 3) === dz.slice(0, 3)) return 50;
  // 前2位相同：相近区域 (~200 mi)
  if (wz.slice(0, 2) === dz.slice(0, 2)) return 200;
  // 首位相同：同一州或邻州 (~500 mi)
  if (wz[0] === dz[0]) return 500;
  // 不同：跨州 (~1500 mi)
  return 1500;
}

// ==========================================
// 仓库负载评分 (权重 20%)
// ==========================================

async function calcLoadScore(
  supabase: NonNullable<ReturnType<typeof createServiceClient>>,
  warehouseId: string,
  tenantId: string
): Promise<{ score: number; count: number }> {
  const { count } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .eq("tenant_id", tenantId)
    .eq("warehouse_id", warehouseId)
    .in("status", ["pending", "allocated", "picking"]);

  const pendingCount = count || 0;

  // 0-10 单 → 100分，每多10单减10分，最低20分
  const score = Math.max(20, 100 - pendingCount * 1.5);

  return { score: Math.round(score * 100) / 100, count: pendingCount };
}

/**
 * 验证一个仓库能否完全履行订单（所有 SKU 数量充足）
 */
export async function canFulfill(
  warehouseId: string,
  tenantId: string,
  items: Array<{ product_id: string; quantity_ordered: number }>
): Promise<boolean> {
  const supabase = createServiceClient();
  if (!supabase) return false;

  const { fulfillable } = await calcInventoryCoverage(supabase, warehouseId, items, tenantId);
  return fulfillable === items.length;
}
