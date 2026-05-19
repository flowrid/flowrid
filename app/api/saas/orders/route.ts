import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

const TENANT_ID = "00000000-0000-0000-0000-000000000001";

export async function GET() {
  const supabase = createServiceClient();
  if (!supabase) return NextResponse.json({ orders: [], clients: [], stats: {} });

  const { data: orders } = await supabase
    .from("orders")
    .select("*, clients(name, company)")
    .eq("tenant_id", TENANT_ID)
    .order("created_at", { ascending: false });

  const { data: clients } = await supabase
    .from("clients")
    .select("*")
    .eq("tenant_id", TENANT_ID);

  const { count: total } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .eq("tenant_id", TENANT_ID);

  const { count: pending } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .eq("tenant_id", TENANT_ID)
    .in("status", ["pending", "allocated", "picking"]);

  return NextResponse.json({
    orders: orders || [],
    clients: clients || [],
    stats: {
      total: total || 0,
      pending: pending || 0,
      shipped: (orders || []).filter((o: any) => o.status === "shipped").length,
    },
  });
}

export async function POST(req: Request) {
  const supabase = createServiceClient();
  if (!supabase) return NextResponse.json({ error: "DB unavailable" }, { status: 503 });

  const body = await req.json();
  const { data, error } = await supabase.from("orders").insert({
    ...body,
    tenant_id: TENANT_ID,
    warehouse_id: "00000000-0000-0000-0000-000000000001",
  }).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}
