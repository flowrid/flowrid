import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { getRateQuotes } from "@/lib/shipping-rates";
import type { ShipmentRequest } from "@/types/saas";

export const dynamic = "force-dynamic";

const TENANT_ID = "00000000-0000-0000-0000-000000000001";

export async function POST(request: Request) {
  const supabase = createServiceClient();
  if (!supabase) return NextResponse.json({ error: "DB unavailable" }, { status: 503 });

  const body = await request.json();

  let shipmentRequest: ShipmentRequest;

  if (body.orderId) {
    // Fetch order details and derive shipment request
    const { data: order } = await supabase
      .from("orders")
      .select("shipping_zip, shipping_country, shipping_method")
      .eq("id", body.orderId)
      .single();

    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    // Get items weight from order_items + products
    const { data: items } = await supabase
      .from("order_items")
      .select("product_id, quantity_ordered")
      .eq("order_id", body.orderId);

    let totalWeight = 0;
    if (items) {
      for (const item of items) {
        const { data: product } = await supabase
          .from("products")
          .select("unit_weight_lbs, unit_length_in, unit_width_in, unit_height_in")
          .eq("id", item.product_id)
          .single();
        if (product) {
          totalWeight += (product.unit_weight_lbs || 0.5) * item.quantity_ordered;
        }
      }
    }

    // Get warehouse zip for origin
    const { data: wh } = await supabase
      .from("warehouses")
      .select("zip")
      .eq("tenant_id", TENANT_ID)
      .limit(1)
      .single();

    shipmentRequest = {
      originZip: wh?.zip || "75201",
      destinationZip: order.shipping_zip || "10001",
      weightLbs: Math.max(totalWeight, 1),
      lengthIn: body.lengthIn || 12,
      widthIn: body.widthIn || 8,
      heightIn: body.heightIn || 6,
      isResidential: body.isResidential ?? true,
      isHazmat: body.isHazmat ?? false,
      declaredValue: body.declaredValue,
    };
  } else {
    shipmentRequest = {
      originZip: body.originZip || "75201",
      destinationZip: body.destinationZip || "10001",
      weightLbs: body.weightLbs || 5,
      lengthIn: body.lengthIn || 12,
      widthIn: body.widthIn || 8,
      heightIn: body.heightIn || 6,
      isResidential: body.isResidential ?? true,
      isHazmat: body.isHazmat ?? false,
      declaredValue: body.declaredValue,
    };
  }

  try {
    const quotes = await getRateQuotes(shipmentRequest);
    return NextResponse.json({ quotes, request: shipmentRequest });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
