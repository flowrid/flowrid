import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { verifyOperatorToken } from "@/lib/saas-auth";
import { apiHandler } from "@/lib/api-handler";
import { ClientUpdateSchema } from "@/lib/validation";
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

  const { data: client } = await supabase
    .from("clients")
    .select("*")
    .eq("tenant_id", operator.tenantId)
    .eq("id", id)
    .single();

  if (!client) throw new NotFoundError("Client");

  // 关联订单
  const { data: orders } = await supabase
    .from("orders")
    .select("id, order_number, status, created_at")
    .eq("tenant_id", operator.tenantId)
    .eq("client_id", id)
    .order("created_at", { ascending: false })
    .limit(20);

  return NextResponse.json({ client, orders: orders || [] });
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
    .from("clients")
    .update(updates)
    .eq("tenant_id", operator.tenantId)
    .eq("id", id)
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  if (!data) throw new NotFoundError("Client");

  return NextResponse.json({ client: data });
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
    .from("clients")
    .delete()
    .eq("tenant_id", operator.tenantId)
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ success: true });
}

export const GET = apiHandler(handleGet);
export const PATCH = apiHandler(handlePatch, { bodySchema: ClientUpdateSchema });
export const DELETE = apiHandler(handleDelete);
