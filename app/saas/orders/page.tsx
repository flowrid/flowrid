/**
 * SaaS Orders — 订单管理面板
 */

export const dynamic = "force-dynamic";

const ORDERS = [
  { id: "ORD-2024", customer: "Acme Apparel", source: "Shopify", items: 12, status: "Shipped", priority: "Normal", created: "2026-05-19 14:22" },
  { id: "ORD-2023", customer: "Zen Beauty", source: "Amazon", items: 3, status: "Picking", priority: "High", created: "2026-05-19 14:18" },
  { id: "ORD-2022", customer: "Peak Nutrition", source: "TikTok", items: 45, status: "Allocated", priority: "Rush", created: "2026-05-19 14:10" },
  { id: "ORD-2021", customer: "Gear Up Sports", source: "Shopify", items: 8, status: "Packed", priority: "Normal", created: "2026-05-19 13:55" },
  { id: "ORD-2020", customer: "Luxe Jewelry", source: "Manual", items: 2, status: "Pending", priority: "Normal", created: "2026-05-19 13:42" },
  { id: "ORD-2019", customer: "Green Foods", source: "EDI", items: 120, status: "Shipped", priority: "Normal", created: "2026-05-19 12:15" },
  { id: "ORD-2018", customer: "FitGear Pro", source: "Walmart", items: 15, status: "Delivered", priority: "Normal", created: "2026-05-19 11:30" },
  { id: "ORD-2017", customer: "StyleHouse", source: "Shopify", items: 9, status: "Returned", priority: "High", created: "2026-05-19 10:45" },
];

const statusColors: Record<string, string> = {
  Pending: "bg-gray-100 text-gray-700",
  Allocated: "bg-purple-100 text-purple-700",
  Picking: "bg-blue-100 text-blue-700",
  Packed: "bg-yellow-100 text-yellow-700",
  Shipped: "bg-green-100 text-green-700",
  Delivered: "bg-green-200 text-green-800",
  Returned: "bg-red-100 text-red-700",
  Cancelled: "bg-red-100 text-red-700",
};

export default function OrdersPage() {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-text">Orders</h1>
        <div className="flex gap-3">
          <select className="border border-border rounded-lg px-3 py-2 text-sm bg-card">
            <option>All Status</option>
            <option>Pending</option>
            <option>Picking</option>
            <option>Shipped</option>
          </select>
          <button className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary-dark transition-colors">
            + New Order
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-4 text-sm">
        <input
          type="text"
          placeholder="Search orders..."
          className="flex-1 border border-border rounded-lg px-3 py-2 text-sm bg-card focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <input
          type="text"
          placeholder="Source (Shopify, Amazon...)"
          className="flex-1 border border-border rounded-lg px-3 py-2 text-sm bg-card focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <input
          type="date"
          className="flex-1 border border-border rounded-lg px-3 py-2 text-sm bg-card focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-text-secondary border-b border-border">
              <th className="px-4 py-3 font-medium">Order</th>
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">Source</th>
              <th className="px-4 py-3 font-medium">Items</th>
              <th className="px-4 py-3 font-medium">Priority</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Created</th>
              <th className="px-4 py-3 font-medium">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {ORDERS.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{order.id}</td>
                <td className="px-4 py-3">{order.customer}</td>
                <td className="px-4 py-3">
                  <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">{order.source}</span>
                </td>
                <td className="px-4 py-3">{order.items}</td>
                <td className="px-4 py-3">
                  <span
                    className={`text-xs font-medium ${
                      order.priority === "Rush"
                        ? "text-danger"
                        : order.priority === "High"
                          ? "text-warning"
                          : "text-text-secondary"
                    }`}
                  >
                    {order.priority}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                      statusColors[order.status]
                    }`}
                  >
                    {order.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-text-secondary">{order.created}</td>
                <td className="px-4 py-3">
                  <select
                    className="border border-border rounded px-2 py-1 text-xs bg-card"
                    defaultValue=""
                  >
                    <option value="" disabled>
                      Action
                    </option>
                    <option>View</option>
                    <option>Pick</option>
                    <option>Ship</option>
                    <option>Cancel</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4 text-sm text-text-secondary">
        <p>Showing 1–8 of 3,847 orders</p>
        <div className="flex gap-2">
          <button className="border border-border rounded-lg px-3 py-1 hover:bg-gray-50">Prev</button>
          <button className="bg-primary text-white rounded-lg px-3 py-1">1</button>
          <button className="border border-border rounded-lg px-3 py-1 hover:bg-gray-50">2</button>
          <button className="border border-border rounded-lg px-3 py-1 hover:bg-gray-50">3</button>
          <button className="border border-border rounded-lg px-3 py-1 hover:bg-gray-50">Next</button>
        </div>
      </div>
    </div>
  );
}
