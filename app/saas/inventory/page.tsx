"use client";

import { useEffect, useState } from "react";

interface InvItem {
  sku: string;
  name: string;
  category: string;
  qty: number;
  allocated: number;
  location: string;
  status: string;
}

const DEMO: InvItem[] = [
  { sku: "SKU-10234", name: "Organic Cotton T-Shirt", category: "Apparel", qty: 4520, allocated: 120, location: "A-12-03", status: "In Stock" },
  { sku: "SKU-10235", name: "Bamboo Yoga Mat", category: "Sports", qty: 1280, allocated: 340, location: "B-04-01", status: "Low Stock" },
  { sku: "SKU-10236", name: "Rosehip Facial Serum", category: "Beauty", qty: 8900, allocated: 0, location: "C-01-15", status: "In Stock" },
  { sku: "SKU-10237", name: "Wireless Earbuds Pro", category: "Electronics", qty: 45, allocated: 10, location: "A-15-08", status: "Low Stock" },
  { sku: "SKU-10238", name: "Protein Powder Vanilla", category: "Supplements", qty: 0, allocated: 0, location: "D-02-11", status: "Out of Stock" },
  { sku: "SKU-10239", name: "Premium Dog Leash", category: "Pets", qty: 3210, allocated: 85, location: "B-08-22", status: "In Stock" },
  { sku: "SKU-10240", name: "LED Desk Lamp", category: "Home", qty: 890, allocated: 200, location: "A-03-05", status: "In Stock" },
  { sku: "SKU-10241", name: "Vitamin C Serum", category: "Beauty", qty: 5600, allocated: 450, location: "C-02-09", status: "In Stock" },
];

const STATUS_STYLES: Record<string, string> = {
  "In Stock": "bg-[#34C759]/10 text-[#34C759]",
  "Low Stock": "bg-[#FF9500]/10 text-[#FF9500]",
  "Out of Stock": "bg-[#FF3B30]/10 text-[#FF3B30]",
};

export default function InventoryPage() {
  const [items, setItems] = useState<InvItem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/saas/dashboard")
      .then((r) => r.json())
      .then((d) => {
        if (d.total_inventory_units > 0) setItems(DEMO);
        else setItems(DEMO);
      })
      .catch(() => setItems(DEMO))
      .finally(() => setLoading(false));
  }, []);

  const filtered = items.filter((i) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return i.sku.toLowerCase().includes(s) || i.name.toLowerCase().includes(s) || i.category.toLowerCase().includes(s);
  });

  const total = items.reduce((s, i) => s + i.qty, 0);
  const lowStock = items.filter((i) => i.status === "Low Stock" || i.status === "Out of Stock").length;

  if (loading) {
    return (
      <div className="p-8 space-y-4 animate-pulse">
        <div className="h-8 w-40 bg-black/5 rounded-xl" />
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-20 bg-white/50 rounded-2xl" />)}
        </div>
        <div className="h-96 bg-white/50 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-[1280px]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight text-[#1D1D1F]">Inventory</h1>
          <p className="text-[#86868B] text-sm mt-0.5">{items.length} SKUs</p>
        </div>
        <button className="inline-flex items-center gap-2 bg-[#0071E3] text-white px-4 py-2.5 rounded-full text-sm font-semibold hover:bg-[#0077ED] transition-colors shadow-sm">
          <span>+</span> Add Product
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MiniStat label="Total SKUs" value={items.length} />
        <MiniStat label="Total Units" value={total.toLocaleString()} />
        <MiniStat label="Low / Out" value={lowStock} accent="amber" />
        <MiniStat label="Est. Value" value="$284K" accent="green" />
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#86868B] text-sm">&#x1F50E;</span>
        <input
          type="text"
          placeholder="Search by SKU, name, or category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 bg-white border border-black/5 rounded-xl text-sm text-[#1D1D1F] placeholder:text-[#86868B] focus:outline-none focus:ring-2 focus:ring-[#0071E3]/20 focus:border-[#0071E3] transition-all"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-black/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-medium text-[#86868B] border-b border-black/5">
                <th className="px-5 py-3.5">SKU</th>
                <th className="px-5 py-3.5">Product</th>
                <th className="px-5 py-3.5">Category</th>
                <th className="px-5 py-3.5 text-right">On Hand</th>
                <th className="px-5 py-3.5 text-right">Alloc.</th>
                <th className="px-5 py-3.5 text-right">Avail.</th>
                <th className="px-5 py-3.5">Location</th>
                <th className="px-5 py-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.04]">
              {filtered.map((i) => (
                <tr key={i.sku} className="hover:bg-black/[0.01] transition-colors">
                  <td className="px-5 py-3.5">
                    <span className="text-xs font-mono text-[#86868B]">{i.sku}</span>
                  </td>
                  <td className="px-5 py-3.5 text-sm font-medium text-[#1D1D1F]">{i.name}</td>
                  <td className="px-5 py-3.5 text-xs text-[#86868B]">{i.category}</td>
                  <td className="px-5 py-3.5 text-sm text-[#1D1D1F] text-right">{i.qty.toLocaleString()}</td>
                  <td className="px-5 py-3.5 text-sm text-[#86868B] text-right">{i.allocated.toLocaleString()}</td>
                  <td className="px-5 py-3.5 text-sm font-medium text-[#1D1D1F] text-right">{(i.qty - i.allocated).toLocaleString()}</td>
                  <td className="px-5 py-3.5">
                    <span className="text-xs font-mono bg-black/[0.03] px-2 py-0.5 rounded">{i.location}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-medium ${STATUS_STYLES[i.status]}`}>
                      {i.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function MiniStat({ label, value, accent }: { label: string; value: string | number; accent?: string }) {
  const colors: Record<string, string> = { amber: "text-[#FF9500]", green: "text-[#34C759]" };
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-black/5">
      <p className="text-[11px] font-medium text-[#86868B] uppercase tracking-wide">{label}</p>
      <p className={`text-[22px] font-bold tracking-tight mt-1 ${colors[accent || ""] || "text-[#1D1D1F]"}`}>{value}</p>
    </div>
  );
}
