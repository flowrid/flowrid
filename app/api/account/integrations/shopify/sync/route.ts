import { NextResponse } from "next/server";
import { requireBrandUser } from "@/lib/account-auth";
import { fetchShopifyOrders } from "@/lib/shopify";
import { createServiceClient } from "@/lib/supabase";

const TABLE_ERROR = "Brand integration table is not configured. Run data/brand-integrations-schema.sql in Supabase.";

type BrandShopifyConnectionRow = {
  id: string;
  credentials: {
    shop?: string;
    access_token?: string;
  } | null;
};

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Sync failed";
}

export async function POST(req: Request) {
  const brand = await requireBrandUser(req);
  if (!brand) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createServiceClient();
  if (!supabase) return NextResponse.json({ error: "DB unavailable" }, { status: 503 });

  const { data: conn, error: connectionError } = await supabase
    .from("brand_integration_connections")
    .select("id, credentials")
    .eq("brand_user_id", brand.userId)
    .eq("platform_name", "shopify")
    .eq("is_active", true)
    .maybeSingle();

  if (connectionError) {
    console.error("Brand Shopify sync connection error:", connectionError);
    return NextResponse.json({ error: TABLE_ERROR }, { status: 503 });
  }

  if (!conn) return NextResponse.json({ error: "Shopify not connected" }, { status: 400 });

  const row = conn as BrandShopifyConnectionRow;
  const { shop, access_token } = row.credentials || {};
  if (!shop || !access_token) {
    return NextResponse.json({ error: "Invalid Shopify connection" }, { status: 400 });
  }

  const startedAt = new Date().toISOString();

  try {
    const orders = await fetchShopifyOrders(shop, access_token, new Date(Date.now() - 30 * 86400000));
    const completedAt = new Date().toISOString();

    await supabase
      .from("brand_integration_connections")
      .update({ last_sync_at: completedAt, updated_at: completedAt })
      .eq("id", row.id)
      .eq("brand_user_id", brand.userId);

    const { error: logError } = await supabase.from("brand_integration_sync_logs").insert({
      connection_id: row.id,
      brand_user_id: brand.userId,
      sync_type: "order_import_preview",
      records_processed: orders.length,
      records_failed: 0,
      status: "completed",
      started_at: startedAt,
      completed_at: completedAt,
    });

    if (logError) console.error("Brand Shopify sync log error:", logError);

    return NextResponse.json({ success: true, imported: orders.length });
  } catch (error: unknown) {
    const completedAt = new Date().toISOString();
    const errorMessage = getErrorMessage(error);

    await supabase.from("brand_integration_sync_logs").insert({
      connection_id: row.id,
      brand_user_id: brand.userId,
      sync_type: "order_import_preview",
      records_processed: 0,
      records_failed: 0,
      status: "failed",
      error_message: errorMessage,
      started_at: startedAt,
      completed_at: completedAt,
    });

    console.error("Brand Shopify sync exception:", error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
