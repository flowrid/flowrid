import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { verifyOperatorToken } from "@/lib/saas-auth";
import { apiHandler } from "@/lib/api-handler";
import { WarehouseUpdateSchema } from "@/lib/validation";
import { UnauthorizedError, NotFoundError } from "@/lib/errors";

export const dynamic = "force-dynamic";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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

  const { data: warehouse } = await supabase
    .from("warehouses")
    .select("*")
    .eq("tenant_id", operator.tenantId)
    .eq("id", id)
    .single();

  if (!warehouse) throw new NotFoundError("Warehouse");

  // 库位统计
  const { count: locationCount } = await supabase
    .from("locations")
    .select("*", { count: "exact", head: true })
    .eq("warehouse_id", id);

  // 库存统计
  const { count: skuCount } = await supabase
    .from("inventory")
    .select("*", { count: "exact", head: true })
    .eq("warehouse_id", id)
    .gt("quantity_on_hand", 0);

  // 订单统计
  const { count: pendingOrders } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .eq("tenant_id", operator.tenantId)
    .eq("warehouse_id", id)
    .in("status", ["pending", "allocated", "picking"]);

  return NextResponse.json({
    warehouse,
    stats: {
      locations: locationCount ?? 0,
      activeSkus: skuCount ?? 0,
      pendingOrders: pendingOrders ?? 0,
    },
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

  const fieldMap: Record<string, string> = {
    address_line1: "address_line1",
    address_city: "city",
    address_state: "state",
    address_zip: "zip",
    address_country: "country",
  };

  const updates: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(body)) {
    const mapped = fieldMap[key] || key;
    if (value !== undefined) updates[mapped] = value;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("warehouses")
    .update(updates)
    .eq("tenant_id", operator.tenantId)
    .eq("id", id)
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  if (!data) throw new NotFoundError("Warehouse");

  return NextResponse.json({ warehouse: data });
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
    .from("warehouses")
    .delete()
    .eq("tenant_id", operator.tenantId)
    .eq("id", id);

  if (error) {
    if (error.code === "23503") {
      return NextResponse.json({ error: "Cannot delete: warehouse has active inventory or orders" }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}

export const GET = apiHandler(handleGet);
export const PATCH = apiHandler(handlePatch, { bodySchema: WarehouseUpdateSchema });
export const DELETE = apiHandler(handleDelete);
