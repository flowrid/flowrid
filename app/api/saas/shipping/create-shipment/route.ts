import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { createShipment as wmsCreateShipment } from "@/lib/saas-wms";

export const dynamic = "force-dynamic";

const TENANT_ID = "00000000-0000-0000-0000-000000000001";

export async function POST(request: Request) {
  const supabase = createServiceClient();
  if (!supabase) return NextResponse.json({ error: "DB unavailable" }, { status: 503 });

  const body = await request.json();
  const { orderId, carrier, serviceLevel, trackingNumber, shippingCost, labelUrl, packageId } = body;

  if (!orderId || !carrier) {
    return NextResponse.json({ error: "Missing orderId or carrier" }, { status: 400 });
  }

  const tn = trackingNumber || `FLOW-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

  try {
    const shipment = await wmsCreateShipment(orderId, TENANT_ID, packageId || orderId, {
      carrier,
      service_level: serviceLevel || "ground",
      tracking_number: tn,
      shipping_cost: shippingCost || 0,
      label_url: labelUrl || `/api/saas/shipping/label/${tn}`,
    });

    return NextResponse.json({ success: true, shipment, trackingNumber: tn });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
