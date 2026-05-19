import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { fetchShopifyOrders } from "@/lib/shopify";

const TENANT_ID = "00000000-0000-0000-0000-000000000001";
const WAREHOUSE_ID = "00000000-0000-0000-0000-000000000001";

/**
 * POST /api/saas/integrations/shopify/sync
 * 手动触发 Shopify 订单同步
 */
export async function POST() {
  const supabase = createServiceClient();
  if (!supabase) return NextResponse.json({ error: "DB unavailable" }, { status: 503 });

  const { data: conn } = await supabase
    .from("integration_connections")
    .select("credentials")
    .eq("tenant_id", TENANT_ID)
    .eq("platform_name", "shopify")
    .eq("is_active", true)
    .maybeSingle();

  if (!conn) return NextResponse.json({ error: "Shopify not connected" }, { status: 400 });

  const c = conn as any;
  const { shop, access_token } = c.credentials || {};
  if (!shop || !access_token) return NextResponse.json({ error: "Invalid connection" }, { status: 400 });

  try {
    const orders = await fetchShopifyOrders(shop, access_token, new Date(Date.now() - 30 * 86400000));
    let imported = 0;

    for (const order of orders) {
      const { data: existing } = await supabase
        .from("orders").select("id").eq("external_order_id", order.external_order_id).maybeSingle();

      if (existing) continue;

      await supabase.from("orders").insert({
        tenant_id: TENANT_ID,
        warehouse_id: WAREHOUSE_ID,
        order_number: order.order_number,
        external_order_id: order.external_order_id,
        source: "shopify",
        customer_name: order.customer_name,
        customer_email: order.customer_email,
        shipping_address_line1: order.shipping_address_line1,
        shipping_city: order.shipping_city,
        shipping_state: order.shipping_state,
        shipping_zip: order.shipping_zip,
        shipping_country: order.shipping_country,
        status: "pending",
        priority: "normal",
        created_at: order.created_at,
      });
      imported++;
    }

    await supabase.from("integration_connections")
      .update({ last_sync_at: new Date().toISOString() })
      .eq("tenant_id", TENANT_ID).eq("platform_name", "shopify");

    await supabase.from("integration_sync_logs").insert({
      connection_id: (c as any).id,
      sync_type: "order_import",
      records_processed: imported,
      status: "completed",
    });

    return NextResponse.json({ success: true, imported });
  } catch (e: any) {
    console.error("Sync error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
