"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { authedFetch } from "@/lib/authed-fetch";

export default function ProductsContent() {
  const t = useTranslations("saasContent.products");
  const router = useRouter();
  const pathname = usePathname();
  const productBasePath = pathname.startsWith("/account") ? "/account/products" : "/saas/products";
  const [products, setProducts] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [sku, setSku] = useState("");
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [brand, setBrand] = useState("");
  const [weight, setWeight] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const mountedRef = useRef(true);

  useEffect(() => { return () => { mountedRef.current = false; }; }, []);

  useEffect(() => {
    let cancelled = false;
    fetchProducts();
    return () => { cancelled = true; };
  }, [search, categoryFilter]);

  async function fetchProducts() {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (search.trim()) params.set("q", search.trim());
      if (categoryFilter) params.set("category", categoryFilter);

      const qs = params.toString();
      const res = await authedFetch("/api/saas/products" + (qs ? "?" + qs : ""));
      if (!mountedRef.current) return;
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || t("networkError"));
      }
      const d = await res.json();
      setProducts(d.data || d.products || []);
      setStats(d.stats || { total: 0 });
    } catch (err: any) {
      if (mountedRef.current) setError(err.message || t("networkError"));
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }

  async function handleCreate() {
    if (!sku.trim() || !name.trim()) return;
    setSaving(true);
    setMessage(null);

    try {
      const res = await authedFetch("/api/saas/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sku: sku.trim(),
          name: name.trim(),
          category: category.trim() || undefined,
          brand: brand.trim() || undefined,
          unit_weight_lbs: weight.trim() ? parseFloat(weight) : undefined,
        }),
      });
      if (res.ok) {
        setSku(""); setName(""); setCategory(""); setBrand(""); setWeight("");
        setMessage({ type: "success", text: t("productCreated") });
        fetchProducts();
      } else {
        const d = await res.json().catch(() => ({}));
        setMessage({ type: "error", text: d.error || t("failedToCreate") });
      }
    } catch {
      setMessage({ type: "error", text: t("networkError") });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm(t("deleteConfirm"))) return;
    const res = await authedFetch(`/api/saas/products/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const d = await res.json();
      alert(d.error || t("failedToDelete"));
    }
    fetchProducts();
  }

  if (loading) return (
    <div className="p-8 space-y-4 animate-pulse">
      <div className="h-8 w-36 bg-black/5 rounded-xl" />
      {[...Array(5)].map((_, i) => <div key={i} className="h-14 bg-white/50 rounded-xl" />)}
    </div>
  );

  if (error) return (
    <div className="p-8 text-center">
      <p className="text-[#FF3B30] text-sm mb-3">{error}</p>
      <button onClick={() => fetchProducts()} className="text-sm text-[#ed6d00] font-medium hover:text-[#FF8A1F]">{t("retry")}</button>
    </div>
  );

  const categories = [...new Set(products.map((p: any) => p.category).filter(Boolean))] as string[];

  return (
    <div className="p-6 md:p-8 max-w-[1280px]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight text-[#1D1D1F]">{t("title")}</h1>
          <p className="text-[#86868B] text-sm mt-0.5">{t("subtitle", { n: stats.total })}</p>
        </div>
      </div>

      {message && (
        <div className={`mb-4 rounded-2xl p-4 text-sm font-medium ${message.type === "success" ? "bg-[#34C759]/10 text-[#34C759]" : "bg-[#FF3B30]/10 text-[#FF3B30]"}`}>
          {message.text}
        </div>
      )}

      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 max-w-xs">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="w-full bg-white border border-black/5 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ed6d00]/20"
          />
        </div>
        {categories.length > 0 && (
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-white border border-black/5 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ed6d00]/20"
          >
            <option value="">{t("allCategories")}</option>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-black/5 p-6 mb-6">
        <h2 className="text-[15px] font-semibold text-[#1D1D1F] mb-4">{t("addProduct")}</h2>
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[120px]">
            <label className="block text-[11px] font-medium text-[#86868B] uppercase tracking-wide mb-1.5">{t("sku")}</label>
            <input type="text" value={sku} onChange={(e) => setSku(e.target.value)} placeholder={t("skuPlaceholder")}
              className="w-full bg-[#F5F5F7] border-0 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ed6d00]/20" />
          </div>
          <div className="flex-1 min-w-[180px]">
            <label className="block text-[11px] font-medium text-[#86868B] uppercase tracking-wide mb-1.5">{t("name")}</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder={t("namePlaceholder")}
              className="w-full bg-[#F5F5F7] border-0 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ed6d00]/20" />
          </div>
          <div className="flex-1 min-w-[120px]">
            <label className="block text-[11px] font-medium text-[#86868B] uppercase tracking-wide mb-1.5">{t("category")}</label>
            <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} placeholder={t("categoryPlaceholder")}
              className="w-full bg-[#F5F5F7] border-0 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ed6d00]/20" />
          </div>
          <div className="flex-1 min-w-[120px]">
            <label className="block text-[11px] font-medium text-[#86868B] uppercase tracking-wide mb-1.5">{t("brand")}</label>
            <input type="text" value={brand} onChange={(e) => setBrand(e.target.value)} placeholder={t("brandPlaceholder")}
              className="w-full bg-[#F5F5F7] border-0 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ed6d00]/20" />
          </div>
          <div className="w-[100px]">
            <label className="block text-[11px] font-medium text-[#86868B] uppercase tracking-wide mb-1.5">{t("weight")}</label>
            <input type="number" step="0.01" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder={t("weightPlaceholder")}
              className="w-full bg-[#F5F5F7] border-0 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ed6d00]/20" />
          </div>
          <button onClick={handleCreate} disabled={saving || !sku.trim() || !name.trim()}
            className="bg-[#ed6d00] text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-[#FF8A1F] disabled:opacity-50 transition-colors">
            {saving ? t("creating") : t("create")}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-black/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-medium text-[#86868B] border-b border-black/5">
                <th className="px-5 py-3.5">{t("skuLabel")}</th>
                <th className="px-5 py-3.5">{t("nameLabel")}</th>
                <th className="px-5 py-3.5">{t("categoryLabel")}</th>
                <th className="px-5 py-3.5">{t("brandLabel")}</th>
                <th className="px-5 py-3.5">{t("weightLabel")}</th>
                <th className="px-5 py-3.5">{t("status")}</th>
                <th className="px-5 py-3.5 text-right">{t("actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.04]">
              {products.map((p: any) => (
                <tr key={p.id} className="hover:bg-black/[0.01] transition-colors cursor-pointer" onClick={() => router.push(`${productBasePath}/${p.id}`)}>
                  <td className="px-5 py-3.5 text-xs font-mono text-[#86868B]">{p.sku}</td>
                  <td className="px-5 py-3.5 text-sm font-medium text-[#1D1D1F]">{p.name}</td>
                  <td className="px-5 py-3.5 text-xs text-[#86868B]">{p.category || "—"}</td>
                  <td className="px-5 py-3.5 text-xs text-[#86868B]">{p.brand || "—"}</td>
                  <td className="px-5 py-3.5 text-xs text-[#86868B]">{p.unit_weight_lbs != null ? `${p.unit_weight_lbs} lbs` : "—"}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1.5">
                      {p.is_hazmat && (
                        <span className="inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#FF9500]/10 text-[#FF9500]">{t("hazmat")}</span>
                      )}
                      <span className="inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#34C759]/10 text-[#34C759]">{t("active")}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(p.id); }}
                      className="text-[11px] text-[#FF3B30] hover:bg-[#FF3B30]/5 px-2 py-1 rounded-full font-medium transition-colors">
                      {t("delete")}
                    </button>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr><td colSpan={7} className="px-5 py-12 text-center text-[#86868B] text-sm">{t("noProducts")}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
