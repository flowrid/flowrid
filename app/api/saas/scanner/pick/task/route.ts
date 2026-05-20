import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const supabase = createServiceClient();
  if (!supabase) return NextResponse.json({ error: "DB unavailable" }, { status: 503 });

  const { searchParams } = new URL(request.url);
  const warehouseId = searchParams.get("warehouseId");

  let query = supabase
    .from("pick_tasks")
    .select("*, pick_items(*, products(name, sku, upc), locations(barcode, zone, aisle, rack, shelf, bin))")
    .in("status", ["pending", "in_progress"]);

  if (warehouseId) {
    query = query.eq("warehouse_id", warehouseId);
  }

  const { data, error } = await query.order("priority", { ascending: true }).order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ tasks: data || [] });
}
