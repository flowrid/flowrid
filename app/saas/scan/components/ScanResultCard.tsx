"use client";

import { useTranslations } from "next-intl";

export default function ScanResultCard({ result }: { result: any }) {
  const t = useTranslations("scan");

  if (!result || result.type === "unknown") {
    return (
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-black/5">
        <p className="text-[#86868B] text-sm text-center">{t("noMatch")}</p>
      </div>
    );
  }

  if (result.type === "product") {
    const p = result.data;
    const invCount = p.inventory?.reduce((sum: number, i: any) => sum + (i.quantity_on_hand || 0), 0) || 0;
    return (
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-black/5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-[17px] font-semibold text-[#1D1D1F]">{p.name}</h3>
          <span className="text-[11px] bg-[#34C759]/10 text-[#34C759] px-2 py-0.5 rounded-full font-medium">{t("inStock", { count: invCount })}</span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div><span className="text-[#86868B]">{t("sku")}</span><p className="text-[#1D1D1F] font-medium">{p.sku}</p></div>
          <div><span className="text-[#86868B]">{t("upc")}</span><p className="text-[#1D1D1F] font-medium">{p.upc || "—"}</p></div>
          <div><span className="text-[#86868B]">{t("weight")}</span><p className="text-[#1D1D1F] font-medium">{p.unit_weight_lbs || "—"} lbs</p></div>
          <div><span className="text-[#86868B]">{t("category")}</span><p className="text-[#1D1D1F] font-medium">{p.category || "—"}</p></div>
          {p.is_hazmat && <div className="col-span-2"><span className="text-[#FF3B30] text-[11px] font-medium">{t("hazmatWarning")}</span></div>}
        </div>
        {p.inventory?.length > 0 && (
          <div className="border-t border-black/5 pt-3">
            <p className="text-[11px] font-medium text-[#86868B] uppercase mb-2">{t("storageLocations")}</p>
            {p.inventory.map((inv: any, i: number) => (
              <div key={i} className="flex justify-between text-xs py-1">
                <span className="text-[#1D1D1F] font-mono">{inv.locations?.barcode || inv.location_id}</span>
                <span className="text-[#1D1D1F]">{t("qtyValue", { qty: inv.quantity_on_hand })}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (result.type === "location") {
    const l = result.data;
    return (
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-black/5 space-y-3">
        <h3 className="text-[17px] font-semibold text-[#1D1D1F]">{t("locationTitle", { barcode: l.barcode })}</h3>
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div><span className="text-[#86868B]">{t("zone")}</span><p className="text-[#1D1D1F] font-medium">{l.zone}</p></div>
          <div><span className="text-[#86868B]">{t("aisle")}</span><p className="text-[#1D1D1F] font-medium">{l.aisle || "—"}</p></div>
          <div><span className="text-[#86868B]">{t("rack")}</span><p className="text-[#1D1D1F] font-medium">{l.rack || "—"}</p></div>
          <div><span className="text-[#86868B]">{t("shelf")}</span><p className="text-[#1D1D1F] font-medium">{l.shelf || "—"}</p></div>
          <div><span className="text-[#86868B]">{t("bin")}</span><p className="text-[#1D1D1F] font-medium">{l.bin || "—"}</p></div>
          <div><span className="text-[#86868B]">{t("warehouse")}</span><p className="text-[#1D1D1F] font-medium">{(l.warehouses as any)?.name || "—"}</p></div>
        </div>
        {l.inventory?.length > 0 && (
          <div className="border-t border-black/5 pt-3">
            <p className="text-[11px] font-medium text-[#86868B] uppercase mb-2">{t("itemsAtLocation")}</p>
            {l.inventory.map((inv: any, i: number) => (
              <div key={i} className="flex justify-between text-xs py-1">
                <span className="text-[#1D1D1F]">{inv.products?.name || inv.product_id}</span>
                <span className="text-[#1D1D1F]">{t("qtyValue", { qty: inv.quantity_on_hand })}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (result.type === "order") {
    const o = result.data;
    return (
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-black/5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-[17px] font-semibold text-[#1D1D1F]">{o.order_number}</h3>
          <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-medium ${
            o.status === "shipped" ? "bg-[#34C759]/10 text-[#34C759]" :
            o.status === "pending" ? "bg-[#8E8E93]/10 text-[#8E8E93]" :
            "bg-[#ed6d00]/10 text-[#ed6d00]"
          }`}>{o.status}</span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div><span className="text-[#86868B]">{t("scanCustomer")}</span><p className="text-[#1D1D1F] font-medium">{o.customer_name || "—"}</p></div>
          <div><span className="text-[#86868B]">{t("scanSource")}</span><p className="text-[#1D1D1F] font-medium">{o.source || "—"}</p></div>
          <div className="col-span-2"><span className="text-[#86868B]">{t("destination")}</span><p className="text-[#1D1D1F] font-medium">{o.shipping_city}, {o.shipping_state} {o.shipping_zip}</p></div>
        </div>
        {o.order_items?.length > 0 && (
          <div className="border-t border-black/5 pt-3">
            <p className="text-[11px] font-medium text-[#86868B] uppercase mb-2">{t("itemsCount", { n: o.order_items.length })}</p>
            {o.order_items.map((oi: any, i: number) => (
              <div key={i} className="flex justify-between text-xs py-1">
                <span className="text-[#1D1D1F]">{oi.sku}</span>
                <span className="text-[#86868B]">x{oi.quantity_ordered}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return null;
}
