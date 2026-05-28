// Kitting 详情 API
import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { verifyOperatorToken } from "@/lib/saas-auth";
import { apiHandler } from "@/lib/api-handler";

export const GET = apiHandler(async (req, { params }: any) => {
  const operator = await verifyOperatorToken(req);
  if (!operator) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createServiceClient();
  const { data: kit } = await supabase!
    .from("kits")
    .select("*, kit_components(*, products(sku, name)), products!kits_kit_product_id_fkey(sku, name)")
    .eq("id", params.id)
    .eq("tenant_id", operator.tenantId)
    .single();

  if (!kit) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ kit });
});

export const PATCH = apiHandler(async (req, { params }: any) => {
  const operator = await verifyOperatorToken(req);
  if (!operator) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createServiceClient();
  const body = await req.json();
  const updates: any = {};
  if (body.is_active !== undefined) updates.is_active = body.is_active;
  if (body.instructions !== undefined) updates.instructions = body.instructions;
  if (body.labor_cost !== undefined) updates.labor_cost = body.labor_cost;

  const { data, error } = await supabase!
    .from("kits")
    .update(updates)
    .eq("id", params.id)
    .eq("tenant_id", operator.tenantId)
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ kit: data });
});

export const DELETE = apiHandler(async (req, { params }: any) => {
  const operator = await verifyOperatorToken(req);
  if (!operator) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createServiceClient();
  await supabase!.from("kit_components").delete().eq("kit_id", params.id);
  await supabase!.from("kits").delete().eq("id", params.id).eq("tenant_id", operator.tenantId);

  return NextResponse.json({ success: true });
});
