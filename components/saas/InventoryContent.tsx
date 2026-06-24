"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { authedFetch } from "@/lib/authed-fetch";

const DT: Record<string, any> = { products: [], warehouses: [], stats: { totalSKUs: 0 } };

export default function InventoryContent() {
  const t = useTranslations("saasContent.inventory");
  const [data, setData] = useState(DT);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [sku, setSku] = useState("");
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [brand, setBrand] = useState("");
  const [weight, setWeight] = useState("");
  const [creating, setCreating] = useState(false);
  const [createMsg, setCreateMsg] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);

  function fetchInventory() {
    setLoading(true);
    let cancelled = false;
    authedFetch("/api/saas/inventory")
      .then(r => { if (!r.ok) throw new Error(t("networkError")); return r.json(); })
      .then(d => { if (!cancelled) { setData(d); setLoading(false); } })
      .catch(e => { if (!cancelled) { setError(e.message || t("networkError")); setLoading(false); } });
    return () => { cancelled = true; };
  }

  useEffect(() => {
    const cancel = fetchInventory();
    return cancel;
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!sku.trim() || !name.trim()) {
      setCreateMsg(t("skuNameRequired"));
      return;
    }
    setCreating(true);
    setCreateMsg(null);
    try {
      const body: Record<string, unknown> = {
        sku: sku.trim(),
        name: name.trim(),
      };
      if (category.trim()) body.category = category.trim();
      if (brand.trim()) body.brand = brand.trim();
      if (weight.trim()) body.unit_weight_lbs = parseFloat(weight);

      const res = await authedFetch("/api/saas/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setSku(""); setName(""); setCategory(""); setBrand(""); setWeight("");
        setCreateMsg(null);
        fetchInventory();
      } else {
        const err = await res.json();
        setCreateMsg(err.error || t("failedToCreate"));
      }
    } catch {
      setCreateMsg(t("networkError"));
    } finally {
      setCreating(false);
    }
  }

  async function handleDeleteSelected() {
    if (selectedIds.size === 0) return;
    setDeleting(true);
    for (const id of selectedIds) {
      try { await authedFetch(`/api/saas/products/${id}`, { method: "DELETE" }); } catch {}
    }
    setSelectedIds(new Set());
    setDeleting(false);
    fetchInventory();
  }

  function toggleSelect(id: string) {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelectedIds(next);
  }

  function toggleSelectAll() {
    const allIds = products.map((p: any) => p.id);
    if (allIds.every((id: string) => selectedIds.has(id))) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(allIds));
    }
  }

  const { products, stats } = data;

  if (loading) return (
    <div className="p-8 space-y-4 animate-pulse">
      <div className="h-8 w-40 bg-black/5 rounded-xl" />
      {[...Array(4)].map((_, i) => <div key={i} className="h-14 bg-white/50 rounded-xl" />)}
    </div>
  );

  if (error) return <div className="p-8 text-center"><p className="text-[#FF3B30] text-sm mb-3">{error}</p><button onClick={() => { setError(null); fetchInventory(); }} className="text-sm text-[#ed6d00] font-medium hover:text-[#FF8A1F]">{t("retry")}</button></div>;

  return (
    <div className="p-6 md:p-8 max-w-[1280px]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight text-[#1D1D1F]">{t("title")}</h1>
          <p className="text-[#86868B] text-sm mt-0.5">{t("subtitle", { n: stats.totalSKUs })}</p>
        </div>
      </div>

      <div className="mb-6 bg-white rounded-2xl shadow-sm border border-black/5 p-6">
        <h2 className="text-[15px] font-semibold text-[#1D1D1F] mb-4">{t("addProduct")}</h2>
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-medium text-[#86868B] uppercase tracking-wide mb-1">{t("sku")}</label>
              <input type="text" value={sku} onChange={(e) => setSku(e.target.value)} placeholder={t("skuPlaceholder")} className="w-full bg-[#F5F5F7] border-0 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ed6d00]/20" />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-[#86868B] uppercase tracking-wide mb-1">{t("name")}</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder={t("namePlaceholder")} className="w-full bg-[#F5F5F7] border-0 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ed6d00]/20" />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-[#86868B] uppercase tracking-wide mb-1">{t("category")}</label>
              <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} placeholder={t("categoryPlaceholder")} className="w-full bg-[#F5F5F7] border-0 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ed6d00]/20" />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-[#86868B] uppercase tracking-wide mb-1">{t("brand")}</label>
              <input type="text" value={brand} onChange={(e) => setBrand(e.target.value)} placeholder={t("brandPlaceholder")} className="w-full bg-[#F5F5F7] border-0 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ed6d00]/20" />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-[#86868B] uppercase tracking-wide mb-1">{t("weight")}</label>
              <input type="number" step="0.01" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder={t("weightPlaceholder")} className="w-full bg-[#F5F5F7] border-0 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ed6d00]/20" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button type="submit" disabled={creating} className="bg-[#ed6d00] text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-[#FF8A1F] disabled:opacity-50 transition-colors">
              {creating ? t("creating") : t("createProduct")}
            </button>
            {createMsg && <span className="text-xs text-[#FF3B30]">{createMsg}</span>}
          </div>
        </form>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-black/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-medium text-[#86868B] border-b border-black/5">
                <th className="px-5 py-3.5 w-10"><input type="checkbox" checked={products.length > 0 && products.every((p: any) => selectedIds.has(p.id))} onChange={toggleSelectAll} className="w-3.5 h-3.5 rounded border-black/20 text-[#ed6d00] focus:ring-[#ed6d00]/20" /></th>
                <th className="px-5 py-3.5">{t("skuLabel")}</th><th className="px-5 py-3.5">{t("productLabel")}</th>
                <th className="px-5 py-3.5">{t("categoryLabel")}</th><th className="px-5 py-3.5 text-right">{t("weightLabel")}</th>
                <th className="px-5 py-3.5 text-right">
                  {selectedIds.size > 0 && (
                    <button onClick={handleDeleteSelected} disabled={deleting} className="text-[11px] text-[#FF3B30] font-medium hover:text-[#FF6B6B] disabled:opacity-50">
                      {deleting ? t("deleting") : t("deleteN", { n: selectedIds.size })}
                    </button>
                  )}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.04]">
              {products.map((p: any) => (
                <tr key={p.id} className="hover:bg-black/[0.01] transition-colors">
                  <td className="px-5 py-3.5"><input type="checkbox" checked={selectedIds.has(p.id)} onChange={() => toggleSelect(p.id)} className="w-3.5 h-3.5 rounded border-black/20 text-[#ed6d00] focus:ring-[#ed6d00]/20" /></td>
                  <td className="px-5 py-3.5 text-xs font-mono text-[#86868B]">{p.sku}</td>
                  <td className="px-5 py-3.5 text-sm font-medium text-[#1D1D1F]">{p.name}</td>
                  <td className="px-5 py-3.5 text-xs text-[#86868B]">{p.category}</td>
                  <td className="px-5 py-3.5 text-sm text-[#1D1D1F] text-right">{p.unit_weight_lbs} lbs</td>
                  <td className="px-5 py-3.5" />
                </tr>
              ))}
              {products.length === 0 && (
                <tr><td colSpan={6} className="px-5 py-12 text-center text-[#86868B] text-sm">{t("noProducts")}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
