// 月台预约详情 API
import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { verifyOperatorToken } from "@/lib/saas-auth";
import { apiHandler } from "@/lib/api-handler";

export const PATCH = apiHandler(async (req, { params }: any) => {
  const operator = await verifyOperatorToken(req);
  if (!operator) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createServiceClient();
  const body = await req.json();
  const updates: any = { updated_at: new Date().toISOString() };

  if (body.status) updates.status = body.status;
  if (body.dock_door) updates.dock_door = body.dock_door;
  if (body.scheduled_start) updates.scheduled_start = body.scheduled_start;
  if (body.scheduled_end) updates.scheduled_end = body.scheduled_end;
  if (body.actual_start) updates.actual_start = body.actual_start;
  if (body.actual_end) updates.actual_end = body.actual_end;
  if (body.notes !== undefined) updates.notes = body.notes;

  const { data, error } = await supabase!
    .from("dock_appointments")
    .update(updates)
    .eq("id", params.id)
    .eq("tenant_id", operator.tenantId)
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ appointment: data });
});

export const DELETE = apiHandler(async (req, { params }: any) => {
  const operator = await verifyOperatorToken(req);
  if (!operator) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createServiceClient();
  await supabase!
    .from("dock_appointments")
    .delete()
    .eq("id", params.id)
    .eq("tenant_id", operator.tenantId);

  return NextResponse.json({ success: true });
});
