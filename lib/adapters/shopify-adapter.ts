/**
 * Shopify 双向适配器 — OpenWMS ERP Adapter 模式移植
 *
 * 借鉴 OpenWMS 的独立适配器接口设计：
 *   importOrders / exportShipments / syncInventory 三向同步
 *
 * 原有 shopify.ts 保留作为底层 API 客户端，此模块作为上层适配器
 */

import { shopifyAPI } from "@/lib/shopify";
import { createServiceClient } from "@/lib/supabase";

// ==========================================
// OpenWMS 风格的适配器接口
// ==========================================

export interface ERPAdapter {
  /** 从平台导入订单 */
  importOrders(since?: Date): Promise<NormalizedOrder[]>;
  /** 发货信息回写平台 */
  exportShipment(orderId: string, trackingNumber: string, carrier: string, trackingUrl?: string): Promise<ExportResult>;
  /** 库存双向同步 */
  syncInventory(sku: string, quantity: number, warehouseId?: string): Promise<SyncResult>;
  /** 测试连接 */
  testConnection(): Promise<ConnectionTest>;
}

export interface NormalizedOrder {
  external_order_id: string;
  order_number: string;
  source: string;
  customer_name: string;
  customer_email: string;
  shipping_address_line1: string;
  shipping_city: string;
  shipping_state: string;
  shipping_zip: string;
  shipping_country: string;
  total_price: number;
  currency: string;
  created_at: string;
  line_items: { sku: string; name: string; quantity: number; price: number }[];
}

export interface ExportResult {
  success: boolean;
  fulfillmentId?: string;
  trackingNumber?: string;
  error?: string;
}

export interface SyncResult {
  success: boolean;
  previousQuantity?: number;
  newQuantity?: number;
  error?: string;
}

export interface ConnectionTest {
  success: boolean;
  shop?: string;
  plan?: string;
  error?: string;
}

export interface SyncLog {
  id: string;
  brand_user_id: string;
  platform: string;
  action: "import_orders" | "export_shipment" | "sync_inventory";
  status: "success" | "failed";
  details?: string;
  created_at: string;
}

// ==========================================
// Shopify 适配器实现
// ==========================================

export class ShopifyAdapter implements ERPAdapter {
  private shop: string;
  private accessToken: string;
  private brandUserId?: string;

  constructor(shop: string, accessToken: string, brandUserId?: string) {
    this.shop = shop;
    this.accessToken = accessToken;
    this.brandUserId = brandUserId;
  }

  // ---------- 导入订单（已有功能，标准化封装）----------
  async importOrders(since?: Date): Promise<NormalizedOrder[]> {
    let path = "orders.json?status=any&limit=250";
    if (since) path += `&updated_at_min=${since.toISOString()}`;

    const data = await shopifyAPI(this.shop, this.accessToken, path);
    const orders = (data.orders || []).map((o: any) => this.normalizeOrder(o));

    await this.logSync("import_orders", "success", `Imported ${orders.length} orders`);
    return orders;
  }

  // ---------- 回写发货信息 ⭐ 新增核心功能 ----------
  async exportShipment(
    orderId: string,
    trackingNumber: string,
    carrier: string,
    trackingUrl?: string
  ): Promise<ExportResult> {
    try {
      // 1. 获取 Shopify 订单的 fulfillment_orders
      const fulfillmentOrders = await shopifyAPI(
        this.shop,
        this.accessToken,
        `orders/${orderId}/fulfillment_orders.json`
      );

      const foList = fulfillmentOrders?.fulfillment_orders || [];
      if (foList.length === 0) {
        // fallback: 直接用 fulfillment API 创建
        await this.createFulfillmentLegacy(orderId, trackingNumber, carrier, trackingUrl);
        await this.logSync("export_shipment", "success", `Legacy fulfillment for #${orderId}`);
        return { success: true, trackingNumber };
      }

      // 2. 使用 Fulfillment Order API（Shopify 2023+ 推荐方式）
      const lineItemsByFO = foList.map((fo: any) => ({
        fulfillment_order_id: fo.id,
      }));

      const trackingInfo = {
        tracking_number: trackingNumber,
        tracking_company: carrier,
        ...(trackingUrl ? { tracking_url: trackingUrl } : {}),
      };

      const result = await shopifyAPI(this.shop, this.accessToken, "fulfillments.json", "POST", {
        fulfillment: {
          line_items_by_fulfillment_order: lineItemsByFO,
          tracking_info: trackingInfo,
          notify_customer: true,
        },
      });

      await this.logSync("export_shipment", "success", `Fulfilled #${orderId} → ${trackingNumber}`);
      return {
        success: true,
        fulfillmentId: result?.fulfillment?.id,
        trackingNumber,
      };
    } catch (e: any) {
      await this.logSync("export_shipment", "failed", e.message);
      return { success: false, error: e.message };
    }
  }

  /** Legacy fulfillment — 用于没有 fulfillment_orders 的旧订单 */
  private async createFulfillmentLegacy(
    orderId: string,
    trackingNumber: string,
    carrier: string,
    trackingUrl?: string
  ) {
    const trackingInfo: any = {
      tracking_number: trackingNumber,
      tracking_company: carrier,
    };
    if (trackingUrl) trackingInfo.tracking_url = trackingUrl;

    return shopifyAPI(this.shop, this.accessToken, `orders/${orderId}/fulfillments.json`, "POST", {
      fulfillment: {
        tracking_info: trackingInfo,
        notify_customer: true,
      },
    });
  }

  // ---------- 库存同步 ----------
  async syncInventory(sku: string, quantity: number): Promise<SyncResult> {
    try {
      // 获取 inventory_item_id
      const variantData = await shopifyAPI(
        this.shop,
        this.accessToken,
        `variants.json?sku=${encodeURIComponent(sku)}`
      );

      const variant = variantData?.variants?.[0];
      if (!variant) {
        return { success: false, error: `SKU not found: ${sku}` };
      }

      const inventoryItemId = variant.inventory_item_id;
      const locationData = await shopifyAPI(this.shop, this.accessToken, "locations.json");
      const locationId = locationData?.locations?.[0]?.id;

      if (!locationId) {
        return { success: false, error: "No location found" };
      }

      // 获取当前库存
      const currentData = await shopifyAPI(
        this.shop,
        this.accessToken,
        `inventory_levels.json?inventory_item_ids=${inventoryItemId}&location_ids=${locationId}`
      );

      const previousQuantity = currentData?.inventory_levels?.[0]?.available || 0;

      // 设置新库存
      await shopifyAPI(this.shop, this.accessToken, "inventory_levels/set.json", "POST", {
        location_id: locationId,
        inventory_item_id: inventoryItemId,
        available: quantity,
      });

      await this.logSync("sync_inventory", "success", `${sku}: ${previousQuantity} → ${quantity}`);
      return { success: true, previousQuantity, newQuantity: quantity };
    } catch (e: any) {
      await this.logSync("sync_inventory", "failed", e.message);
      return { success: false, error: e.message };
    }
  }

  // ---------- 连接测试 ----------
  async testConnection(): Promise<ConnectionTest> {
    try {
      const data = await shopifyAPI(this.shop, this.accessToken, "shop.json") as any;
      return { success: true, shop: data?.shop?.name, plan: data?.shop?.plan_name };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }

  // ---------- 工具方法 ----------
  private normalizeOrder(shopifyOrder: any): NormalizedOrder {
    const addr = shopifyOrder.shipping_address || {};
    return {
      external_order_id: String(shopifyOrder.id),
      order_number: shopifyOrder.name || `#${shopifyOrder.order_number}`,
      source: "shopify",
      customer_name: `${addr.first_name || ""} ${addr.last_name || ""}`.trim(),
      customer_email: shopifyOrder.email || shopifyOrder.customer?.email || "",
      shipping_address_line1: addr.address1 || "",
      shipping_city: addr.city || "",
      shipping_state: addr.province_code || addr.province || "",
      shipping_zip: addr.zip || "",
      shipping_country: addr.country_code || "US",
      total_price: parseFloat(shopifyOrder.total_price || "0"),
      currency: shopifyOrder.currency || "USD",
      created_at: shopifyOrder.created_at,
      line_items: (shopifyOrder.line_items || []).map((li: any) => ({
        sku: li.sku || "",
        name: li.name || li.title || "",
        quantity: li.quantity || 1,
        price: parseFloat(li.price || "0"),
      })),
    };
  }

  private async logSync(
    action: SyncLog["action"],
    status: SyncLog["status"],
    details?: string
  ) {
    if (!this.brandUserId) return;

    try {
      const supabase = createServiceClient();
      if (!supabase) return;

      await supabase.from("brand_sync_logs").insert({
        brand_user_id: this.brandUserId,
        platform: "shopify",
        action,
        status,
        details,
      });
    } catch {
      // 日志失败不阻断主流程
    }
  }
}

// ==========================================
// 从数据库恢复适配器实例
// ==========================================

export async function createAdapterFromDB(
  brandUserId: string
): Promise<ShopifyAdapter | null> {
  const supabase = createServiceClient();
  if (!supabase) return null;

  const { data } = await supabase
    .from("brand_integration_connections")
    .select("*")
    .eq("brand_user_id", brandUserId)
    .eq("platform_name", "shopify")
    .eq("is_active", true)
    .single();

  if (!data?.credentials?.shop || !data?.credentials?.access_token) return null;

  return new ShopifyAdapter(data.credentials.shop, data.credentials.access_token, brandUserId);
}
