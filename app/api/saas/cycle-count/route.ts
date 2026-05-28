// 周期盘点 API
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

  let query = supabase!
    .from("cycle_count_sessions")
    .select("*", { count: "exact" })
    .eq("tenant_id", operator.tenantId)
    .order("created_at", { ascending: false });

  if (warehouseId) query = query.eq("warehouse_id", warehouseId);
  if (status) query = query.eq("status", status);

  const { data, count } = await query;
  return NextResponse.json({ data, total: count });
});

export const POST = apiHandler(async (req) => {
  const operator = await verifyOperatorToken(req);
  if (!operator) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createServiceClient();
  const body = await req.json();

  const { data: session, error } = await supabase!
    .from("cycle_count_sessions")
    .insert({
      tenant_id: operator.tenantId,
      warehouse_id: body.warehouse_id,
      name: body.name || `Cycle Count ${new Date().toISOString().split("T")[0]}`,
      count_type: body.count_type || "full",
      zone_filter: body.zone_filter,
      assigned_to: body.assigned_to,
    })
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  // 如果是全盘点，自动生成盘点项
  if (body.count_type === "full" || body.auto_generate) {
    let invQuery = supabase!
      .from("inventory")
      .select("product_id, location_id, quantity_on_hand")
      .eq("warehouse_id", body.warehouse_id)
      .gt("quantity_on_hand", 0);

    if (body.zone_filter) {
      invQuery = invQuery.eq("locations!inner(zone)", body.zone_filter);
    }

    const { data: inventory } = await invQuery;

    if (inventory?.length) {
      await supabase!.from("cycle_count_items").insert(
        inventory.map((inv: any) => ({
          session_id: (session as any).id,
          product_id: inv.product_id,
          location_id: inv.location_id,
          expected_quantity: inv.quantity_on_hand || 0,
          status: "pending",
        }))
      );
    }
  }

  return NextResponse.json({ session }, { status: 201 });
});
