import { NextResponse } from "next/server";
import { requireBrandUser } from "@/lib/account-auth";
import { createServiceClient } from "@/lib/supabase";

const TABLE_ERROR = "Brand integration table is not configured. Run data/brand-integrations-schema.sql in Supabase.";

type ShopifyStatusRow = {
  is_active: boolean | null;
  last_sync_at: string | null;
  credentials: { shop?: string } | null;
};

export async function GET(req: Request) {
  const brand = await requireBrandUser(req);
  if (!brand) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createServiceClient();
  if (!supabase) return NextResponse.json({ error: "DB unavailable" }, { status: 503 });

  const { data, error } = await supabase
    .from("brand_integration_connections")
    .select("is_active, last_sync_at, credentials")
    .eq("brand_user_id", brand.userId)
    .eq("platform_name", "shopify")
    .maybeSingle();

  if (error) {
    console.error("Brand Shopify status error:", error);
    return NextResponse.json({ error: TABLE_ERROR }, { status: 503 });
  }

  if (!data) return NextResponse.json({ connected: false, lastSync: null, shop: null, recentLogs: [] });

  const row = data as ShopifyStatusRow;

  // 获取最近同步日志
  const { data: logs } = await supabase
    .from("brand_integration_sync_logs")
    .select("sync_type, records_processed, status, error_message, started_at, completed_at")
    .eq("brand_user_id", brand.userId)
    .order("started_at", { ascending: false })
    .limit(10);

  return NextResponse.json({
    connected: row.is_active || false,
    lastSync: row.last_sync_at || null,
    shop: row.credentials?.shop || null,
    recentLogs: logs || [],
  });
}
