/**
 * Flowrid Webhook Dispatch Engine
 * HMAC-SHA256 signing + fire-and-forget delivery to registered endpoints
 */
import { createHmac, randomBytes } from "crypto";
import { createServiceClient } from "./supabase";

export type WebhookEvent =
  | "order.created"
  | "order.status_changed"
  | "shipment.created"
  | "inventory.updated"
  | "ping";

export const WEBHOOK_EVENTS: { value: WebhookEvent; label: string }[] = [
  { value: "order.created", label: "Order Created" },
  { value: "order.status_changed", label: "Order Status Changed" },
  { value: "shipment.created", label: "Shipment Created" },
  { value: "inventory.updated", label: "Inventory Updated" },
];

export function generateWebhookSecret(): string {
  return randomBytes(32).toString("hex");
}

export function generateHmacSignature(body: string, secret: string): string {
  return createHmac("sha256", secret).update(body).digest("hex");
}

/**
 * 分发 webhook 事件到租户所有匹配的活跃订阅
 * fire-and-forget — 不阻塞主流程
 */
export function dispatchWebhookEvent(
  tenantId: string,
  event: WebhookEvent,
  payload: Record<string, unknown>
): void {
  void deliverToSubscribers(tenantId, event, payload);
}

async function deliverToSubscribers(
  tenantId: string,
  event: WebhookEvent,
  payload: Record<string, unknown>
): Promise<void> {
  const supabase = createServiceClient();
  if (!supabase) return;

  const { data: subscriptions } = await supabase
    .from("webhook_subscriptions")
    .select("*")
    .eq("tenant_id", tenantId)
    .eq("is_active", true)
    .contains("events", [event]);

  if (!subscriptions || subscriptions.length === 0) return;

  const body = JSON.stringify({
    event,
    data: payload,
    timestamp: new Date().toISOString(),
  });

  await Promise.allSettled(
    subscriptions.map((sub: any) => deliverWebhook(sub, event, body))
  );
}

async function deliverWebhook(
  subscription: any,
  event: string,
  body: string
): Promise<void> {
  const supabase = createServiceClient();
  if (!supabase) return;

  const signature = generateHmacSignature(body, subscription.secret);
  const start = Date.now();

  try {
    const res = await fetch(subscription.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Flowrid-Event": event,
        "X-Flowrid-Signature": signature,
        "X-Flowrid-Delivery-Id": subscription.id,
      },
      body,
      signal: AbortSignal.timeout(10000),
    });

    const responseBody = await res.text().catch(() => "");

    await supabase.from("webhook_delivery_logs").insert({
      tenant_id: subscription.tenant_id,
      subscription_id: subscription.id,
      event,
      request_body: body,
      response_status: res.status,
      response_body: responseBody.substring(0, 2000),
      success: res.ok,
    });

    // 更新 last_triggered_at
    if (res.ok) {
      await supabase
        .from("webhook_subscriptions")
        .update({ last_triggered_at: new Date().toISOString() })
        .eq("tenant_id", subscription.tenant_id)
        .eq("id", subscription.id);
    }
  } catch {
    await supabase.from("webhook_delivery_logs").insert({
      tenant_id: subscription.tenant_id,
      subscription_id: subscription.id,
      event,
      request_body: body,
      response_status: null,
      response_body: "Delivery failed: timeout or network error",
      success: false,
    });
  }
}
