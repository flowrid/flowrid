// Container / Movable Unit API
import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { verifyOperatorToken } from "@/lib/saas-auth";
import { apiHandler } from "@/lib/api-handler";

export const GET = apiHandler(async (req) => {
  const operator = await verifyOperatorToken(req);
  if (!operator) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createServiceClient();
  const url = new URL(req.url);
  const warehouseId = url.searchParams.get("warehouse_id");
  const status = url.searchParams.get("status");
  const search = url.searchParams.get("search");

  let query = supabase!
    .from("containers")
    .select("*, locations(barcode, zone, aisle)", { count: "exact" })
    .eq("tenant_id", operator.tenantId)
    .order("created_at", { ascending: false });

  if (warehouseId) query = query.eq("warehouse_id", warehouseId);
  if (status) query = query.eq("status", status);
  if (search) query = query.or(`barcode.ilike.%${search}%,name.ilike.%${search}%`);

  const { data, count } = await query;
  return NextResponse.json({ data, total: count });
});

export const POST = apiHandler(async (req) => {
  const operator = await verifyOperatorToken(req);
  if (!operator) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createServiceClient();
  const body = await req.json();

  const barcode = body.barcode || `CTR-${Date.now().toString(36).toUpperCase()}`;

  const { data, error } = await supabase!
    .from("containers")
    .insert({
      tenant_id: operator.tenantId,
      warehouse_id: body.warehouse_id,
      container_type: body.container_type || "pallet",
      barcode,
      name: body.name || barcode,
      location_id: body.location_id,
      max_weight_lbs: body.max_weight_lbs,
      max_volume_cuft: body.max_volume_cuft,
    })
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ container: data }, { status: 201 });
});
