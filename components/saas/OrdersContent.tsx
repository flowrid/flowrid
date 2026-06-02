"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

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

const DT: Record<string, any> = { orders: [], data: [], stats: { total: 0, pending: 0, shipped: 0 } };

function generateOrderNumber() {
  return `ORD-${Date.now().toString(36).toUpperCase()}`;
}

export default function OrdersContent() {
  const [data, setData] = useState(DT);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [createMsg, setCreateMsg] = useState<string | null>(null);
  const [orderNumber, setOrderNumber] = useState(generateOrderNumber());
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [source, setSource] = useState("manual");
  const [warehouseId, setWarehouseId] = useState("");
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [shippingZip, setShippingZip] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const orderBasePath = pathname.startsWith("/account") ? "/account/orders" : "/saas/orders";

  async function fetchOrders() {
    try {
      const r = await fetch("/api/saas/orders");
      if (!r.ok) throw new Error(`Request failed (${r.status})`);
      const d = await r.json();
      setData(d);
    } catch (e: any) {
      setError(e.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchOrders();
    // Fetch warehouses for dropdown
    fetch("/api/saas/warehouses")
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d) {
          const whs = d.data || d.warehouses || [];
          setWarehouses(whs);
          if (whs.length > 0) setWarehouseId(whs[0].id);
        }
      })
      .catch(() => {});
  }, []);

  async function handleCreateOrder(e: React.FormEvent) {
    e.preventDefault();
    if (!orderNumber.trim()) {
      setCreateMsg("Order number is required");
      return;
    }
    setCreating(true);
    setCreateMsg(null);
    try {
      const body: Record<string, unknown> = {
        order_number: orderNumber.trim(),
        customer_name: customerName || "Walk-in Customer",
        source,
      };
      if (customerEmail) body.customer_email = customerEmail;
      if (warehouseId) body.warehouse_id = warehouseId;
      if (shippingZip) body.shipping_zip = shippingZip;

      const res = await fetch("/api/saas/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setOrderNumber(generateOrderNumber());
        setCustomerName("");
        setCustomerEmail("");
        setShippingZip("");
        setCreateMsg(null);
        setLoading(true);
        fetchOrders();
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

  async function handleDeleteSelected() {
    if (selectedIds.size === 0) return;
    setDeleting(true);
    let count = 0;
    for (const id of selectedIds) {
      try {
        const res = await fetch(`/api/saas/orders/${id}`, { method: "DELETE" });
        if (res.ok) count++;
      } catch {}
    }
    setSelectedIds(new Set());
    setDeleting(false);
    setLoading(true);
    fetchOrders();
  }

  function toggleSelect(id: string) {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelectedIds(next);
  }

  function toggleSelectAll() {
    const allIds = orders.map((o: any) => o.id);
    if (allIds.every((id: string) => selectedIds.has(id))) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(allIds));
    }
  }

  const fmtTime = (ts: string) => {
    if (!ts) return "—";
    const d = new Date(ts);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return "Just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const orders = data.orders || data.data || [];
  const stats = data.stats || { total: 0, pending: 0, shipped: 0 };

  if (loading) return <Skeleton />;
  if (error) return (
    <div className="p-8 text-center">
      <p className="text-[#FF3B30] text-sm mb-3">{error}</p>
      <button onClick={() => { setError(null); setLoading(true); fetchOrders(); }} className="text-sm text-[#ed6d00] font-medium hover:text-[#FF8A1F]">Retry</button>
    </div>
  );

  return (
    <div className="p-6 md:p-8 max-w-[1280px]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight text-[#1D1D1F]">Orders</h1>
          <p className="text-[#86868B] text-sm mt-0.5">{stats.total} total · {stats.pending} pending · {stats.shipped} shipped</p>
        </div>
      </div>

      {/* New Order form — always visible */}
      <div className="mb-6 bg-white rounded-2xl shadow-sm border border-black/5 p-6">
        <h2 className="text-[15px] font-semibold text-[#1D1D1F] mb-4">New Order</h2>
        <form onSubmit={handleCreateOrder} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-medium text-[#86868B] uppercase tracking-wide mb-1">Order Number *</label>
              <input type="text" value={orderNumber} onChange={(e) => setOrderNumber(e.target.value)} className="w-full bg-[#F5F5F7] border-0 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ed6d00]/20" />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-[#86868B] uppercase tracking-wide mb-1">Customer Name</label>
              <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Walk-in Customer" className="w-full bg-[#F5F5F7] border-0 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ed6d00]/20" />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-[#86868B] uppercase tracking-wide mb-1">Customer Email</label>
              <input type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} placeholder="email@example.com" className="w-full bg-[#F5F5F7] border-0 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ed6d00]/20" />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-[#86868B] uppercase tracking-wide mb-1">Source</label>
              <select value={source} onChange={(e) => setSource(e.target.value)} className="w-full bg-[#F5F5F7] border-0 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ed6d00]/20">
                <option value="manual">Manual</option>
                <option value="shopify">Shopify</option>
                <option value="amazon">Amazon</option>
                <option value="ebay">eBay</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-[#86868B] uppercase tracking-wide mb-1">Warehouse</label>
              <select value={warehouseId} onChange={(e) => setWarehouseId(e.target.value)} className="w-full bg-[#F5F5F7] border-0 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ed6d00]/20">
                <option value="">Auto-select</option>
                {warehouses.map((wh: any) => (
                  <option key={wh.id} value={wh.id}>{wh.name} ({wh.code})</option>
                ))}
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
            {createMsg && <span className="text-xs text-[#FF3B30]">{createMsg}</span>}
          </div>
        </form>
      </div>

      {/* Orders list */}
      <div className="bg-white rounded-2xl shadow-sm border border-black/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-medium text-[#86868B] border-b border-black/5">
                <th className="px-5 py-3.5 w-10"><input type="checkbox" checked={orders.length > 0 && orders.every((o: any) => selectedIds.has(o.id))} onChange={toggleSelectAll} className="w-3.5 h-3.5 rounded border-black/20 text-[#ed6d00] focus:ring-[#ed6d00]/20" /></th>
                <th className="px-5 py-3.5">Order</th><th className="px-5 py-3.5">Customer</th>
                <th className="px-5 py-3.5">Warehouse</th>
                <th className="px-5 py-3.5">Source</th><th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Time</th>
                <th className="px-5 py-3.5 text-right">
                  {selectedIds.size > 0 && (
                    <button onClick={handleDeleteSelected} disabled={deleting} className="text-[11px] text-[#FF3B30] font-medium hover:text-[#FF6B6B] disabled:opacity-50">
                      {deleting ? "Deleting..." : `Delete (${selectedIds.size})`}
                    </button>
                  )}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.04]">
              {orders.map((o: any) => {
                const displayStatus = (o.status || "").toLowerCase();
                const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
                return (
                  <tr key={o.id} className="hover:bg-black/[0.01] transition-colors cursor-pointer" onClick={() => router.push(`${orderBasePath}/${o.id}`)}>
                    <td className="px-5 py-3.5" onClick={(e) => e.stopPropagation()}><input type="checkbox" checked={selectedIds.has(o.id)} onChange={() => toggleSelect(o.id)} className="w-3.5 h-3.5 rounded border-black/20 text-[#ed6d00] focus:ring-[#ed6d00]/20" /></td>
                    <td className="px-5 py-3.5 text-sm font-medium text-[#1D1D1F]">{o.order_number || o.id}</td>
                    <td className="px-5 py-3.5 text-sm text-[#1D1D1F]">{o.customer_name || o.clients?.name || "—"}</td>
                    <td className="px-5 py-3.5 text-xs text-[#86868B]">{o.warehouses?.name || o.warehouses?.code || "—"}</td>
                    <td className="px-5 py-3.5"><span className="text-[11px] bg-black/[0.04] text-[#86868B] px-2 py-0.5 rounded-full">{o.source || "—"}</span></td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-medium ${STATUS_STYLES[displayStatus] || ""}`}>{cap(displayStatus)}</span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-[#86868B] text-right">{fmtTime(o.created_at || o.time)}</td>
                    <td className="px-5 py-3.5" /> {/* spacer for delete column */}
                  </tr>
                );
              })}
              {orders.length === 0 && (
                <tr><td colSpan={8} className="px-5 py-12 text-center text-[#86868B] text-sm">No orders yet</td></tr>
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
