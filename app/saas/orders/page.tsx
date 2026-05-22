"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Order {
  id: string;
  order_number: string;
  customer_name?: string;
  customer?: string;
  source?: string;
  priority?: string;
  status: string;
  created_at?: string;
  time?: string;
  clients?: { name: string; company: string };
  warehouses?: { name: string; code: string };
}

const STATUS_STYLES: Record<string, string> = {
  shipped: "bg-[#34C759]/10 text-[#34C759]", delivered: "bg-[#34C759]/10 text-[#34C759]",
  picking: "bg-[#ed6d00]/10 text-[#ed6d00]",
  allocated: "bg-[#AF52DE]/10 text-[#AF52DE]",
  packed: "bg-[#FF9500]/10 text-[#FF9500]",
  pending: "bg-[#8E8E93]/10 text-[#8E8E93]",
  returned: "bg-[#FF3B30]/10 text-[#FF3B30]",
  cancelled: "bg-[#FF3B30]/10 text-[#FF3B30]",
};

const DT = { orders: [], stats: { total: 0, pending: 0, shipped: 0 } };

export default function OrdersPage() {
  const [data, setData] = useState(DT);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createMsg, setCreateMsg] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [source, setSource] = useState("manual");
  const [shippingZip, setShippingZip] = useState("");
  const router = useRouter();

  async function fetchOrders() {
    try {
      const r = await fetch("/api/saas/orders");
      if (!r.ok) throw new Error(`请求失败 (${r.status})`);
      const d = await r.json();
      setData(d);
    } catch (e: any) {
      setError(e.message || "加载失败");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;
    fetchOrders();
    return () => { cancelled = true; };
  }, []);

  async function handleCreateOrder(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setCreateMsg(null);
    try {
      const res = await fetch("/api/saas/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_number: `ORD-${Date.now().toString(36).toUpperCase()}`,
          customer_name: customerName || "Walk-in Customer",
          source,
          shipping_zip: shippingZip || undefined,
        }),
      });
      if (res.ok) {
        const order = await res.json();
        setShowCreate(false);
        setCustomerName("");
        setShippingZip("");
        setLoading(true);
        fetchOrders();
      } else {
        const err = await res.json();
        setCreateMsg(err.error || "创建失败");
      }
    } catch {
      setCreateMsg("网络错误");
    } finally {
      setCreating(false);
    }
  }

  const { orders, stats } = data;

  if (loading) return <Skeleton />;
  if (error) return <div className="p-8 text-center"><p className="text-[#FF3B30] text-sm mb-3">{error}</p><button onClick={() => { setError(null); setLoading(true); fetchOrders(); }} className="text-sm text-[#ed6d00] font-medium hover:text-[#FF8A1F]">重试</button></div>;

  return (
    <div className="p-6 md:p-8 max-w-[1280px]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight text-[#1D1D1F]">Orders</h1>
          <p className="text-[#86868B] text-sm mt-0.5">{stats.total} total · {stats.pending} pending · {stats.shipped} shipped</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="inline-flex items-center gap-2 bg-[#ed6d00] text-white px-4 py-2.5 rounded-full text-sm font-semibold hover:bg-[#FF8A1F] transition-colors shadow-sm">+ New Order</button>
      </div>

      {showCreate && (
        <div className="mb-6 bg-white rounded-2xl shadow-sm border border-black/5 p-6">
          <h2 className="text-[15px] font-semibold text-[#1D1D1F] mb-4">New Order</h2>
          <form onSubmit={handleCreateOrder} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-medium text-[#86868B] uppercase tracking-wide mb-1">Customer Name</label>
                <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Walk-in Customer" className="w-full bg-[#F5F5F7] border-0 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ed6d00]/20" />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-[#86868B] uppercase tracking-wide mb-1">Source</label>
                <select value={source} onChange={(e) => setSource(e.target.value)} className="w-full bg-[#F5F5F7] border-0 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ed6d00]/20">
                  <option value="manual">Manual</option>
                  <option value="shopify">Shopify</option>
                  <option value="amazon">Amazon</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-[#86868B] uppercase tracking-wide mb-1">Shipping ZIP</label>
                <input type="text" value={shippingZip} onChange={(e) => setShippingZip(e.target.value)} placeholder="optional" className="w-full bg-[#F5F5F7] border-0 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ed6d00]/20" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button type="submit" disabled={creating} className="bg-[#ed6d00] text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-[#FF8A1F] disabled:opacity-50 transition-colors">
                {creating ? "Creating..." : "Create Order"}
              </button>
              <button type="button" onClick={() => setShowCreate(false)} className="text-sm text-[#86868B] hover:text-[#1D1D1F] transition-colors">Cancel</button>
              {createMsg && <span className="text-xs text-[#FF3B30]">{createMsg}</span>}
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-black/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-medium text-[#86868B] border-b border-black/5">
                <th className="px-5 py-3.5">Order</th><th className="px-5 py-3.5">Customer</th>
                <th className="px-5 py-3.5">Warehouse</th>
                <th className="px-5 py-3.5">Source</th><th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.04]">
              {orders.map((o: any) => {
                const displayStatus = (o.status || "").toLowerCase();
                const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
                return (
                  <tr key={o.id} className="hover:bg-black/[0.01] transition-colors cursor-pointer" onClick={() => router.push(`/saas/orders/${o.id}`)}>
                    <td className="px-5 py-3.5 text-sm font-medium text-[#1D1D1F]">{o.order_number || o.id}</td>
                    <td className="px-5 py-3.5 text-sm text-[#1D1D1F]">{o.customer_name || o.clients?.name || "—"}</td>
                    <td className="px-5 py-3.5 text-xs text-[#86868B]">{o.warehouses?.name || o.warehouses?.code || "—"}</td>
                    <td className="px-5 py-3.5"><span className="text-[11px] bg-black/[0.04] text-[#86868B] px-2 py-0.5 rounded-full">{o.source || "—"}</span></td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-medium ${STATUS_STYLES[displayStatus] || ""}`}>{cap(displayStatus)}</span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-[#86868B] text-right">{o.time || "—"}</td>
                  </tr>
                );
              })}
              {orders.length === 0 && (
                <tr><td colSpan={6} className="px-5 py-12 text-center text-[#86868B] text-sm">No orders yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="p-8 space-y-4 animate-pulse">
      <div className="h-8 w-36 bg-black/5 rounded-xl" />
      {[...Array(5)].map((_, i) => <div key={i} className="h-14 bg-white/50 rounded-xl" />)}
    </div>
  );
}
