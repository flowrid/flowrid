import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { verifyOperatorToken } from "@/lib/saas-auth";
import { safeErrorMessage } from "@/lib/errors";
import { BillingRateSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const operator = await verifyOperatorToken(req);
  if (!operator) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const TENANT_ID = operator.tenantId;
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

export async function POST(req: Request) {
  const operator = await verifyOperatorToken(req);
  if (!operator) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const TENANT_ID = operator.tenantId;
  const supabase = createServiceClient();
  if (!supabase) return NextResponse.json({ error: "DB unavailable" }, { status: 503 });

  const body = await req.json().catch(() => ({}));

  // Mode 1: Create billing rates (when body has "rates")
  if (body.rates && Array.isArray(body.rates)) {
    const parsed = BillingRateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.issues }, { status: 422 });
    }
    const { rates } = parsed.data;

    const inserts = rates.map((r: any) => ({
      tenant_id: TENANT_ID,
      charge_type: r.charge_type ?? "other",
      charge_unit: r.charge_unit ?? "flat",
      rate: typeof r.rate === "number" ? r.rate : parseFloat(r.rate) || 0,
      min_charge: r.min_charge != null ? (typeof r.min_charge === "number" ? r.min_charge : parseFloat(r.min_charge) ?? null) : null,
      is_active: true,
    }));

    const { error } = await supabase.from("billing_rates").insert(inserts);
    if (error) return NextResponse.json({ error: safeErrorMessage(error) }, { status: 400 });

    return NextResponse.json({ success: true, count: inserts.length });
  }

  // Mode 2: Generate invoice from unbilled transactions
  const { data: unbilled } = await supabase
    .from("billing_transactions")
    .select("*")
    .eq("tenant_id", TENANT_ID)
    .eq("is_invoiced", false);

  if (!unbilled || unbilled.length === 0) {
    return NextResponse.json({ error: "No unbilled transactions to invoice" }, { status: 400 });
  }

  const totalAmount = unbilled.reduce((s: number, t: any) => s + (t.total_amount || 0), 0);
  const invoiceNumber = `INV-${Date.now().toString(36).toUpperCase()}`;

  const { data: invoice, error: invErr } = await supabase
    .from("invoices")
    .insert({
      tenant_id: TENANT_ID,
      invoice_number: invoiceNumber,
      total_amount: totalAmount,
      status: "sent",
      issued_date: new Date().toISOString(),
      due_date: new Date(Date.now() + 30 * 86400000).toISOString(),
    })
    .select()
    .single();

  if (invErr) return NextResponse.json({ error: safeErrorMessage(invErr) }, { status: 400 });

  // Mark transactions as invoiced
  await supabase
    .from("billing_transactions")
    .update({ is_invoiced: true, invoice_id: (invoice as any).id })
    .in("id", unbilled.map((t: any) => t.id));

  return NextResponse.json({ success: true, invoice });
}
