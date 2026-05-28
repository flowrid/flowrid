// QuickBooks Online 集成 — Intuit QuickBooks API V3
// 认证: OAuth 2.0 (授权码模式) + Realm ID
// https://developer.intuit.com/app/developer/qbo/docs/develop

import { createServiceClient } from "@/lib/supabase";

export interface QuickBooksCredentials {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  realmId: string;
  accessToken?: string;
  accessTokenExpiry?: string;
}

const QBO_API_BASE = "https://quickbooks.api.intuit.com/v3/company";

/**
 * 保存凭证
 */
export async function saveQuickBooksCredentials(tenantId: string, creds: QuickBooksCredentials): Promise<string | null> {
  const supabase = createServiceClient();
  if (!supabase) return null;

  const { data } = await supabase
    .from("integration_connections")
    .upsert({
      tenant_id: tenantId, platform_name: "quickbooks", connection_type: "oauth",
      credentials: creds as any, status: "connected",
      updated_at: new Date().toISOString(),
    }, { onConflict: "tenant_id,platform_name" })
    .select("id").single();

  return (data as any)?.id || null;
}

/**
 * OAuth URL
 */
export function getQuickBooksAuthUrl(clientId: string, redirectUri: string): string {
  const params = new URLSearchParams({
    client_id: clientId, redirect_uri: redirectUri, response_type: "code",
    scope: "com.intuit.quickbooks.accounting",
    state: crypto.randomUUID(),
  });
  return `https://appcenter.intuit.com/connect/oauth2?${params}`;
}

/**
 * 刷新 access token
 */
async function refreshAccessToken(creds: QuickBooksCredentials): Promise<string | null> {
  if (creds.accessToken && creds.accessTokenExpiry && new Date(creds.accessTokenExpiry) > new Date()) {
    return creds.accessToken;
  }
  const auth = Buffer.from(`${creds.clientId}:${creds.clientSecret}`).toString("base64");
  const res = await fetch("https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", Authorization: `Basic ${auth}` },
    body: new URLSearchParams({ grant_type: "refresh_token", refresh_token: creds.refreshToken }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  creds.accessToken = data.access_token;
  creds.accessTokenExpiry = new Date(Date.now() + (data.expires_in || 3600) * 1000).toISOString();
  return data.access_token;
}

/**
 * 同步 QuickBooks 发票 → Flowrid 订单
 */
export async function syncQuickBooksInvoices(
  tenantId: string, creds: QuickBooksCredentials, days: number = 7
): Promise<{ synced: number; errors: string[] }> {
  const supabase = createServiceClient();
  if (!supabase) return { synced: 0, errors: ["Database unavailable"] };

  const result = { synced: 0, errors: [] as string[] };
  const token = await refreshAccessToken(creds);
  if (!token) return { synced: 0, errors: ["Failed to get QBO access token"] };

  try {
    const filter = new Date(Date.now() - days * 86400000).toISOString().split("T")[0];
    const q = `SELECT * FROM Invoice WHERE TxnDate >= '${filter}' MAXRESULTS 50`;
    const res = await fetch(`${QBO_API_BASE}/${creds.realmId}/query?query=${encodeURIComponent(q)}`, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    });
    if (!res.ok) return { synced: 0, errors: [`QBO error ${res.status}`] };

    const data = await res.json();
    const invoices = data.QueryResponse?.Invoice || [];

    for (const inv of invoices) {
      try {
        await supabase.from("orders").upsert({
          tenant_id: tenantId, external_order_id: String(inv.Id),
          status: inv.Balance > 0 ? "pending" : "delivered",
          shipping_address1: inv.BillAddr?.Line1 || undefined,
          shipping_city: inv.BillAddr?.City || undefined,
          shipping_state: inv.BillAddr?.CountrySubDivisionCode || undefined,
          shipping_zip: inv.BillAddr?.PostalCode || undefined,
          created_at: inv.TxnDate, updated_at: new Date().toISOString(),
        }, { onConflict: "tenant_id,external_order_id" });
        result.synced++;
      } catch { result.errors.push(`Failed to sync invoice ${inv.Id}`); }
    }
  } catch (err: any) { result.errors.push(err.message); }

  return result;
}
