// 自动化规则 API
import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { verifyOperatorToken } from "@/lib/saas-auth";
import { apiHandler } from "@/lib/api-handler";

export const GET = apiHandler(async (req) => {
  const operator = await verifyOperatorToken(req);
  if (!operator) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createServiceClient();
  const url = new URL(req.url);
  const activeOnly = url.searchParams.get("active") === "true";

  let query = supabase!
    .from("automation_rules")
    .select("*", { count: "exact" })
    .eq("tenant_id", operator.tenantId)
    .order("priority", { ascending: true });

  if (activeOnly) query = query.eq("is_active", true);

  const { data, count } = await query;
  return NextResponse.json({ data, total: count });
});

export const POST = apiHandler(async (req) => {
  const operator = await verifyOperatorToken(req);
  if (!operator) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createServiceClient();
  const body = await req.json();

  const { data, error } = await supabase!
    .from("automation_rules")
    .insert({
      tenant_id: operator.tenantId,
      name: body.name,
      description: body.description,
      trigger_event: body.trigger,
      conditions: body.conditions || [],
      actions: body.actions || [],
      is_active: body.is_active ?? true,
      priority: body.priority || 0,
      cooldown_minutes: body.cooldown_minutes || 0,
    })
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ rule: data }, { status: 201 });
});
