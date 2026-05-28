import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { verifyOperatorToken } from "@/lib/saas-auth";

export async function GET(req: Request) {
  const operator = await verifyOperatorToken(req);
  if (!operator) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const TENANT_ID = operator.tenantId;

  const supabase = createServiceClient();
  if (!supabase) return NextResponse.json({ connected: false });

  const { data } = await supabase
    .from("integration_connections")
    .select("is_active, last_sync_at, credentials")
    .eq("tenant_id", TENANT_ID)
    .eq("platform_name", "shopify")
    .maybeSingle();

  if (!data) return NextResponse.json({ connected: false });

  const d = data as any;
  return NextResponse.json({
    connected: d.is_active || false,
    lastSync: d.last_sync_at || null,
    shop: d.credentials?.shop || null,
  });
}
