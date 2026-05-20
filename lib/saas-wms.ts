/**
 * Flowrid SaaS — WMS Core Engine
 *
 * 仓库管理核心：入库 → 上架 → 库存 → 拣货 → 打包 → 发货
 */

import { createServerClient } from "./supabase";
import type { Order, OrderItem, Inventory, PickTask, PickItem, Package, Shipment, ReceivingOrder } from "@/types/saas";

// ==========================================
// INVENTORY — 库存操作
// ==========================================

export async function getInventory(warehouseId: string) {
  const supabase = createServerClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("inventory")
    .select("*, products(name, sku, image_url)")
    .eq("warehouse_id", warehouseId)
    .gt("quantity_on_hand", 0)
    .order("quantity_on_hand", { ascending: false });
  return data || [];
}

export async function allocateInventory(orderId: string) {
  const supabase = createServerClient();
  if (!supabase) return;

  // 获取订单项
  const { data: items } = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", orderId);

  if (!items) return;

  for (const item of items) {
    // 找可用库存（FIFO: 先过期先出）
    const { data: stock } = await supabase
      .from("inventory")
      .select("*")
      .eq("product_id", item.product_id)
      .gt("quantity_available", 0)
      .order("expiration_date", { ascending: true, nullsFirst: false })
      .order("received_date", { ascending: true })
      .limit(1);

    if (!stock || stock.length === 0) {
      throw new Error(`Insufficient inventory for SKU ${item.sku}`);
    }

    const allocation = Math.min(item.quantity_ordered, stock[0].quantity_available);

    // 扣减库存（分配）
    await supabase
      .from("inventory")
      .update({ quantity_allocated: stock[0].quantity_allocated + allocation })
      .eq("id", stock[0].id);
  }

  // 更新订单状态
  await supabase.from("orders").update({ status: "allocated" }).eq("id", orderId);
}

// ==========================================
// PICKING — 智能拣货
// ==========================================

export async function createPickTask(
  warehouseId: string,
  tenantId: string,
  pickType: "single" | "batch" | "wave" = "single",
  orderIds?: string[]
) {
  const supabase = createServerClient();
  if (!supabase) return null;

  // 获取待拣货的订单
  let query = supabase
    .from("orders")
    .select("id")
    .eq("warehouse_id", warehouseId)
    .eq("status", "allocated");

  if (orderIds && orderIds.length > 0) {
    query = query.in("id", orderIds);
  }

  const { data: orders } = await query;
  if (!orders || orders.length === 0) return null;

  // 创建拣货任务
  const { data: task } = await supabase
    .from("pick_tasks")
    .insert({
      tenant_id: tenantId,
      warehouse_id: warehouseId,
      pick_type: pickType,
      status: "pending",
    })
    .select()
    .single();

  if (!task) return null;

  // 生成拣货清单（按库位优化路径）
  for (const order of orders) {
    const { data: orderItems } = await supabase
      .from("order_items")
      .select("*, inventory!inner(location_id)")
      .eq("order_id", order.id)
      .gt("quantity_ordered", 0);

    if (!orderItems) continue;

    const pickItems = orderItems.map((oi: { id: string; product_id: string; quantity_ordered: number; inventory: { location_id: string }[] }) => ({
      pick_task_id: task.id,
      order_item_id: oi.id,
      product_id: oi.product_id,
      location_id: oi.inventory?.[0]?.location_id,
      quantity_to_pick: oi.quantity_ordered,
    }));

    await supabase.from("pick_items").insert(pickItems);

    // 标记订单为拣货中
    await supabase.from("orders").update({ status: "picking" }).eq("id", order.id);
  }

  return task;
}

export async function completePickTask(taskId: string) {
  const supabase = createServerClient();
  if (!supabase) return;

  await supabase
    .from("pick_tasks")
    .update({ status: "complete", completed_at: new Date().toISOString() })
    .eq("id", taskId);

  await supabase
    .from("pick_items")
    .update({ status: "picked", quantity_picked: 0, picked_at: new Date().toISOString() })
    .eq("pick_task_id", taskId);
}

export async function confirmPickItem(pickItemId: string, quantityPicked: number) {
  const supabase = createServerClient();
  if (!supabase) return null;

  const { data: item, error } = await supabase
    .from("pick_items")
    .update({
      status: "picked",
      quantity_picked: quantityPicked,
      picked_at: new Date().toISOString(),
    })
    .eq("id", pickItemId)
    .select("pick_task_id, order_item_id, product_id")
    .single();

  if (error || !item) return null;

  // Update the order_item quantity_picked
  const { data: oi } = await supabase
    .from("order_items")
    .select("quantity_picked")
    .eq("id", item.order_item_id)
    .single();

  if (oi) {
    await supabase
      .from("order_items")
      .update({ quantity_picked: (oi.quantity_picked || 0) + quantityPicked })
      .eq("id", item.order_item_id);
  }

  // Check if all items in the task are done
  const { data: remaining } = await supabase
    .from("pick_items")
    .select("id")
    .eq("pick_task_id", item.pick_task_id)
    .neq("status", "picked");

  const remainingItems = remaining?.length || 0;

  // Auto-complete task if nothing left
  if (remainingItems === 0) {
    await supabase
      .from("pick_tasks")
      .update({ status: "complete", completed_at: new Date().toISOString() })
      .eq("id", item.pick_task_id);
  }

  return { taskComplete: remainingItems === 0, remainingItems };
}

// ==========================================
// PACKING — 打包
// ==========================================

export async function createPackage(
  orderId: string,
  tenantId: string,
  pkgData: { carrier: string; service_level: string; weight_lbs: number; length_in: number; width_in: number; height_in: number }
) {
  const supabase = createServerClient();
  if (!supabase) return null;

  const { data: pkg } = await supabase
    .from("packages")
    .insert({
      tenant_id: tenantId,
      order_id: orderId,
      carrier: pkgData.carrier,
      service_level: pkgData.service_level,
      weight_lbs: pkgData.weight_lbs,
      length_in: pkgData.length_in,
      width_in: pkgData.width_in,
      height_in: pkgData.height_in,
      status: "created",
    })
    .select()
    .single();

  // 关联订单项到包裹
  if (pkg) {
    const { data: items } = await supabase
      .from("order_items")
      .select("id")
      .eq("order_id", orderId);

    if (items) {
      await supabase.from("package_items").insert(
        items.map((i: { id: string }) => ({
          package_id: pkg.id,
          order_item_id: i.id,
          quantity: 1,
        }))
      );
    }

    // 更新订单状态
    await supabase.from("orders").update({ status: "packed" }).eq("id", orderId);
  }

  return pkg;
}

// ==========================================
// SHIPPING — 发货 + 标签生成
// ==========================================

export async function createShipment(
  orderId: string,
  tenantId: string,
  packageId: string,
  shipmentData: { carrier: string; service_level: string; tracking_number: string; shipping_cost: number; label_url: string }
) {
  const supabase = createServerClient();
  if (!supabase) return null;

  const { data: shipment } = await supabase
    .from("shipments")
    .insert({
      tenant_id: tenantId,
      order_id: orderId,
      package_id: packageId,
      carrier: shipmentData.carrier,
      service_level: shipmentData.service_level,
      tracking_number: shipmentData.tracking_number,
      shipping_cost: shipmentData.shipping_cost,
      label_url: shipmentData.label_url,
      status: "shipped",
    })
    .select()
    .single();

  // 更新订单和包裹状态
  await supabase.from("orders").update({ status: "shipped" }).eq("id", orderId);
  await supabase
    .from("packages")
    .update({ tracking_number: shipmentData.tracking_number, label_url: shipmentData.label_url, status: "shipped" })
    .eq("id", packageId);

  // 核减库存
  const { data: items } = await supabase.from("order_items").select("*").eq("order_id", orderId);
  if (items) {
    for (const item of items) {
      await supabase.rpc("decrease_inventory", {
        p_product_id: item.product_id,
        p_warehouse_id: null, // 需要从 order 获取
        p_quantity: item.quantity_ordered,
      });
    }
  }

  return shipment;
}

// ==========================================
// RECEIVING — 入库接收
// ==========================================

export async function receiveInventory(
  receivingId: string,
  tenantId: string,
  warehouseId: string,
  items: { product_id: string; quantity_received: number; location_id?: string; lot_number?: string; expiration_date?: string }[]
) {
  const supabase = createServerClient();
  if (!supabase) return;

  for (const item of items) {
    // 更新入库单项
    await supabase
      .from("receiving_items")
      .update({ quantity_received: item.quantity_received })
      .eq("receiving_id", receivingId)
      .eq("product_id", item.product_id);

    // 更新或插入库存记录
    const { data: existing } = await supabase
      .from("inventory")
      .select("id, quantity_on_hand, location_id")
      .eq("product_id", item.product_id)
      .eq("warehouse_id", warehouseId)
      .eq("lot_number", item.lot_number || "")
      .single();

    if (existing) {
      await supabase
        .from("inventory")
        .update({
          quantity_on_hand: existing.quantity_on_hand + item.quantity_received,
          location_id: item.location_id || existing.location_id,
          last_updated: new Date().toISOString(),
        })
        .eq("id", existing.id);
    } else {
      await supabase.from("inventory").insert({
        product_id: item.product_id,
        warehouse_id: warehouseId,
        location_id: item.location_id,
        quantity_on_hand: item.quantity_received,
        lot_number: item.lot_number,
        expiration_date: item.expiration_date,
        received_date: new Date().toISOString().split("T")[0],
      });
    }
  }

  // 更新入库单状态
  await supabase
    .from("receiving_orders")
    .update({ status: "complete", received_date: new Date().toISOString() })
    .eq("id", receivingId);
}

// ==========================================
// UCC-128 / GS1-128 标签生成
// ==========================================

export function generateUCC128Label(
  companyPrefix: string,
  asn: string,
  cartonNumber: number,
  totalCartons: number
): string {
  // GS1 Application Identifier 格式
  // (00) = SSCC-18 序列号
  const sscc = `${companyPrefix}${asn.padStart(9, "0")}${cartonNumber.toString().padStart(7, "0")}`;
  const checkDigit = calculateCheckDigit(sscc);

  return JSON.stringify({
    barcode: `(00)${sscc}${checkDigit}`,
    human_readable: `SSCC: ${sscc}${checkDigit}`,
    carton: `${cartonNumber} of ${totalCartons}`,
  });
}

function calculateCheckDigit(code: string): number {
  let sum = 0;
  for (let i = 0; i < code.length; i++) {
    sum += parseInt(code[i]) * (i % 2 === 0 ? 3 : 1);
  }
  return (10 - (sum % 10)) % 10;
}
