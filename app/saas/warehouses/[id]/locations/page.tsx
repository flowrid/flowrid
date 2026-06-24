"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";

export default function WarehouseLocationsPage() {
  const t = useTranslations("saas");
  const params = useParams();
  const router = useRouter();
  const warehouseId = params.id as string;

  const [warehouse, setWarehouse] = useState<any>(null);
  const [locations, setLocations] = useState<any[]>([]);
  const [zones, setZones] = useState<string[]>([]);
  const [stats, setStats] = useState({ total: 0, occupied: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [zoneFilter, setZoneFilter] = useState("");
  const [search, setSearch] = useState("");

  // Create form
  const [creating, setCreating] = useState(false);
  const [createMsg, setCreateMsg] = useState<string | null>(null);
  const [zone, setZone] = useState("");
  const [aisle, setAisle] = useState("");
  const [rack, setRack] = useState("");
  const [shelf, setShelf] = useState("");
  const [bin_, setBin] = useState("");
  const [maxWeight, setMaxWeight] = useState("");

  async function fetchData() {
    try {
      // Fetch warehouse info
      const whRes = await fetch(`/api/saas/warehouses/${warehouseId}`);
      if (whRes.ok) {
        const whData = await whRes.json();
        setWarehouse(whData.warehouse);
      }

      // Fetch locations
      const params = new URLSearchParams({ warehouse_id: warehouseId });
      if (zoneFilter) params.set("zone", zoneFilter);
      if (search.trim()) params.set("search", search.trim());

      const r = await fetch(`/api/saas/locations?${params.toString()}`);
      if (!r.ok) throw new Error(`Request failed (${r.status})`);
      const d = await r.json();
      setLocations(d.data || []);
      setZones(d.zones || []);
      setStats(d.stats || { total: 0, occupied: 0 });
    } catch (e: any) {
      setError(e.message || t("failedToLoad"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchData(); }, [warehouseId, zoneFilter, search]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!zone.trim()) {
      setCreateMsg(t("zoneIsRequired"));
      return;
    }
    setCreating(true);
    setCreateMsg(null);
    try {
      const r = await fetch("/api/saas/locations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          warehouse_id: warehouseId,
          zone: zone.trim(),
          aisle: aisle.trim() || undefined,
          rack: rack.trim() || undefined,
          shelf: shelf.trim() || undefined,
          bin: bin_.trim() || undefined,
          max_weight_lbs: maxWeight ? parseFloat(maxWeight) : undefined,
        }),
      });
      if (r.ok) {
        setZone(""); setAisle(""); setRack(""); setShelf(""); setBin(""); setMaxWeight("");
        fetchData();
      } else {
        const err = await r.json();
        setCreateMsg(err.error || t("failedToCreate"));
      }
    } catch {
      setCreateMsg(t("networkError"));
    } finally {
      setCreating(false);
    }
  }

  // Group locations by zone for tree view
  const groupedByZone: Record<string, any[]> = {};
  for (const loc of locations) {
    const z = loc.zone || "Unzoned";
    if (!groupedByZone[z]) groupedByZone[z] = [];
    groupedByZone[z].push(loc);
  }

  if (loading) return <Skeleton />;
  if (error) return (
    <div className="p-8 text-center">
      <p className="text-[#FF3B30] text-sm mb-3">{error}</p>
      <button onClick={() => { setError(null); setLoading(true); fetchData(); }} className="text-sm text-[#ed6d00] font-medium">{t("retry")}</button>
    </div>
  );

  return (
    <div className="p-6 md:p-8 max-w-[1280px]">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.push("/saas/warehouses")} className="text-[#86868B] hover:text-[#1D1D1F] text-sm">&larr; Warehouses</button>
        <h1 className="text-[28px] font-bold tracking-tight text-[#1D1D1F]">
          {t("warehouseLocations", { name: warehouse?.name || t("warehouse") })}
        </h1>
        <span className="text-[#86868B] text-sm">{stats.total} total · {stats.occupied} occupied</span>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder={t("searchByZone")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-white border border-black/5 rounded-xl px-4 py-2.5 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-[#ed6d00]/20"
        />
        <select value={zoneFilter} onChange={(e) => setZoneFilter(e.target.value)} className="bg-white border border-black/5 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ed6d00]/20">
          <option value="">{t("allZones")}</option>
          {zones.map((z) => <option key={z} value={z}>{z}</option>)}
        </select>
      </div>

      {/* New Location form */}
      <div className="mb-6 bg-white rounded-2xl shadow-sm border border-black/5 p-6">
        <h2 className="text-[15px] font-semibold text-[#1D1D1F] mb-4">{t("addLocation")}</h2>
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-[#86868B] uppercase mb-1">{t("zoneRequired")}</label>
              <input type="text" value={zone} onChange={(e) => setZone(e.target.value)} placeholder={t("zonePlaceholder")} className="w-full bg-[#F5F5F7] border-0 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ed6d00]/20" />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-[#86868B] uppercase mb-1">{t("aisle")}</label>
              <input type="text" value={aisle} onChange={(e) => setAisle(e.target.value)} placeholder={t("aislePlaceholder")} className="w-full bg-[#F5F5F7] border-0 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ed6d00]/20" />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-[#86868B] uppercase mb-1">{t("rack")}</label>
              <input type="text" value={rack} onChange={(e) => setRack(e.target.value)} placeholder={t("rackPlaceholder")} className="w-full bg-[#F5F5F7] border-0 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ed6d00]/20" />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-[#86868B] uppercase mb-1">{t("shelf")}</label>
              <input type="text" value={shelf} onChange={(e) => setShelf(e.target.value)} placeholder={t("shelfPlaceholder")} className="w-full bg-[#F5F5F7] border-0 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ed6d00]/20" />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-[#86868B] uppercase mb-1">{t("bin")}</label>
              <input type="text" value={bin_} onChange={(e) => setBin(e.target.value)} placeholder={t("binPlaceholder")} className="w-full bg-[#F5F5F7] border-0 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ed6d00]/20" />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-[#86868B] uppercase mb-1">{t("maxWtLbs")}</label>
              <input type="number" step="0.1" value={maxWeight} onChange={(e) => setMaxWeight(e.target.value)} className="w-full bg-[#F5F5F7] border-0 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ed6d00]/20" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button type="submit" disabled={creating} className="bg-[#ed6d00] text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-[#FF8A1F] disabled:opacity-50 transition-colors">
              {creating ? t("adding") : t("addLocationBtn")}
            </button>
            {createMsg && <span className="text-xs text-[#FF3B30]">{createMsg}</span>}
          </div>
        </form>
      </div>

      {/* Tree view by zone */}
      <div className="space-y-4">
        {Object.entries(groupedByZone).map(([zoneName, locs]) => (
          <div key={zoneName} className="bg-white rounded-2xl shadow-sm border border-black/5 overflow-hidden">
            <div className="px-6 py-3 bg-[#F5F5F7] border-b border-black/5">
              <h3 className="text-sm font-semibold text-[#1D1D1F]">
                Zone: {zoneName} <span className="text-[#86868B] font-normal">({locs.length} locations)</span>
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs font-medium text-[#86868B] border-b border-black/5">
                    <th className="px-5 py-2.5">Barcode</th>
                    <th className="px-5 py-2.5">Aisle</th>
                    <th className="px-5 py-2.5">Rack</th>
                    <th className="px-5 py-2.5">Shelf</th>
                    <th className="px-5 py-2.5">Bin</th>
                    <th className="px-5 py-2.5">Max Wt</th>
                    <th className="px-5 py-2.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/[0.04]">
                  {locs.map((loc: any) => (
                    <tr key={loc.id} className="hover:bg-black/[0.01]">
                      <td className="px-5 py-2.5 text-xs font-mono text-[#86868B]">{loc.barcode || "—"}</td>
                      <td className="px-5 py-2.5 text-sm text-[#1D1D1F]">{loc.aisle || "—"}</td>
                      <td className="px-5 py-2.5 text-sm">{loc.rack || "—"}</td>
                      <td className="px-5 py-2.5 text-sm">{loc.shelf || "—"}</td>
                      <td className="px-5 py-2.5 text-sm">{loc.bin || "—"}</td>
                      <td className="px-5 py-2.5 text-sm">{loc.max_weight_lbs ? `${loc.max_weight_lbs} lbs` : "—"}</td>
                      <td className="px-5 py-2.5">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${loc.is_occupied ? "bg-[#ed6d00]/10 text-[#ed6d00]" : "bg-[#34C759]/10 text-[#34C759]"}`}>
                          {loc.is_occupied ? t("occupied") : t("empty")}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
        {locations.length === 0 && (
          <div className="py-12 text-center text-[#86868B] text-sm">{t("noLocations")}</div>
        )}
      </div>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="p-8 space-y-4 animate-pulse">
      <div className="h-8 w-64 bg-black/5 rounded-xl" />
      {[...Array(3)].map((_, i) => <div key={i} className="h-32 bg-white/50 rounded-2xl" />)}
    </div>
  );
}
