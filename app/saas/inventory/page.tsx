/**
 * SaaS Inventory — 库存看板
 */

const INVENTORY = [
  { sku: "SKU-10234", name: "Organic Cotton T-Shirt", category: "Apparel", qty: 4520, allocated: 120, location: "A-12-03", status: "In Stock" },
  { sku: "SKU-10235", name: "Bamboo Yoga Mat", category: "Sports", qty: 1280, allocated: 340, location: "B-04-01", status: "Low Stock" },
  { sku: "SKU-10236", name: "Rosehip Facial Serum", category: "Beauty", qty: 8900, allocated: 0, location: "C-01-15", status: "In Stock" },
  { sku: "SKU-10237", name: "Wireless Earbuds Pro", category: "Electronics", qty: 45, allocated: 10, location: "A-15-08", status: "Low Stock" },
  { sku: "SKU-10238", name: "Protein Powder Vanilla", category: "Supplements", qty: 0, allocated: 0, location: "D-02-11", status: "Out of Stock" },
  { sku: "SKU-10239", name: "Premium Dog Leash", category: "Pets", qty: 3210, allocated: 85, location: "B-08-22", status: "In Stock" },
  { sku: "SKU-10240", name: "LED Desk Lamp", category: "Home", qty: 890, allocated: 200, location: "A-03-05", status: "In Stock" },
];

const statusStyles: Record<string, string> = {
  "In Stock": "bg-green-100 text-green-700",
  "Low Stock": "bg-yellow-100 text-yellow-700",
  "Out of Stock": "bg-red-100 text-red-700",
};

export default function InventoryPage() {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-text">Inventory</h1>
        <button className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary-dark transition-colors">
          + Add Product
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total SKUs" value="1,247" />
        <StatCard label="Total Units" value="125,430" />
        <StatCard label="Low Stock" value="23" color="warning" />
        <StatCard label="Out of Stock" value="5" color="danger" />
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by SKU, name, or category..."
          className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-card focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Inventory Table */}
      <div className="bg-card border border-border rounded-xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-text-secondary border-b border-border">
              <th className="px-4 py-3 font-medium">SKU</th>
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">On Hand</th>
              <th className="px-4 py-3 font-medium">Allocated</th>
              <th className="px-4 py-3 font-medium">Available</th>
              <th className="px-4 py-3 font-medium">Location</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {INVENTORY.map((item) => (
              <tr key={item.sku} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-xs">{item.sku}</td>
                <td className="px-4 py-3 font-medium">{item.name}</td>
                <td className="px-4 py-3 text-text-secondary">{item.category}</td>
                <td className="px-4 py-3">{item.qty.toLocaleString()}</td>
                <td className="px-4 py-3">{item.allocated.toLocaleString()}</td>
                <td className="px-4 py-3 font-medium">
                  {(item.qty - item.allocated).toLocaleString()}
                </td>
                <td className="px-4 py-3 font-mono text-xs">{item.location}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${statusStyles[item.status]}`}>
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: string; color?: string }) {
  const colors: Record<string, string> = { warning: "text-warning", danger: "text-danger" };
  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <p className="text-xs text-text-secondary uppercase">{label}</p>
      <p className={`text-xl font-bold mt-1 ${color ? colors[color] : "text-text"}`}>{value}</p>
    </div>
  );
}
