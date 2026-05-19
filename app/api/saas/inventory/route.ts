import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

const TENANT_ID = "00000000-0000-0000-0000-000000000001";

export async function GET() {
  const supabase = createServiceClient();
  if (!supabase) return NextResponse.json({ products: [], warehouses: [], stats: {} });

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("tenant_id", TENANT_ID);

  const { data: warehouses } = await supabase
    .from("warehouses")
    .select("*")
    .eq("tenant_id", TENANT_ID);

  const { count: totalSKUs } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true })
    .eq("tenant_id", TENANT_ID);

  return NextResponse.json({
    products: products || [],
    warehouses: warehouses || [],
    stats: { totalSKUs: totalSKUs || 0 },
  });
}
