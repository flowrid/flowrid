"use client";

import { useEffect, useState } from "react";

const DT = { products: [], warehouses: [], stats: { totalSKUs: 0 } };

export default function InventoryPage() {
  const [data, setData] = useState(DT);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/saas/inventory").then(r => r.json()).then(setData).finally(() => setLoading(false));
  }, []);

  const { products, stats } = data;

  if (loading) return (
    <div className="p-8 space-y-4 animate-pulse">
      <div className="h-8 w-40 bg-black/5 rounded-xl" />
      {[...Array(4)].map((_, i) => <div key={i} className="h-14 bg-white/50 rounded-xl" />)}
    </div>
  );

  return (
    <div className="p-6 md:p-8 max-w-[1280px]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight text-[#1D1D1F]">Inventory</h1>
          <p className="text-[#86868B] text-sm mt-0.5">{stats.totalSKUs} SKUs</p>
        </div>
        <button className="inline-flex items-center gap-2 bg-[#ed6d00] text-white px-4 py-2.5 rounded-full text-sm font-semibold hover:bg-[#FF8A1F] transition-colors shadow-sm">+ Add Product</button>
      </div>

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
