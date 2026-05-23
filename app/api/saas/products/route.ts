import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { verifyOperatorToken } from "@/lib/saas-auth";
import { apiHandler } from "@/lib/api-handler";
import { ProductCreateSchema, sanitizeSearch } from "@/lib/validation";
import { UnauthorizedError, ConflictError } from "@/lib/errors";

export const dynamic = "force-dynamic";

async function handleGet(req: Request) {
  const operator = await verifyOperatorToken(req);
  if (!operator) throw new UnauthorizedError();
  const TENANT_ID = operator.tenantId;

  const supabase = createServiceClient();
  if (!supabase) return NextResponse.json({ data: [], stats: {} });

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");
  const category = searchParams.get("category");
  const page = Math.max(1, parseInt(searchParams.get("page") || "1")) || 1;
  const perPage = Math.min(100, Math.max(1, parseInt(searchParams.get("per_page") || "50"))) || 50;
  const offset = (page - 1) * perPage;

  let query = supabase
    .from("products")
    .select("id, sku, upc, name, description, category, brand, image_url, unit_weight_lbs, unit_length_in, unit_width_in, unit_height_in, requires_lot_tracking, requires_serial_tracking, requires_expiration, is_hazmat, is_active, created_at, updated_at", { count: "exact" })
    .eq("tenant_id", TENANT_ID);

  if (q) {
    const safe = sanitizeSearch(q);
    if (safe) {
      query = query.or(`name.ilike.%${safe}%,sku.ilike.%${safe}%`);
    }
  }

  if (category) {
    query = query.eq("category", category);
  }

  const { data: products, count } = await query.order("created_at", { ascending: false }).range(offset, offset + perPage - 1);

  return NextResponse.json({
    data: products ?? [],
    stats: { total: count ?? 0 },
    pagination: { page, per_page: perPage, total: count ?? 0, total_pages: Math.ceil((count ?? 0) / perPage) },
  });
}

async function handlePost(req: Request) {
  const operator = await verifyOperatorToken(req);
  if (!operator) throw new UnauthorizedError();
  const TENANT_ID = operator.tenantId;

  const supabase = createServiceClient();
  if (!supabase) return NextResponse.json({ error: "DB unavailable" }, { status: 503 });

  const body = (req as any).validatedBody;

  const { data: existing } = await supabase
    .from("products")
    .select("id")
    .eq("tenant_id", TENANT_ID)
    .eq("sku", body.sku)
    .maybeSingle();

  if (existing) throw new ConflictError("A product with this SKU already exists");

  const insertRow: Record<string, unknown> = {
    tenant_id: TENANT_ID,
    sku: body.sku,
    name: body.name,
  };

  if (body.description != null) insertRow.description = body.description;
  if (body.upc != null) insertRow.upc = body.upc;
  if (body.barcode != null) insertRow.upc = body.barcode;
  if (body.category != null) insertRow.category = body.category;
  if (body.brand != null) insertRow.brand = body.brand;
  if (body.image_url != null) insertRow.image_url = body.image_url;
  if (body.unit_weight_lbs != null) insertRow.unit_weight_lbs = body.unit_weight_lbs;
  if (body.weight_lbs != null && body.unit_weight_lbs == null) insertRow.unit_weight_lbs = body.weight_lbs;
  if (body.unit_length_in != null) insertRow.unit_length_in = body.unit_length_in;
  if (body.unit_width_in != null) insertRow.unit_width_in = body.unit_width_in;
  if (body.unit_height_in != null) insertRow.unit_height_in = body.unit_height_in;
  if (body.requires_lot_tracking != null) insertRow.requires_lot_tracking = body.requires_lot_tracking;
  if (body.requires_serial_tracking != null) insertRow.requires_serial_tracking = body.requires_serial_tracking;
  if (body.requires_expiration != null) insertRow.requires_expiration = body.requires_expiration;
  if (body.is_hazmat != null) insertRow.is_hazmat = body.is_hazmat;
  if (body.is_active != null) insertRow.is_active = body.is_active;

  const { data, error } = await supabase
    .from("products")
    .insert(insertRow)
    .select("id, sku, upc, name, description, category, brand, image_url, unit_weight_lbs, unit_length_in, unit_width_in, unit_height_in, requires_lot_tracking, requires_serial_tracking, requires_expiration, is_hazmat, is_active, created_at, updated_at")
    .single();

  if (error) {
    if (error.code === "23505") throw new ConflictError("A product with this SKU already exists");
    return NextResponse.json({ error: error.message || "Failed to create product" }, { status: 400 });
  }

  return NextResponse.json({ product: data }, { status: 201 });
}

export const GET = apiHandler(handleGet);
export const POST = apiHandler(handlePost, { bodySchema: ProductCreateSchema });
