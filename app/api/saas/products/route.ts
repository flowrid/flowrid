import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { verifyOperatorToken } from "@/lib/saas-auth";
import { apiHandler } from "@/lib/api-handler";
import { ProductCreateSchema, sanitizeSearch } from "@/lib/validation";
import { UnauthorizedError, ConflictError, safeErrorMessage } from "@/lib/errors";

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
    .select("id, sku, name, description, category, barcode, unit_price, weight_lbs, dimensions_lwh, image_url, requires_lot, requires_serial, min_quantity, max_quantity, reorder_point, created_at, updated_at", { count: "exact" })
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

  const { data, error } = await supabase
    .from("products")
    .insert({
      tenant_id: TENANT_ID,
      sku: body.sku,
      name: body.name,
      description: body.description ?? null,
      category: body.category ?? null,
      barcode: body.barcode ?? null,
      unit_price: body.unit_price ?? null,
      unit_cost: body.unit_cost ?? null,
      weight_lbs: body.weight_lbs ?? null,
      dimensions_lwh: body.dimensions_lwh ?? null,
      requires_lot: body.requires_lot ?? false,
      requires_serial: body.requires_serial ?? false,
      min_quantity: body.min_quantity ?? 0,
      max_quantity: body.max_quantity ?? 0,
      reorder_point: body.reorder_point ?? 0,
    })
    .select("id, sku, name, description, category, barcode, unit_price, weight_lbs, dimensions_lwh, image_url, requires_lot, requires_serial, min_quantity, max_quantity, reorder_point, created_at, updated_at")
    .single();

  if (error) {
    if (error.code === "23505") throw new ConflictError("A product with this SKU already exists");
    return NextResponse.json({ error: safeErrorMessage(error) }, { status: 400 });
  }

  return NextResponse.json({ product: data }, { status: 201 });
}

export const GET = apiHandler(handleGet);
export const POST = apiHandler(handlePost, { bodySchema: ProductCreateSchema });
