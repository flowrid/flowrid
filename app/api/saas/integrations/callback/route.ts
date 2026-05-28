// 集成 OAuth 回调 — 处理各平台 OAuth redirect
// 支持: amazon, bigcommerce, ebay, quickbooks

import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { exchangeBigCommerceCode, saveBigCommerceCredentials } from "@/lib/bigcommerce";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const platform = url.searchParams.get("platform") || url.searchParams.get("state")?.split(":")[0] || "unknown";
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state") || "";

  if (!code) {
    const error = url.searchParams.get("error_description") || url.searchParams.get("error") || "No authorization code";
    return NextResponse.redirect(new URL(`/saas/settings?integration=error&error=${encodeURIComponent(error)}`, req.url));
  }

  const supabase = createServiceClient();
  if (!supabase) return NextResponse.redirect(new URL("/saas/settings?integration=error&error=db_unavailable", req.url));

  // 从 state 中提取 tenant_id
  const stateParts = state.split(":");
  const tenantId = stateParts[1] || "";

  try {
    // BigCommerce OAuth
    if (platform === "bigcommerce") {
      // 获取存储的 client credentials
      const { data: conn } = await supabase
        .from("integration_connections")
        .select("credentials")
        .eq("platform_name", "bigcommerce")
        .eq("status", "pending")
        .maybeSingle();

      const creds = (conn as any)?.credentials || {};
      const result = await exchangeBigCommerceCode(
        creds.clientId || process.env.BIGCOMMERCE_CLIENT_ID || "",
        creds.clientSecret || process.env.BIGCOMMERCE_CLIENT_SECRET || "",
        code,
        `${url.origin}/api/saas/integrations/callback?platform=bigcommerce`
      );

      if (result) {
        await saveBigCommerceCredentials(tenantId, {
          storeHash: result.storeHash,
          accessToken: result.accessToken,
          clientId: creds.clientId || "",
          clientSecret: creds.clientSecret || "",
        });
      }
    }

    // 其他平台的 OAuth 交换在此扩展
    // eBay: exchange authorization code for token
    // QuickBooks: exchange authorization code for realm + token
    // Amazon: 通过 Login with Amazon 获取 refresh token

    return NextResponse.redirect(new URL(`/saas/settings?integration=connected&platform=${platform}`, req.url));
  } catch (err: any) {
    return NextResponse.redirect(new URL(`/saas/settings?integration=error&error=${encodeURIComponent(err.message)}`, req.url));
  }
}
