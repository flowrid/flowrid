import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { verifyOperatorToken } from "@/lib/saas-auth";
import { apiHandler } from "@/lib/api-handler";
import { ClientCreateSchema } from "@/lib/validation";
import { UnauthorizedError } from "@/lib/errors";

export const dynamic = "force-dynamic";

async function handleGet(req: Request) {
  const operator = await verifyOperatorToken(req);
  if (!operator) throw new UnauthorizedError();
  const TENANT_ID = operator.tenantId;

  const supabase = createServiceClient();
  if (!supabase) return NextResponse.json({ data: [], stats: {} });

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const page = Math.max(1, parseInt(searchParams.get("page") || "1")) || 1;
  const perPage = Math.min(100, Math.max(1, parseInt(searchParams.get("per_page") || "50"))) || 50;
  const offset = (page - 1) * perPage;

  let query = supabase
    .from("clients")
    .select("*", { count: "exact" })
    .eq("tenant_id", TENANT_ID)
    .order("name", { ascending: true })
    .range(offset, offset + perPage - 1);

  if (search) {
    const sanitized = search.replace(/[%_]/g, "").trim();
    if (sanitized) {
      query = query.or(`name.ilike.*${sanitized}*,company.ilike.*${sanitized}*,email.ilike.*${sanitized}*`);
    }
  }

  const { data, count } = await query;

  const { count: total } = await supabase
    .from("clients")
    .select("*", { count: "exact", head: true })
    .eq("tenant_id", TENANT_ID);

  return NextResponse.json({
    data: data || [],
    pagination: { page, per_page: perPage, total: count ?? 0, total_pages: Math.ceil((count ?? 0) / perPage) },
    stats: { total: total ?? 0 },
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
    company: body.company || null,
    email: body.email,
    phone: body.phone || null,
    address_line1: body.address_line1 || null,
    city: body.address_city || null,
    state: body.address_state || null,
    zip: body.address_zip || null,
    billing_terms: body.billing_terms || "net30",
  };

  const { data, error } = await supabase
    .from("clients")
    .insert(insertData)
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ client: data });
}

export const GET = apiHandler(handleGet);
export const POST = apiHandler(handlePost, { bodySchema: ClientCreateSchema });
