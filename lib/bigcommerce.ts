// BigCommerce 集成 — BigCommerce API V3
// 认证: Store Hash + OAuth Access Token
// https://developer.bigcommerce.com/docs/rest

import { createServiceClient } from "@/lib/supabase";

export interface BigCommerceCredentials {
  storeHash: string;
  accessToken: string;
  clientId: string;
  clientSecret: string;
}

const BC_API_BASE = "https://api.bigcommerce.com/stores";

/**
 * 保存凭证
 */
export async function saveBigCommerceCredentials(
  tenantId: string,
  creds: BigCommerceCredentials
): Promise<string | null> {
  const supabase = createServiceClient();
  if (!supabase) return null;

  const { data } = await supabase
    .from("integration_connections")
    .upsert({
      tenant_id: tenantId,
      platform_name: "bigcommerce",
      connection_type: "oauth",
      credentials: creds as any,
      status: "connected",
      updated_at: new Date().toISOString(),
    }, { onConflict: "tenant_id,platform_name" })
    .select("id")
    .single();

  return (data as any)?.id || null;
}

/**
 * OAuth 授权 URL
 */
export function getBigCommerceAuthUrl(clientId: string, redirectUri: string, state?: string): string {
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "store_v2_orders store_v2_products store_v2_information",
    state: state || crypto.randomUUID(),
  });
  return `https://login.bigcommerce.com/authorize?${params}`;
}

/**
 * 用 code 换取 access token
 */
export async function exchangeBigCommerceCode(
  clientId: string,
  clientSecret: string,
  code: string,
  redirectUri: string
): Promise<{ accessToken: string; storeHash: string; context: string } | null> {
  const res = await fetch("https://login.bigcommerce.com/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code, redirect_uri: redirectUri, grant_type: "authorization_code" }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  return { accessToken: data.access_token, storeHash: data.store_hash, context: data.context };
}

/**
 * 同步订单
 */
export async function syncBigCommerceOrders(
  tenantId: string,
  creds: BigCommerceCredentials,
  options?: { minDateCreated?: string }
): Promise<{ synced: number; errors: string[] }> {
  const supabase = createServiceClient();
  if (!supabase) return { synced: 0, errors: ["Database unavailable"] };

  const result = { synced: 0, errors: [] as string[] };
  const baseUrl = `${BC_API_BASE}/${creds.storeHash}/v2/orders`;
  const params = new URLSearchParams({ limit: "50", sort: "date_created:desc" });
  if (options?.minDateCreated) params.set("min_date_created", options.minDateCreated);

  try {
    const res = await fetch(`${baseUrl}?${params}`, {
      headers: { "X-Auth-Token": creds.accessToken, "Accept": "application/json" },
    });
    if (!res.ok) return { synced: 0, errors: [`BC error ${res.status}`] };

    const orders = await res.json();

    for (const order of orders || []) {
      try {
        await supabase.from("orders").upsert({
          tenant_id: tenantId,
          external_order_id: String(order.id),
          status: mapBCStatus(order.status_id),
          shipping_name: `${order.billing_address?.first_name || ""} ${order.billing_address?.last_name || ""}`.trim(),
          shipping_address1: order.billing_address?.street_1 || undefined,
          shipping_city: order.billing_address?.city || undefined,
          shipping_state: order.billing_address?.state || undefined,
          shipping_zip: order.billing_address?.zip || undefined,
          shipping_country: order.billing_address?.country || undefined,
          created_at: order.date_created,
          updated_at: new Date().toISOString(),
        }, { onConflict: "tenant_id,external_order_id" });
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

function mapBCStatus(statusId: number): string {
  const map: Record<number, string> = {
    0: "pending", 1: "pending", 2: "pending", 3: "pending",
    4: "picking", 5: "picking", 6: "picking",
    7: "packed", 8: "packed", 9: "shipped", 10: "delivered",
    11: "cancelled", 12: "cancelled", 13: "cancelled", 14: "cancelled",
  };
  return map[statusId] || "pending";
}
