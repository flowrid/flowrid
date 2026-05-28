// 库存转移引擎 — Inventory Transfer Engine
// 仓库间调拨 + 库位间移动

import { createServiceClient } from "@/lib/supabase";

export interface TransferRequest {
  fromWarehouseId: string;
  toWarehouseId: string;
  items: { productId: string; quantity: number; fromLocationId?: string; toLocationId?: string }[];
  reason?: string;
  referenceNumber?: string;
}

export interface TransferResult {
  transferId: string;
  referenceNumber: string;
  status: "completed" | "partial" | "failed";
  items: { productId: string; quantity: number; status: "transferred" | "insufficient" | "error"; error?: string }[];
}

/**
 * 执行库存转移
 */
export async function executeTransfer(
  tenantId: string,
  userId: string,
  req: TransferRequest
): Promise<TransferResult> {
  const supabase = createServiceClient();
  const refNumber = req.referenceNumber || `TRF-${Date.now()}`;
  const results: TransferResult["items"] = [];
  let overallStatus: TransferResult["status"] = "completed";

  if (!supabase) {
    return { transferId: "", referenceNumber: refNumber, status: "failed", items: [] };
  }

  // 创建转移记录
  const { data: transfer } = await supabase
    .from("inventory_transfers")
    .insert({
      tenant_id: tenantId,
      from_warehouse_id: req.fromWarehouseId,
      to_warehouse_id: req.toWarehouseId,
      reference_number: refNumber,
      reason: req.reason || null,
      status: "in_progress",
      initiated_by: userId,
    })
    .select("id")
    .single();

  const transferId = (transfer as any)?.id;
  if (!transferId) return { transferId: "", referenceNumber: refNumber, status: "failed", items: [] };

  for (const item of req.items) {
    try {
      // 检查源库存
      let invQuery = supabase
        .from("inventory")
        .select("id, quantity_on_hand, quantity_available")
        .eq("product_id", item.productId)
        .eq("warehouse_id", req.fromWarehouseId)
        .gt("quantity_available", 0);

      if (item.fromLocationId) invQuery = invQuery.eq("location_id", item.fromLocationId);

      const { data: sourceInv } = await invQuery;

      if (!sourceInv?.length) {
        results.push({ productId: item.productId, quantity: item.quantity, status: "insufficient", error: "No available inventory at source" });
        overallStatus = "partial";
        continue;
      }

      // 按顺序扣减
      let remaining = item.quantity;
      for (const src of sourceInv) {
        if (remaining <= 0) break;
        const deduct = Math.min(remaining, (src as any).quantity_available);
        await supabase
          .from("inventory")
          .update({
            quantity_on_hand: (src as any).quantity_on_hand - deduct,
            quantity_available: (src as any).quantity_available - deduct,
            updated_at: new Date().toISOString(),
          })
          .eq("id", (src as any).id);

        // 目标仓库加库存
        const { data: targetInv } = await supabase
          .from("inventory")
          .select("id, quantity_on_hand, quantity_available")
          .eq("product_id", item.productId)
          .eq("warehouse_id", req.toWarehouseId)
          .eq("location_id", item.toLocationId || (src as any).location_id)
          .limit(1);

        if (targetInv?.length) {
          await supabase
            .from("inventory")
            .update({
              quantity_on_hand: (targetInv[0] as any).quantity_on_hand + deduct,
              quantity_available: (targetInv[0] as any).quantity_available + deduct,
              updated_at: new Date().toISOString(),
            })
            .eq("id", (targetInv[0] as any).id);
        } else {
          // 新建库存记录
          await supabase.from("inventory").insert({
            tenant_id: tenantId,
            product_id: item.productId,
            warehouse_id: req.toWarehouseId,
            location_id: item.toLocationId,
            quantity_on_hand: deduct,
            quantity_available: deduct,
          });
        }

        remaining -= deduct;
      }

      const itemStatus = remaining > 0 ? "insufficient" : "transferred";
      if (itemStatus === "insufficient") overallStatus = "partial";
      results.push({
        productId: item.productId,
        quantity: item.quantity - remaining,
        status: itemStatus,
        error: itemStatus === "insufficient" ? `Short ${remaining} units` : undefined,
      });
    } catch (err: any) {
      results.push({ productId: item.productId, quantity: 0, status: "error", error: err.message });
      overallStatus = "partial";
    }
  }

  // 更新转移记录状态
  await supabase
    .from("inventory_transfers")
    .update({ status: overallStatus, completed_at: new Date().toISOString() })
    .eq("id", transferId);

  return { transferId, referenceNumber: refNumber, status: overallStatus, items: results };
}

/**
 * 库位间移动 — 同一仓库内移动
 */
export async function moveBetweenLocations(
  warehouseId: string,
  productId: string,
  quantity: number,
  fromLocationId: string,
  toLocationId: string
): Promise<{ success: boolean; moved: number }> {
  const supabase = createServiceClient();
  if (!supabase) return { success: false, moved: 0 };

  const { data: source } = await supabase
    .from("inventory")
    .select("id, quantity_available")
    .eq("product_id", productId)
    .eq("warehouse_id", warehouseId)
    .eq("location_id", fromLocationId)
    .single();

  if (!source) return { success: false, moved: 0 };

  const moveQty = Math.min(quantity, (source as any).quantity_available);

  // 扣减源库位
  await supabase
    .from("inventory")
    .update({
      quantity_on_hand: (source as any).quantity_on_hand - moveQty,
      quantity_available: (source as any).quantity_available - moveQty,
    })
    .eq("id", (source as any).id);

  // 增加目标库位
  const { data: target } = await supabase
    .from("inventory")
    .select("id, quantity_on_hand, quantity_available")
    .eq("product_id", productId)
    .eq("warehouse_id", warehouseId)
    .eq("location_id", toLocationId)
    .single();

  if (target) {
    await supabase
      .from("inventory")
      .update({
        quantity_on_hand: (target as any).quantity_on_hand + moveQty,
        quantity_available: (target as any).quantity_available + moveQty,
      })
      .eq("id", (target as any).id);
  }

  return { success: true, moved: moveQty };
}
