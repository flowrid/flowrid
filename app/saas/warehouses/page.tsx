"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function WarehousesPage() {
  const router = useRouter();
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, active: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create form
  const [creating, setCreating] = useState(false);
  const [createMsg, setCreateMsg] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [city, setCity] = useState("");
  const [state_, setState_] = useState("");
  const [sqFootage, setSqFootage] = useState("");

  async function fetchWarehouses() {
    try {
      const r = await fetch("/api/saas/warehouses");
      if (!r.ok) throw new Error(`Request failed (${r.status})`);
      const d = await r.json();
      setWarehouses(d.data || []);
      setStats(d.stats || { total: 0, active: 0 });
    } catch (e: any) {
      setError(e.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchWarehouses(); }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !code.trim()) {
      setCreateMsg("Name and code are required");
      return;
    }
    setCreating(true);
    setCreateMsg(null);
    try {
      const r = await fetch("/api/saas/warehouses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          code: code.trim().toUpperCase(),
          city: city.trim() || undefined,
          state: state_.trim() || undefined,
          sq_footage: sqFootage ? parseInt(sqFootage) : undefined,
        }),
      });
      if (r.ok) {
        setName(""); setCode(""); setCity(""); setState_(""); setSqFootage("");
        fetchWarehouses();
      } else {
        const err = await r.json();
        setCreateMsg(err.error || "Failed to create");
      }
    } catch {
      setCreateMsg("Network error");
    } finally {
      setCreating(false);
    }
  }

  if (loading) return <Skeleton />;
  if (error) return (
    <div className="p-8 text-center">
      <p className="text-[#FF3B30] text-sm mb-3">{error}</p>
      <button onClick={() => { setError(null); setLoading(true); fetchWarehouses(); }} className="text-sm text-[#ed6d00] font-medium">Retry</button>
    </div>
  );

  return (
    <div className="p-6 md:p-8 max-w-[1280px]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight text-[#1D1D1F]">Warehouses</h1>
          <p className="text-[#86868B] text-sm mt-0.5">{stats.total} total · {stats.active} active</p>
        </div>
      </div>

      {/* New Warehouse form */}
      <div className="mb-6 bg-white rounded-2xl shadow-sm border border-black/5 p-6">
        <h2 className="text-[15px] font-semibold text-[#1D1D1F] mb-4">New Warehouse</h2>
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-medium text-[#86868B] uppercase tracking-wide mb-1">Name *</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Chicago Hub" className="w-full bg-[#F5F5F7] border-0 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ed6d00]/20" />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-[#86868B] uppercase tracking-wide mb-1">Code *</label>
              <input type="text" value={code} onChange={(e) => setCode(e.target.value)} placeholder="e.g. ORD1" className="w-full bg-[#F5F5F7] border-0 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ed6d00]/20" />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-[#86868B] uppercase tracking-wide mb-1">City</label>
              <input type="text" value={city} onChange={(e) => setCity(e.target.value)} className="w-full bg-[#F5F5F7] border-0 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ed6d00]/20" />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-[#86868B] uppercase tracking-wide mb-1">State</label>
              <input type="text" value={state_} onChange={(e) => setState_(e.target.value)} className="w-full bg-[#F5F5F7] border-0 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ed6d00]/20" />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-[#86868B] uppercase tracking-wide mb-1">Sq Footage</label>
              <input type="number" value={sqFootage} onChange={(e) => setSqFootage(e.target.value)} className="w-full bg-[#F5F5F7] border-0 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ed6d00]/20" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button type="submit" disabled={creating} className="bg-[#ed6d00] text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-[#FF8A1F] disabled:opacity-50 transition-colors">
              {creating ? "Creating..." : "Create Warehouse"}
            </button>
            {createMsg && <span className="text-xs text-[#FF3B30]">{createMsg}</span>}
          </div>
        </form>
      </div>

      {/* Warehouse cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {warehouses.map((w: any) => (
          <div
            key={w.id}
            onClick={() => router.push(`/saas/warehouses/${w.id}/locations`)}
            className="bg-white rounded-2xl shadow-sm border border-black/5 p-6 hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-[15px] font-semibold text-[#1D1D1F]">{w.name}</h3>
                <p className="text-xs text-[#86868B]">{w.code}</p>
              </div>
              <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${w.is_active ? "bg-[#34C759]/10 text-[#34C759]" : "bg-[#8E8E93]/10 text-[#8E8E93]"}`}>
                {w.is_active ? "Active" : "Inactive"}
              </span>
            </div>
            <div className="text-xs text-[#86868B] space-y-1">
              {[w.city, w.state].filter(Boolean).length > 0 && <p>{[w.city, w.state].filter(Boolean).join(", ")}</p>}
              {w.sq_footage && <p>{w.sq_footage.toLocaleString()} sq ft</p>}
            </div>
          </div>
        ))}
        {warehouses.length === 0 && (
          <div className="col-span-full py-12 text-center text-[#86868B] text-sm">No warehouses yet</div>
        )}
      </div>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="p-8 space-y-4 animate-pulse">
      <div className="h-8 w-44 bg-black/5 rounded-xl" />
      <div className="grid grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => <div key={i} className="h-40 bg-white/50 rounded-2xl" />)}
      </div>
    </div>
  );
}
