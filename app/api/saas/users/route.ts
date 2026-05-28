import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { verifyOperatorToken } from "@/lib/saas-auth";
import { apiHandler } from "@/lib/api-handler";
import { UserCreateSchema } from "@/lib/validation";
import { UnauthorizedError } from "@/lib/errors";

export const dynamic = "force-dynamic";

async function handleGet(req: Request) {
  const operator = await verifyOperatorToken(req);
  if (!operator) throw new UnauthorizedError();
  const TENANT_ID = operator.tenantId;

  const supabase = createServiceClient();
  if (!supabase) return NextResponse.json({ data: [], stats: {} });

  const { searchParams } = new URL(req.url);
  const role = searchParams.get("role") || "";

  let query = supabase
    .from("users")
    .select("id, email, name, role, warehouse_ids, is_active, last_login_at, created_at")
    .eq("tenant_id", TENANT_ID)
    .order("name", { ascending: true });

  if (role) query = query.eq("role", role);

  const { data: users } = await query;

  const { count: total } = await supabase
    .from("users")
    .select("*", { count: "exact", head: true })
    .eq("tenant_id", TENANT_ID);

  const { count: active } = await supabase
    .from("users")
    .select("*", { count: "exact", head: true })
    .eq("tenant_id", TENANT_ID)
    .eq("is_active", true);

  return NextResponse.json({
    data: users || [],
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

  const { data: existing } = await supabase
    .from("users")
    .select("id")
    .eq("email", body.email.toLowerCase().trim())
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ error: "A user with this email already exists" }, { status: 409 });
  }

  const { data, error } = await supabase
    .from("users")
    .insert({
      tenant_id: TENANT_ID,
      email: body.email.toLowerCase().trim(),
      name: body.name,
      role: body.role || "operator",
      warehouse_ids: body.warehouse_ids || [],
      is_active: true,
    })
    .select("id, email, name, role, warehouse_ids, is_active, created_at")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ user: data });
}

export const GET = apiHandler(handleGet);
export const POST = apiHandler(handlePost, { bodySchema: UserCreateSchema });
