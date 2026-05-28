// Amazon SP-API 集成 — Selling Partner API
// 认证: OAuth 2.0 + AWS IAM (Role ARN) + Refresh Token
// https://developer-docs.amazon.com/sp-api/

import { createServiceClient } from "@/lib/supabase";

const SP_API_ENDPOINTS: Record<string, string> = {
  na: "https://sellingpartnerapi-na.amazon.com",
  eu: "https://sellingpartnerapi-eu.amazon.com",
  fe: "https://sellingpartnerapi-fe.amazon.com",
};

export interface AmazonCredentials {
  refreshToken: string;
  clientId: string;
  clientSecret: string;
  awsAccessKeyId: string;
  awsSecretAccessKey: string;
  roleArn: string;
  region: "na" | "eu" | "fe";
  sellerId: string;
}

export interface AmazonOrder {
  amazonOrderId: string;
  purchaseDate: string;
  orderStatus: string;
  fulfillmentChannel: string;
  shipServiceLevel?: string;
  orderTotal?: { currencyCode: string; amount: string };
  shippingAddress?: Record<string, string>;
  buyerName?: string;
  buyerEmail?: string;
}

/**
 * 保存 Amazon 凭证
 */
export async function saveAmazonCredentials(
  tenantId: string,
  credentials: AmazonCredentials
): Promise<string | null> {
  const supabase = createServiceClient();
  if (!supabase) return null;

  const { data } = await supabase
    .from("integration_connections")
    .upsert({
      tenant_id: tenantId,
      platform_name: "amazon",
      connection_type: "oauth",
      credentials: credentials as any,
      status: "connected",
      updated_at: new Date().toISOString(),
    }, { onConflict: "tenant_id,platform_name" })
    .select("id")
    .single();

  return (data as any)?.id || null;
}

/**
 * 获取授权 URL（引导用户完成 Amazon OAuth）
 */
export function getAmazonAuthUrl(clientId: string, redirectUri: string, state?: string): string {
  const baseUrl = "https://sellercentral.amazon.com/apps/authorize/consent";
  const params = new URLSearchParams({
    application_id: clientId,
    redirect_uri: redirectUri,
    version: "beta",
    state: state || crypto.randomUUID(),
  });
  return `${baseUrl}?${params}`;
}

/**
 * 同步 Amazon 订单
 */
export async function syncAmazonOrders(
  tenantId: string,
  credentials: AmazonCredentials,
  options?: { createdAfter?: string; marketplaceIds?: string[] }
): Promise<{ synced: number; errors: string[] }> {
  const supabase = createServiceClient();
  if (!supabase) return { synced: 0, errors: ["Database unavailable"] };

  // 调用 SP-API Orders API v0
  const endpoint = `${SP_API_ENDPOINTS[credentials.region]}/orders/v0/orders`;
  const result = { synced: 0, errors: [] as string[] };

  try {
    const accessToken = await getAmazonAccessToken(credentials);
    if (!accessToken) return { synced: 0, errors: ["Failed to obtain access token"] };

    const params = new URLSearchParams({
      MarketplaceIds: marketplaceIdsForRegion(credentials.region).join(","),
      CreatedAfter: options?.createdAfter || new Date(Date.now() - 86400000 * 7).toISOString(),
      OrderStatuses: "Unshipped,PartiallyShipped",
    });

    const res = await fetch(`${endpoint}?${params}`, {
      headers: {
        "x-amz-access-token": accessToken,
        "x-amz-date": new Date().toISOString(),
      },
    });

    if (!res.ok) {
      return { synced: 0, errors: [`SP-API error ${res.status}: ${await res.text()}`] };
    }

    const data = await res.json();
    const orders: AmazonOrder[] = data.payload?.Orders || [];

    for (const order of orders) {
      try {
        await supabase.from("orders").upsert({
          tenant_id: tenantId,
          external_order_id: order.amazonOrderId,
          status: mapAmazonStatus(order.orderStatus),
          shipping_name: order.buyerName || undefined,
          shipping_address1: order.shippingAddress?.AddressLine1 || undefined,
          shipping_city: order.shippingAddress?.City || undefined,
          shipping_state: order.shippingAddress?.StateOrRegion || undefined,
          shipping_zip: order.shippingAddress?.PostalCode || undefined,
          created_at: order.purchaseDate,
          updated_at: new Date().toISOString(),
        }, { onConflict: "tenant_id,external_order_id" });
        result.synced++;
      } catch {
        result.errors.push(`Failed to upsert order ${order.amazonOrderId}`);
      }
    }
  } catch (err: any) {
    result.errors.push(err.message);
  }

  return result;
}

function marketplaceIdsForRegion(region: string): string[] {
  return region === "na" ? ["ATVPDKIKX0DER"] : region === "eu" ? ["A1PA6795UKMFR9"] : ["A19VAU5U5O7RUS"];
}

function mapAmazonStatus(status: string): string {
  const map: Record<string, string> = {
    Unshipped: "pending",
    PartiallyShipped: "shipped",
    Shipped: "shipped",
    Canceled: "cancelled",
  };
  return map[status] || "pending";
}

async function getAmazonAccessToken(credentials: AmazonCredentials): Promise<string | null> {
  const res = await fetch("https://api.amazon.com/auth/o2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: credentials.refreshToken,
      client_id: credentials.clientId,
      client_secret: credentials.clientSecret,
    }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.access_token || null;
}
