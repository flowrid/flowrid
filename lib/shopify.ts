/**
 * Shopify Integration — OAuth + API Client
 */

const SHOPIFY_CLIENT_ID = process.env.SHOPIFY_CLIENT_ID || "";
const SHOPIFY_CLIENT_SECRET = process.env.SHOPIFY_CLIENT_SECRET || "";
const REDIRECT_URI = "https://www.flowrid.com/api/saas/integrations/shopify/callback";
const SCOPES = "read_orders,write_orders,read_products,read_inventory,write_inventory";

// ==========================================
// OAuth URL 生成
// ==========================================
export function getShopifyOAuthUrl(shop: string, state: string): string {
  return `https://${shop}.myshopify.com/admin/oauth/authorize?client_id=${SHOPIFY_CLIENT_ID}&scope=${SCOPES}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&state=${state}`;
}

// ==========================================
// OAuth Token 交换
// ==========================================
export async function exchangeShopifyToken(shop: string, code: string) {
  const res = await fetch(`https://${shop}.myshopify.com/admin/oauth/access_token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: SHOPIFY_CLIENT_ID,
      client_secret: SHOPIFY_CLIENT_SECRET,
      code,
    }),
  });

  if (!res.ok) throw new Error(`Shopify OAuth failed: ${await res.text()}`);
  const data = await res.json();
  return { accessToken: data.access_token, scope: data.scope };
}

// ==========================================
// Shopify REST API Client
// ==========================================
export async function shopifyAPI(shop: string, accessToken: string, path: string, method = "GET", body?: any) {
  const url = `https://${shop}.myshopify.com/admin/api/2024-01/${path}`;
  const headers: Record<string, string> = {
    "X-Shopify-Access-Token": accessToken,
    "Content-Type": "application/json",
  };

  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) throw new Error(`Shopify API error: ${await res.text()}`);
  return res.json();
}

// ==========================================
// 订单获取 + 标准化
// ==========================================
export async function fetchShopifyOrders(shop: string, accessToken: string, since?: Date) {
  let path = "orders.json?status=any&limit=250";
  if (since) path += `&updated_at_min=${since.toISOString()}`;

  const data = await shopifyAPI(shop, accessToken, path);
  return (data.orders || []).map(normalizeShopifyOrder);
}

export function normalizeShopifyOrder(shopifyOrder: any) {
  const addr = shopifyOrder.shipping_address || {};
  return {
    external_order_id: String(shopifyOrder.id),
    order_number: shopifyOrder.name || `#${shopifyOrder.order_number}`,
    source: "shopify",
    customer_name: `${addr.first_name || ""} ${addr.last_name || ""}`.trim() || shopifyOrder.customer?.first_name || "",
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

// ==========================================
// Webhook 注册
// ==========================================
export async function registerShopifyWebhooks(shop: string, accessToken: string) {
  const webhooks = [
    { topic: "orders/create", address: "https://www.flowrid.com/api/saas/integrations/shopify/webhook" },
    { topic: "orders/updated", address: "https://www.flowrid.com/api/saas/integrations/shopify/webhook" },
  ];

  for (const wh of webhooks) {
    try {
      await shopifyAPI(shop, accessToken, "webhooks.json", "POST", { webhook: wh });
    } catch (e: any) {
      // Webhook already exists = ignore
      if (!e.message.includes("already been taken")) console.error("Webhook registration:", e.message);
    }
  }
}
