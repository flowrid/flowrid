// eBay 集成 — eBay API with OAuth
// 认证: Client ID + Client Secret (OAuth 2.0) + 传统 Token
// https://developer.ebay.com/develop/apis

import { createServiceClient } from "@/lib/supabase";

export interface eBayCredentials {
  clientId: string;
  clientSecret: string;
  refreshToken?: string;
  accessToken?: string;
  tokenExpiry?: string;
  marketplaceId?: string;
}

export interface eBayOrder {
  orderId: string;
  creationDate: string;
  orderFulfillmentStatus: string;
  orderPaymentStatus: string;
  pricingSummary: { total: { value: string; currency: string } };
  lineItems: { title: string; sku: string; quantity: number; lineItemCost: { value: string } }[];
  fulfillmentStartInstructions: { shippingStep: { shipTo: { fullName: string; contactAddress: any } } }[];
}

/**
 * 保存凭证
 */
export async function saveEbayCredentials(tenantId: string, creds: eBayCredentials): Promise<string | null> {
  const supabase = createServiceClient();
  if (!supabase) return null;

  const { data } = await supabase
    .from("integration_connections")
    .upsert({
      tenant_id: tenantId, platform_name: "ebay", connection_type: "oauth",
      credentials: creds as any, status: "connected",
      updated_at: new Date().toISOString(),
    }, { onConflict: "tenant_id,platform_name" })
    .select("id").single();

  return (data as any)?.id || null;
}

/**
 * 获取 eBay OAuth URL
 */
export function getEbayAuthUrl(clientId: string, redirectUri: string, ruName: string): string {
  const params = new URLSearchParams({
    client_id: clientId, redirect_uri: ruName, response_type: "code",
    scope: "https://api.ebay.com/oauth/api_scope/sell.fulfillment https://api.ebay.com/oauth/api_scope/sell.inventory",
  });
  return `https://auth.ebay.com/oauth2/authorize?${params}`;
}

/**
 * 获取 access token
 */
export async function getEbayAccessToken(creds: eBayCredentials): Promise<string | null> {
  if (creds.accessToken && creds.tokenExpiry && new Date(creds.tokenExpiry) > new Date()) {
    return creds.accessToken;
  }
  if (!creds.refreshToken) return null;

  const auth = Buffer.from(`${creds.clientId}:${creds.clientSecret}`).toString("base64");
  const res = await fetch("https://api.ebay.com/identity/v1/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", Authorization: `Basic ${auth}` },
    body: new URLSearchParams({ grant_type: "refresh_token", refresh_token: creds.refreshToken }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.access_token || null;
}

/**
 * 同步订单
 */
export async function syncEbayOrders(
  tenantId: string, creds: eBayCredentials, days: number = 7
): Promise<{ synced: number; errors: string[] }> {
  const supabase = createServiceClient();
  if (!supabase) return { synced: 0, errors: ["Database unavailable"] };

  const result = { synced: 0, errors: [] as string[] };
  const token = await getEbayAccessToken(creds);
  if (!token) return { synced: 0, errors: ["Failed to get eBay access token"] };

  try {
    const filter = new Date(Date.now() - days * 86400000).toISOString();
    const res = await fetch(
      `https://api.ebay.com/sell/fulfillment/v1/order?filter=creationdate:[${filter}..]&limit=50`,
      { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", "X-EBAY-C-MARKETPLACE-ID": creds.marketplaceId || "EBAY_US" } }
    );
    if (!res.ok) return { synced: 0, errors: [`eBay error ${res.status}`] };

    const data = await res.json();
    const orders: eBayOrder[] = data.orders || [];

    for (const order of orders) {
      try {
        const shipTo = order.fulfillmentStartInstructions?.[0]?.shippingStep?.shipTo;
        await supabase.from("orders").upsert({
          tenant_id: tenantId, external_order_id: order.orderId,
          status: mapEbayStatus(order.orderFulfillmentStatus),
          shipping_name: shipTo?.fullName || undefined,
          shipping_address1: shipTo?.contactAddress?.addressLine1 || undefined,
          shipping_city: shipTo?.contactAddress?.city || undefined,
          shipping_state: shipTo?.contactAddress?.stateOrProvince || undefined,
          shipping_zip: shipTo?.contactAddress?.postalCode || undefined,
          shipping_country: shipTo?.contactAddress?.countryCode || undefined,
          created_at: order.creationDate, updated_at: new Date().toISOString(),
        }, { onConflict: "tenant_id,external_order_id" });
        result.synced++;
      } catch { result.errors.push(`Failed to upsert order ${order.orderId}`); }
    }
  } catch (err: any) { result.errors.push(err.message); }

  return result;
}

function mapEbayStatus(status: string): string {
  const map: Record<string, string> = {
    NOT_STARTED: "pending", IN_PROGRESS: "picking", FULFILLED: "shipped", COMPLETED: "delivered", CANCELLED: "cancelled",
  };
  return map[status] || "pending";
}
