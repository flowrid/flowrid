import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { verifyOperatorToken } from "@/lib/saas-auth";
import { apiHandler } from "@/lib/api-handler";
import { ReturnCreateSchema } from "@/lib/validation";
import { UnauthorizedError } from "@/lib/errors";

export const dynamic = "force-dynamic";

async function handleGet(req: Request) {
  const operator = await verifyOperatorToken(req);
  if (!operator) throw new UnauthorizedError();
  const TENANT_ID = operator.tenantId;

  const supabase = createServiceClient();
  if (!supabase) return NextResponse.json({ data: [], stats: {} });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") || "";
  const page = Math.max(1, parseInt(searchParams.get("page") || "1")) || 1;
  const perPage = Math.min(100, Math.max(1, parseInt(searchParams.get("per_page") || "50"))) || 50;
  const offset = (page - 1) * perPage;

  let query = supabase
    .from("returns")
    .select("*, orders!inner(order_number, customer_name)", { count: "exact" })
    .eq("tenant_id", TENANT_ID)
    .order("created_at", { ascending: false })
    .range(offset, offset + perPage - 1);

  if (status) query = query.eq("status", status);

  const { data, count } = await query;

  const { count: totalPending } = await supabase
    .from("returns")
    .select("*", { count: "exact", head: true })
    .eq("tenant_id", TENANT_ID)
    .eq("status", "pending");

  const { count: total } = await supabase
    .from("returns")
    .select("*", { count: "exact", head: true })
    .eq("tenant_id", TENANT_ID);

  return NextResponse.json({
    data: data || [],
    pagination: { page, per_page: perPage, total: count ?? 0, total_pages: Math.ceil((count ?? 0) / perPage) },
    stats: { total: total ?? 0, pending: totalPending ?? 0 },
  });
}

async function handlePost(req: Request) {
  const operator = await verifyOperatorToken(req);
  if (!operator) throw new UnauthorizedError();
  const TENANT_ID = operator.tenantId;

  const supabase = createServiceClient();
  if (!supabase) return NextResponse.json({ error: "DB unavailable" }, { status: 503 });

  const body = (req as any).validatedBody;

  let resolvedOrderId: string | undefined = body.order_id;

  if (!resolvedOrderId && body.order_number) {
    const { data: orderByNumber } = await supabase
      .from("orders")
      .select("id")
      .eq("tenant_id", TENANT_ID)
      .eq("order_number", body.order_number)
      .maybeSingle();

    if (!orderByNumber) {
      return NextResponse.json(
        { error: `Order not found: ${body.order_number}` },
        { status: 404 }
      );
    }
    resolvedOrderId = (orderByNumber as { id: string }).id;
  }

  if (!resolvedOrderId) {
    return NextResponse.json(
      { error: "order_id or order_number is required" },
      { status: 400 }
    );
  }

  // 验证订单属于当前租户
  const { data: order } = await supabase
    .from("orders")
    .select("id")
    .eq("tenant_id", TENANT_ID)
    .eq("id", resolvedOrderId)
    .single();

  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  const rmaNumber = `RMA-${Date.now().toString(36).toUpperCase()}`;

  const insertData = {
    tenant_id: TENANT_ID,
    order_id: resolvedOrderId,
    rma_number: rmaNumber,
    reason: body.reason,
    condition: body.condition || null,
    disposition: body.disposition || null,
    status: "pending",
  };

  const { data: rma, error } = await supabase
    .from("returns")
    .insert(insertData)
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  // 如果有退货行项目
  if (body.items && body.items.length > 0) {
    await supabase.from("return_items").insert(
      body.items.map((item: any) => ({
        return_id: (rma as any).id,
        order_item_id: item.product_id,
        quantity_returned: item.quantity,
        disposition: item.condition || "resellable",
      }))
    );
  }

  return NextResponse.json({ return: rma });
}

export const GET = apiHandler(handleGet);
export const POST = apiHandler(handlePost, { bodySchema: ReturnCreateSchema });
