// 拣货策略引擎 — Picking Strategy Engine
// 支持 FIFO / LIFO / FEFO 可配置策略

import { createServiceClient } from "@/lib/supabase";

export type PickingStrategy = "fifo" | "lifo" | "fefo";

export interface PickableItem {
  inventoryId: string;
  productId: string;
  sku: string;
  name: string;
  locationId: string;
  locationBarcode: string;
  zone: string;
  aisle?: string;
  rack?: string;
  shelf?: string;
  bin?: string;
  quantityAvailable: number;
  lotNumber?: string;
  serialNumber?: string;
  expirationDate?: string;
  receivedDate?: string;
}

/**
 * 按指定策略为订单行项目排序拣货顺序
 *
 * FIFO (First In First Out): 按收货日期升序 — 先入库先出
 * LIFO (Last In First Out): 按收货日期降序 — 后入库先出
 * FEFO (First Expired First Out): 按过期日期升序 — 先过期先出
 */
export function sortPickSequence(
  items: PickableItem[],
  strategy: PickingStrategy = "fifo"
): PickableItem[] {
  const sorted = [...items];

  switch (strategy) {
    case "fifo":
      sorted.sort((a, b) => {
        const dateA = a.receivedDate ? new Date(a.receivedDate).getTime() : 0;
        const dateB = b.receivedDate ? new Date(b.receivedDate).getTime() : 0;
        return dateA - dateB;
      });
      break;

    case "lifo":
      sorted.sort((a, b) => {
        const dateA = a.receivedDate ? new Date(a.receivedDate).getTime() : 0;
        const dateB = b.receivedDate ? new Date(b.receivedDate).getTime() : 0;
        return dateB - dateA;
      });
      break;

    case "fefo":
      sorted.sort((a, b) => {
        // 有过期日期的优先
        const expA = a.expirationDate ? new Date(a.expirationDate).getTime() : Infinity;
        const expB = b.expirationDate ? new Date(b.expirationDate).getTime() : Infinity;
        if (expA !== expB) return expA - expB;
        // 同等过期日期，FIFO
        const dateA = a.receivedDate ? new Date(a.receivedDate).getTime() : 0;
        const dateB = b.receivedDate ? new Date(b.receivedDate).getTime() : 0;
        return dateA - dateB;
      });
      break;
  }

  return sorted;
}

/**
 * 优化拣货路径 — 按库位物理顺序排列
 * 路径: zone → aisle → rack → shelf → bin
 */
export function optimizePickRoute(items: PickableItem[]): PickableItem[] {
  return [...items].sort((a, b) => {
    const zoneCmp = (a.zone || "").localeCompare(b.zone || "");
    if (zoneCmp !== 0) return zoneCmp;
    const aisleCmp = (a.aisle || "").localeCompare(b.aisle || "", undefined, { numeric: true });
    if (aisleCmp !== 0) return aisleCmp;
    const rackCmp = (a.rack || "").localeCompare(b.rack || "", undefined, { numeric: true });
    if (rackCmp !== 0) return rackCmp;
    const shelfCmp = (a.shelf || "").localeCompare(b.shelf || "", undefined, { numeric: true });
    if (shelfCmp !== 0) return shelfCmp;
    return (a.bin || "").localeCompare(b.bin || "", undefined, { numeric: true });
  });
}

/**
 * 获取仓库的可用库存，按指定策略排序
 */
export async function getPickableInventory(
  warehouseId: string,
  productId: string,
  quantityNeeded: number,
  strategy: PickingStrategy = "fifo"
): Promise<{ items: PickableItem[]; totalAvailable: number }> {
  const supabase = createServiceClient();
  if (!supabase) return { items: [], totalAvailable: 0 };

  const { data } = await supabase
    .from("inventory")
    .select("*, products(sku, name), locations(zone, aisle, rack, shelf, bin, barcode)")
    .eq("warehouse_id", warehouseId)
    .eq("product_id", productId)
    .gt("quantity_available", 0);

  if (!data?.length) return { items: [], totalAvailable: 0 };

  const items: PickableItem[] = data.map((inv: any) => ({
    inventoryId: inv.id,
    productId: inv.product_id,
    sku: inv.products?.sku || "",
    name: inv.products?.name || "",
    locationId: inv.location_id,
    locationBarcode: inv.locations?.barcode || "",
    zone: inv.locations?.zone || "",
    aisle: inv.locations?.aisle || "",
    rack: inv.locations?.rack || "",
    shelf: inv.locations?.shelf || "",
    bin: inv.locations?.bin || "",
    quantityAvailable: inv.quantity_available,
    lotNumber: inv.lot_number,
    serialNumber: inv.serial_number,
    expirationDate: inv.expiration_date,
    receivedDate: inv.received_date,
  }));

  const sorted = sortPickSequence(items, strategy);
  const totalAvailable = items.reduce((sum, i) => sum + i.quantityAvailable, 0);

  return { items: sorted, totalAvailable };
}

/**
 * 计算拣货总量 — 按策略取货直到满足需求量
 */
export function calculatePickAllocation(
  items: PickableItem[],
  quantityNeeded: number
): { item: PickableItem; pickQuantity: number }[] {
  const result: { item: PickableItem; pickQuantity: number }[] = [];
  let remaining = quantityNeeded;

  for (const item of items) {
    if (remaining <= 0) break;
    const pick = Math.min(remaining, item.quantityAvailable);
    result.push({ item, pickQuantity: pick });
    remaining -= pick;
  }

  return result;
}
