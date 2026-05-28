import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { verifyOperatorToken } from "@/lib/saas-auth";
import { apiHandler } from "@/lib/api-handler";
import { LocationUpdateSchema } from "@/lib/validation";
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

  const { data: location } = await supabase
    .from("locations")
    .select("*, warehouses!inner(tenant_id, name, code)")
    .eq("id", id)
    .single();

  if (!location) throw new NotFoundError("Location");
  if (((location as any).warehouses?.tenant_id) !== operator.tenantId) throw new UnauthorizedError();

  // 当前位置的库存
  const { data: inventory } = await supabase
    .from("inventory")
    .select("*, products(sku, name)")
    .eq("location_id", id)
    .gt("quantity_on_hand", 0);

  return NextResponse.json({ location, inventory: inventory || [] });
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

  // 验证归属
  const { data: loc } = await supabase
    .from("locations")
    .select("*, warehouses!inner(tenant_id)")
    .eq("id", id)
    .single();

  if (!loc) throw new NotFoundError("Location");
  if (((loc as any).warehouses?.tenant_id) !== operator.tenantId) throw new UnauthorizedError();

  const updates: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(body)) {
    if (value !== undefined && key !== "warehouse_id") updates[key] = value;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("locations")
    .update(updates)
    .eq("id", id)
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ location: data });
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

  const { data: loc } = await supabase
    .from("locations")
    .select("*, warehouses!inner(tenant_id)")
    .eq("id", id)
    .single();

  if (!loc) throw new NotFoundError("Location");
  if (((loc as any).warehouses?.tenant_id) !== operator.tenantId) throw new UnauthorizedError();

  const { error } = await supabase.from("locations").delete().eq("id", id);

  if (error) {
    if (error.code === "23503") {
      return NextResponse.json({ error: "Cannot delete: location has active inventory" }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}

export const GET = apiHandler(handleGet);
export const PATCH = apiHandler(handlePatch, { bodySchema: LocationUpdateSchema });
export const DELETE = apiHandler(handleDelete);
