// QC 质检 API — Quality Control Checks
// POST: 记录质检结果 | GET: 查询质检历史

import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { verifyOperatorToken } from "@/lib/saas-auth";
import { apiHandler } from "@/lib/api-handler";
import { QCCheckSchema } from "@/lib/validation";

export const POST = apiHandler(async (req) => {
  const operator = await verifyOperatorToken(req);
  if (!operator) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = QCCheckSchema.parse(body);

  const supabase = createServiceClient();
  if (!supabase) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });

  // 验证订单属于此租户
  const { data: order } = await supabase
    .from("orders")
    .select("id, warehouse_id")
    .eq("id", parsed.order_id)
    .eq("tenant_id", operator.tenantId)
    .single();

  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  // 合并 results/checklist 字段
  const results = parsed.results || parsed.checklist || [];
  const overallPassed = parsed.passed ?? results.every((r: any) => r.passed);

  const { data: qc, error } = await supabase
    .from("qc_checks")
    .insert({
      tenant_id: operator.tenantId,
      order_id: parsed.order_id,
      warehouse_id: (order as any).warehouse_id,
      inspector_name: parsed.inspector_name || null,
      packer_name: parsed.packer_name || null,
      passed: overallPassed,
      results: JSON.stringify(results),
      notes: parsed.notes || null,
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: "Failed to save QC check", detail: error.message }, { status: 500 });
  }

  // QC 通过 → 自动推进订单到 packed
  if (overallPassed) {
    await supabase
      .from("orders")
      .update({ status: "packed", updated_at: new Date().toISOString() })
      .eq("id", parsed.order_id)
      .eq("status", "packing");
  }

  return NextResponse.json({ qc }, { status: 201 });
}, { bodySchema: QCCheckSchema });

export const GET = apiHandler(async (req) => {
  const operator = await verifyOperatorToken(req);
  if (!operator) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createServiceClient();
  if (!supabase) return NextResponse.json({ error: "Database unavailable" }, { status: 503 });

  const url = new URL(req.url);
  const orderId = url.searchParams.get("order_id");
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "20"), 100);
  const offset = (page - 1) * limit;

  let query = supabase
    .from("qc_checks")
    .select("*, orders!inner(external_order_id)", { count: "exact" })
    .eq("tenant_id", operator.tenantId)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (orderId) query = query.eq("order_id", orderId);

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json({ error: "Failed to fetch QC checks" }, { status: 500 });
  }

  return NextResponse.json({
    data: (data || []).map((qc: any) => ({
      ...qc,
      results: typeof qc.results === "string" ? JSON.parse(qc.results) : qc.results,
    })),
    total: count || 0,
    page,
    limit,
  });
});
