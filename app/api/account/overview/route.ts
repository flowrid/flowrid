import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { requireBrandUser } from "@/lib/account-auth";

export async function GET(req: Request) {
  try {
    const user = await requireBrandUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createServiceClient();
    if (!supabase) {
      return NextResponse.json({ error: "DB unavailable" }, { status: 503 });
    }

    // 并行查询所有指标
    const [
      { count: savedCount },
      { count: rfqCount },
      { data: shopifyData },
      { count: totalProviders },
    ] = await Promise.all([
      supabase.from("saved_3pls").select("*", { count: "exact", head: true }).eq("user_id", user.userId),
      supabase.from("rfq_requests").select("*", { count: "exact", head: true }).eq("email", user.email),
      supabase.from("brand_integration_connections")
        .select("is_active, last_sync_at")
        .eq("brand_user_id", user.userId)
        .eq("platform_name", "shopify")
        .maybeSingle(),
      supabase.from("pl_providers").select("*", { count: "exact", head: true }),
    ]);

    return NextResponse.json({
      savedCount: savedCount ?? 0,
      rfqCount: rfqCount ?? 0,
      shopifyConnected: shopifyData?.is_active ?? false,
      lastSyncAt: shopifyData?.last_sync_at ?? null,
      totalProviders: totalProviders ?? 0,
    });
  } catch (e) {
    console.error("/api/account/overview error:", e);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
