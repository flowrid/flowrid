"use client";

import { useEffect, useState } from "react";

const DT: Record<string, any> = { products: [], warehouses: [], stats: { totalSKUs: 0 } };

export default function InventoryPage() {
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

  function fetchInventory() {
    setLoading(true);
    let cancelled = false;
    fetch("/api/saas/inventory")
      .then(r => { if (!r.ok) throw new Error(`请求失败 (${r.status})`); return r.json(); })
      .then(d => { if (!cancelled) { setData(d); setLoading(false); } })
      .catch(e => { if (!cancelled) { setError(e.message || "加载失败"); setLoading(false); } });
    return () => { cancelled = true; };
  }

  useEffect(() => {
    const cancel = fetchInventory();
    return cancel;
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!sku.trim() || !name.trim()) {
      setCreateMsg("SKU and Name are required");
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

      const res = await fetch("/api/saas/products", {
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
        setCreateMsg(err.error || "Failed to create");
      }
    } catch {
      setCreateMsg("Network error");
    } finally {
      setCreating(false);
    }
  }

  const { products, stats } = data;

  if (loading) return (
    <div className="p-8 space-y-4 animate-pulse">
      <div className="h-8 w-40 bg-black/5 rounded-xl" />
      {[...Array(4)].map((_, i) => <div key={i} className="h-14 bg-white/50 rounded-xl" />)}
    </div>
  );

  if (error) return <div className="p-8 text-center"><p className="text-[#FF3B30] text-sm mb-3">{error}</p><button onClick={() => { setError(null); fetchInventory(); }} className="text-sm text-[#ed6d00] font-medium hover:text-[#FF8A1F]">重试</button></div>;

  return (
    <div className="p-6 md:p-8 max-w-[1280px]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight text-[#1D1D1F]">Inventory</h1>
          <p className="text-[#86868B] text-sm mt-0.5">{stats.totalSKUs} SKUs</p>
        </div>
      </div>

      {/* Add Product form — always visible */}
      <div className="mb-6 bg-white rounded-2xl shadow-sm border border-black/5 p-6">
        <h2 className="text-[15px] font-semibold text-[#1D1D1F] mb-4">Add Product</h2>
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-medium text-[#86868B] uppercase tracking-wide mb-1">SKU *</label>
              <input type="text" value={sku} onChange={(e) => setSku(e.target.value)} placeholder="SKU-001" className="w-full bg-[#F5F5F7] border-0 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ed6d00]/20" />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-[#86868B] uppercase tracking-wide mb-1">Name *</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Product Name" className="w-full bg-[#F5F5F7] border-0 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ed6d00]/20" />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-[#86868B] uppercase tracking-wide mb-1">Category</label>
              <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Electronics" className="w-full bg-[#F5F5F7] border-0 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ed6d00]/20" />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-[#86868B] uppercase tracking-wide mb-1">Brand</label>
              <input type="text" value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="Brand" className="w-full bg-[#F5F5F7] border-0 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ed6d00]/20" />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-[#86868B] uppercase tracking-wide mb-1">Weight (lbs)</label>
              <input type="number" step="0.01" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="0.00" className="w-full bg-[#F5F5F7] border-0 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ed6d00]/20" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button type="submit" disabled={creating} className="bg-[#ed6d00] text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-[#FF8A1F] disabled:opacity-50 transition-colors">
              {creating ? "Creating..." : "Create Product"}
            </button>
            {createMsg && <span className="text-xs text-[#FF3B30]">{createMsg}</span>}
          </div>
        </form>
      </div>

      {/* Product list */}
      <div className="bg-white rounded-2xl shadow-sm border border-black/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-medium text-[#86868B] border-b border-black/5">
                <th className="px-5 py-3.5">SKU</th><th className="px-5 py-3.5">Product</th>
                <th className="px-5 py-3.5">Category</th><th className="px-5 py-3.5 text-right">Weight</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.04]">
              {products.map((p: any) => (
                <tr key={p.id} className="hover:bg-black/[0.01] transition-colors">
                  <td className="px-5 py-3.5 text-xs font-mono text-[#86868B]">{p.sku}</td>
                  <td className="px-5 py-3.5 text-sm font-medium text-[#1D1D1F]">{p.name}</td>
                  <td className="px-5 py-3.5 text-xs text-[#86868B]">{p.category}</td>
                  <td className="px-5 py-3.5 text-sm text-[#1D1D1F] text-right">{p.unit_weight_lbs} lbs</td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr><td colSpan={4} className="px-5 py-12 text-center text-[#86868B] text-sm">No products yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
