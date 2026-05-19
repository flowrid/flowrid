/**
 * Flowrid SaaS — Billing Engine
 *
 * 自动化计费引擎
 * 跟踪每个收费事件 → 计算费用 → 生成发票 → 对接 QuickBooks
 */

import { createServerClient } from "./supabase";
import type { BillingRate, BillingTransaction, Invoice, Client } from "@/types/saas";

// ==========================================
// 费率管理
// ==========================================

export const DEFAULT_CHARGE_TYPES = [
  { type: "storage", unit: "per_pallet", description: "Storage — per pallet per month" },
  { type: "storage", unit: "per_cubic_ft", description: "Storage — per cubic foot per month" },
  { type: "receiving", unit: "per_unit", description: "Receiving — per unit" },
  { type: "receiving", unit: "per_pallet", description: "Receiving — per pallet" },
  { type: "pick_pack", unit: "per_order", description: "Pick & Pack — per order" },
  { type: "pick_pack", unit: "per_unit", description: "Pick & Pack — per unit (first unit)" },
  { type: "pick_pack", unit: "per_additional_unit", description: "Pick & Pack — each additional unit" },
  { type: "shipping", unit: "per_label", description: "Shipping label fee" },
  { type: "labeling", unit: "per_unit", description: "Labeling / relabeling" },
  { type: "kitting", unit: "per_unit", description: "Kitting / assembly" },
  { type: "inserts", unit: "per_unit", description: "Marketing inserts" },
  { type: "account_management", unit: "per_month", description: "Account management — monthly" },
  { type: "technology", unit: "per_month", description: "Technology / WMS platform fee" },
];

export async function setBillingRate(
  tenantId: string,
  clientId: string | null,
  chargeType: string,
  chargeUnit: string,
  rate: number,
  minCharge?: number
) {
  const supabase = createServerClient();
  if (!supabase) return null;

  return supabase.from("billing_rates").upsert({
    tenant_id: tenantId,
    client_id: clientId,
    charge_type: chargeType,
    charge_unit: chargeUnit,
    rate,
    min_charge: minCharge || null,
    is_active: true,
  });
}

// ==========================================
// 自动计费采集
// ==========================================

export async function captureTransaction(
  tenantId: string,
  clientId: string,
  chargeType: string,
  details: {
    quantity: number;
    reference_type?: string;
    reference_id?: string;
    description?: string;
    date?: string;
  }
) {
  const supabase = createServerClient();
  if (!supabase) return null;

  // 查找适用费率
  const { data: rate } = await supabase
    .from("billing_rates")
    .select("*")
    .eq("tenant_id", tenantId)
    .or(`client_id.eq.${clientId},client_id.is.null`)
    .eq("charge_type", chargeType)
    .eq("is_active", true)
    .order("client_id", { ascending: false, nullsFirst: false })
    .limit(1)
    .single();

  if (!rate) {
    console.warn(`No billing rate found for ${chargeType}`);
    return null;
  }

  const unitRate = rate.rate;
  let totalAmount = unitRate * details.quantity;

  // 应用最低收费
  if (rate.min_charge && totalAmount < rate.min_charge) {
    totalAmount = rate.min_charge;
  }

  const now = new Date();
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
  const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split("T")[0];

  return supabase.from("billing_transactions").insert({
    tenant_id: tenantId,
    client_id: clientId,
    charge_type: chargeType,
    reference_type: details.reference_type,
    reference_id: details.reference_id,
    description: details.description,
    quantity: details.quantity,
    unit_rate: unitRate,
    total_amount: totalAmount,
    billing_period_start: details.date || periodStart,
    billing_period_end: periodEnd,
  });
}

// ==========================================
// 按月自动采集（批量运行）
// ==========================================

export async function runMonthlyBilling(tenantId: string, clientId: string) {
  const supabase = createServerClient();
  if (!supabase) return;

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split("T")[0];

  // 1. 仓储费
  const { data: storagePallets } = await supabase
    .from("inventory")
    .select("product_id")
    .gt("quantity_on_hand", 0);

  if (storagePallets) {
    const estimatedPallets = Math.ceil(storagePallets.length / 30); // 估算：每托盘约30个SKU
    await captureTransaction(tenantId, clientId, "storage", {
      quantity: estimatedPallets,
      reference_type: "storage",
      description: `Storage — ${monthStart} to ${monthEnd}`,
    });
  }

  // 2. 接收费
  const { count: receivingCount } = await supabase
    .from("receiving_items")
    .select("*", { count: "exact", head: true })
    .gte("created_at", monthStart)
    .lte("created_at", monthEnd);

  if (receivingCount && receivingCount > 0) {
    await captureTransaction(tenantId, clientId, "receiving", {
      quantity: receivingCount,
      reference_type: "receiving",
      description: `Receiving units — ${monthStart} to ${monthEnd}`,
    });
  }

  // 3. 拣货打包费 — 按已发货订单
  const { count: orderCount } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .eq("client_id", clientId)
    .eq("status", "shipped")
    .gte("updated_at", monthStart)
    .lte("updated_at", monthEnd);

  if (orderCount && orderCount > 0) {
    await captureTransaction(tenantId, clientId, "pick_pack", {
      quantity: orderCount,
      reference_type: "order",
      description: `Pick & pack — ${monthStart} to ${monthEnd}`,
    });
  }

  // 4. 账户管理费
  await captureTransaction(tenantId, clientId, "account_management", {
    quantity: 1,
    reference_type: "service",
    description: `Account management — ${monthStart} to ${monthEnd}`,
  });
}

// ==========================================
// 发票生成
// ==========================================

export async function generateInvoice(
  tenantId: string,
  clientId: string,
  billingMonth: string // "YYYY-MM"
) {
  const supabase = createServerClient();
  if (!supabase) return null;

  // 获取该月未开票的交易
  const [year, month] = billingMonth.split("-").map(Number);
  const periodStart = `${billingMonth}-01`;
  const periodEnd = new Date(year, month, 0).toISOString().split("T")[0];

  const { data: transactions } = await supabase
    .from("billing_transactions")
    .select("*")
    .eq("tenant_id", tenantId)
    .eq("client_id", clientId)
    .eq("is_invoiced", false)
    .gte("billing_period_start", periodStart)
    .lte("billing_period_end", periodEnd);

  if (!transactions || transactions.length === 0) return null;

  const subtotal = transactions.reduce(
    (sum: number, t: { total_amount: number }) => sum + t.total_amount,
    0
  );

  // 生成发票号：INV-{年月}-{序号}
  const { count } = await supabase
    .from("invoices")
    .select("*", { count: "exact", head: true })
    .eq("tenant_id", tenantId);

  const invoiceNumber = `INV-${billingMonth.replace("-", "")}-${String((count || 0) + 1).padStart(4, "0")}`;

  const { data: invoice } = await supabase
    .from("invoices")
    .insert({
      tenant_id: tenantId,
      client_id: clientId,
      invoice_number: invoiceNumber,
      subtotal,
      tax_amount: 0, // 税率稍后计算
      total_amount: subtotal,
      due_date: new Date(year, month, 30).toISOString().split("T")[0],
      status: "draft",
    })
    .select()
    .single();

  if (invoice) {
    // 标记交易为已开票
    await supabase
      .from("billing_transactions")
      .update({ is_invoiced: true, invoice_id: invoice.id })
      .in(
        "id",
        transactions.map((t: { id: string }) => t.id)
      );
  }

  return invoice;
}

// ==========================================
// 计费报表
// ==========================================

export async function getBillingSummary(tenantId: string, clientId?: string) {
  const supabase = createServerClient();
  if (!supabase) return {};

  let query = supabase
    .from("billing_transactions")
    .select("charge_type, total_amount, billing_period_start")
    .eq("tenant_id", tenantId);

  if (clientId) query = query.eq("client_id", clientId);

  const { data } = await query;
  if (!data) return {};

  const summary: Record<string, number> = {};
  for (const t of data as { charge_type: string; total_amount: number }[]) {
    summary[t.charge_type] = (summary[t.charge_type] || 0) + t.total_amount;
  }

  return summary;
}
