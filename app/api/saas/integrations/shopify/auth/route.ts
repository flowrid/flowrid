import { NextResponse } from "next/server";
import { getShopifyOAuthUrl } from "@/lib/shopify";

/**
 * GET /api/saas/integrations/shopify/auth
 * 发起 Shopify OAuth — 跳转到 Shopify 授权页
 * Query: ?shop=yourstore
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const shop = searchParams.get("shop");

  if (!shop) {
    return NextResponse.json({ error: "Missing ?shop= parameter" }, { status: 400 });
  }

  const state = Buffer.from(JSON.stringify({ shop, ts: Date.now() })).toString("base64");
  const url = getShopifyOAuthUrl(shop, state);

  return NextResponse.redirect(url);
}
