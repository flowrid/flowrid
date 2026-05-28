// 补货逻辑引擎 — Replenishment Engine
// 监控库存低水位，自动生成补货建议

import { createServiceClient } from "@/lib/supabase";

export interface ReplenishmentAlert {
  productId: string;
  sku: string;
  name: string;
  warehouseId: string;
  warehouseName: string;
  quantityOnHand: number;
  quantityAvailable: number;
  minQuantity: number;
  maxQuantity: number;
  reorderPoint: number;
  suggestedReorder: number;
  severity: "low" | "medium" | "critical";
}

/**
 * 扫描仓库中所有低于再订货点的产品
 */
export async function checkReplenishment(
  tenantId: string,
  warehouseId?: string
): Promise<ReplenishmentAlert[]> {
  const supabase = createServiceClient();
  if (!supabase) return [];

  // 获取所有产品及其库存
  let productQuery = supabase
    .from("products")
    .select("*")
    .eq("tenant_id", tenantId)
    .eq("is_active", true);

  const { data: products } = await productQuery;

  if (!products?.length) return [];

  const alerts: ReplenishmentAlert[] = [];

  for (const product of products) {
    const minQty = (product as any).min_quantity || 0;
    const maxQty = (product as any).max_quantity || 0;
    const reorderPoint = (product as any).reorder_point || minQty;

    // 未设置补货参数则跳过
    if (!minQty && !reorderPoint) continue;

    let invQuery = supabase
      .from("inventory")
      .select("*, warehouses!inner(name)")
      .eq("product_id", (product as any).id);

    if (warehouseId) invQuery = invQuery.eq("warehouse_id", warehouseId);

    const { data: inventory } = await invQuery;

    (inventory || []).forEach((inv: any) => {
      const onHand = inv.quantity_on_hand || 0;
      const available = inv.quantity_available || 0;
      const threshold = reorderPoint || minQty;

      if (available <= threshold) {
        const severity =
          available <= 0 ? "critical" :
          available <= threshold * 0.5 ? "medium" :
          "low";

        const suggested = maxQty > 0 ? maxQty - onHand : threshold * 2 - onHand;

        alerts.push({
          productId: (product as any).id,
          sku: (product as any).sku,
          name: (product as any).name,
          warehouseId: inv.warehouse_id,
          warehouseName: inv.warehouses?.name || "",
          quantityOnHand: onHand,
          quantityAvailable: available,
          minQuantity: minQty,
          maxQuantity: maxQty,
          reorderPoint: threshold,
          suggestedReorder: Math.max(1, suggested),
          severity,
        });
      }
    });
  }

  // 按严重程度排序
  const severityOrder = { critical: 0, medium: 1, low: 2 };
  alerts.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  return alerts;
}

/**
 * 获取补货汇总 — 按仓库分组统计
 */
export async function getReplenishmentSummary(tenantId: string) {
  const alerts = await checkReplenishment(tenantId);

  const byWarehouse: Record<string, { warehouseName: string; critical: number; medium: number; low: number; items: ReplenishmentAlert[] }> = {};

  for (const alert of alerts) {
    const key = alert.warehouseId;
    if (!byWarehouse[key]) {
      byWarehouse[key] = { warehouseName: alert.warehouseName, critical: 0, medium: 0, low: 0, items: [] };
    }
    byWarehouse[key][alert.severity]++;
    if (byWarehouse[key].items.length < 20) byWarehouse[key].items.push(alert);
  }

  return {
    totalAlerts: alerts.length,
    criticalCount: alerts.filter((a) => a.severity === "critical").length,
    byWarehouse,
  };
}
