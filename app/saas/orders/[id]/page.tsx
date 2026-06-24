"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

interface OrderDetail {
  order: any;
  items: any[];
  packages: any[];
  returns: any[];
  allowedTransitions: string[];
}

const STATUS_STYLES: Record<string, string> = {
  shipped: "bg-[#34C759]/10 text-[#34C759]", delivered: "bg-[#34C759]/10 text-[#34C759]",
  picking: "bg-[#ed6d00]/10 text-[#ed6d00]", picked: "bg-[#ed6d00]/10 text-[#ed6d00]",
  packing: "bg-[#FF9500]/10 text-[#FF9500]",
  allocated: "bg-[#AF52DE]/10 text-[#AF52DE]",
  packed: "bg-[#007AFF]/10 text-[#007AFF]",
  pending: "bg-[#8E8E93]/10 text-[#8E8E93]",
  returned: "bg-[#FF3B30]/10 text-[#FF3B30]",
  cancelled: "bg-[#FF3B30]/10 text-[#FF3B30]",
};

export default function OrderDetailPage() {
  const t = useTranslations("saas");
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [data, setData] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function fetchOrder() {
    try {
      const r = await fetch(`/api/saas/orders/${id}`);
      if (!r.ok) throw new Error(`Request failed (${r.status})`);
      setData(await r.json());
    } catch (e: any) {
      setError(e.message || t("failedToLoadOrder"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchOrder(); }, [id]);

  async function transitionStatus(newStatus: string) {
    setUpdating(true);
    setMsg(null);
    try {
      const r = await fetch(`/api/saas/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (r.ok) {
        fetchOrder();
      } else {
        const err = await r.json();
        setMsg(err.error || t("failedToUpdateStatus"));
      }
    } catch {
      setMsg(t("networkError"));
    } finally {
      setUpdating(false);
    }
  }

  if (loading) return <Skeleton />;
  if (error) return (
    <div className="p-8 text-center">
      <p className="text-[#FF3B30] text-sm mb-3">{error}</p>
      <button onClick={() => { setError(null); setLoading(true); fetchOrder(); }} className="text-sm text-[#ed6d00] font-medium">{t("retry")}</button>
    </div>
  );
  if (!data) return null;

  const { order, items, packages: pkgs, returns, allowedTransitions } = data;
  const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  return (
    <div className="p-6 md:p-8 max-w-[1280px]">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="text-[#86868B] hover:text-[#1D1D1F] text-sm">&larr; Back</button>
        <h1 className="text-[28px] font-bold tracking-tight text-[#1D1D1F]">Order {order.order_number || order.id}</h1>
        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-medium ${STATUS_STYLES[order.status] || ""}`}>{cap(order.status)}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main: order info + line items */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status Actions */}
          {allowedTransitions.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-black/5 p-6">
              <h2 className="text-[15px] font-semibold text-[#1D1D1F] mb-3">{t("actions")}</h2>
              <div className="flex flex-wrap gap-2">
                {allowedTransitions.map((s) => (
                  <button
                    key={s}
                    onClick={() => transitionStatus(s)}
                    disabled={updating}
                    className="bg-[#ed6d00] text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-[#FF8A1F] disabled:opacity-50 transition-colors"
                  >
                    {updating ? "..." : t("markAs", { status: cap(s) })}
                  </button>
                ))}
              </div>
              {msg && <p className="text-xs text-[#FF3B30] mt-2">{msg}</p>}
            </div>
          )}

          {/* Order Info */}
          <div className="bg-white rounded-2xl shadow-sm border border-black/5 p-6">
            <h2 className="text-[15px] font-semibold text-[#1D1D1F] mb-4">{t("orderInformation")}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
              <Info label="Source" value={order.source || "—"} />
              <Info label="Priority" value={cap(order.priority || "normal")} />
              <Info label="Warehouse" value={order.warehouses?.name || "—"} />
              <Info label="Client" value={order.clients?.name || order.clients?.company || "—"} />
              <Info label="Customer" value={order.customer_name || "—"} />
              <Info label="Email" value={order.customer_email || "—"} />
              <Info label="Shipping Method" value={order.shipping_method || "—"} />
              <Info label="Tracking" value={order.tracking_number || "—"} />
              <Info label="Created" value={order.created_at ? new Date(order.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—"} />
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white rounded-2xl shadow-sm border border-black/5 p-6">
            <h2 className="text-[15px] font-semibold text-[#1D1D1F] mb-4">{t("shippingAddress")}</h2>
            <p className="text-sm text-[#1D1D1F] leading-relaxed">
              {order.shipping_address_line1 || "—"}<br />
              {[order.shipping_city, order.shipping_state, order.shipping_zip].filter(Boolean).join(", ") || "—"}<br />
              {order.shipping_country || "—"}
            </p>
          </div>

          {/* Line Items */}
          <div className="bg-white rounded-2xl shadow-sm border border-black/5 overflow-hidden">
            <div className="px-6 py-4 border-b border-black/5">
              <h2 className="text-[15px] font-semibold text-[#1D1D1F]">Line Items ({items.length})</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs font-medium text-[#86868B] border-b border-black/5">
                    <th className="px-5 py-3">{t("product")}</th>
                    <th className="px-5 py-3">{t("sku")}</th>
                    <th className="px-5 py-3 text-right">{t("ordered")}</th>
                    <th className="px-5 py-3 text-right">{t("picked")}</th>
                    <th className="px-5 py-3 text-right">{t("packed")}</th>
                    <th className="px-5 py-3 text-right">{t("shipped")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/[0.04]">
                  {items.map((item: any) => (
                    <tr key={item.id} className="hover:bg-black/[0.01]">
                      <td className="px-5 py-3 text-sm text-[#1D1D1F]">{item.products?.name || item.product_id}</td>
                      <td className="px-5 py-3 text-xs text-[#86868B]">{item.products?.sku || "—"}</td>
                      <td className="px-5 py-3 text-sm text-right">{item.quantity_ordered}</td>
                      <td className="px-5 py-3 text-sm text-right">{item.quantity_picked || 0}</td>
                      <td className="px-5 py-3 text-sm text-right">{item.quantity_packed || 0}</td>
                      <td className="px-5 py-3 text-sm text-right">{item.quantity_shipped || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar: packages + returns */}
        <div className="space-y-6">
          {/* Packages */}
          <div className="bg-white rounded-2xl shadow-sm border border-black/5 p-6">
            <h2 className="text-[15px] font-semibold text-[#1D1D1F] mb-3">Packages ({pkgs.length})</h2>
            {pkgs.length === 0 ? (
              <p className="text-sm text-[#86868B]">{t("noPackages")}</p>
            ) : (
              <div className="space-y-3">
                {pkgs.map((p: any) => (
                  <div key={p.id} className="p-3 bg-[#F5F5F7] rounded-xl text-sm">
                    <div className="flex justify-between">
                      <span className="font-medium">{p.carrier || "—"}</span>
                      <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${(p.status === "shipped" || p.status === "created") ? "bg-[#34C759]/10 text-[#34C759]" : "bg-[#8E8E93]/10 text-[#8E8E93]"}`}>{p.status || "pending"}</span>
                    </div>
                    {p.tracking_number && <p className="text-xs text-[#86868B] mt-1">Tracking: {p.tracking_number}</p>}
                    {p.weight_lbs && <p className="text-xs text-[#86868B]">{p.weight_lbs} lbs</p>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Returns */}
          <div className="bg-white rounded-2xl shadow-sm border border-black/5 p-6">
            <h2 className="text-[15px] font-semibold text-[#1D1D1F] mb-3">Returns ({returns.length})</h2>
            {returns.length === 0 ? (
              <p className="text-sm text-[#86868B]">{t("noReturns")}</p>
            ) : (
              <div className="space-y-3">
                {returns.map((r: any) => (
                  <div key={r.id} className="p-3 bg-[#F5F5F7] rounded-xl text-sm">
                    <p className="font-medium">RMA: {r.rma_number}</p>
                    <p className="text-xs text-[#86868B]">Reason: {r.reason || "—"}</p>
                    <span className={`inline-flex mt-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${r.status === "received" ? "bg-[#34C759]/10 text-[#34C759]" : "bg-[#8E8E93]/10 text-[#8E8E93]"}`}>{r.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] text-[#86868B] uppercase tracking-wide">{label}</p>
      <p className="text-[#1D1D1F] mt-0.5">{value}</p>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="p-8 space-y-4 animate-pulse">
      <div className="h-8 w-48 bg-black/5 rounded-xl" />
      <div className="grid grid-cols-3 gap-4">
        <div className="h-40 bg-white/50 rounded-2xl" />
        <div className="h-40 bg-white/50 rounded-2xl col-span-2" />
      </div>
    </div>
  );
}
