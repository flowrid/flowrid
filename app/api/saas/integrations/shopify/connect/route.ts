import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { shopifyAPI } from "@/lib/shopify";
import { verifyOperatorToken } from "@/lib/saas-auth";

/**
 * POST /api/saas/integrations/shopify/connect
 * 直接用 Admin API Token 连接 Shopify
 */
export async function POST(req: Request) {
  const operator = await verifyOperatorToken(req);
  if (!operator) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const TENANT_ID = operator.tenantId;

  try {
    const { shop, access_token } = await req.json();
    if (!shop || !access_token) {
      return NextResponse.json({ error: "Missing shop or access_token" }, { status: 400 });
    }

    // 验证 token 有效性
    const data = await shopifyAPI(shop, access_token, "shop.json");
    if (!data.shop) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // 存数据库
    const supabase = createServiceClient();
    if (supabase) {
      const { error } = await supabase.from("integration_connections").upsert({
        tenant_id: TENANT_ID,
        platform_type: "shopping_cart",
        platform_name: "shopify",
        connection_type: "api",
        credentials: { shop, access_token },
        endpoint_url: `https://${shop}.myshopify.com`,
        is_active: true,
        sync_frequency: "realtime",
      }, { onConflict: "tenant_id,platform_name" } as any);

      if (error) console.error("DB upsert error:", error);
    }

    return NextResponse.json({
      success: true,
      shop: data.shop.name,
      plan: data.shop.plan_name,
    });
  } catch (e: any) {
    console.error("Shopify connect error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
