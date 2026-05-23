import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { verifyOperatorToken } from "@/lib/saas-auth";
import { apiHandler } from "@/lib/api-handler";
import { UnauthorizedError } from "@/lib/errors";

export const dynamic = "force-dynamic";

async function handleGet(req: Request) {
  const operator = await verifyOperatorToken(req);
  if (!operator) throw new UnauthorizedError();

  const supabase = createServiceClient();
  if (!supabase) return NextResponse.json({ data: [] });

  const { data: orders, error } = await supabase
    .from("receiving_orders")
    .select("*")
    .eq("tenant_id", operator.tenantId)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ data: [] });
  }

  const mapped = (orders || []).map((r: any) => {
    let meta: any = {};
    try {
      if (r.reference_number) meta = JSON.parse(r.reference_number);
    } catch {}

    return {
      id: r.id,
      order_number: r.order_number,
      supplier: meta.supplier || r.reference_number || "—",
      customer_name: meta.supplier || r.reference_number || "—",
      item_count: meta.item_count || 0,
      expected_date: r.expected_date,
      status: r.status || "pending",
      created_at: r.created_at,
    };
  });

  return NextResponse.json({ data: mapped });
}

async function handlePost(req: Request) {
  const operator = await verifyOperatorToken(req);
  if (!operator) throw new UnauthorizedError();

  const supabase = createServiceClient();
  if (!supabase) return NextResponse.json({ error: "DB unavailable" }, { status: 503 });

  const body = await req.json();

  if (!body.order_number?.trim()) {
    return NextResponse.json({ error: "ASN number is required" }, { status: 400 });
  }

  const meta: any = {};
  if (body.supplier) meta.supplier = body.supplier;
  if (body.item_count != null) meta.item_count = Number(body.item_count);

  const insertRow: Record<string, unknown> = {
    tenant_id: operator.tenantId,
    order_number: body.order_number.trim(),
    expected_date: body.expected_date || null,
    status: "pending",
  };

  if (Object.keys(meta).length > 0) {
    insertRow.reference_number = JSON.stringify(meta);
  }

  const { data, error } = await supabase
    .from("receiving_orders")
    .insert(insertRow)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message || "Failed to create ASN" }, { status: 400 });
  }

  return NextResponse.json({
    success: true,
    data: {
      id: data.id,
      order_number: data.order_number,
      supplier: body.supplier || "—",
      customer_name: body.supplier || "—",
      item_count: Number(body.item_count) || 0,
      expected_date: data.expected_date,
      status: data.status,
      created_at: data.created_at,
    },
  }, { status: 201 });
}

export const GET = apiHandler(handleGet);
export const POST = apiHandler(handlePost);
