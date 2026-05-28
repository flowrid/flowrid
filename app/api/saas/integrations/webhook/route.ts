// 集成 Webhook 接收器 — 统一处理各平台 webhook
// 平台识别: URL param 或 header

import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { processEDIPurchaseOrder } from "@/lib/edi";
import { triggerEvent } from "@/lib/automation-engine";

export async function POST(req: Request) {
  const url = new URL(req.url);
  const platform = url.searchParams.get("platform") || "unknown";

  const supabase = createServiceClient();
  const rawBody = await req.text();
  const signature = req.headers.get("x-hub-signature") || req.headers.get("x-wc-webhook-signature") || "";

  try {
    // 查找租户对应的连接
    const body = rawBody.startsWith("{") ? JSON.parse(rawBody) : { raw: rawBody };
    const externalOrderId =
      body.amazonOrderId ||
      body.orderId ||
      body.id ||
      body.order?.id ||
      body.purchaseOrderId ||
      "";

    // EDI: X12 raw body
    if (platform === "edi" && rawBody.includes("ISA*")) {
      // 从 ISA 获取 sender ID 查找租户
      const { data: conn } = await supabase!
        .from("integration_connections")
        .select("tenant_id")
        .eq("platform_name", "edi")
        .eq("status", "connected")
        .maybeSingle();

      if (conn) {
        const tenantId = (conn as any).tenant_id;
        await processEDIPurchaseOrder(tenantId, rawBody);
      }
      return NextResponse.json({ received: true });
    }

    // 通用 webhook 处理: 更新/创建订单
    const eventType = body.event || body.eventType || body.type || "unknown";

    if (externalOrderId) {
      // 尝试通过 external_order_id 查找租户
      const { data: order } = await supabase!
        .from("orders")
        .select("tenant_id")
        .eq("external_order_id", String(externalOrderId))
        .maybeSingle();

      if (order) {
        const tenantId = (order as any).tenant_id;

        // 更新订单状态
        await supabase!
          .from("orders")
          .update({
            status: mapPlatformStatus(platform, body.status || body.orderStatus || "pending"),
            metadata: { webhook_body: body },
            updated_at: new Date().toISOString(),
          })
          .eq("external_order_id", String(externalOrderId));

        // 触发自动化规则
        triggerEvent(tenantId, "order.status_changed", (order as any).id, {
          previous_status: (order as any).status,
          new_status: mapPlatformStatus(platform, body.status || body.orderStatus || "pending"),
          platform,
        });
      }
    }

    return NextResponse.json({ received: true, platform });
  } catch (err: any) {
    return NextResponse.json({ error: "Failed to process webhook", detail: err.message }, { status: 500 });
  }
}

function mapPlatformStatus(platform: string, status: string): string {
  if (platform === "amazon") {
    const m: Record<string, string> = { Unshipped: "pending", PartiallyShipped: "shipped", Shipped: "shipped", Canceled: "cancelled" };
    return m[status] || "pending";
  }
  if (platform === "bigcommerce") {
    const m: Record<string, string> = { "1": "pending", "2": "pending", "9": "shipped", "10": "delivered", "11": "cancelled" };
    return m[status] || "pending";
  }
  return status?.toLowerCase().includes("cancel") ? "cancelled" : status?.toLowerCase().includes("ship") ? "shipped" : "pending";
}
