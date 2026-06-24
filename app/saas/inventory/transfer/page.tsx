"use client";
import { useTranslations } from "next-intl";

// 库存转移

import { useEffect, useState } from "react";

export default function TransferPage() {
  const t = useTranslations("saas");
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [fromWh, setFromWh] = useState("");
  const [toWh, setToWh] = useState("");
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [reason, setReason] = useState("");
  const [result, setResult] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/saas/warehouses").then((r) => r.json()).then((d) => setWarehouses(d.data || [])).catch(() => {});
  }, []);

  async function handleTransfer(e: React.FormEvent) {
    e.preventDefault();
    if (!fromWh || !toWh || !productId.trim() || fromWh === toWh) {
      setMsg(t("pleaseFillAllFields"));
      return;
    }
    setSubmitting(true);
    setMsg(null);
    setResult(null);
    try {
      const r = await fetch("/api/saas/inventory/transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromWarehouseId: fromWh,
          toWarehouseId: toWh,
          items: [{ productId: productId.trim(), quantity: parseInt(quantity) || 1 }],
          reason: reason.trim() || undefined,
        }),
      });
      const d = await r.json();
      setResult(d);
    } catch { setMsg(t("networkError")); }
    finally { setSubmitting(false); }
  }

  return (
    <div className="p-6 md:p-8 max-w-[768px]">
      <h1 className="text-[28px] font-bold tracking-tight text-[#1D1D1F] mb-6">{t("inventoryTransfer")}</h1>

      <div className="bg-white rounded-2xl shadow-sm border border-black/5 p-6">
        <h2 className="text-[15px] font-semibold text-[#1D1D1F] mb-4">{t("transferBetweenWarehouses")}</h2>
        <form onSubmit={handleTransfer} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-medium text-[#86868B] uppercase mb-1">{t("fromWarehouse")}</label>
              <select value={fromWh} onChange={(e) => setFromWh(e.target.value)}
                className="w-full bg-[#F5F5F7] border-0 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ed6d00]/20">
                <option value="">{t("selectSource")}</option>
                {warehouses.map((w: any) => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-[#86868B] uppercase mb-1">{t("toWarehouse")}</label>
              <select value={toWh} onChange={(e) => setToWh(e.target.value)}
                className="w-full bg-[#F5F5F7] border-0 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ed6d00]/20">
                <option value="">{t("selectDestination")}</option>
                {warehouses.filter((w) => w.id !== fromWh).map((w: any) => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-medium text-[#86868B] uppercase mb-1">{t("productIdRequired")}</label>
              <input type="text" value={productId} onChange={(e) => setProductId(e.target.value)} placeholder={t("uuidPlaceholder")}
                className="w-full bg-[#F5F5F7] border-0 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ed6d00]/20" />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-[#86868B] uppercase mb-1">{t("quantityRequired")}</label>
              <input type="number" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)}
                className="w-full bg-[#F5F5F7] border-0 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ed6d00]/20" />
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-medium text-[#86868B] uppercase mb-1">{t("reason")}</label>
            <input type="text" value={reason} onChange={(e) => setReason(e.target.value)} placeholder={t("optionalPlaceholder")}
              className="w-full bg-[#F5F5F7] border-0 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ed6d00]/20" />
          </div>
          <div className="flex items-center gap-3">
            <button type="submit" disabled={submitting}
              className="bg-[#ed6d00] text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-[#FF8A1F] disabled:opacity-50 transition-colors">
              {submitting ? t("transferring") : t("executeTransfer")}
            </button>
            {msg && <span className="text-xs text-[#FF3B30]">{msg}</span>}
          </div>
        </form>

        {result && (
          <div className="mt-6 p-4 bg-[#F5F5F7] rounded-xl">
            <div className="text-sm font-semibold mb-2">
              Transfer <span className="font-mono text-xs text-[#86868B]">{result.referenceNumber}</span>
              {" "}&mdash;{" "}
              <span className={`font-medium ${result.status === "completed" ? "text-[#34C759]" : result.status === "partial" ? "text-[#FF9500]" : "text-[#FF3B30]"}`}>
                {result.status}
              </span>
            </div>
            {result.items?.map((item: any, i: number) => (
              <div key={i} className="text-xs text-[#86868B] flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${item.status === "transferred" ? "bg-[#34C759]" : item.status === "insufficient" ? "bg-[#FF9500]" : "bg-[#FF3B30]"}`} />
                <span className="font-mono">{item.productId?.slice(0, 8)}</span> x{item.quantity}
                {item.error && <span className="text-[#FF3B30]">({item.error})</span>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
