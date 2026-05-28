import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { exchangeShopifyToken, registerShopifyWebhooks } from "@/lib/shopify";
import { verifyOperatorToken } from "@/lib/saas-auth";

/**
 * GET /api/saas/integrations/shopify/callback
 * Shopify OAuth 回调 — 交换 token → 存数据库 → 注册 webhook → 回首页
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const shop = searchParams.get("shop");
  const state = searchParams.get("state");

  if (!code || !shop) {
    return NextResponse.json({ error: "Missing code or shop" }, { status: 400 });
  }

  const operator = await verifyOperatorToken(req);
  if (!operator) {
    return NextResponse.redirect(new URL("/saas/login?redirect=/saas/settings", req.url));
  }
  const TENANT_ID = operator.tenantId;

  try {
    // 交换 token
    const { accessToken } = await exchangeShopifyToken(shop, code);

    // 存数据库
    const supabase = createServiceClient();
    if (supabase) {
      await supabase.from("integration_connections").upsert({
        tenant_id: TENANT_ID,
        platform_type: "shopping_cart",
        platform_name: "shopify",
        connection_type: "api",
        credentials: { shop, access_token: accessToken },
        endpoint_url: `https://${shop}.myshopify.com`,
        is_active: true,
        sync_frequency: "realtime",
      }, { onConflict: "tenant_id,platform_name" });

      // 注册 webhook
      await registerShopifyWebhooks(shop, accessToken);
    }

    // 回到 Settings 页
    return NextResponse.redirect(new URL("/saas/settings?integrated=shopify", req.url));
  } catch (e: any) {
    console.error("Shopify OAuth callback error:", e);
    return NextResponse.redirect(new URL("/saas/settings?error=shopify_oauth_failed", req.url));
  }
}
