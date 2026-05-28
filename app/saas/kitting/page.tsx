"use client";

// Kitting / 组装管理

import { useEffect, useState } from "react";

export default function KittingPage() {
  const [kits, setKits] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Create form
  const [kitProductId, setKitProductId] = useState("");
  const [components, setComponents] = useState<any[]>([{ product_id: "", quantity_per_kit: 1 }]);
  const [instructions, setInstructions] = useState("");
  const [creating, setCreating] = useState(false);

  // Assemble form
  const [assembleKitId, setAssembleKitId] = useState("");
  const [assembleWh, setAssembleWh] = useState("");
  const [assembleQty, setAssembleQty] = useState("1");
  const [assembleMsg, setAssembleMsg] = useState<string | null>(null);

  async function fetchData() {
    try {
      const [kR, pR, wR] = await Promise.all([
        fetch("/api/saas/kitting"),
        fetch("/api/saas/products?limit=100"),
        fetch("/api/saas/warehouses"),
      ]);
      setKits(((await kR.json()).data || []));
      setProducts(((await pR.json()).data || []));
      setWarehouses(((await wR.json()).data || []));
    } catch {} finally { setLoading(false); }
  }

  useEffect(() => { fetchData(); }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!kitProductId) return;
    setCreating(true);
    await fetch("/api/saas/kitting", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "create",
        kit_product_id: kitProductId,
        components: components.filter((c) => c.product_id),
        instructions: instructions.trim() || undefined,
      }),
    });
    setCreating(false);
    setKitProductId(""); setComponents([{ product_id: "", quantity_per_kit: 1 }]); setInstructions("");
    fetchData();
  }

  async function handleAssemble(e: React.FormEvent) {
    e.preventDefault();
    if (!assembleKitId || !assembleWh) return;
    setAssembleMsg(null);
    const r = await fetch("/api/saas/kitting", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "assemble",
        kit_product_id: assembleKitId,
        warehouse_id: assembleWh,
        quantity: parseInt(assembleQty) || 1,
      }),
    });
    const d = await r.json();
    setAssembleMsg(d.message || (d.success ? "Assembled" : "Failed"));
    if (d.success) fetchData();
  }

  function addComponent() {
    setComponents([...components, { product_id: "", quantity_per_kit: 1 }]);
  }

  return (
    <div className="p-6 md:p-8 max-w-[1280px]">
      <h1 className="text-[28px] font-bold tracking-tight text-[#1D1D1F] mb-6">Kitting & Assembly</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Create Kit */}
        <div className="bg-white rounded-2xl shadow-sm border border-black/5 p-6">
          <h2 className="text-[15px] font-semibold text-[#1D1D1F] mb-4">Define Kit</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-[11px] font-medium text-[#86868B] uppercase mb-1">Kit Product *</label>
              <select value={kitProductId} onChange={(e) => setKitProductId(e.target.value)}
                className="w-full bg-[#F5F5F7] border-0 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ed6d00]/20">
                <option value="">Select product...</option>
                {products.map((p: any) => <option key={p.id} value={p.id}>{p.name || p.sku} ({p.sku})</option>)}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-[#86868B] uppercase mb-1">Components</label>
              <div className="space-y-2">
                {components.map((c, i) => (
                  <div key={i} className="flex gap-2">
                    <select value={c.product_id} onChange={(e) => {
                      const next = [...components];
                      next[i].product_id = e.target.value;
                      setComponents(next);
                    }} className="flex-1 bg-[#F5F5F7] border-0 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#ed6d00]/20">
                      <option value="">Component product...</option>
                      {products.filter((p: any) => p.id !== kitProductId).map((p: any) => <option key={p.id} value={p.id}>{p.name || p.sku}</option>)}
                    </select>
                    <input type="number" min="1" value={c.quantity_per_kit} onChange={(e) => {
                      const next = [...components];
                      next[i].quantity_per_kit = parseInt(e.target.value) || 1;
                      setComponents(next);
                    }} className="w-16 bg-[#F5F5F7] border-0 rounded-lg px-2 py-2 text-xs text-center focus:outline-none focus:ring-2 focus:ring-[#ed6d00]/20" />
                    {components.length > 1 && (
                      <button type="button" onClick={() => setComponents(components.filter((_, j) => j !== i))} className="text-[#FF3B30] text-xs px-1">&times;</button>
                    )}
                  </div>
                ))}
              </div>
              <button type="button" onClick={addComponent} className="text-xs text-[#ed6d00] font-medium mt-2">+ Add Component</button>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-[#86868B] uppercase mb-1">Instructions</label>
              <textarea value={instructions} onChange={(e) => setInstructions(e.target.value)} rows={2}
                className="w-full bg-[#F5F5F7] border-0 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ed6d00]/20 resize-none" />
            </div>

            <button type="submit" disabled={creating}
              className="bg-[#ed6d00] text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-[#FF8A1F] disabled:opacity-50 transition-colors">
              {creating ? "Creating..." : "Create Kit"}
            </button>
          </form>
        </div>

        {/* Assemble Kit */}
        <div className="bg-white rounded-2xl shadow-sm border border-black/5 p-6">
          <h2 className="text-[15px] font-semibold text-[#1D1D1F] mb-4">Assemble / Disassemble</h2>
          <form onSubmit={handleAssemble} className="space-y-4">
            <div>
              <label className="block text-[11px] font-medium text-[#86868B] uppercase mb-1">Kit *</label>
              <select value={assembleKitId} onChange={(e) => setAssembleKitId(e.target.value)}
                className="w-full bg-[#F5F5F7] border-0 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ed6d00]/20">
                <option value="">Select kit...</option>
                {kits.map((k: any) => (
                  <option key={k.id} value={k.kit_product_id}>{k.products?.name || k.products?.sku || k.kit_product_id}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-[#86868B] uppercase mb-1">Warehouse *</label>
                <select value={assembleWh} onChange={(e) => setAssembleWh(e.target.value)}
                  className="w-full bg-[#F5F5F7] border-0 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ed6d00]/20">
                  <option value="">Select...</option>
                  {warehouses.map((w: any) => <option key={w.id} value={w.id}>{w.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-[#86868B] uppercase mb-1">Quantity</label>
                <input type="number" min="1" value={assembleQty} onChange={(e) => setAssembleQty(e.target.value)}
                  className="w-full bg-[#F5F5F7] border-0 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ed6d00]/20" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button type="submit"
                className="bg-[#34C759] text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-[#30B350] transition-colors">Assemble</button>
              <button type="button" onClick={async () => {
                if (!assembleKitId || !assembleWh) return;
                const r = await fetch("/api/saas/kitting", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ action: "disassemble", kit_product_id: assembleKitId, warehouse_id: assembleWh, quantity: parseInt(assembleQty) || 1 }),
                });
                const d = await r.json();
                setAssembleMsg(d.message || (d.success ? "Disassembled" : "Failed"));
                if (d.success) fetchData();
              }}
                className="text-[#FF3B30] border border-[#FF3B30]/20 px-4 py-2 rounded-full text-sm font-semibold hover:bg-[#FF3B30]/5 transition-colors">Disassemble</button>
            </div>
            {assembleMsg && <p className={`text-xs ${assembleMsg.includes("not") || assembleMsg.includes("Failed") || assembleMsg.includes("Insufficient") ? "text-[#FF3B30]" : "text-[#34C759]"}`}>{assembleMsg}</p>}
          </form>
        </div>
      </div>

      {/* Kit list */}
      <div className="mt-6 bg-white rounded-2xl shadow-sm border border-black/5 overflow-hidden">
        <div className="px-6 py-3 bg-[#F5F5F7] border-b border-black/5">
          <h3 className="text-sm font-semibold text-[#1D1D1F]">Defined Kits ({kits.length})</h3>
        </div>
        <table className="w-full">
          <thead><tr className="text-left text-xs text-[#86868B] border-b"><th className="px-5 py-2.5">Kit Product</th><th className="px-5 py-2.5">Components</th><th className="px-5 py-2.5">Status</th></tr></thead>
          <tbody className="divide-y divide-black/[0.04]">
            {kits.map((k: any) => (
              <tr key={k.id}>
                <td className="px-5 py-3 text-sm font-medium">{k.products?.name || k.kit_product_id?.slice(0, 8)}</td>
                <td className="px-5 py-3 text-xs text-[#86868B]">
                  {(k.kit_components || []).map((c: any) => `${c.products?.name || c.component_product_id?.slice(0, 6)} x${c.quantity_per_kit}`).join(", ")}
                </td>
                <td className="px-5 py-3">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${k.is_active ? "bg-[#34C759]/10 text-[#34C759]" : "bg-[#8E8E93]/10 text-[#8E8E93]"}`}>
                    {k.is_active ? "Active" : "Inactive"}
                  </span>
                </td>
              </tr>
            ))}
            {kits.length === 0 && (
              <tr><td colSpan={3} className="px-5 py-12 text-center text-[#86868B] text-sm">No kits defined yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
