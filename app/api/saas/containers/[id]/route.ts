// Container 详情 API
import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { verifyOperatorToken } from "@/lib/saas-auth";
import { apiHandler } from "@/lib/api-handler";

export const GET = apiHandler(async (req, { params }: any) => {
  const operator = await verifyOperatorToken(req);
  if (!operator) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createServiceClient();
  const { data: container } = await supabase!
    .from("containers")
    .select("*, container_items(*, products(sku, name)), locations(barcode, zone)")
    .eq("id", params.id)
    .eq("tenant_id", operator.tenantId)
    .single();

  if (!container) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ container });
});

export const PATCH = apiHandler(async (req, { params }: any) => {
  const operator = await verifyOperatorToken(req);
  if (!operator) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createServiceClient();
  const body = await req.json();
  const updates: any = { updated_at: new Date().toISOString() };

  if (body.status) updates.status = body.status;
  if (body.location_id !== undefined) updates.location_id = body.location_id;
  if (body.name) updates.name = body.name;

  const { data } = await supabase!
    .from("containers")
    .update(updates)
    .eq("id", params.id)
    .eq("tenant_id", operator.tenantId)
    .select("*")
    .single();

  return NextResponse.json({ container: data });
});

// 添加/移除 container items
export const POST = apiHandler(async (req, { params }: any) => {
  const operator = await verifyOperatorToken(req);
  if (!operator) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createServiceClient();
  const body = await req.json();

  if (body.action === "add") {
    const { data, error } = await supabase!
      .from("container_items")
      .insert({
        container_id: params.id,
        product_id: body.product_id,
        inventory_id: body.inventory_id,
        quantity: body.quantity || 1,
        lot_number: body.lot_number,
      })
      .select("*")
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ item: data }, { status: 201 });
  }

  if (body.action === "remove") {
    await supabase!
      .from("container_items")
      .delete()
      .eq("id", body.item_id)
      .eq("container_id", params.id);

    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
});
