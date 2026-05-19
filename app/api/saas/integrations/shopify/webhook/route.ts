import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { normalizeShopifyOrder } from "@/lib/shopify";

const TENANT_ID = "00000000-0000-0000-0000-000000000001";
const WAREHOUSE_ID = "00000000-0000-0000-0000-000000000001";

/**
 * POST /api/saas/integrations/shopify/webhook
 * 接收 Shopify Webhook: orders/create, orders/update
 */
export async function POST(req: Request) {
  try {
    const topic = req.headers.get("x-shopify-topic") || "";
    const body = await req.json();

    // 验证是订单事件
    if (!topic.startsWith("orders/")) {
      return NextResponse.json({ success: true, skipped: true });
    }

    const supabase = createServiceClient();
    if (!supabase) return NextResponse.json({ error: "DB unavailable" }, { status: 503 });

    const order = body as Record<string, unknown>;
    const normalized = normalizeShopifyOrder(order);

    // 检查是否已存在
    const { data: existing } = await supabase
      .from("orders")
      .select("id, status")
      .eq("tenant_id", TENANT_ID)
      .eq("external_order_id", normalized.external_order_id)
      .maybeSingle();

    if (existing) {
      const ex = existing as Record<string, unknown>;
      const shopifyStatus = (order.financial_status as string || "").toLowerCase();
      const mapStatus = (s: string) => {
        if (s === "paid" || s === "fulfilled") return "shipped";
        if (s === "partially_fulfilled") return "packed";
        return "pending";
      };

      await supabase.from("orders")
        .update({ status: mapStatus(shopifyStatus), updated_at: new Date().toISOString() })
        .eq("id", ex.id as string);
    } else {
      // 插入新订单
      await supabase.from("orders").insert({
        tenant_id: TENANT_ID,
        warehouse_id: WAREHOUSE_ID,
        order_number: normalized.order_number,
        external_order_id: normalized.external_order_id,
        source: "shopify",
        customer_name: normalized.customer_name,
        customer_email: normalized.customer_email,
        shipping_address_line1: normalized.shipping_address_line1,
        shipping_city: normalized.shipping_city,
        shipping_state: normalized.shipping_state,
        shipping_zip: normalized.shipping_zip,
        shipping_country: normalized.shipping_country,
        status: "pending",
        priority: "normal",
        created_at: normalized.created_at || new Date().toISOString(),
      });

      // 记录同步日志
      await supabase.from("integration_sync_logs").insert({
        connection_id: null, // 可查到具体 connection
        sync_type: "order_import",
        records_processed: 1,
        status: "completed",
      });
    }

    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error("Shopify webhook error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
