/**
 * SaaS Billing — 计费与发票
 */

const INVOICES = [
  { id: "INV-202605-0001", client: "Acme Apparel", amount: "$4,280.50", status: "Paid", due: "2026-06-30", paid: "2026-05-15" },
  { id: "INV-202605-0002", client: "Zen Beauty", amount: "$1,845.00", status: "Sent", due: "2026-06-30", paid: "-" },
  { id: "INV-202605-0003", client: "Peak Nutrition", amount: "$9,320.75", status: "Overdue", due: "2026-05-15", paid: "-" },
  { id: "INV-202605-0004", client: "Gear Up Sports", amount: "$2,150.00", status: "Draft", due: "-", paid: "-" },
  { id: "INV-202604-0005", client: "Luxe Jewelry", amount: "$3,670.25", status: "Paid", due: "2026-05-31", paid: "2026-04-28" },
  { id: "INV-202604-0006", client: "Green Foods", amount: "$12,480.00", status: "Paid", due: "2026-05-31", paid: "2026-04-20" },
];

const statusStyles: Record<string, string> = {
  Paid: "bg-green-100 text-green-700",
  Sent: "bg-blue-100 text-blue-700",
  Overdue: "bg-red-100 text-red-700",
  Draft: "bg-gray-100 text-gray-700",
};

export default function BillingPage() {
  const totalRevenue = INVOICES.reduce((sum, inv) => {
    const amt = parseFloat(inv.amount.replace(/[$,]/g, ""));
    return sum + (inv.status !== "Draft" ? amt : 0);
  }, 0);

  const totalOutstanding = INVOICES.filter((i) => i.status === "Sent" || i.status === "Overdue").reduce(
    (sum, inv) => sum + parseFloat(inv.amount.replace(/[$,]/g, "")),
    0
  );

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-text">Billing</h1>
        <button className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary-dark transition-colors">
          + Generate Invoice
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <BillingCard label="Total Revenue (MTD)" value={`$${totalRevenue.toLocaleString()}`} color="success" />
        <BillingCard label="Outstanding" value={`$${totalOutstanding.toLocaleString()}`} color="danger" />
        <BillingCard label="Paid This Month" value="$8,950.75" color="primary" />
        <BillingCard label="Avg Invoice" value="$5,624" color="text" />
      </div>

      {/* Invoice Table */}
      <div className="bg-card border border-border rounded-xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-text-secondary border-b border-border">
              <th className="px-4 py-3 font-medium">Invoice</th>
              <th className="px-4 py-3 font-medium">Client</th>
              <th className="px-4 py-3 font-medium">Amount</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Due Date</th>
              <th className="px-4 py-3 font-medium">Paid Date</th>
              <th className="px-4 py-3 font-medium">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {INVOICES.map((inv) => (
              <tr key={inv.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-xs">{inv.id}</td>
                <td className="px-4 py-3 font-medium">{inv.client}</td>
                <td className="px-4 py-3 font-semibold">{inv.amount}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${statusStyles[inv.status]}`}>
                    {inv.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-text-secondary">{inv.due}</td>
                <td className="px-4 py-3 text-text-secondary">{inv.paid}</td>
                <td className="px-4 py-3">
                  <button className="text-primary hover:underline text-xs font-medium">View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Charge Types Reference */}
      <div className="mt-8 bg-card border border-border rounded-xl p-4">
        <h2 className="font-bold text-text mb-3">Billing Rates Reference</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          {[
            { type: "Storage", rate: "$12.50/pallet/mo" },
            { type: "Receiving", rate: "$3.25/unit" },
            { type: "Pick & Pack", rate: "$2.50/order + $0.45/unit" },
            { type: "Labeling", rate: "$0.35/unit" },
            { type: "Kitting", rate: "$0.75/unit" },
            { type: "Shipping Label", rate: "$0.25/label" },
            { type: "Account Mgmt", rate: "$150.00/mo" },
            { type: "Technology Fee", rate: "$299.00/mo" },
          ].map((rate) => (
            <div key={rate.type} className="p-3 bg-gray-50 rounded-lg">
              <p className="font-medium text-text">{rate.type}</p>
              <p className="text-text-secondary text-xs mt-0.5">{rate.rate}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function BillingCard({ label, value, color }: { label: string; value: string; color: string }) {
  const colors: Record<string, string> = {
    success: "text-success",
    danger: "text-danger",
    primary: "text-primary",
    text: "text-text",
  };
  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <p className="text-xs text-text-secondary uppercase">{label}</p>
      <p className={`text-xl font-bold mt-1 ${colors[color]}`}>{value}</p>
    </div>
  );
}
