import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const supabase = createServiceClient();
  if (!supabase) return NextResponse.json({ error: "DB unavailable" }, { status: 503 });

  const { barcode, warehouseId } = await request.json();
  if (!barcode) return NextResponse.json({ type: "unknown" });

  // Try matching against locations
  const { data: location } = await supabase
    .from("locations")
    .select("*, warehouses(name, code)")
    .eq("barcode", barcode)
    .maybeSingle();

  if (location) {
    const { data: items } = await supabase
      .from("inventory")
      .select("*, products(name, sku, upc)")
      .eq("location_id", (location as any).id);
    return NextResponse.json({ type: "location", data: { ...location, inventory: items || [] } });
  }

  // Try matching against products (UPC or SKU)
  const { data: product } = await supabase
    .from("products")
    .select("*")
    .or(`upc.eq.${barcode},sku.eq.${barcode}`)
    .maybeSingle();

  if (product && warehouseId) {
    const { data: inv } = await supabase
      .from("inventory")
      .select("*, locations(barcode, zone, aisle, rack, shelf, bin)")
      .eq("product_id", (product as any).id)
      .eq("warehouse_id", warehouseId);
    return NextResponse.json({ type: "product", data: { ...product, inventory: inv || [] } });
  }

  if (product) {
    return NextResponse.json({ type: "product", data: product });
  }

  // Try matching against orders
  const { data: order } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("order_number", barcode)
    .maybeSingle();

  if (order) {
    return NextResponse.json({ type: "order", data: order });
  }

  return NextResponse.json({ type: "unknown" });
}
