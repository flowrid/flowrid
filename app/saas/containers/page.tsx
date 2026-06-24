"use client";

// Container / Movable Unit 管理

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

const CONTAINER_TYPES = ["pallet", "tote", "cart", "cage", "trailer"];

export default function ContainersPage() {
  const t = useTranslations("saas");
  const [containers, setContainers] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");

  // Create form
  const [warehouseId, setWarehouseId] = useState("");
  const [containerType, setContainerType] = useState("pallet");
  const [barcode, setBarcode] = useState("");
  const [maxWeight, setMaxWeight] = useState("");
  const [creating, setCreating] = useState(false);

  // View details
  const [selectedContainer, setSelectedContainer] = useState<any>(null);
  const [containerItems, setContainerItems] = useState<any[]>([]);

  async function fetchData() {
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);
      if (search.trim()) params.set("search", search.trim());
      const [cR, wR] = await Promise.all([
        fetch(`/api/saas/containers?${params}`),
        fetch("/api/saas/warehouses"),
      ]);
      setContainers(((await cR.json()).data || []));
      setWarehouses(((await wR.json()).data || []));
    } catch {} finally { setLoading(false); }
  }

  useEffect(() => { fetchData(); }, [statusFilter, search]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!warehouseId) return;
    setCreating(true);
    await fetch("/api/saas/containers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        warehouse_id: warehouseId,
        container_type: containerType,
        barcode: barcode.trim() || undefined,
        max_weight_lbs: maxWeight ? parseFloat(maxWeight) : undefined,
      }),
    });
    setCreating(false);
    setBarcode(""); setMaxWeight("");
    fetchData();
  }

  async function viewContainer(c: any) {
    setSelectedContainer(c);
    const r = await fetch(`/api/saas/containers/${c.id}`);
    const d = await r.json();
    setContainerItems(d.container?.container_items || []);
  }

  if (loading) return <div className="p-8 animate-pulse space-y-4"><div className="h-8 w-48 bg-black/5 rounded-xl" /><div className="h-32 bg-white/50 rounded-2xl" /></div>;

  return (
    <div className="p-6 md:p-8 max-w-[1280px]">
      <h1 className="text-[28px] font-bold tracking-tight text-[#1D1D1F] mb-6">{t("containers")}</h1>

      {selectedContainer ? (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <button onClick={() => { setSelectedContainer(null); setContainerItems([]); }} className="text-sm text-[#86868B] hover:text-[#1D1D1F]">&larr; Back</button>
            <h2 className="text-lg font-semibold">{selectedContainer.name || selectedContainer.barcode}</h2>
            <span className="text-xs text-[#86868B] capitalize">{selectedContainer.container_type}</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <InfoCard label="Barcode" value={selectedContainer.barcode} />
            <InfoCard label="Type" value={selectedContainer.container_type} />
            <InfoCard label="Status" value={selectedContainer.status} />
            <InfoCard label="Location" value={selectedContainer.locations?.barcode || selectedContainer.locations?.zone || "—"} />
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-black/5 overflow-hidden">
            <div className="px-6 py-3 bg-[#F5F5F7] border-b border-black/5">
              <h3 className="text-sm font-semibold text-[#1D1D1F]">{t("contents", { n: containerItems.length })}</h3>
            </div>
            <table className="w-full">
              <thead><tr className="text-left text-xs text-[#86868B] border-b"><th className="px-5 py-2.5">{t("product")}</th><th className="px-5 py-2.5 text-right">{t("qtyCol")}</th><th className="px-5 py-2.5">{t("lotCol")}</th></tr></thead>
              <tbody className="divide-y divide-black/[0.04]">
                {containerItems.map((item: any) => (
                  <tr key={item.id}>
                    <td className="px-5 py-2.5 text-sm">{item.products?.name || item.product_id?.slice(0, 8)}</td>
                    <td className="px-5 py-2.5 text-sm text-right">{item.quantity}</td>
                    <td className="px-5 py-2.5 text-xs text-[#86868B]">{item.lot_number || "—"}</td>
                  </tr>
                ))}
                {containerItems.length === 0 && (
                  <tr><td colSpan={3} className="px-5 py-12 text-center text-[#86868B] text-sm">{t("emptyContainer")}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap gap-4 mb-6">
            <input type="text" placeholder={t("searchBarcode")} value={search} onChange={(e) => setSearch(e.target.value)}
              className="bg-white border border-black/5 rounded-xl px-4 py-2.5 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-[#ed6d00]/20" />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white border border-black/5 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ed6d00]/20">
              <option value="">{t("allStatuses")}</option>
              <option value="available">{t("available")}</option>
              <option value="in_use">{t("inUse")}</option>
              <option value="staged">{t("staged")}</option>
              <option value="shipped">Shipped</option>
            </select>
          </div>

          {/* Create form */}
          <div className="mb-6 bg-white rounded-2xl shadow-sm border border-black/5 p-6">
            <h2 className="text-[15px] font-semibold text-[#1D1D1F] mb-4">{t("createContainer")}</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-[#86868B] uppercase mb-1">{t("warehouseRequired")}</label>
                  <select value={warehouseId} onChange={(e) => setWarehouseId(e.target.value)}
                    className="w-full bg-[#F5F5F7] border-0 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ed6d00]/20">
                    <option value="">{t("selectPlaceholder")}</option>
                    {warehouses.map((w: any) => <option key={w.id} value={w.id}>{w.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-[#86868B] uppercase mb-1">{t("typeLabel")}</label>
                  <select value={containerType} onChange={(e) => setContainerType(e.target.value)}
                    className="w-full bg-[#F5F5F7] border-0 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ed6d00]/20">
                    {CONTAINER_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-[#86868B] uppercase mb-1">{t("barcode")}</label>
                  <input type="text" value={barcode} onChange={(e) => setBarcode(e.target.value)} placeholder={t("autoGeneratedBarcode")}
                    className="w-full bg-[#F5F5F7] border-0 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ed6d00]/20" />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-[#86868B] uppercase mb-1">{t("maxWeightLbs")}</label>
                  <input type="number" step="0.1" value={maxWeight} onChange={(e) => setMaxWeight(e.target.value)}
                    className="w-full bg-[#F5F5F7] border-0 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ed6d00]/20" />
                </div>
              </div>
              <button type="submit" disabled={creating}
                className="bg-[#ed6d00] text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-[#FF8A1F] disabled:opacity-50 transition-colors">
                {creating ? t("creating") : t("createContainer")}
              </button>
            </form>
          </div>

          {/* Container list */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {containers.map((c: any) => (
              <div key={c.id} onClick={() => viewContainer(c)}
                className="bg-white rounded-2xl shadow-sm border border-black/5 p-5 cursor-pointer hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-[#1D1D1F]">{c.barcode}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    c.status === "available" ? "bg-[#34C759]/10 text-[#34C759]" :
                    c.status === "in_use" ? "bg-[#007AFF]/10 text-[#007AFF]" :
                    c.status === "staged" ? "bg-[#FF9500]/10 text-[#FF9500]" : "bg-[#8E8E93]/10 text-[#8E8E93]"
                  }`}>{c.status?.replace(/_/g, " ")}</span>
                </div>
                <div className="text-xs text-[#86868B] space-y-1">
                  <div>Type: <span className="capitalize">{c.container_type}</span></div>
                  <div>Location: {c.locations?.barcode || c.locations?.zone || "—"}</div>
                  {c.max_weight_lbs && <div>Max: {c.max_weight_lbs} lbs</div>}
                </div>
              </div>
            ))}
            {containers.length === 0 && (
              <div className="col-span-full py-12 text-center text-[#86868B] text-sm">{t("noContainers")}</div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-black/5 p-4">
      <div className="text-[10px] font-medium text-[#86868B] uppercase mb-0.5">{label}</div>
      <div className="text-sm font-medium text-[#1D1D1F] capitalize">{value}</div>
    </div>
  );
}
