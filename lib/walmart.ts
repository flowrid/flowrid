// Walmart Marketplace 集成 — Walmart API
// 认证: Client ID + Client Secret (HMAC 签名)
// https://developer.walmart.com/

import { createServiceClient } from "@/lib/supabase";

export interface WalmartCredentials {
  clientId: string;
  clientSecret: string;
  wmConsumerChannelType?: string;
}

const WM_API_BASE = "https://marketplace.walmartapis.com/v3";

/**
 * 保存凭证
 */
export async function saveWalmartCredentials(tenantId: string, creds: WalmartCredentials): Promise<string | null> {
  const supabase = createServiceClient();
  if (!supabase) return null;

  const { data } = await supabase
    .from("integration_connections")
    .upsert({
      tenant_id: tenantId, platform_name: "walmart", connection_type: "api",
      credentials: creds as any, status: "connected",
      updated_at: new Date().toISOString(),
    }, { onConflict: "tenant_id,platform_name" })
    .select("id").single();

  return (data as any)?.id || null;
}

/**
 * 生成 Walmart HMAC 签名
 */
function generateWalmartSignature(clientId: string, clientSecret: string, timestamp: string): string {
  // WM_SEC.KEY_VERSION: 1 → WM_SEC.AUTH_SIGNATURE = Base64(RSA-SHA256(timestamp))
  const crypto = require("crypto");
  const sign = crypto.createSign("RSA-SHA256");
  sign.update(`${clientId}\n${timestamp}\n${clientId}\n`);
  const signature = sign.sign(clientSecret, "base64");
  return signature;
}

/**
 * 生成请求头
 */
function walmartHeaders(creds: WalmartCredentials): Record<string, string> {
  const timestamp = Date.now().toString();
  const correlationId = crypto.randomUUID();
  const signature = generateWalmartSignature(creds.clientId, creds.clientSecret, timestamp);
  return {
    "WM_SEC.ACCESS_TOKEN": creds.clientId,
    "WM_SEC.TIMESTAMP": timestamp,
    "WM_SEC.AUTH_SIGNATURE": signature,
    "WM_QOS.CORRELATION_ID": correlationId,
    "WM_SVC.NAME": "Walmart Marketplace",
    "WM_CONSUMER.CHANNEL.TYPE": creds.wmConsumerChannelType || "SWAGGER_CHANNEL",
    "Accept": "application/json",
  };
}

/**
 * 同步 Walmart 订单
 */
export async function syncWalmartOrders(
  tenantId: string, creds: WalmartCredentials, days: number = 7
): Promise<{ synced: number; errors: string[] }> {
  const supabase = createServiceClient();
  if (!supabase) return { synced: 0, errors: ["Database unavailable"] };

  const result = { synced: 0, errors: [] as string[] };
  const createdStartDate = new Date(Date.now() - days * 86400000).toISOString().split("T")[0];

  try {
    const res = await fetch(`${WM_API_BASE}/orders?createdStartDate=${createdStartDate}&limit=50`, {
      headers: walmartHeaders(creds),
    });
    if (!res.ok) return { synced: 0, errors: [`Walmart error ${res.status}`] };

    const data = await res.json();
    const orderList = data.list?.elements?.order || [];

    for (const order of orderList) {
      try {
        await supabase.from("orders").upsert({
          tenant_id: tenantId, external_order_id: order.purchaseOrderId,
          status: mapWalmartStatus(order.orderLines?.orderLine?.[0]?.orderLineStatuses?.orderLineStatus?.[0]?.status),
          shipping_name: order.shippingInfo?.postalAddress?.name || undefined,
          shipping_address1: order.shippingInfo?.postalAddress?.address1 || undefined,
          shipping_city: order.shippingInfo?.postalAddress?.city || undefined,
          shipping_state: order.shippingInfo?.postalAddress?.state || undefined,
          shipping_zip: order.shippingInfo?.postalAddress?.postalCode || undefined,
          shipping_country: order.shippingInfo?.postalAddress?.country || undefined,
          created_at: order.orderDate, updated_at: new Date().toISOString(),
        }, { onConflict: "tenant_id,external_order_id" });
        result.synced++;
      } catch { result.errors.push(`Failed to upsert order ${order.purchaseOrderId}`); }
    }
  } catch (err: any) { result.errors.push(err.message); }

  return result;
}

function mapWalmartStatus(status?: string): string {
  const map: Record<string, string> = {
    Created: "pending", Acknowledged: "pending", Shipped: "shipped", Delivered: "delivered", Cancelled: "cancelled",
  };
  return map[status || ""] || "pending";
}
