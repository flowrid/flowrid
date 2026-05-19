/**
 * SaaS Dashboard — 3PL 运营总览
 */

import { createServerClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  // 模拟 KPI 数据（实际生产环境从 saas-analytics 引擎获取）
  const kpis = {
    orders_today: 142,
    orders_30d: 3847,
    pending_orders: 28,
    total_inventory_units: 125430,
    avg_pick_time_minutes: 12,
  };

  const recentOrders = [
    { id: "#ORD-2024", customer: "Acme Apparel", items: 12, status: "Shipped", time: "2 min ago" },
    { id: "#ORD-2023", customer: "Zen Beauty", items: 3, status: "Picking", time: "5 min ago" },
    { id: "#ORD-2022", customer: "Peak Nutrition", items: 45, status: "Allocated", time: "8 min ago" },
    { id: "#ORD-2021", customer: "Gear Up Sports", items: 8, status: "Packed", time: "15 min ago" },
    { id: "#ORD-2020", customer: "Luxe Jewelry", items: 2, status: "Pending", time: "22 min ago" },
  ];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-text">Dashboard</h1>
        <p className="text-sm text-text-secondary">
          {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <KPICard label="Orders Today" value={kpis.orders_today} color="primary" />
        <KPICard label="30-Day Orders" value={kpis.orders_30d.toLocaleString()} color="primary" />
        <KPICard label="Pending" value={kpis.pending_orders} color="warning" />
        <KPICard label="Inventory Units" value={kpis.total_inventory_units.toLocaleString()} color="success" />
        <KPICard label="Avg Pick Time" value={`${kpis.avg_pick_time_minutes}m`} color="text" />
      </div>

      {/* Recent Orders */}
      <div className="bg-card border border-border rounded-xl">
        <div className="p-4 border-b border-border flex justify-between items-center">
          <h2 className="font-bold text-text">Recent Orders</h2>
          <a href="/saas/orders" className="text-sm text-primary hover:underline">
            View All
          </a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-text-secondary">
                <th className="px-4 py-3 font-medium">Order</th>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Items</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{order.id}</td>
                  <td className="px-4 py-3">{order.customer}</td>
                  <td className="px-4 py-3">{order.items}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="px-4 py-3 text-text-secondary">{order.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function KPICard({
  label,
  value,
  color,
}: {
  label: string;
  value: string | number;
  color: string;
}) {
  const colorMap: Record<string, string> = {
    primary: "text-primary",
    success: "text-success",
    warning: "text-warning",
    text: "text-text",
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <p className="text-xs text-text-secondary uppercase tracking-wide">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${colorMap[color] || "text-text"}`}>
        {value}
      </p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Shipped: "bg-green-100 text-green-700",
    Picking: "bg-blue-100 text-blue-700",
    Allocated: "bg-purple-100 text-purple-700",
    Packed: "bg-yellow-100 text-yellow-700",
    Pending: "bg-gray-100 text-gray-700",
  };

  return (
    <span
      className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
        styles[status] || "bg-gray-100 text-gray-700"
      }`}
    >
      {status}
    </span>
  );
}
