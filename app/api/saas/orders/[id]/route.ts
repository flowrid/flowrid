import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { verifyOperatorToken } from "@/lib/saas-auth";
import { apiHandler } from "@/lib/api-handler";
import { OrderUpdateSchema } from "@/lib/validation";
import { UnauthorizedError, NotFoundError } from "@/lib/errors";

export const dynamic = "force-dynamic";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const VALID_TRANSITIONS: Record<string, string[]> = {
  pending: ["allocated", "cancelled"],
  allocated: ["picking", "cancelled"],
  picking: ["picked", "packing"],
  picked: ["packing"],
  packing: ["packed"],
  packed: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: ["returned"],
  returned: [],
  cancelled: [],
};

async function handleGet(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const operator = await verifyOperatorToken(req);
  if (!operator) throw new UnauthorizedError();

  const supabase = createServiceClient();
  if (!supabase) return NextResponse.json({ error: "DB unavailable" }, { status: 503 });

  const { id } = await params;
  if (!UUID_RE.test(id)) return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });

  // 订单主信息 + 关联
  const { data: order } = await supabase
    .from("orders")
    .select("*, clients(name, company), warehouses(name, code)")
    .eq("tenant_id", operator.tenantId)
    .eq("id", id)
    .single();

  if (!order) throw new NotFoundError("Order");

  // 行项目
  const { data: items } = await supabase
    .from("order_items")
    .select("*, products(sku, name, image_url)")
    .eq("order_id", id);

  // 包裹/发货
  const { data: packages } = await supabase
    .from("packages")
    .select("*")
    .eq("order_id", id)
    .order("created_at", { ascending: false });

  // 退货
  const { data: returns } = await supabase
    .from("returns")
    .select("*")
    .eq("order_id", id);

  return NextResponse.json({
    order,
    items: items || [],
    packages: packages || [],
    returns: returns || [],
    allowedTransitions: VALID_TRANSITIONS[(order as any).status] || [],
  });
}

async function handlePatch(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const operator = await verifyOperatorToken(req);
  if (!operator) throw new UnauthorizedError();

  const supabase = createServiceClient();
  if (!supabase) return NextResponse.json({ error: "DB unavailable" }, { status: 503 });

  const body = (req as any).validatedBody;
  const { id } = await params;
  if (!UUID_RE.test(id)) return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });

  // 查当前订单
  const { data: current } = await supabase
    .from("orders")
    .select("id, status")
    .eq("tenant_id", operator.tenantId)
    .eq("id", id)
    .single();

  if (!current) throw new NotFoundError("Order");

  const currentStatus = (current as any).status;

  // 状态变更校验
  if (body.status && body.status !== currentStatus) {
    const allowed = VALID_TRANSITIONS[currentStatus] || [];
    if (!allowed.includes(body.status)) {
      return NextResponse.json({
        error: `Cannot transition from "${currentStatus}" to "${body.status}". Allowed: ${allowed.join(", ") || "none"}`,
      }, { status: 422 });
    }

    // 特殊逻辑：如果转到 shipped，自动设置 shipped_at
    if (body.status === "shipped") {
      body.shipped_at = new Date().toISOString();
    }
    if (body.status === "delivered") {
      body.delivered_at = new Date().toISOString();
    }
  }

  const allowed = [
    "status", "priority", "notes", "shipping_carrier", "tracking_number",
    "warehouse_id", "customer_name", "customer_email",
    "shipping_address_line1", "shipping_city", "shipping_state",
    "shipping_zip", "shipping_country", "shipping_method", "shipped_at", "delivered_at",
  ];
  const updates: Record<string, unknown> = {};
  for (const key of allowed) {
    if (body[key] !== undefined) updates[key] = body[key];
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  updates.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from("orders")
    .update(updates)
    .eq("tenant_id", operator.tenantId)
    .eq("id", id)
    .select("*, clients(name, company), warehouses(name, code)")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  if (!data) throw new NotFoundError("Order");

  return NextResponse.json({ order: data });
}

async function handleDelete(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const operator = await verifyOperatorToken(req);
  if (!operator) throw new UnauthorizedError();

  const supabase = createServiceClient();
  if (!supabase) return NextResponse.json({ error: "DB unavailable" }, { status: 503 });

  const { id } = await params;

  const { error } = await supabase
    .from("orders")
    .delete()
    .eq("tenant_id", operator.tenantId)
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ success: true });
}

export const GET = apiHandler(handleGet);
export const PATCH = apiHandler(handlePatch, { bodySchema: OrderUpdateSchema });
export const DELETE = apiHandler(handleDelete);
