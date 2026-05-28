import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { verifyOperatorToken } from "@/lib/saas-auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const operator = await verifyOperatorToken(req);
  if (!operator) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const TENANT_ID = operator.tenantId;

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
