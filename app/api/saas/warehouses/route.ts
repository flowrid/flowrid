import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { verifyOperatorToken } from "@/lib/saas-auth";
import { apiHandler } from "@/lib/api-handler";
import { WarehouseCreateSchema } from "@/lib/validation";
import { UnauthorizedError } from "@/lib/errors";

export const dynamic = "force-dynamic";

async function handleGet(req: Request) {
  const operator = await verifyOperatorToken(req);
  if (!operator) throw new UnauthorizedError();
  const TENANT_ID = operator.tenantId;

  const supabase = createServiceClient();
  if (!supabase) return NextResponse.json({ data: [], stats: {} });

  const { data: warehouses } = await supabase
    .from("warehouses")
    .select("*")
    .eq("tenant_id", TENANT_ID)
    .order("name", { ascending: true });

  const { count: total } = await supabase
    .from("warehouses")
    .select("*", { count: "exact", head: true })
    .eq("tenant_id", TENANT_ID);

  const { count: active } = await supabase
    .from("warehouses")
    .select("*", { count: "exact", head: true })
    .eq("tenant_id", TENANT_ID)
    .eq("is_active", true);

  return NextResponse.json({
    data: warehouses || [],
    stats: { total: total ?? 0, active: active ?? 0 },
  });
}

async function handlePost(req: Request) {
  const operator = await verifyOperatorToken(req);
  if (!operator) throw new UnauthorizedError();
  const TENANT_ID = operator.tenantId;

  const supabase = createServiceClient();
  if (!supabase) return NextResponse.json({ error: "DB unavailable" }, { status: 503 });

  const body = (req as any).validatedBody;

  const insertData = {
    tenant_id: TENANT_ID,
    name: body.name,
    code: body.code,
    address_line1: body.address_line1 || null,
    city: body.address_city || body.city || null,
    state: body.address_state || body.state || null,
    zip: body.address_zip || body.zip || null,
    country: body.address_country || body.country || "US",
    sq_footage: body.sq_footage || null,
    is_active: body.is_active !== undefined ? body.is_active : true,
  };

  const { data, error } = await supabase
    .from("warehouses")
    .insert(insertData)
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ warehouse: data });
}

export const GET = apiHandler(handleGet);
export const POST = apiHandler(handlePost, { bodySchema: WarehouseCreateSchema });
