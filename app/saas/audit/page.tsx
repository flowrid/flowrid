"use client";

// 审计日志查看器

import { useEffect, useState } from "react";

export default function AuditPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState("");
  const [entityFilter, setEntityFilter] = useState("");
  const [page, setPage] = useState(1);

  async function fetchLogs() {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: "50", offset: String((page - 1) * 50) });
      if (actionFilter) params.set("action", actionFilter);
      if (entityFilter) params.set("entity_type", entityFilter);

      const r = await fetch(`/api/saas/audit?${params}`);
      const d = await r.json();
      setLogs(d.data || []);
      setTotal(d.total || 0);
    } catch {} finally { setLoading(false); }
  }

  useEffect(() => { fetchLogs(); }, [actionFilter, entityFilter, page]);

  function formatJson(val: any) {
    if (!val) return "—";
    if (typeof val === "string") return val;
    return JSON.stringify(val).slice(0, 120);
  }

  function timeAgo(ts: string) {
    const diff = Date.now() - new Date(ts).getTime();
    const min = Math.floor(diff / 60000);
    if (min < 1) return "Just now";
    if (min < 60) return `${min}m ago`;
    const hrs = Math.floor(min / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  }

  const totalPages = Math.ceil(total / 50);

  return (
    <div className="p-6 md:p-8 max-w-[1280px]">
      <h1 className="text-[28px] font-bold tracking-tight text-[#1D1D1F] mb-6">Audit Log</h1>

      <div className="flex flex-wrap gap-4 mb-6">
        <select value={actionFilter} onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
          className="bg-white border border-black/5 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ed6d00]/20">
          <option value="">All Actions</option>
          <option value="order.created">Order Created</option>
          <option value="order.status_changed">Order Status Changed</option>
          <option value="product.created">Product Created</option>
          <option value="product.updated">Product Updated</option>
          <option value="inventory.adjusted">Inventory Adjusted</option>
          <option value="user.created">User Created</option>
          <option value="user.login">User Login</option>
          <option value="shipment.created">Shipment Created</option>
          <option value="settings.updated">Settings Updated</option>
        </select>
        <select value={entityFilter} onChange={(e) => { setEntityFilter(e.target.value); setPage(1); }}
          className="bg-white border border-black/5 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ed6d00]/20">
          <option value="">All Entities</option>
          <option value="order">Order</option>
          <option value="product">Product</option>
          <option value="inventory">Inventory</option>
          <option value="user">User</option>
          <option value="warehouse">Warehouse</option>
          <option value="shipment">Shipment</option>
        </select>
        <span className="text-sm text-[#86868B] self-center">{total.toLocaleString()} entries</span>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-black/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-medium text-[#86868B] border-b border-black/5">
                <th className="px-5 py-3.5">Action</th>
                <th className="px-5 py-3.5">Entity</th>
                <th className="px-5 py-3.5">Entity ID</th>
                <th className="px-5 py-3.5">User</th>
                <th className="px-5 py-3.5">Changes</th>
                <th className="px-5 py-3.5 text-right">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.04]">
              {logs.map((log: any) => (
                <tr key={log.id} className="hover:bg-black/[0.01]">
                  <td className="px-5 py-3 text-xs">
                    <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#ed6d00]/10 text-[#ed6d00]">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-xs text-[#86868B] capitalize">{log.entity_type}</td>
                  <td className="px-5 py-3 text-xs font-mono text-[#86868B]">{log.entity_id ? log.entity_id.slice(0, 8) + "..." : "—"}</td>
                  <td className="px-5 py-3 text-xs text-[#86868B]">{log.user_id ? log.user_id.slice(0, 8) + "..." : "System"}</td>
                  <td className="px-5 py-3 text-xs text-[#1D1D1F] max-w-[200px] truncate">
                    {log.new_values ? formatJson(log.new_values) : log.old_values ? `← ${formatJson(log.old_values)}` : "—"}
                  </td>
                  <td className="px-5 py-3 text-xs text-[#86868B] text-right whitespace-nowrap">{timeAgo(log.created_at)}</td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr><td colSpan={6} className="px-5 py-12 text-center text-[#86868B] text-sm">No audit entries found</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-black/5">
            <span className="text-xs text-[#86868B]">Page {page} of {totalPages}</span>
            <div className="flex gap-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                className="text-xs text-[#ed6d00] font-medium disabled:opacity-30">Prev</button>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="text-xs text-[#ed6d00] font-medium disabled:opacity-30">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
