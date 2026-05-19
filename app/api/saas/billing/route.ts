import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

const TENANT_ID = "00000000-0000-0000-0000-000000000001";

export async function GET() {
  const supabase = createServiceClient();
  if (!supabase) return NextResponse.json({ invoices: [], rates: [], stats: {} });

  const { data: invoices } = await supabase
    .from("invoices")
    .select("*, clients(name, company)")
    .eq("tenant_id", TENANT_ID)
    .order("created_at", { ascending: false });

  const { data: rates } = await supabase
    .from("billing_rates")
    .select("*")
    .eq("tenant_id", TENANT_ID)
    .eq("is_active", true);

  const { data: transactions } = await supabase
    .from("billing_transactions")
    .select("total_amount, status:is_invoiced")
    .eq("tenant_id", TENANT_ID);

  const totalRevenue = (transactions || []).reduce((s: number, t: any) => s + (t.total_amount || 0), 0);
  const invoiced = (transactions || []).filter((t: any) => t.is_invoiced).reduce((s: number, t: any) => s + (t.total_amount || 0), 0);

  return NextResponse.json({
    invoices: invoices || [],
    rates: rates || [],
    stats: {
      totalRevenue,
      invoiced,
      outstanding: totalRevenue - invoiced,
      invoiceCount: (invoices || []).length,
    },
  });
}
