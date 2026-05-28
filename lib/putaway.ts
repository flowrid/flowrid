// 引导上架引擎 — Putaway Strategy Engine
// 为新入库货物推荐最优库位

import { createServiceClient } from "@/lib/supabase";

export interface PutawayItem {
  productId: string;
  quantity: number;
  sku?: string;
  name?: string;
  lotNumber?: string;
  expirationDate?: string;
  weightLbs?: number;
  isHazmat?: boolean;
}

export interface LocationScore {
  locationId: string;
  barcode: string;
  zone: string;
  aisle?: string;
  rack?: string;
  shelf?: string;
  bin?: string;
  score: number;
  reasons: string[];
  availableWeight: number;
  availableVolume: number;
}

/**
 * 为一批货物推荐最优库位
 * 评分维度：zone 匹配 25% + 空闲率 20% + 黄金区 15% + 重量适配 15% + 批次合并 15% + 距离 10%
 */
export async function suggestPutawayLocations(
  warehouseId: string,
  items: PutawayItem[],
  options?: { preferSingleZone?: boolean; excludeZones?: string[] }
): Promise<{ item: PutawayItem; locations: LocationScore[] }[]> {
  const supabase = createServiceClient();
  if (!supabase) return [];

  // 1. 获取所有可用库位
  const { data: locations } = await supabase
    .from("locations")
    .select("*")
    .eq("warehouse_id", warehouseId);

  if (!locations?.length) return [];

  // 对每个库位计算已有库存重量
  const locationLoads: Record<string, { totalWeight: number; totalVolume: number; itemCount: number }> = {};
  const { data: inventory } = await supabase
    .from("inventory")
    .select("location_id, quantity_on_hand, products(unit_weight_lbs, unit_length_in, unit_width_in, unit_height_in)")
    .eq("warehouse_id", warehouseId)
    .gt("quantity_on_hand", 0);

  (inventory || []).forEach((inv: any) => {
    const lid = inv.location_id;
    if (!lid) return;
    if (!locationLoads[lid]) locationLoads[lid] = { totalWeight: 0, totalVolume: 0, itemCount: 0 };
    const w = (inv.products?.unit_weight_lbs || 0) * inv.quantity_on_hand;
    const dims = inv.products;
    const vol = dims ? (dims.unit_length_in || 1) * (dims.unit_width_in || 1) * (dims.unit_height_in || 1) * inv.quantity_on_hand : 0;
    locationLoads[lid].totalWeight += w;
    locationLoads[lid].totalVolume += vol;
    locationLoads[lid].itemCount += 1;
  });

  // 2. 获取已有该产品的库位（批次合并）
  const existingProductLocations = new Set<string>();
  for (const item of items) {
    const { data: existing } = await supabase
      .from("inventory")
      .select("location_id")
      .eq("product_id", item.productId)
      .eq("warehouse_id", warehouseId)
      .gt("quantity_on_hand", 0);
    (existing || []).forEach((e: any) => e.location_id && existingProductLocations.add(e.location_id));
  }

  // 3. 评分
  const results: { item: PutawayItem; locations: LocationScore[] }[] = [];

  for (const item of items) {
    const scores: LocationScore[] = locations
      .filter((loc: any) => {
        if (options?.excludeZones?.includes(loc.zone)) return false;
        return true;
      })
      .map((loc: any) => {
        const load = locationLoads[loc.id] || { totalWeight: 0, totalVolume: 0, itemCount: 0 };
        const maxWt = loc.max_weight_lbs || 5000;
        const maxVol = loc.max_volume_cuft || 10000;
        const availableWt = Math.max(0, maxWt - load.totalWeight);
        const availableVol = Math.max(0, maxVol - load.totalVolume);
        const reasons: string[] = [];

        // Zone 匹配 (25%)
        let zoneScore = 15;
        const zoneMap: Record<string, number> = { "A": 25, "B": 22, "C": 18, "D": 15, "E": 12 };
        zoneScore = zoneMap[loc.zone?.toUpperCase()] || 15;
        reasons.push(`Zone ${loc.zone} base=${zoneScore}`);

        // 空闲率 (20%)
        const fullness = load.itemCount > 0 ? load.itemCount / 100 : 0;
        const vacancyScore = Math.round((1 - Math.min(fullness, 1)) * 20);
        reasons.push(`Vacancy=${vacancyScore}/20`);

        // 黄金区 (15%) — aisle A-C 为黄金区
        const aisleLetter = (loc.aisle || "Z").charAt(0).toUpperCase();
        const goldScore = aisleLetter >= "A" && aisleLetter <= "C" ? 15 : aisleLetter <= "F" ? 10 : 5;
        reasons.push(`Aisle proximity=${goldScore}/15`);

        // 重量适配 (15%)
        const itemWt = item.weightLbs || 0;
        let weightScore = 15;
        if (itemWt > availableWt) weightScore = 0;
        else if (itemWt > 0 && maxWt > 0) weightScore = Math.round((1 - itemWt / maxWt) * 15);
        reasons.push(`Weight fit=${weightScore}/15`);

        // 批次合并 (15%) — 同一产品优先放在已有位置附近
        const batchScore = existingProductLocations.has(loc.id) ? 15 : 0;
        if (batchScore > 0) reasons.push(`Batch merge +${batchScore}`);

        // 危险品隔离 (加分项)
        if (item.isHazmat && loc.zone?.toUpperCase() === "H") {
          reasons.push("Hazmat zone match +5");
        }

        const total = zoneScore + vacancyScore + goldScore + weightScore + batchScore + (item.isHazmat && loc.zone?.toUpperCase() === "H" ? 5 : 0);

        return {
          locationId: loc.id,
          barcode: loc.barcode || `${loc.zone}-${loc.aisle || ""}-${loc.rack || ""}`,
          zone: loc.zone,
          aisle: loc.aisle,
          rack: loc.rack,
          shelf: loc.shelf,
          bin: loc.bin,
          score: total,
          reasons,
          availableWeight: availableWt,
          availableVolume: availableVol,
        };
      })
      .filter((s) => s.availableWeight > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    results.push({ item, locations: scores });
  }

  return results;
}

/**
 * 单件上架 — 快速推荐最佳库位
 */
export async function quickPutaway(
  warehouseId: string,
  productId: string,
  quantity: number
): Promise<LocationScore | null> {
  const results = await suggestPutawayLocations(warehouseId, [{ productId, quantity }]);
  if (results.length === 0 || results[0].locations.length === 0) return null;
  return results[0].locations[0];
}
