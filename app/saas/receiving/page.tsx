"use client";

import { useState } from "react";

const DEMO_RECEIVING = [
  { id: "ASN-1042", supplier: "Overseas Textile Co.", expected: "May 22", items: 2400, status: "In Transit" },
  { id: "ASN-1041", supplier: "Shenzhen Electronics", expected: "May 20", items: 850, status: "Arrived" },
  { id: "ASN-1040", supplier: "BeautySupply Ltd.", expected: "May 19", items: 12000, status: "Received" },
  { id: "ASN-1039", supplier: "GearUp Mfg", expected: "May 18", items: 3600, status: "Complete" },
  { id: "ASN-1038", supplier: "Organic Foods Co.", expected: "May 15", items: 4800, status: "Complete" },
];

const STATUS_STYLES: Record<string, string> = {
  "In Transit": "bg-[#0071E3]/10 text-[#0071E3]",
  Arrived: "bg-[#FF9500]/10 text-[#FF9500]",
  Received: "bg-[#AF52DE]/10 text-[#AF52DE]",
  Complete: "bg-[#34C759]/10 text-[#34C759]",
};

export default function ReceivingPage() {
  const [items] = useState(DEMO_RECEIVING);

  return (
    <div className="p-6 md:p-8 max-w-[1280px]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight text-[#1D1D1F]">Receiving</h1>
          <p className="text-[#86868B] text-sm mt-0.5">Inbound shipments</p>
        </div>
        <button className="inline-flex items-center gap-2 bg-[#0071E3] text-white px-4 py-2.5 rounded-full text-sm font-semibold hover:bg-[#0077ED] transition-colors shadow-sm">
          <span>+</span> New ASN
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-black/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-medium text-[#86868B] border-b border-black/5">
                <th className="px-5 py-3.5">ASN</th>
                <th className="px-5 py-3.5">Supplier</th>
                <th className="px-5 py-3.5">Expected</th>
                <th className="px-5 py-3.5">Items</th>
                <th className="px-5 py-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.04]">
              {items.map((r) => (
                <tr key={r.id} className="hover:bg-black/[0.01] transition-colors">
                  <td className="px-5 py-3.5 text-sm font-medium text-[#1D1D1F]">{r.id}</td>
                  <td className="px-5 py-3.5 text-sm text-[#1D1D1F]">{r.supplier}</td>
                  <td className="px-5 py-3.5 text-xs text-[#86868B]">{r.expected}</td>
                  <td className="px-5 py-3.5 text-sm text-[#1D1D1F]">{r.items.toLocaleString()}</td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-medium ${STATUS_STYLES[r.status]}`}>
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
