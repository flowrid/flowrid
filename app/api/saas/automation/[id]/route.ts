// 自动化规则详情 API
import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { verifyOperatorToken } from "@/lib/saas-auth";
import { apiHandler } from "@/lib/api-handler";

export const GET = apiHandler(async (req, { params }: any) => {
  const operator = await verifyOperatorToken(req);
  if (!operator) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createServiceClient();
  const { data } = await supabase!
    .from("automation_rules")
    .select("*")
    .eq("id", params.id)
    .eq("tenant_id", operator.tenantId)
    .single();

  if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ rule: data });
});

export const PATCH = apiHandler(async (req, { params }: any) => {
  const operator = await verifyOperatorToken(req);
  if (!operator) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createServiceClient();
  const body = await req.json();
  const updates: any = {};
  if (body.name !== undefined) updates.name = body.name;
  if (body.description !== undefined) updates.description = body.description;
  if (body.trigger !== undefined) updates.trigger_event = body.trigger;
  if (body.conditions !== undefined) updates.conditions = body.conditions;
  if (body.actions !== undefined) updates.actions = body.actions;
  if (body.is_active !== undefined) updates.is_active = body.is_active;
  if (body.priority !== undefined) updates.priority = body.priority;
  updates.updated_at = new Date().toISOString();

  const { data, error } = await supabase!
    .from("automation_rules")
    .update(updates)
    .eq("id", params.id)
    .eq("tenant_id", operator.tenantId)
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ rule: data });
});

export const DELETE = apiHandler(async (req, { params }: any) => {
  const operator = await verifyOperatorToken(req);
  if (!operator) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createServiceClient();
  const { error } = await supabase!
    .from("automation_rules")
    .delete()
    .eq("id", params.id)
    .eq("tenant_id", operator.tenantId);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ success: true });
});
