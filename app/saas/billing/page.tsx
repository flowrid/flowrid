"use client";

import { useState } from "react";

interface Invoice {
  id: string;
  client: string;
  amount: string;
  status: string;
  due: string;
  paid: string;
}

const INVOICES: Invoice[] = [
  { id: "INV-202605-0001", client: "Acme Apparel", amount: "$4,280.50", status: "Paid", due: "Jun 30", paid: "May 15" },
  { id: "INV-202605-0002", client: "Zen Beauty", amount: "$1,845.00", status: "Sent", due: "Jun 30", paid: "—" },
  { id: "INV-202605-0003", client: "Peak Nutrition", amount: "$9,320.75", status: "Overdue", due: "May 15", paid: "—" },
  { id: "INV-202605-0004", client: "Gear Up Sports", amount: "$2,150.00", status: "Draft", due: "—", paid: "—" },
  { id: "INV-202604-0005", client: "Luxe Jewelry", amount: "$3,670.25", status: "Paid", due: "May 31", paid: "Apr 28" },
  { id: "INV-202604-0006", client: "Green Foods", amount: "$12,480.00", status: "Paid", due: "May 31", paid: "Apr 20" },
];

const STATUS_STYLES: Record<string, string> = {
  Paid: "bg-[#34C759]/10 text-[#34C759]",
  Sent: "bg-[#0071E3]/10 text-[#0071E3]",
  Overdue: "bg-[#FF3B30]/10 text-[#FF3B30]",
  Draft: "bg-[#8E8E93]/10 text-[#8E8E93]",
};

const RATES = [
  { type: "Storage", rate: "$12.50 / pallet / mo" },
  { type: "Receiving", rate: "$3.25 / unit" },
  { type: "Pick & Pack", rate: "$2.50/order + $0.45/unit" },
  { type: "Labeling", rate: "$0.35 / unit" },
  { type: "Kitting", rate: "$0.75 / unit" },
  { type: "Shipping Label", rate: "$0.25 / label" },
  { type: "Account Mgmt", rate: "$150.00 / month" },
  { type: "Technology Fee", rate: "$299.00 / month" },
];

export default function BillingPage() {
  const [activeTab, setActiveTab] = useState<"invoices" | "rates">("invoices");

  const totalRevenue = INVOICES.reduce((s, i) => s + (i.status !== "Draft" ? parseFloat(i.amount.replace(/[$,]/g, "")) : 0), 0);
  const totalOutstanding = INVOICES.filter((i) => i.status === "Sent" || i.status === "Overdue").reduce((s, i) => s + parseFloat(i.amount.replace(/[$,]/g, "")), 0);

  return (
    <div className="p-6 md:p-8 max-w-[1280px]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight text-[#1D1D1F]">Billing</h1>
          <p className="text-[#86868B] text-sm mt-0.5">Invoices & rates</p>
        </div>
        <button className="inline-flex items-center gap-2 bg-[#0071E3] text-white px-4 py-2.5 rounded-full text-sm font-semibold hover:bg-[#0077ED] transition-colors shadow-sm">
          <span>+</span> Generate Invoice
        </button>
      </div>

      {/* Metric tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <BillingTile label="Total Revenue" value={`$${totalRevenue.toLocaleString()}`} accent="green" />
        <BillingTile label="Outstanding" value={`$${totalOutstanding.toLocaleString()}`} accent="red" />
        <BillingTile label="Paid This Month" value="$8,950.75" accent="blue" />
        <BillingTile label="Avg Invoice" value="$5,624" />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-black/[0.03] rounded-full p-1 w-fit">
        {(["invoices", "rates"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`px-4 py-2 rounded-full text-xs font-medium transition-all capitalize ${
              activeTab === t ? "bg-white text-[#1D1D1F] shadow-sm" : "text-[#86868B] hover:text-[#1D1D1F]"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === "invoices" ? (
        <div className="bg-white rounded-2xl shadow-sm border border-black/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-medium text-[#86868B] border-b border-black/5">
                  <th className="px-5 py-3.5">Invoice</th>
                  <th className="px-5 py-3.5">Client</th>
                  <th className="px-5 py-3.5">Amount</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Due</th>
                  <th className="px-5 py-3.5">Paid</th>
                  <th className="px-5 py-3.5"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.04]">
                {INVOICES.map((inv) => (
                  <tr key={inv.id} className="hover:bg-black/[0.01] transition-colors">
                    <td className="px-5 py-3.5 text-xs font-mono text-[#86868B]">{inv.id}</td>
                    <td className="px-5 py-3.5 text-sm font-medium text-[#1D1D1F]">{inv.client}</td>
                    <td className="px-5 py-3.5 text-sm font-semibold text-[#1D1D1F]">{inv.amount}</td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-medium ${STATUS_STYLES[inv.status]}`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-[#86868B]">{inv.due}</td>
                    <td className="px-5 py-3.5 text-xs text-[#86868B]">{inv.paid}</td>
                    <td className="px-5 py-3.5">
                      <button className="text-[11px] text-[#0071E3] hover:underline font-medium">View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {RATES.map((r) => (
            <div key={r.type} className="bg-white rounded-2xl p-5 shadow-sm border border-black/5">
              <p className="text-sm font-medium text-[#1D1D1F]">{r.type}</p>
              <p className="text-xs text-[#86868B] mt-1">{r.rate}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function BillingTile({ label, value, accent }: { label: string; value: string; accent?: string }) {
  const colors: Record<string, string> = { green: "text-[#34C759]", red: "text-[#FF3B30]", blue: "text-[#0071E3]" };
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-black/5">
      <p className="text-[11px] font-medium text-[#86868B] uppercase tracking-wide">{label}</p>
      <p className={`text-[22px] font-bold tracking-tight mt-1.5 ${colors[accent || ""] || "text-[#1D1D1F]"}`}>{value}</p>
    </div>
  );
}
