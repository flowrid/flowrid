import { NextResponse } from "next/server";
import { requireBrandUser } from "@/lib/account-auth";
import { shopifyAPI } from "@/lib/shopify";
import { createServiceClient } from "@/lib/supabase";

const TABLE_ERROR = "Brand integration table is not configured. Run data/brand-integrations-schema.sql in Supabase.";

type ShopifyShopResponse = {
  shop?: {
    name?: string;
    plan_name?: string;
  };
};

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Connection failed";
}

function normalizeShop(shop: string): string {
  return shop
    .trim()
    .replace(/^https?:\/\//, "")
    .replace(/\/.*$/, "")
    .replace(/\.myshopify\.com$/i, "")
    .toLowerCase();
}

export async function POST(req: Request) {
  const brand = await requireBrandUser(req);
  if (!brand) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { action, shop, access_token } = await req.json();
    const normalizedShop = normalizeShop(shop || "");

    if (!normalizedShop || !access_token) {
      return NextResponse.json({ error: "Missing shop or access_token" }, { status: 400 });
    }

    const data = await shopifyAPI(normalizedShop, access_token, "shop.json") as ShopifyShopResponse;
    if (!data.shop) {
      return NextResponse.json({ error: "Invalid Shopify token" }, { status: 401 });
    }

    if (action === "test") {
      return NextResponse.json({
        success: true,
        shop: data.shop.name,
        plan: data.shop.plan_name,
      });
    }

    if (action !== "connect") {
      return NextResponse.json({ error: "Unsupported action" }, { status: 400 });
    }

    const supabase = createServiceClient();
    if (!supabase) return NextResponse.json({ error: "DB unavailable" }, { status: 503 });

    const { error } = await supabase.from("brand_integration_connections").upsert({
      brand_user_id: brand.userId,
      brand_email: brand.email,
      company_name: brand.company,
      platform_type: "shopping_cart",
      platform_name: "shopify",
      connection_type: "api",
      credentials: { shop: normalizedShop, access_token },
      endpoint_url: `https://${normalizedShop}.myshopify.com`,
      is_active: true,
      sync_frequency: "manual",
      updated_at: new Date().toISOString(),
    }, { onConflict: "brand_user_id,platform_name" });

    if (error) {
      console.error("Brand Shopify connect error:", error);
      return NextResponse.json({ error: TABLE_ERROR }, { status: 503 });
    }

    return NextResponse.json({
      success: true,
      shop: data.shop.name,
      plan: data.shop.plan_name,
    });
  } catch (error: unknown) {
    console.error("Brand Shopify connect exception:", error);
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
