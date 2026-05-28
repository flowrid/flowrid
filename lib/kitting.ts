// Kitting / 组装引擎 — Kit Assembly Engine
// 管理组合产品 (Bundle/Kit)，自动扣除组件库存

import { createServiceClient } from "@/lib/supabase";

export interface KitComponent {
  productId: string;
  sku: string;
  name: string;
  quantityPerKit: number;
}

export interface KitDefinition {
  id: string;
  kitProductId: string;
  kitSku: string;
  kitName: string;
  components: KitComponent[];
  laborCost?: number;
  instructions?: string;
  isActive: boolean;
}

/**
 * 获取一个 Kit 的定义及其组件
 */
export async function getKitDefinition(
  tenantId: string,
  kitProductId: string
): Promise<KitDefinition | null> {
  const supabase = createServiceClient();
  if (!supabase) return null;

  const { data: kit } = await supabase
    .from("kits")
    .select("*, kit_components(*, products(sku, name))")
    .eq("tenant_id", tenantId)
    .eq("kit_product_id", kitProductId)
    .eq("is_active", true)
    .single();

  if (!kit) return null;

  const k = kit as any;
  return {
    id: k.id,
    kitProductId: k.kit_product_id,
    kitSku: k.products?.sku || "",
    kitName: k.products?.name || "",
    components: (k.kit_components || []).map((c: any) => ({
      productId: c.component_product_id,
      sku: c.products?.sku || "",
      name: c.products?.name || "",
      quantityPerKit: c.quantity_per_kit,
    })),
    laborCost: k.labor_cost,
    instructions: k.instructions,
    isActive: k.is_active,
  };
}

/**
 * 组装 Kit — 消耗组件库存，增加 Kit 成品库存
 */
export async function assembleKit(
  tenantId: string,
  warehouseId: string,
  kitProductId: string,
  quantity: number,
  targetLocationId?: string
): Promise<{ success: boolean; message: string }> {
  const supabase = createServiceClient();
  if (!supabase) return { success: false, message: "Database unavailable" };

  const kit = await getKitDefinition(tenantId, kitProductId);
  if (!kit) return { success: false, message: "Kit definition not found" };

  // 检查所有组件的库存
  for (const comp of kit.components) {
    const { data: inv } = await supabase
      .from("inventory")
      .select("quantity_available")
      .eq("product_id", comp.productId)
      .eq("warehouse_id", warehouseId)
      .gt("quantity_available", 0);

    const totalAvailable = (inv || []).reduce((s: number, i: any) => s + i.quantity_available, 0);
    const needed = comp.quantityPerKit * quantity;

    if (totalAvailable < needed) {
      return { success: false, message: `Insufficient ${comp.name || comp.sku} — need ${needed}, have ${totalAvailable}` };
    }
  }

  // 扣除组件
  for (const comp of kit.components) {
    let remaining = comp.quantityPerKit * quantity;
    const { data: invBatch } = await supabase
      .from("inventory")
      .select("*")
      .eq("product_id", comp.productId)
      .eq("warehouse_id", warehouseId)
      .gt("quantity_available", 0)
      .order("received_date", { ascending: true });

    for (const inv of invBatch || []) {
      if (remaining <= 0) break;
      const deduct = Math.min(remaining, (inv as any).quantity_available);
      await supabase
        .from("inventory")
        .update({
          quantity_available: (inv as any).quantity_available - deduct,
          quantity_on_hand: (inv as any).quantity_on_hand - deduct,
        })
        .eq("id", (inv as any).id);
      remaining -= deduct;
    }
  }

  // 增加 Kit 成品库存
  const { data: kitInv } = await supabase
    .from("inventory")
    .select("id, quantity_on_hand, quantity_available")
    .eq("product_id", kitProductId)
    .eq("warehouse_id", warehouseId)
    .eq("location_id", targetLocationId || "")
    .limit(1);

  if (kitInv?.length) {
    await supabase
      .from("inventory")
      .update({
        quantity_on_hand: (kitInv[0] as any).quantity_on_hand + quantity,
        quantity_available: (kitInv[0] as any).quantity_available + quantity,
      })
      .eq("id", (kitInv[0] as any).id);
  } else {
    await supabase.from("inventory").insert({
      tenant_id: tenantId,
      product_id: kitProductId,
      warehouse_id: warehouseId,
      location_id: targetLocationId,
      quantity_on_hand: quantity,
      quantity_available: quantity,
    });
  }

  // 记录组装日志
  await supabase.from("kit_assembly_logs").insert({
    tenant_id: tenantId,
    warehouse_id: warehouseId,
    kit_product_id: kitProductId,
    quantity,
    components_snapshot: JSON.stringify(kit.components),
  });

  return { success: true, message: `Assembled ${quantity} kits` };
}

/**
 * 拆解 Kit — 逆向：回收组件，减少 Kit 成品
 */
export async function disassembleKit(
  tenantId: string,
  warehouseId: string,
  kitProductId: string,
  quantity: number
): Promise<{ success: boolean; message: string }> {
  const supabase = createServiceClient();
  if (!supabase) return { success: false, message: "Database unavailable" };

  const kit = await getKitDefinition(tenantId, kitProductId);
  if (!kit) return { success: false, message: "Kit definition not found" };

  // 检查 Kit 成品库存
  const { data: kitInv } = await supabase
    .from("inventory")
    .select("quantity_available")
    .eq("product_id", kitProductId)
    .eq("warehouse_id", warehouseId)
    .gt("quantity_available", 0);

  const available = (kitInv || []).reduce((s: number, i: any) => s + i.quantity_available, 0);
  if (available < quantity) {
    return { success: false, message: `Not enough kits — have ${available}, need ${quantity}` };
  }

  // 减少 Kit 成品
  let remaining = quantity;
  for (const inv of kitInv || []) {
    if (remaining <= 0) break;
    const deduct = Math.min(remaining, (inv as any).quantity_available);
    await supabase
      .from("inventory")
      .update({
        quantity_available: (inv as any).quantity_available - deduct,
        quantity_on_hand: (inv as any).quantity_on_hand - deduct,
      })
      .eq("id", (inv as any).id);
    remaining -= deduct;
  }

  // 回收组件
  for (const comp of kit.components) {
    const qty = comp.quantityPerKit * quantity;
    const { data: compInv } = await supabase
      .from("inventory")
      .select("id, quantity_on_hand, quantity_available")
      .eq("product_id", comp.productId)
      .eq("warehouse_id", warehouseId)
      .limit(1);

    if (compInv?.length) {
      await supabase
        .from("inventory")
        .update({
          quantity_on_hand: (compInv[0] as any).quantity_on_hand + qty,
          quantity_available: (compInv[0] as any).quantity_available + qty,
        })
        .eq("id", (compInv[0] as any).id);
    }
  }

  return { success: true, message: `Disassembled ${quantity} kits` };
}
