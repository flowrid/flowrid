// ShipStation 集成 — ShipStation REST API
// 认证: API Key + API Secret (Basic Auth)
// https://www.shipstation.com/docs/api/

import { createServiceClient } from "@/lib/supabase";

export interface ShipStationCredentials {
  apiKey: string;
  apiSecret: string;
  baseUrl?: string; // 默认 https://ssapi.shipstation.com
}

const SS_API_BASE = "https://ssapi.shipstation.com";

/**
 * 保存凭证
 */
export async function saveShipStationCredentials(tenantId: string, creds: ShipStationCredentials): Promise<string | null> {
  const supabase = createServiceClient();
  if (!supabase) return null;

  const { data } = await supabase
    .from("integration_connections")
    .upsert({
      tenant_id: tenantId, platform_name: "shipstation", connection_type: "api",
      credentials: creds as any, status: "connected",
      updated_at: new Date().toISOString(),
    }, { onConflict: "tenant_id,platform_name" })
    .select("id").single();

  return (data as any)?.id || null;
}

function shipStationHeaders(creds: ShipStationCredentials): Record<string, string> {
  const auth = Buffer.from(`${creds.apiKey}:${creds.apiSecret}`).toString("base64");
  return { Authorization: `Basic ${auth}`, "Content-Type": "application/json" };
}

/**
 * 测试连接
 */
export async function testShipStationConnection(creds: ShipStationCredentials): Promise<boolean> {
  try {
    const res = await fetch(`${creds.baseUrl || SS_API_BASE}/stores`, {
      headers: shipStationHeaders(creds),
    });
    return res.ok;
  } catch { return false; }
}

/**
 * 获取运费
 */
export async function getShipStationRates(
  creds: ShipStationCredentials,
  params: {
    carrierCode?: string;
    fromPostalCode: string;
    toPostalCode: string;
    weightOz: number;
    dimensions?: { length: number; width: number; height: number };
  }
): Promise<any[]> {
  const res = await fetch(`${creds.baseUrl || SS_API_BASE}/shipments/getrates`, {
    method: "POST",
    headers: shipStationHeaders(creds),
    body: JSON.stringify({
      carrierCode: params.carrierCode || null,
      fromPostalCode: params.fromPostalCode,
      toPostalCode: params.toPostalCode,
      weight: { value: params.weightOz, units: "ounces" },
      dimensions: params.dimensions ? {
        length: params.dimensions.length,
        width: params.dimensions.width,
        height: params.dimensions.height,
        units: "inches",
      } : undefined,
    }),
  });
  if (!res.ok) return [];
  return (await res.json()) || [];
}

/**
 * 创建 ShipStation 运单
 */
export async function createShipStationLabel(
  creds: ShipStationCredentials,
  orderId: string,
  carrierCode: string,
  serviceCode: string,
  packageCode?: string
): Promise<{ shipmentId: string; trackingNumber: string; labelUrl: string } | null> {
  const res = await fetch(`${creds.baseUrl || SS_API_BASE}/orders/createorder`, {
    method: "POST",
    headers: shipStationHeaders(creds),
    body: JSON.stringify({
      orderId, carrierCode, serviceCode, packageCode: packageCode || "package",
    }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  return {
    shipmentId: data.shipmentId?.toString() || "",
    trackingNumber: data.trackingNumber || "",
    labelUrl: data.labelData || "",
  };
}

/**
 * 同步订单（从 ShipStation 拉取）
 */
export async function syncShipStationOrders(
  tenantId: string, creds: ShipStationCredentials, days: number = 7
): Promise<{ synced: number; errors: string[] }> {
  const supabase = createServiceClient();
  if (!supabase) return { synced: 0, errors: ["Database unavailable"] };

  const result = { synced: 0, errors: [] as string[] };
  const createDateStart = new Date(Date.now() - days * 86400000).toISOString();

  try {
    const res = await fetch(
      `${creds.baseUrl || SS_API_BASE}/orders?createDateStart=${createDateStart}&pageSize=50`,
      { headers: shipStationHeaders(creds) }
    );
    if (!res.ok) return { synced: 0, errors: [`ShipStation error ${res.status}`] };

    const data = await res.json();
    const orders = data.orders || [];

    for (const order of orders) {
      try {
        await supabase.from("orders").upsert({
          tenant_id: tenantId, external_order_id: order.orderId?.toString() || order.orderNumber,
          status: mapSSStatus(order.orderStatus),
          shipping_name: order.shipTo?.name || undefined,
          shipping_address1: order.shipTo?.street1 || undefined,
          shipping_city: order.shipTo?.city || undefined,
          shipping_state: order.shipTo?.state || undefined,
          shipping_zip: order.shipTo?.postalCode || undefined,
          shipping_country: order.shipTo?.country || undefined,
          shipping_carrier: order.carrierCode || undefined,
          created_at: order.createDate, updated_at: new Date().toISOString(),
        }, { onConflict: "tenant_id,external_order_id" });

        // 同步行项目
        for (const item of order.items || []) {
          await supabase.from("order_items").upsert({
            order_id: order.orderId?.toString(), sku: item.sku,
            quantity_ordered: item.quantity, unit_price: item.unitPrice,
          }, { onConflict: "" });
        }
        result.synced++;
      } catch { result.errors.push(`Failed to sync order ${order.orderId}`); }
    }
  } catch (err: any) { result.errors.push(err.message); }

  return result;
}

function mapSSStatus(status: string): string {
  const map: Record<string, string> = {
    awaiting_payment: "pending", awaiting_shipment: "pending",
    shipped: "shipped", delivered: "delivered", cancelled: "cancelled", on_hold: "pending",
  };
  return map[status] || "pending";
}
