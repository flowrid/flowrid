/**
 * 仓储事件引擎 — OpenWMS 事件总线模式移植
 *
 * 借鉴 OpenWMS 的 RabbitMQ + Orchestrator 模式：
 *   事件发生 → 事件总线 → 订阅者自动处理
 *
 * Flowrid 实现：数据库状态变更 → 事件链配置 → 依次执行副作用
 * 无需 RabbitMQ，用 Supabase 数据库触发器 + 同步事件链
 */

import { createServiceClient } from "@/lib/supabase";
import { createAdapterFromDB } from "@/lib/adapters/shopify-adapter";

// ==========================================
// 事件类型定义（对照 OpenWMS 的事件命名）
// ==========================================

export type WarehouseEvent =
  | "receiving.completed"      // 收货完成 → OpenWMS: GoodsReceived
  | "inventory.updated"        // 库存变更
  | "pick.completed"           // 拣货完成
  | "shipping.dispatched"      // 发货 → OpenWMS: GoodsShipped
  | "returns.received"         // 退货收到 → OpenWMS: GoodsReturned
  | "order.status_changed";    // 订单状态变更

export interface EventPayload {
  event: WarehouseEvent;
  tenantId: string;
  entityId: string;
  data: Record<string, any>;
  timestamp: string;
}

export type EventAction =
  | "inventory.update_quantity"
  | "order.update_status"
  | "notification.create"
  | "shopify.export_shipment"
  | "shopify.sync_inventory"
  | "qc.create_task"
  | "brand.notify";

export interface EventChain {
  event: WarehouseEvent;
  actions: EventAction[];
}

// ==========================================
// 事件链配置（OpenWMS 的事件订阅映射）
// ==========================================

export const WAREHOUSE_EVENT_CHAINS: EventChain[] = [
  {
    event: "receiving.completed",
    actions: [
      "inventory.update_quantity",   // 自动更新库存数量
      "notification.create",         // 通知仓库主管
    ],
  },
  {
    event: "shipping.dispatched",
    actions: [
      "order.update_status",         // 订单 → shipped
      "brand.notify",                // 通知 Brand
      "shopify.export_shipment",     // 回写 Shopify
    ],
  },
  {
    event: "returns.received",
    actions: [
      "qc.create_task",              // 创建质检任务
      "inventory.update_quantity",   // 调整库存
    ],
  },
  {
    event: "pick.completed",
    actions: [
      "order.update_status",         // 订单 → packed
    ],
  },
];

// ==========================================
// 事件执行引擎
// ==========================================

export async function executeEventChain(payload: EventPayload): Promise<{
  executed: EventAction[];
  errors: string[];
}> {
  const chain = WAREHOUSE_EVENT_CHAINS.find((c) => c.event === payload.event);
  if (!chain) return { executed: [], errors: [] };

  const executed: EventAction[] = [];
  const errors: string[] = [];

  for (const action of chain.actions) {
    try {
      await executeAction(action, payload);
      executed.push(action);
    } catch (e: any) {
      errors.push(`${action}: ${e.message}`);
    }
  }

  return { executed, errors };
}

// ==========================================
// 各 Action 的实现
// ==========================================

async function executeAction(action: EventAction, payload: EventPayload) {
  const supabase = createServiceClient();
  if (!supabase) throw new Error("Database unavailable");

  switch (action) {
    // --- 自动更新库存 ---
    case "inventory.update_quantity": {
      const { sku, quantity_change, warehouse_id } = payload.data;
      if (!sku || quantity_change === undefined) return;

      let query = supabase.from("inventory").select("*").eq("sku", sku);
      if (warehouse_id) query = query.eq("warehouse_id", warehouse_id);
      const { data: items } = await query;

      if (items && items.length > 0) {
        for (const item of items) {
          const newQty = Math.max(0, (item.quantity_on_hand || 0) + quantity_change);
          await supabase
            .from("inventory")
            .update({ quantity_on_hand: newQty, quantity_available: newQty, updated_at: new Date().toISOString() })
            .eq("id", item.id);
        }
      }
      break;
    }

    // --- 自动更新订单状态 ---
    case "order.update_status": {
      const { new_status } = payload.data;
      if (!new_status) return;

      await supabase
        .from("orders")
        .update({ status: new_status, updated_at: new Date().toISOString() })
        .eq("id", payload.entityId);
      break;
    }

    // --- 创建通知 ---
    case "notification.create": {
      const { title, body, type, user_id } = payload.data;
      if (!title) return;

      await supabase.from("notifications").insert({
        user_id: user_id || null,
        tenant_id: payload.tenantId,
        title,
        body: body || "",
        type: type || "info",
        category: payload.event,
        is_read: false,
      });
      break;
    }

    // --- 通知 Brand ---
    case "brand.notify": {
      const { brand_user_id, order_number, tracking_number } = payload.data;
      if (!brand_user_id) return;

      await supabase.from("notifications").insert({
        user_id: brand_user_id,
        title: `Order ${order_number || payload.entityId} has shipped!`,
        body: tracking_number ? `Tracking: ${tracking_number}` : "Your order is on the way.",
        type: "success",
        category: "order_shipped",
        is_read: false,
      });
      break;
    }

    // --- Shopify 回写发货 ---
    case "shopify.export_shipment": {
      const { brand_user_id, shopify_order_id, tracking_number, carrier } = payload.data;
      if (!shopify_order_id || !tracking_number) return;

      // 从数据库恢复适配器
      const adapter = await createAdapterFromDB(brand_user_id || payload.tenantId);
      if (!adapter) return; // 未连接 Shopify，静默跳过

      await adapter.exportShipment(
        shopify_order_id,
        tracking_number,
        carrier || "UPS",
      );
      break;
    }

    // --- Shopify 库存同步 ---
    case "shopify.sync_inventory": {
      const { brand_user_id, sku, quantity } = payload.data;
      if (!sku || quantity === undefined) return;

      const adapter = await createAdapterFromDB(brand_user_id || payload.tenantId);
      if (!adapter) return;

      await adapter.syncInventory(sku, quantity);
      break;
    }

    // --- 创建质检任务 ---
    case "qc.create_task": {
      const { return_id, warehouse_id } = payload.data;
      await supabase.from("qc_tasks").insert({
        tenant_id: payload.tenantId,
        entity_type: "return",
        entity_id: payload.entityId,
        warehouse_id: warehouse_id || null,
        status: "pending",
      });
      break;
    }

    default:
      break;
  }
}

// ==========================================
// 便捷触发函数 — 在关键操作点调用
// ==========================================

export async function triggerWarehouseEvent(
  event: WarehouseEvent,
  tenantId: string,
  entityId: string,
  data: Record<string, any> = {}
) {
  const payload: EventPayload = {
    event,
    tenantId,
    entityId,
    data,
    timestamp: new Date().toISOString(),
  };

  // 异步执行，不阻塞主操作
  executeEventChain(payload).catch((e) => {
    console.error(`[WarehouseEvents] ${event} failed:`, e);
  });
}
