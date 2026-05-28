"use client";

// 周期盘点

import { useEffect, useState } from "react";

export default function CycleCountPage() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);

  // Create form
  const [warehouseId, setWarehouseId] = useState("");
  const [sessionName, setSessionName] = useState("");
  const [countType, setCountType] = useState("full");
  const [creating, setCreating] = useState(false);

  async function fetchSessions() {
    try {
      const [sR, wR] = await Promise.all([
        fetch("/api/saas/cycle-count"),
        fetch("/api/saas/warehouses"),
      ]);
      setSessions(((await sR.json()).data || []));
      setWarehouses(((await wR.json()).data || []));
    } catch {} finally { setLoading(false); }
  }

  useEffect(() => { fetchSessions(); }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!warehouseId) return;
    setCreating(true);
    await fetch("/api/saas/cycle-count", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        warehouse_id: warehouseId,
        name: sessionName.trim() || undefined,
        count_type: countType,
        auto_generate: true,
      }),
    });
    setCreating(false);
    setSessionName("");
    fetchSessions();
  }

  async function viewSession(session: any) {
    setSelectedSession(session);
    const r = await fetch(`/api/saas/cycle-count/${session.id}`);
    const d = await r.json();
    setItems(d.items || []);
  }

  async function updateItem(itemId: string, countedQuantity: number) {
    await fetch(`/api/saas/cycle-count/${selectedSession.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: [{ id: itemId, counted_quantity: countedQuantity, status: "counted" }] }),
    });
    viewSession(selectedSession);
  }

  async function updateSessionStatus(status: string) {
    await fetch(`/api/saas/cycle-count/${selectedSession.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    fetchSessions();
    setSelectedSession((s: any) => s ? { ...s, status } : null);
  }

  const countedItems = items.filter((i: any) => i.status === "counted").length;
  const varianceItems = items.filter((i: any) => i.variance && i.variance !== 0).length;

  return (
    <div className="p-6 md:p-8 max-w-[1280px]">
      <h1 className="text-[28px] font-bold tracking-tight text-[#1D1D1F] mb-6">Cycle Count</h1>

      {selectedSession ? (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <button onClick={() => { setSelectedSession(null); setItems([]); }} className="text-sm text-[#86868B] hover:text-[#1D1D1F]">&larr; Back</button>
            <h2 className="text-lg font-semibold">{selectedSession.name}</h2>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              selectedSession.status === "completed" ? "bg-[#34C759]/10 text-[#34C759]" :
              selectedSession.status === "in_progress" ? "bg-[#007AFF]/10 text-[#007AFF]" : "bg-[#8E8E93]/10 text-[#8E8E93]"
            }`}>{selectedSession.status.replace(/_/g, " ")}</span>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <KpiCard label="Total Items" value={items.length} />
            <KpiCard label="Counted" value={`${countedItems} (${items.length > 0 ? Math.round((countedItems / items.length) * 100) : 0}%)`} />
            <KpiCard label="Variances" value={varianceItems} warn={varianceItems > 0} />
          </div>

          {selectedSession.status !== "completed" && (
            <div className="flex gap-2">
              {selectedSession.status === "created" && (
                <button onClick={() => updateSessionStatus("in_progress")}
                  className="bg-[#007AFF] text-white px-4 py-2 rounded-full text-sm font-semibold">Start Count</button>
              )}
              {selectedSession.status === "in_progress" && (
                <button onClick={() => updateSessionStatus("completed")}
                  className="bg-[#34C759] text-white px-4 py-2 rounded-full text-sm font-semibold">Complete Count</button>
              )}
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-sm border border-black/5 overflow-hidden">
            <table className="w-full">
              <thead><tr className="text-left text-xs text-[#86868B] border-b"><th className="px-5 py-2.5">Product</th><th className="px-5 py-2.5">Location</th><th className="px-5 py-2.5 text-right">Expected</th><th className="px-5 py-2.5 text-right">Counted</th><th className="px-5 py-2.5 text-right">Variance</th><th className="px-5 py-2.5">Status</th></tr></thead>
              <tbody className="divide-y divide-black/[0.04]">
                {items.map((item: any) => (
                  <tr key={item.id}>
                    <td className="px-5 py-2.5 text-sm">{item.products?.name || item.product_id?.slice(0, 8)}</td>
                    <td className="px-5 py-2.5 text-xs text-[#86868B]">{item.locations?.barcode || item.locations?.zone || "—"}</td>
                    <td className="px-5 py-2.5 text-sm text-right">{item.expected_quantity}</td>
                    <td className="px-5 py-2.5 text-right">
                      {item.status === "pending" || item.status === "counted" ? (
                        <input type="number" defaultValue={item.counted_quantity ?? item.expected_quantity}
                          onBlur={(e) => updateItem(item.id, parseInt(e.target.value) || 0)}
                          className="w-20 text-right bg-[#F5F5F7] border-0 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#ed6d00]/20" />
                      ) : (
                        <span className="text-sm">{item.counted_quantity || "—"}</span>
                      )}
                    </td>
                    <td className={`px-5 py-2.5 text-sm text-right font-medium ${item.variance && item.variance !== 0 ? "text-[#FF3B30]" : "text-[#34C759]"}`}>
                      {item.variance !== null && item.variance !== undefined ? (item.variance > 0 ? `+${item.variance}` : item.variance) : "—"}
                    </td>
                    <td className="px-5 py-2.5">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${item.status === "counted" ? "bg-[#34C759]/10 text-[#34C759]" : "bg-[#8E8E93]/10 text-[#8E8E93]"}`}>{item.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <>
          {/* Create form */}
          <div className="mb-6 bg-white rounded-2xl shadow-sm border border-black/5 p-6">
            <h2 className="text-[15px] font-semibold text-[#1D1D1F] mb-4">New Cycle Count</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-medium text-[#86868B] uppercase mb-1">Warehouse *</label>
                  <select value={warehouseId} onChange={(e) => setWarehouseId(e.target.value)}
                    className="w-full bg-[#F5F5F7] border-0 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ed6d00]/20">
                    <option value="">Select...</option>
                    {warehouses.map((w: any) => <option key={w.id} value={w.id}>{w.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-[#86868B] uppercase mb-1">Name</label>
                  <input type="text" value={sessionName} onChange={(e) => setSessionName(e.target.value)} placeholder="Auto-generated if empty"
                    className="w-full bg-[#F5F5F7] border-0 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ed6d00]/20" />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-[#86868B] uppercase mb-1">Type</label>
                  <select value={countType} onChange={(e) => setCountType(e.target.value)}
                    className="w-full bg-[#F5F5F7] border-0 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ed6d00]/20">
                    <option value="full">Full Count</option>
                    <option value="zone">By Zone</option>
                    <option value="abc">ABC Analysis</option>
                    <option value="random">Random Sample</option>
                  </select>
                </div>
              </div>
              <button type="submit" disabled={creating}
                className="bg-[#ed6d00] text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-[#FF8A1F] disabled:opacity-50 transition-colors">
                {creating ? "Creating..." : "Create Session"}
              </button>
            </form>
          </div>

          {/* Sessions list */}
          <div className="bg-white rounded-2xl shadow-sm border border-black/5 overflow-hidden">
            <table className="w-full">
              <thead><tr className="text-left text-xs text-[#86868B] border-b"><th className="px-5 py-3.5">Name</th><th className="px-5 py-3.5">Type</th><th className="px-5 py-3.5">Status</th><th className="px-5 py-3.5">Created</th></tr></thead>
              <tbody className="divide-y divide-black/[0.04]">
                {sessions.map((s: any) => (
                  <tr key={s.id} className="hover:bg-black/[0.01] cursor-pointer" onClick={() => viewSession(s)}>
                    <td className="px-5 py-3.5 text-sm font-medium">{s.name}</td>
                    <td className="px-5 py-3.5 text-xs capitalize">{s.count_type}</td>
                    <td className="px-5 py-3.5">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        s.status === "completed" ? "bg-[#34C759]/10 text-[#34C759]" :
                        s.status === "in_progress" ? "bg-[#007AFF]/10 text-[#007AFF]" : "bg-[#8E8E93]/10 text-[#8E8E93]"
                      }`}>{s.status.replace(/_/g, " ")}</span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-[#86868B]">{new Date(s.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
                {sessions.length === 0 && (
                  <tr><td colSpan={4} className="px-5 py-12 text-center text-[#86868B] text-sm">No cycle counts yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

function KpiCard({ label, value, warn }: { label: string; value: string | number; warn?: boolean }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-black/5 p-4">
      <div className="text-[10px] font-medium text-[#86868B] uppercase mb-1">{label}</div>
      <div className={`text-xl font-bold ${warn ? "text-[#FF3B30]" : "text-[#1D1D1F]"}`}>{value}</div>
    </div>
  );
}
