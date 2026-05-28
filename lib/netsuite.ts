// NetSuite 集成 — NetSuite REST Web Services / SuiteTalk
// 认证: Token-Based Authentication (TBA) — Account + Consumer Key/Secret + Token ID/Secret
// https://docs.oracle.com/en/cloud/saas/netsuite/

import { createServiceClient } from "@/lib/supabase";

export interface NetSuiteCredentials {
  accountId: string;
  consumerKey: string;
  consumerSecret: string;
  tokenId: string;
  tokenSecret: string;
  restletUrl?: string;
}

const NS_REST_API = "https://<accountId>.suitetalk.api.netsuite.com/services/rest/record/v1";

/**
 * 保存凭证
 */
export async function saveNetSuiteCredentials(tenantId: string, creds: NetSuiteCredentials): Promise<string | null> {
  const supabase = createServiceClient();
  if (!supabase) return null;

  const { data } = await supabase
    .from("integration_connections")
    .upsert({
      tenant_id: tenantId, platform_name: "netsuite", connection_type: "oauth",
      credentials: creds as any, status: "connected",
      updated_at: new Date().toISOString(),
    }, { onConflict: "tenant_id,platform_name" })
    .select("id").single();

  return (data as any)?.id || null;
}

/**
 * 生成 OAuth 1.0 签名 (TBA)
 */
export function generateOAuth1Signature(
  method: string, url: string, params: Record<string, string>,
  consumerSecret: string, tokenSecret: string
): string {
  const crypto = require("crypto");
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const nonce = crypto.randomBytes(16).toString("hex");

  const oauthParams = {
    ...params,
    oauth_consumer_key: params.oauth_consumer_key || "",
    oauth_nonce: nonce,
    oauth_signature_method: "HMAC-SHA256",
    oauth_timestamp: timestamp,
    oauth_token: params.oauth_token || "",
    oauth_version: "1.0",
  };

  const sortedKeys = Object.keys(oauthParams).sort();
  const paramString = sortedKeys.map((k) => `${encodeURIComponent(k)}=${encodeURIComponent((oauthParams as any)[k])}`).join("&");
  const baseString = [method.toUpperCase(), encodeURIComponent(url), encodeURIComponent(paramString)].join("&");
  const signingKey = `${encodeURIComponent(consumerSecret)}&${encodeURIComponent(tokenSecret)}`;

  return crypto.createHmac("sha256", signingKey).update(baseString).digest("base64");
}

/**
 * 同步 NetSuite 销售订单
 */
export async function syncNetSuiteOrders(
  tenantId: string, creds: NetSuiteCredentials, days: number = 7
): Promise<{ synced: number; errors: string[] }> {
  const supabase = createServiceClient();
  if (!supabase) return { synced: 0, errors: ["Database unavailable"] };

  const result = { synced: 0, errors: [] as string[] };
  const apiBase = NS_REST_API.replace("<accountId>", creds.accountId);

  try {
    // REST API: 查询 salesorder 记录
    const q = `SELECT id, trandate, status, shippingaddress FROM salesorder WHERE trandate >= '${new Date(Date.now() - days * 86400000).toISOString().split("T")[0]}'`;
    const res = await fetch(`${apiBase}/salesorder?q=${encodeURIComponent(q)}`, {
      headers: {
        "Authorization": `OAuth realm="${creds.accountId}", oauth_consumer_key="${creds.consumerKey}", oauth_token="${creds.tokenId}"`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) return { synced: 0, errors: [`NetSuite error ${res.status}`] };

    const data = await res.json();
    const orders = data.items || [];

    for (const order of orders) {
      try {
        await supabase.from("orders").upsert({
          tenant_id: tenantId, external_order_id: order.id,
          status: mapNSStatus(order.status?.id),
          created_at: order.trandate, updated_at: new Date().toISOString(),
        }, { onConflict: "tenant_id,external_order_id" });
        result.synced++;
      } catch { result.errors.push(`Failed to upsert order ${order.id}`); }
    }
  } catch (err: any) { result.errors.push(err.message); }

  return result;
}

function mapNSStatus(status?: string): string {
  const map: Record<string, string> = {
    A: "pending", B: "allocated", C: "packed", D: "delivered", E: "delivered", F: "cancelled",
  };
  return map[status || ""] || "pending";
}

/**
 * 同步 NetSuite 库存 → Flowrid inventory
 */
export async function syncNetSuiteInventory(
  tenantId: string, creds: NetSuiteCredentials
): Promise<{ synced: number; errors: string[] }> {
  const supabase = createServiceClient();
  if (!supabase) return { synced: 0, errors: ["Database unavailable"] };

  const result = { synced: 0, errors: [] as string[] };
  const apiBase = NS_REST_API.replace("<accountId>", creds.accountId);

  try {
    const q = "SELECT id, item, quantityonhand, location FROM inventorybalance WHERE quantityonhand > 0";
    const res = await fetch(`${apiBase}/query/v1/suiteql?limit=1000`, {
      method: "POST",
      headers: {
        "Authorization": `OAuth realm="${creds.accountId}"`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ q }),
    });

    if (!res.ok) return { synced: 0, errors: [`NetSuite error ${res.status}`] };

    const data = await res.json();
    const items = data.items || [];

    for (const item of items) {
      try {
        await supabase.from("inventory").upsert({
          tenant_id: tenantId, product_id: item.item,
          quantity_on_hand: item.quantityonhand,
          quantity_available: item.quantityonhand,
          updated_at: new Date().toISOString(),
        }, { onConflict: "tenant_id,product_id,warehouse_id" });
        result.synced++;
      } catch { result.errors.push(`Failed to sync inventory ${item.item}`); }
    }
  } catch (err: any) { result.errors.push(err.message); }

  return result;
}
