import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { verifyOperatorToken } from "@/lib/saas-auth";
import { apiHandler } from "@/lib/api-handler";
import { UnauthorizedError } from "@/lib/errors";

export const dynamic = "force-dynamic";

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
    .from("orders")
    .delete()
    .eq("tenant_id", operator.tenantId)
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message || "Failed to delete order" }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}

export const DELETE = apiHandler(handleDelete);
