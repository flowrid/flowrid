// 月台预约 API
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
  const dateFrom = url.searchParams.get("date_from") || new Date().toISOString().split("T")[0];
  const dateTo = url.searchParams.get("date_to");
  const status = url.searchParams.get("status");

  let query = supabase!
    .from("dock_appointments")
    .select("*")
    .eq("tenant_id", operator.tenantId)
    .gte("scheduled_start", dateFrom)
    .order("scheduled_start", { ascending: true });

  if (warehouseId) query = query.eq("warehouse_id", warehouseId);
  if (dateTo) query = query.lte("scheduled_end", dateTo);
  if (status) query = query.eq("status", status);

  const { data } = await query;
  return NextResponse.json({ data });
});

export const POST = apiHandler(async (req) => {
  const operator = await verifyOperatorToken(req);
  if (!operator) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createServiceClient();
  const body = await req.json();

  const { data, error } = await supabase!
    .from("dock_appointments")
    .insert({
      tenant_id: operator.tenantId,
      warehouse_id: body.warehouse_id,
      dock_door: body.dock_door,
      appointment_type: body.appointment_type || "inbound",
      reference_type: body.reference_type,
      reference_id: body.reference_id,
      carrier: body.carrier,
      trailer_number: body.trailer_number,
      scheduled_start: body.scheduled_start,
      scheduled_end: body.scheduled_end,
      notes: body.notes,
      created_by: operator.userId,
    })
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ appointment: data }, { status: 201 });
});
