/**
 * Flowrid SaaS — Integration Hub
 *
 * 对标 Extensiv Integration Manager (CartRover)
 * 连接电商平台 → WMS → 物流，自动同步订单/库存/发货
 */

import type { IntegrationConnection, PlatformType, Order, OrderItem } from "@/types/saas";

// ==========================================
// 支持的平台目录
// ==========================================

export const PLATFORM_CATALOG: Record<PlatformType, {
  name: string;
  type: PlatformType;
  icon: string;
  supports: ("order_import" | "inventory_export" | "shipment_update" | "product_sync")[];
  authType: "oauth" | "api_key" | "basic" | "ftp" | "edi";
}[]> = {
  shopping_cart: [
    { name: "Shopify", type: "shopping_cart", icon: "shopify", supports: ["order_import", "inventory_export", "shipment_update", "product_sync"], authType: "oauth" },
    { name: "WooCommerce", type: "shopping_cart", icon: "woocommerce", supports: ["order_import", "inventory_export", "product_sync"], authType: "api_key" },
    { name: "BigCommerce", type: "shopping_cart", icon: "bigcommerce", supports: ["order_import", "inventory_export", "shipment_update"], authType: "api_key" },
    { name: "Magento", type: "shopping_cart", icon: "magento", supports: ["order_import", "inventory_export", "shipment_update", "product_sync"], authType: "api_key" },
    { name: "CrateJoy", type: "shopping_cart", icon: "cratejoy", supports: ["order_import"], authType: "api_key" },
    { name: "Squarespace", type: "shopping_cart", icon: "squarespace", supports: ["order_import"], authType: "api_key" },
  ],
  marketplace: [
    { name: "Amazon Seller Central", type: "marketplace", icon: "amazon", supports: ["order_import", "inventory_export", "shipment_update", "product_sync"], authType: "oauth" },
    { name: "Amazon MCF", type: "marketplace", icon: "amazon", supports: ["order_import", "shipment_update"], authType: "oauth" },
    { name: "eBay", type: "marketplace", icon: "ebay", supports: ["order_import", "shipment_update"], authType: "oauth" },
    { name: "Walmart Marketplace", type: "marketplace", icon: "walmart", supports: ["order_import", "inventory_export", "shipment_update"], authType: "api_key" },
    { name: "Etsy", type: "marketplace", icon: "etsy", supports: ["order_import"], authType: "oauth" },
    { name: "Wayfair", type: "marketplace", icon: "wayfair", supports: ["order_import", "shipment_update"], authType: "api_key" },
    { name: "Wish", type: "marketplace", icon: "wish", supports: ["order_import"], authType: "api_key" },
  ],
  erp: [
    { name: "NetSuite", type: "erp", icon: "netsuite", supports: ["order_import", "inventory_export", "product_sync"], authType: "oauth" },
    { name: "QuickBooks", type: "erp", icon: "quickbooks", supports: ["order_import", "inventory_export"], authType: "oauth" },
  ],
  oms: [
    { name: "ChannelAdvisor", type: "oms", icon: "channeladvisor", supports: ["order_import", "inventory_export"], authType: "api_key" },
    { name: "TradeGecko", type: "oms", icon: "tradegecko", supports: ["order_import", "inventory_export"], authType: "api_key" },
  ],
  wms: [
    { name: "Flowrid WMS", type: "wms", icon: "flowrid", supports: ["order_import", "shipment_update", "product_sync"], authType: "api_key" },
    { name: "Deposco", type: "wms", icon: "deposco", supports: ["order_import", "shipment_update"], authType: "api_key" },
  ],
  shipping: [
    { name: "ShipStation", type: "shipping", icon: "shipstation", supports: ["shipment_update"], authType: "api_key" },
    { name: "Shippo", type: "shipping", icon: "shippo", supports: ["shipment_update"], authType: "api_key" },
    { name: "DesktopShipper", type: "shipping", icon: "desktopshipper", supports: ["shipment_update"], authType: "api_key" },
  ],
  edi: [
    { name: "SPS Commerce", type: "edi", icon: "sps", supports: ["order_import", "shipment_update"], authType: "edi" },
    { name: "CommerceHub", type: "edi", icon: "commercehub", supports: ["order_import", "shipment_update"], authType: "edi" },
  ],
  crm: [
    { name: "Salesforce", type: "crm", icon: "salesforce", supports: ["order_import"], authType: "oauth" },
  ],
  pos: [
    { name: "Lightspeed", type: "pos", icon: "lightspeed", supports: ["order_import", "inventory_export"], authType: "oauth" },
  ],
  custom: [],
};

// 总计支持平台数
export const TOTAL_PLATFORMS = Object.values(PLATFORM_CATALOG).flat().length;

// ==========================================
// 数据标准化引擎
// ==========================================

/**
 * 将各平台订单数据标准化为 Flowrid 统一格式
 */
export function normalizeOrder(
  sourceOrder: Record<string, unknown>,
  source: string
): Partial<Order> {
  const normalizers: Record<string, (o: Record<string, unknown>) => Partial<Order>> = {
    shopify: (o) => ({
      external_order_id: String(o.id || ""),
      order_number: String(o.name || o.order_number || ""),
      customer_name: o.shipping_address
        ? `${(o.shipping_address as Record<string, string>)?.first_name || ""} ${(o.shipping_address as Record<string, string>)?.last_name || ""}`
        : "",
      customer_email: String(o.email || ""),
      shipping_address_line1: (o.shipping_address as Record<string, string>)?.address1 || "",
      shipping_city: (o.shipping_address as Record<string, string>)?.city || "",
      shipping_state: (o.shipping_address as Record<string, string>)?.province_code || "",
      shipping_zip: (o.shipping_address as Record<string, string>)?.zip || "",
      shipping_country: (o.shipping_address as Record<string, string>)?.country_code || "US",
      source: "shopify",
    }),
    amazon: (o) => ({
      external_order_id: String(o.AmazonOrderId || ""),
      order_number: String(o.AmazonOrderId || ""),
      customer_name: String(o.BuyerName || ""),
      customer_email: String(o.BuyerEmail || ""),
      shipping_address_line1: (o.ShippingAddress as Record<string, string>)?.AddressLine1 || "",
      shipping_city: (o.ShippingAddress as Record<string, string>)?.City || "",
      shipping_state: (o.ShippingAddress as Record<string, string>)?.StateOrRegion || "",
      shipping_zip: (o.ShippingAddress as Record<string, string>)?.PostalCode || "",
      source: "amazon",
    }),
    tiktok: (o) => ({
      external_order_id: String(o.order_id || ""),
      order_number: String(o.order_id || ""),
      customer_name: String(o.recipient_name || ""),
      shipping_address_line1: (o.recipient_address as Record<string, string>)?.full_address || "",
      source: "tiktok",
    }),
  };

  const normalizer = normalizers[source.toLowerCase()];
  if (normalizer) {
    return normalizer(sourceOrder);
  }

  // 默认：直接映射通用字段
  return {
    external_order_id: String(sourceOrder.order_id || sourceOrder.id || ""),
    order_number: String(sourceOrder.order_number || sourceOrder.id || ""),
    customer_name: String(sourceOrder.customer_name || sourceOrder.buyer_name || ""),
    customer_email: String(sourceOrder.email || sourceOrder.buyer_email || ""),
    source,
  };
}

/**
 * 将标准化订单项转为 Flowrid 格式
 */
export function normalizeOrderItems(
  sourceItems: Record<string, unknown>[],
  source: string
): Partial<OrderItem>[] {
  return sourceItems.map((item) => ({
    sku: String(item.sku || item.SellerSKU || ""),
    quantity_ordered: Number(item.quantity || item.QuantityOrdered || 1),
    unit_price: Number(item.price || item.ItemPrice || 0),
  }));
}

// ==========================================
// CSV / FTP / EDI 文件解析
// ==========================================

/**
 * 解析标准 CSV 订单文件
 */
export function parseCSVOrders(csvContent: string): Record<string, string>[] {
  const lines = csvContent.trim().split("\n");
  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""));
  const orders: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",").map((v) => v.trim().replace(/"/g, ""));
    const order: Record<string, string> = {};
    headers.forEach((h, idx) => {
      order[h] = values[idx] || "";
    });
    orders.push(order);
  }

  return orders;
}

/**
 * 解析 EDI 850 (Purchase Order) 并转为标准格式
 */
export function parseEDI850(ediContent: string): Partial<Order> | null {
  // EDI X12 850 标准解析
  const begSegment = ediContent.match(/BEG\*(\d{2})\*(\w+)\*([^*]+)/);
  const nameSegment = ediContent.match(/N1\*ST\*([^*]+)/);
  const addrSegment = ediContent.match(/N3\*([^*]+)/);
  const citySegment = ediContent.match(/N4\*([^*]+)\*([^*]+)\*([^*]+)/);

  if (!begSegment) return null;

  return {
    external_order_id: begSegment[3],
    order_number: `EDI-${begSegment[3]}`,
    customer_name: nameSegment?.[1] || "",
    shipping_address_line1: addrSegment?.[1] || "",
    shipping_city: citySegment?.[1] || "",
    shipping_state: citySegment?.[2] || "",
    shipping_zip: citySegment?.[3] || "",
    source: "edi",
  };
}

// ==========================================
// Webhook 处理器工厂
// ==========================================

/**
 * 生成平台 Webhook 处理函数
 */
export function createWebhookHandler(platform: string) {
  return async (payload: Record<string, unknown>) => {
    const order = normalizeOrder(payload, platform);
    // 交给 WMS 订单处理器
    return { success: true, order };
  };
}
