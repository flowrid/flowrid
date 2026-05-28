import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { verifyOperatorToken } from "@/lib/saas-auth";
import { apiHandler } from "@/lib/api-handler";
import { ReturnUpdateSchema } from "@/lib/validation";
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

  const { data: rma } = await supabase
    .from("returns")
    .select("*, orders!inner(order_number, customer_name)")
    .eq("tenant_id", operator.tenantId)
    .eq("id", id)
    .single();

  if (!rma) throw new NotFoundError("Return");

  const { data: items } = await supabase
    .from("return_items")
    .select("*, products!inner(sku, name)")
    .eq("return_id", id);

  return NextResponse.json({ return: rma, items: items || [] });
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

  const updates: Record<string, unknown> = {};
  if (body.disposition !== undefined) updates.disposition = body.disposition;
  if (body.status !== undefined) updates.status = body.status;
  if (body.condition !== undefined) updates.condition = body.condition;
  if (body.notes !== undefined) updates.notes = body.notes;

  if (body.status === "received" || body.status === "resolved") {
    updates.processed_at = new Date().toISOString();
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("returns")
    .update(updates)
    .eq("tenant_id", operator.tenantId)
    .eq("id", id)
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  if (!data) throw new NotFoundError("Return");

  return NextResponse.json({ return: data });
}

export const GET = apiHandler(handleGet);
export const PATCH = apiHandler(handlePatch, { bodySchema: ReturnUpdateSchema });
