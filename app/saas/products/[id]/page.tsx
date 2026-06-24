"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

export default function ProductDetailPage() {
  const t = useTranslations("saas");
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [product, setProduct] = useState<any>(null);
  const [inventory, setInventory] = useState<any[]>([]);
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  // Edit form state
  const [editName, setEditName] = useState("");
  const [editSku, setEditSku] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editBrand, setEditBrand] = useState("");
  const [editWeight, setEditWeight] = useState("");
  const [editDesc, setEditDesc] = useState("");

  async function fetchProduct() {
    try {
      const r = await fetch(`/api/saas/products/${id}`);
      if (!r.ok) throw new Error(`Request failed (${r.status})`);
      const d = await r.json();
      setProduct(d.product);
      setInventory(d.inventory || []);
      setOrderItems(d.orderItems || []);
      setEditName(d.product.name || "");
      setEditSku(d.product.sku || "");
      setEditCategory(d.product.category || "");
      setEditBrand(d.product.brand || "");
      setEditWeight(d.product.unit_weight_lbs?.toString() || "");
      setEditDesc(d.product.description || "");
    } catch (e: any) {
      setError(e.message || t("failedToLoad"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchProduct(); }, [id]);

  async function handleSave() {
    setSaving(true);
    setMsg(null);
    try {
      const body: Record<string, unknown> = {};
      if (editName !== product.name) body.name = editName;
      if (editSku !== product.sku) body.sku = editSku;
      if (editCategory !== (product.category || "")) body.category = editCategory;
      if (editBrand !== (product.brand || "")) body.brand = editBrand;
      if (editDesc !== (product.description || "")) body.description = editDesc;
      const w = parseFloat(editWeight);
      if (!isNaN(w) && w !== product.unit_weight_lbs) body.unit_weight_lbs = w;

      if (Object.keys(body).length === 0) {
        setEditing(false);
        return;
      }

      const r = await fetch(`/api/saas/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (r.ok) {
        setEditing(false);
        fetchProduct();
      } else {
        const err = await r.json();
        setMsg(err.error || t("failedToUpdate"));
      }
    } catch {
      setMsg(t("networkError"));
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <Skeleton />;
  if (error) return (
    <div className="p-8 text-center">
      <p className="text-[#FF3B30] text-sm mb-3">{error}</p>
      <button onClick={() => { setError(null); setLoading(true); fetchProduct(); }} className="text-sm text-[#ed6d00] font-medium">{t("retry")}</button>
    </div>
  );
  if (!product) return null;

  return (
    <div className="p-6 md:p-8 max-w-[1280px]">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="text-[#86868B] hover:text-[#1D1D1F] text-sm">&larr; Back</button>
        <h1 className="text-[28px] font-bold tracking-tight text-[#1D1D1F]">{product.name}</h1>
        <span className="text-[#86868B] text-sm">{product.sku}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-black/5 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-[15px] font-semibold text-[#1D1D1F]">{t("productInformation")}</h2>
              {!editing ? (
                <button onClick={() => setEditing(true)} className="text-sm text-[#ed6d00] font-medium hover:text-[#FF8A1F]">{t("edit")}</button>
              ) : (
                <div className="flex gap-2">
                  <button onClick={() => setEditing(false)} className="text-sm text-[#86868B] hover:text-[#1D1D1F]">{t("cancel")}</button>
                  <button onClick={handleSave} disabled={saving} className="text-sm bg-[#ed6d00] text-white px-4 py-1.5 rounded-full font-medium hover:bg-[#FF8A1F] disabled:opacity-50">{saving ? t("saving") : t("save")}</button>
                </div>
              )}
            </div>

            {msg && <p className="text-xs text-[#FF3B30] mb-3">{msg}</p>}

            {editing ? (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-medium text-[#86868B] uppercase mb-1">{t("name")}</label>
                  <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full bg-[#F5F5F7] border-0 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ed6d00]/20" />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-[#86868B] uppercase mb-1">{t("sku")}</label>
                  <input type="text" value={editSku} onChange={(e) => setEditSku(e.target.value)} className="w-full bg-[#F5F5F7] border-0 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ed6d00]/20" />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-[#86868B] uppercase mb-1">{t("category")}</label>
                  <input type="text" value={editCategory} onChange={(e) => setEditCategory(e.target.value)} className="w-full bg-[#F5F5F7] border-0 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ed6d00]/20" />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-[#86868B] uppercase mb-1">{t("brand")}</label>
                  <input type="text" value={editBrand} onChange={(e) => setEditBrand(e.target.value)} className="w-full bg-[#F5F5F7] border-0 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ed6d00]/20" />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-[#86868B] uppercase mb-1">{t("weightLbs")}</label>
                  <input type="number" step="0.01" value={editWeight} onChange={(e) => setEditWeight(e.target.value)} className="w-full bg-[#F5F5F7] border-0 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ed6d00]/20" />
                </div>
                <div className="col-span-2">
                  <label className="block text-[11px] font-medium text-[#86868B] uppercase mb-1">{t("description")}</label>
                  <textarea value={editDesc} onChange={(e) => setEditDesc(e.target.value)} rows={3} className="w-full bg-[#F5F5F7] border-0 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ed6d00]/20" />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                <Info label="SKU" value={product.sku} />
                <Info label="Category" value={product.category || "—"} />
                <Info label="Brand" value={product.brand || "—"} />
                <Info label="UPC" value={product.upc || "—"} />
                <Info label="Weight" value={product.unit_weight_lbs ? `${product.unit_weight_lbs} lbs` : "—"} />
                <Info label="Dimensions" value={[product.unit_length_in, product.unit_width_in, product.unit_height_in].filter(Boolean).join(" x ") + " in" || "—"} />
                <Info label="Hazmat" value={product.is_hazmat ? t("yes") : t("no")} />
                <Info label="Active" value={product.is_active ? t("yes") : t("no")} />
              </div>
            )}
          </div>

          {/* Inventory across warehouses */}
          <div className="bg-white rounded-2xl shadow-sm border border-black/5 overflow-hidden">
            <div className="px-6 py-4 border-b border-black/5">
              <h2 className="text-[15px] font-semibold text-[#1D1D1F]">Inventory ({inventory.length})</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs font-medium text-[#86868B] border-b border-black/5">
                    <th className="px-5 py-3">Warehouse</th>
                    <th className="px-5 py-3">Location</th>
                    <th className="px-5 py-3 text-right">On Hand</th>
                    <th className="px-5 py-3 text-right">Allocated</th>
                    <th className="px-5 py-3 text-right">Available</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/[0.04]">
                  {inventory.map((inv: any) => (
                    <tr key={inv.id}>
                      <td className="px-5 py-3 text-sm text-[#1D1D1F]">{inv.warehouses?.name || inv.warehouse_id}</td>
                      <td className="px-5 py-3 text-xs text-[#86868B]">{inv.locations?.zone || "—"}</td>
                      <td className="px-5 py-3 text-sm text-right">{inv.quantity_on_hand}</td>
                      <td className="px-5 py-3 text-sm text-right">{inv.quantity_allocated}</td>
                      <td className="px-5 py-3 text-sm text-right font-medium">{inv.quantity_available}</td>
                    </tr>
                  ))}
                  {inventory.length === 0 && (
                    <tr><td colSpan={5} className="px-5 py-8 text-center text-[#86868B] text-sm">{t("noInventory")}</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-2xl shadow-sm border border-black/5 p-6">
          <h2 className="text-[15px] font-semibold text-[#1D1D1F] mb-3">Recent Orders ({orderItems.length})</h2>
          {orderItems.length === 0 ? (
            <p className="text-sm text-[#86868B]">{t("noOrdersContain")}</p>
          ) : (
            <div className="space-y-2">
              {orderItems.map((oi: any) => (
                <div key={oi.id} className="p-3 bg-[#F5F5F7] rounded-xl text-sm">
                  <p className="font-medium text-[#1D1D1F]">{oi.orders?.order_number || "—"}</p>
                  <p className="text-xs text-[#86868B]">Qty: {oi.quantity_ordered} · Status: {oi.orders?.status || "—"}</p>
                </div>
              ))}
            </div>
          )}
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
        <div className="h-60 bg-white/50 rounded-2xl col-span-2" />
        <div className="h-60 bg-white/50 rounded-2xl" />
      </div>
    </div>
  );
}
