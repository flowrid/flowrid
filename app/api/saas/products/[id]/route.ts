import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { verifyOperatorToken, requireRole } from "@/lib/saas-auth";
import { apiHandler } from "@/lib/api-handler";
import { ProductUpdateSchema } from "@/lib/validation";
import { UnauthorizedError, NotFoundError, ConflictError } from "@/lib/errors";

export const dynamic = "force-dynamic";

async function handleGet(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const operator = await verifyOperatorToken(req);
  if (!operator) throw new UnauthorizedError();
  const TENANT_ID = operator.tenantId;

  const supabase = createServiceClient();
  if (!supabase) return NextResponse.json({ error: "DB unavailable" }, { status: 503 });

  const { id } = await params;

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
  }

  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("tenant_id", TENANT_ID)
    .eq("id", id)
    .single();

  if (!product) throw new NotFoundError("Product");

  // 各仓库库存
  const { data: inventory } = await supabase
    .from("inventory")
    .select("*, warehouses(name, code), locations(zone, aisle, rack, shelf, bin, barcode)")
    .eq("product_id", id);

  // 关联订单
  const { data: orderItems } = await supabase
    .from("order_items")
    .select("*, orders!inner(id, order_number, status, created_at)")
    .eq("product_id", id)
    .order("created_at", { ascending: false })
    .limit(30);

  return NextResponse.json({
    product,
    inventory: inventory || [],
    orderItems: orderItems || [],
  });
}

async function handlePatch(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const operator = await verifyOperatorToken(req);
  if (!operator) throw new UnauthorizedError();
  const TENANT_ID = operator.tenantId;

  const supabase = createServiceClient();
  if (!supabase) return NextResponse.json({ error: "DB unavailable" }, { status: 503 });

  const { id } = await params;

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
  }

  const body = (req as any).validatedBody;

  const allowed = ["name", "description", "category", "brand", "upc", "barcode", "image_url", "unit_weight_lbs", "unit_length_in", "unit_width_in", "unit_height_in", "requires_lot_tracking", "requires_serial_tracking", "requires_expiration", "is_hazmat", "is_active"];
  const updates: Record<string, unknown> = {};
  for (const key of allowed) {
    if (body[key] !== undefined) updates[key] = body[key];
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  // If SKU is being updated, check uniqueness
  if (body.sku) {
    const { data: existing } = await supabase
      .from("products")
      .select("id")
      .eq("tenant_id", TENANT_ID)
      .eq("sku", body.sku)
      .neq("id", id)
      .maybeSingle();

    if (existing) throw new ConflictError("A product with this SKU already exists");
    updates.sku = body.sku;
  }

  const { data, error } = await supabase
    .from("products")
    .update(updates)
    .eq("tenant_id", TENANT_ID)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    if (error.code === "23505") throw new ConflictError("A product with this SKU already exists");
    return NextResponse.json({ error: error.message || "Failed to update product" }, { status: 400 });
  }
  if (!data) throw new NotFoundError("Product");

  return NextResponse.json({ product: data });
}

async function handleDelete(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const operator = await requireRole(req, ["admin", "manager"]);
  const TENANT_ID = operator.tenantId;

  const supabase = createServiceClient();
  if (!supabase) return NextResponse.json({ error: "DB unavailable" }, { status: 503 });

  const { id } = await params;

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
  }

  const { error } = await supabase
    .from("products")
    .delete()
    .eq("tenant_id", TENANT_ID)
    .eq("id", id);

  if (error) {
    if (error.code === "23503") {
      return NextResponse.json({
        error: "Cannot delete this product because it is referenced by inventory or order items. Please remove those references first.",
      }, { status: 409 });
    }
    return NextResponse.json({ error: error.message || "Failed to update product" }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}

export const GET = apiHandler(handleGet);
export const PATCH = apiHandler(handlePatch, { bodySchema: ProductUpdateSchema });
export const DELETE = apiHandler(handleDelete);
