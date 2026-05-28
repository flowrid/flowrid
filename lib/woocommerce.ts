// WooCommerce 集成 — WooCommerce REST API
// 认证: Consumer Key + Consumer Secret (HMAC)
// https://woocommerce.com/document/woocommerce-rest-api/

import { createServiceClient } from "@/lib/supabase";

export interface WooCommerceCredentials {
  storeUrl: string;
  consumerKey: string;
  consumerSecret: string;
}

export interface WooCommerceOrder {
  id: number;
  number: string;
  status: string;
  date_created: string;
  billing: { first_name: string; last_name: string; company: string; email: string; phone: string; address_1: string; address_2: string; city: string; state: string; postcode: string; country: string };
  shipping: { first_name: string; last_name: string; address_1: string; address_2: string; city: string; state: string; postcode: string; country: string };
  line_items: { product_id: number; name: string; sku: string; quantity: number; price: string; total: string }[];
  total: string;
  shipping_lines: { method_title: string; total: string }[];
}

/**
 * 保存 WooCommerce 凭证
 */
export async function saveWooCommerceCredentials(
  tenantId: string,
  creds: WooCommerceCredentials
): Promise<string | null> {
  const supabase = createServiceClient();
  if (!supabase) return null;

  const { data } = await supabase
    .from("integration_connections")
    .upsert({
      tenant_id: tenantId,
      platform_name: "woocommerce",
      connection_type: "api",
      credentials: creds as any,
      endpoint_url: creds.storeUrl,
      status: "connected",
      updated_at: new Date().toISOString(),
    }, { onConflict: "tenant_id,platform_name" })
    .select("id")
    .single();

  return (data as any)?.id || null;
}

/**
 * 测试连接
 */
export async function testWooCommerceConnection(creds: WooCommerceCredentials): Promise<boolean> {
  try {
    const res = await makeWooCommerceRequest(creds, "system_status", {});
    return res.ok;
  } catch { return false; }
}

/**
 * 同步 WooCommerce 订单
 */
export async function syncWooCommerceOrders(
  tenantId: string,
  creds: WooCommerceCredentials,
  options?: { after?: string; status?: string }
): Promise<{ synced: number; errors: string[] }> {
  const supabase = createServiceClient();
  if (!supabase) return { synced: 0, errors: ["Database unavailable"] };

  const result = { synced: 0, errors: [] as string[] };
  const params: Record<string, string> = { per_page: "50" };
  if (options?.after) params.after = options.after;
  if (options?.status) params.status = options.status;

  try {
    const res = await makeWooCommerceRequest(creds, "orders", params);
    if (!res.ok) return { synced: 0, errors: [`WooCommerce error ${res.status}`] };

    const orders: WooCommerceOrder[] = await res.json();

    for (const order of orders) {
      try {
        await supabase.from("orders").upsert({
          tenant_id: tenantId,
          external_order_id: String(order.id),
          status: mapWooCommerceStatus(order.status),
          shipping_name: `${order.shipping?.first_name || ""} ${order.shipping?.last_name || ""}`.trim() || undefined,
          shipping_address1: order.shipping?.address_1 || undefined,
          shipping_city: order.shipping?.city || undefined,
          shipping_state: order.shipping?.state || undefined,
          shipping_zip: order.shipping?.postcode || undefined,
          shipping_country: order.shipping?.country || undefined,
          created_at: order.date_created,
          updated_at: new Date().toISOString(),
        }, { onConflict: "tenant_id,external_order_id" });

        // 同步行项目
        for (const item of order.line_items) {
          await supabase.from("order_items").upsert({
            order_id: (order as any).id,
            product_id: null, // WooCommerce product IDs differ
            sku: item.sku || `WOO-${item.product_id}`,
            quantity_ordered: item.quantity,
            unit_price: parseFloat(item.price),
          }, { onConflict: "" });
        }
        result.synced++;
      } catch {
        result.errors.push(`Failed to upsert order ${order.id}`);
      }
    }
  } catch (err: any) {
    result.errors.push(err.message);
  }

  return result;
}

async function makeWooCommerceRequest(creds: WooCommerceCredentials, endpoint: string, params: Record<string, string>) {
  const url = new URL(`${creds.storeUrl.replace(/\/$/, "")}/wp-json/wc/v3/${endpoint}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const auth = Buffer.from(`${creds.consumerKey}:${creds.consumerSecret}`).toString("base64");
  return fetch(url.toString(), {
    headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/json" },
  });
}

function mapWooCommerceStatus(status: string): string {
  const map: Record<string, string> = {
    pending: "pending", processing: "allocated", on_hold: "pending",
    completed: "delivered", cancelled: "cancelled", refunded: "cancelled", failed: "cancelled",
  };
  return map[status] || "pending";
}
