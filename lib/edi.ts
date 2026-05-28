// EDI 集成 — SPS Commerce / CommerceHub
// 协议: X12 (850/856/810/846) via SFTP/AS2
// X12 标准文档类型映射

import { createServiceClient } from "@/lib/supabase";

export interface EDIConnection {
  id?: string;
  tenantId: string;
  partnerName: string;      // SPS Commerce, CommerceHub, TrueCommerce
  protocol: "sftp" | "as2";
  host: string;
  port: number;
  username: string;
  privateKey: string;        // SFTP 私钥 或 AS2 证书
  remotePath: string;
  partnerISAQualifier: string;
  partnerISAId: string;
  ourISAQualifier: string;
  ourISAId: string;
  gsId: string;
  isActive: boolean;
}

/**
 * 保存 EDI 连接配置
 */
export async function saveEDIConnection(tenantId: string, config: EDIConnection): Promise<string | null> {
  const supabase = createServiceClient();
  if (!supabase) return null;

  const { data } = await supabase
    .from("integration_connections")
    .upsert({
      tenant_id: tenantId, platform_name: "edi",
      connection_type: "edi",
      credentials: { protocol: config.protocol, host: config.host, username: config.username, partner_isa: config.partnerISAId } as any,
      endpoint_url: `${config.protocol}://${config.host}:${config.port}${config.remotePath}`,
      status: "connected",
      updated_at: new Date().toISOString(),
    }, { onConflict: "tenant_id,platform_name" })
    .select("id").single();

  return (data as any)?.id || null;
}

/** X12 850 Purchase Order → Flowrid order */
export interface X12_850_PO {
  senderISA: string;
  receiverISA: string;
  poNumber: string;
  poDate: string;
  shipToName: string;
  shipToAddress1: string;
  shipToCity: string;
  shipToState: string;
  shipToZip: string;
  shipToCountry: string;
  items: { buyerPartNumber: string; vendorPartNumber: string; quantity: number; unitPrice?: number }[];
  requestedShipDate?: string;
  carrierRouting?: string;
}

/**
 * 解析 X12 850 文件为订单对象
 * X12 segment structure:
 * ISA → GS → ST(850) → BEG → N1(ST) → N3 → N4 → PO1(×items) → CTT → SE → GE → IEA
 */
export function parseX12_850_PO(rawX12: string): X12_850_PO | null {
  try {
    const segments = rawX12.split("~").map((s) => s.trim()).filter(Boolean);
    const getElement = (seg: string, idx: number) => seg.split("*")[idx] || "";

    const isaSeg = segments.find((s) => s.startsWith("ISA"));
    const begSeg = segments.find((s) => s.startsWith("BEG"));
    const n1Ship = segments.find((s) => s.startsWith("N1") && getElement(s, 1) === "ST");
    const n3Seg = segments.find((s) => s.startsWith("N3"));
    const n4Seg = segments.find((s) => s.startsWith("N4"));
    const po1Segs = segments.filter((s) => s.startsWith("PO1"));

    if (!isaSeg || !begSeg) return null;

    const items = po1Segs.map((po1) => ({
      buyerPartNumber: getElement(po1, 8) || "",
      vendorPartNumber: getElement(po1, 9) || "",
      quantity: parseInt(getElement(po1, 2)) || 0,
      unitPrice: parseFloat(getElement(po1, 4)) || undefined,
    }));

    return {
      senderISA: getElement(isaSeg, 6),
      receiverISA: getElement(isaSeg, 8),
      poNumber: getElement(begSeg, 3),
      poDate: getElement(begSeg, 5),
      shipToName: n1Ship ? getElement(n1Ship, 2) : "",
      shipToAddress1: n3Seg ? getElement(n3Seg, 1) : "",
      shipToCity: n4Seg ? getElement(n4Seg, 1) : "",
      shipToState: n4Seg ? getElement(n4Seg, 2) : "",
      shipToZip: n4Seg ? getElement(n4Seg, 3) : "",
      shipToCountry: n4Seg ? getElement(n4Seg, 4) : "",
      items,
    };
  } catch {
    return null;
  }
}

/**
 * 生成 X12 856 ASN (Advance Ship Notice)
 */
export function generateX12_856_ASN(order: {
  poNumber: string; trackingNumber?: string; shipDate: string;
  items: { sku: string; quantityShipped: number }[];
  isaSender: string; isaReceiver: string;
}): string {
  const now = new Date();
  const isaDate = now.toISOString().slice(2, 10).replace(/-/g, "");
  const isaTime = now.toTimeString().slice(0, 8).replace(/:/g, "");
  const controlNumber = String(Math.floor(Math.random() * 999999999)).padStart(9, "0");

  const isa = `ISA*00*          *00*          *ZZ*${order.isaSender}*ZZ*${order.isaReceiver}*${isaDate}*${isaTime}*U*00401*${controlNumber}*0*P*>`;
  const gs = `GS*SH*${order.isaSender}*${order.isaReceiver}*${isaDate}*${isaTime}*1*X*004010`;
  const st = "ST*856*0001";
  const bsn = `BSN*00*${order.poNumber}*${isaDate}`;

  const hl1 = "HL*1**S";
  const td1 = `TD1*CTN*${order.items.length}*${order.items.reduce((s, i) => s + i.quantityShipped, 0)}`;
  const ref = order.trackingNumber ? `REF*2I*${order.trackingNumber}` : "";

  const itemLines: string[] = [];
  order.items.forEach((item, idx) => {
    const hl = `HL*${idx + 2}*1*I`;
    const lin = `LIN**UP*${item.sku}`;
    const sn1 = `SN1**${item.quantityShipped}*EA`;
    itemLines.push([hl, lin, sn1].join("~"));
  });

  const ctt = `CTT*${order.items.length}`;
  const se = `SE*${14 + order.items.length * 3}*0001`;
  const ge = `GE*1*1`;
  const iea = `IEA*1*${controlNumber}`;

  return [isa, gs, st, bsn, hl1, td1, ref, ...itemLines, ctt, se, ge, iea].filter(Boolean).join("~") + "~";
}

/**
 * 生成 X12 810 Invoice
 */
export function generateX12_810_Invoice(invoice: {
  invoiceNumber: string; poNumber: string; invoiceDate: string;
  totalAmount: number; currency: string;
  items: { sku: string; quantity: number; unitPrice: number }[];
  isaSender: string; isaReceiver: string;
}): string {
  const now = new Date();
  const isaDate = now.toISOString().slice(2, 10).replace(/-/g, "");
  const isaTime = now.toTimeString().slice(0, 8).replace(/:/g, "");
  const controlNumber = String(Math.floor(Math.random() * 999999999)).padStart(9, "0");

  const isa = `ISA*00*          *00*          *ZZ*${invoice.isaSender}*ZZ*${invoice.isaReceiver}*${isaDate}*${isaTime}*U*00401*${controlNumber}*0*P*>`;
  const gs = `GS*IN*${invoice.isaSender}*${invoice.isaReceiver}*${isaDate}*${isaTime}*1*X*004010`;
  const st = "ST*810*0001";
  const big = `BIG*${invoice.invoiceDate}*${invoice.invoiceNumber}*${invoice.invoiceDate}*${invoice.poNumber}`;
  const ctt = `CTT*${invoice.items.length}`;
  const tds = `TDS*${invoice.totalAmount.toFixed(2)}`;

  const se = `SE*${5 + invoice.items.length}*0001`;
  const ge = "GE*1*1";
  const iea = `IEA*1*${controlNumber}`;

  return [isa, gs, st, big, ctt, tds, se, ge, iea].join("~") + "~";
}

/**
 * 处理 EDI 文件 — PO 入库
 */
export async function processEDIPurchaseOrder(
  tenantId: string,
  rawX12: string,
  warehouseId?: string
): Promise<{ created: string | null; error?: string }> {
  const po = parseX12_850_PO(rawX12);
  if (!po) return { created: null, error: "Failed to parse X12 850" };

  const supabase = createServiceClient();
  if (!supabase) return { created: null, error: "Database unavailable" };

  const { data, error } = await supabase.from("orders").insert({
    tenant_id: tenantId,
    external_order_id: po.poNumber,
    status: "pending",
    shipping_name: po.shipToName,
    shipping_address1: po.shipToAddress1,
    shipping_city: po.shipToCity,
    shipping_state: po.shipToState,
    shipping_zip: po.shipToZip,
    shipping_country: po.shipToCountry,
    warehouse_id: warehouseId,
    updated_at: new Date().toISOString(),
  }).select("id").single();

  if (error) return { created: null, error: error.message };
  return { created: (data as any)?.id };
}
