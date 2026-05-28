// 周期盘点详情 API
import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { verifyOperatorToken } from "@/lib/saas-auth";
import { apiHandler } from "@/lib/api-handler";

export const GET = apiHandler(async (req, { params }: any) => {
  const operator = await verifyOperatorToken(req);
  if (!operator) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createServiceClient();
  const { data: session } = await supabase!
    .from("cycle_count_sessions")
    .select("*")
    .eq("id", params.id)
    .eq("tenant_id", operator.tenantId)
    .single();

  if (!session) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { data: items } = await supabase!
    .from("cycle_count_items")
    .select("*, products(name, sku), locations(barcode, zone)")
    .eq("session_id", params.id)
    .order("status", { ascending: true });

  return NextResponse.json({ session, items });
});

export const PATCH = apiHandler(async (req, { params }: any) => {
  const operator = await verifyOperatorToken(req);
  if (!operator) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createServiceClient();
  const body = await req.json();

  // 更新 session 状态
  if (body.status) {
    const updates: any = { status: body.status };
    if (body.status === "in_progress") updates.started_at = new Date().toISOString();
    if (body.status === "completed") updates.completed_at = new Date().toISOString();

    const { data } = await supabase!
      .from("cycle_count_sessions")
      .update(updates)
      .eq("id", params.id)
      .eq("tenant_id", operator.tenantId)
      .select("*")
      .single();

    return NextResponse.json({ session: data });
  }

  // 更新盘点项
  if (body.items) {
    for (const item of body.items) {
      const variance = (item.counted_quantity || 0) - (item.expected_quantity || 0);
      await supabase!
        .from("cycle_count_items")
        .update({
          counted_quantity: item.counted_quantity,
          variance,
          counted_by: operator.userId,
          counted_at: new Date().toISOString(),
          status: item.status || "counted",
        })
        .eq("id", item.id)
        .eq("session_id", params.id);
    }
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "No updates provided" }, { status: 400 });
});
