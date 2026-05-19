"use client";

import { useEffect, useState } from "react";

interface Order {
  id: string;
  customer: string;
  source: string;
  items: number;
  priority: string;
  status: string;
  time: string;
}

const STATUS_STYLES: Record<string, string> = {
  Shipped: "bg-[#34C759]/10 text-[#34C759]",
  Picking: "bg-[#0071E3]/10 text-[#0071E3]",
  Allocated: "bg-[#AF52DE]/10 text-[#AF52DE]",
  Packed: "bg-[#FF9500]/10 text-[#FF9500]",
  Pending: "bg-[#8E8E93]/10 text-[#8E8E93]",
  Delivered: "bg-[#34C759]/10 text-[#34C759]",
  Returned: "bg-[#FF3B30]/10 text-[#FF3B30]",
  Cancelled: "bg-[#FF3B30]/10 text-[#FF3B30]",
};

const DEMO: Order[] = [
  { id: "ORD-2024", customer: "Acme Apparel", source: "Shopify", items: 12, priority: "Normal", status: "Shipped", time: "14:22" },
  { id: "ORD-2023", customer: "Zen Beauty", source: "Amazon", items: 3, priority: "High", status: "Picking", time: "14:18" },
  { id: "ORD-2022", customer: "Peak Nutrition", source: "TikTok", items: 45, priority: "Rush", status: "Allocated", time: "14:10" },
  { id: "ORD-2021", customer: "Gear Up Sports", source: "Shopify", items: 8, priority: "Normal", status: "Packed", time: "13:55" },
  { id: "ORD-2020", customer: "Luxe Jewelry", source: "Manual", items: 2, priority: "Normal", status: "Pending", time: "13:42" },
  { id: "ORD-2019", customer: "Green Foods", source: "EDI", items: 120, priority: "Normal", status: "Shipped", time: "12:15" },
  { id: "ORD-2018", customer: "FitGear Pro", source: "Walmart", items: 15, priority: "Normal", status: "Delivered", time: "11:30" },
  { id: "ORD-2017", customer: "StyleHouse", source: "Shopify", items: 9, priority: "High", status: "Returned", time: "10:45" },
];

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/saas/dashboard")
      .then((r) => r.json())
      .then((data) => {
        if (data.recent_orders?.length > 5) {
          setOrders(data.recent_orders as Order[]);
        } else {
          setOrders(DEMO);
        }
      })
      .catch(() => setOrders(DEMO))
      .finally(() => setLoading(false));
  }, []);

  const filtered = orders.filter((o) => {
    if (statusFilter !== "All" && o.status !== statusFilter) return false;
    if (filter && !o.id.toLowerCase().includes(filter.toLowerCase()) && !o.customer.toLowerCase().includes(filter.toLowerCase())) return false;
    return true;
  });

  const uniqueStatuses = ["All", ...new Set(orders.map((o) => o.status))];

  if (loading) {
    return (
      <div className="p-8 space-y-4 animate-pulse">
        <div className="h-8 w-36 bg-black/5 rounded-xl" />
        <div className="h-10 w-full bg-black/5 rounded-xl" />
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-14 bg-white/50 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-[1280px]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight text-[#1D1D1F]">Orders</h1>
          <p className="text-[#86868B] text-sm mt-0.5">{orders.length} total</p>
        </div>
        <button className="inline-flex items-center gap-2 bg-[#0071E3] text-white px-4 py-2.5 rounded-full text-sm font-semibold hover:bg-[#0077ED] transition-colors shadow-sm">
          <span>+</span> New Order
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1 relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#86868B] text-sm">&#x1F50E;</span>
          <input
            type="text"
            placeholder="Search orders or customers..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-black/5 rounded-xl text-sm text-[#1D1D1F] placeholder:text-[#86868B] focus:outline-none focus:ring-2 focus:ring-[#0071E3]/20 focus:border-[#0071E3] transition-all"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {uniqueStatuses.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3.5 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                statusFilter === s
                  ? "bg-[#1D1D1F] text-white"
                  : "bg-white text-[#86868B] border border-black/5 hover:border-black/10"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Order List */}
      <div className="bg-white rounded-2xl shadow-sm border border-black/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-medium text-[#86868B] border-b border-black/5">
                <th className="px-5 py-3.5">Order ID</th>
                <th className="px-5 py-3.5">Customer</th>
                <th className="px-5 py-3.5">Source</th>
                <th className="px-5 py-3.5">Priority</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.04]">
              {filtered.map((o) => (
                <tr key={o.id} className="hover:bg-black/[0.01] transition-colors group">
                  <td className="px-5 py-3.5">
                    <span className="text-sm font-medium text-[#1D1D1F]">{o.id}</span>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-[#1D1D1F]">{o.customer}</td>
                  <td className="px-5 py-3.5">
                    <span className="text-[11px] bg-black/[0.04] text-[#86868B] px-2 py-0.5 rounded-full">{o.source}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`text-xs font-medium ${
                      o.priority === "Rush" ? "text-[#FF3B30]" : o.priority === "High" ? "text-[#FF9500]" : "text-[#86868B]"
                    }`}>
                      {o.priority}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-medium ${STATUS_STYLES[o.status] || ""}`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-[#86868B] text-right">{o.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
