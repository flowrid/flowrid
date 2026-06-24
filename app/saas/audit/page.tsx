"use client";

// Audit log viewer

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

export default function AuditPage() {
  const t = useTranslations("saasContent.audit");
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
    if (!val) return t("noChanges");
    if (typeof val === "string") return val;
    return JSON.stringify(val).slice(0, 120);
  }

  function timeAgo(ts: string) {
    const diff = Date.now() - new Date(ts).getTime();
    const min = Math.floor(diff / 60000);
    if (min < 1) return t("justNow");
    if (min < 60) return t("minutesAgo", { n: min });
    const hrs = Math.floor(min / 60);
    if (hrs < 24) return t("hoursAgo", { n: hrs });
    return t("daysAgo", { n: Math.floor(hrs / 24) });
  }

  const totalPages = Math.ceil(total / 50);

  const actionOptions = [
    { value: "", label: "allActions" },
    { value: "order.created", label: "actionOrderCreated" },
    { value: "order.status_changed", label: "actionOrderStatusChanged" },
    { value: "product.created", label: "actionProductCreated" },
    { value: "product.updated", label: "actionProductUpdated" },
    { value: "inventory.adjusted", label: "actionInventoryAdjusted" },
    { value: "user.created", label: "actionUserCreated" },
    { value: "user.login", label: "actionUserLogin" },
    { value: "shipment.created", label: "actionShipmentCreated" },
    { value: "settings.updated", label: "actionSettingsUpdated" },
  ];

  const entityOptions = [
    { value: "", label: "allEntities" },
    { value: "order", label: "entityOrder" },
    { value: "product", label: "entityProduct" },
    { value: "inventory", label: "entityInventory" },
    { value: "user", label: "entityUser" },
    { value: "warehouse", label: "entityWarehouse" },
    { value: "shipment", label: "entityShipment" },
  ];

  return (
    <div className="p-6 md:p-8 max-w-[1280px]">
      <h1 className="text-[28px] font-bold tracking-tight text-[#1D1D1F] mb-6">{t("title")}</h1>

      <div className="flex flex-wrap gap-4 mb-6">
        <select value={actionFilter} onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
          className="bg-white border border-black/5 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ed6d00]/20">
          {actionOptions.map((o) => <option key={o.value} value={o.value}>{t(o.label as any)}</option>)}
        </select>
        <select value={entityFilter} onChange={(e) => { setEntityFilter(e.target.value); setPage(1); }}
          className="bg-white border border-black/5 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ed6d00]/20">
          {entityOptions.map((o) => <option key={o.value} value={o.value}>{t(o.label as any)}</option>)}
        </select>
        <span className="text-sm text-[#86868B] self-center">{t("entriesCount", { n: total })}</span>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-black/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-medium text-[#86868B] border-b border-black/5">
                <th className="px-5 py-3.5">{t("actionLabel")}</th>
                <th className="px-5 py-3.5">{t("entityLabel")}</th>
                <th className="px-5 py-3.5">{t("entityIdLabel")}</th>
                <th className="px-5 py-3.5">{t("userLabel")}</th>
                <th className="px-5 py-3.5">{t("changesLabel")}</th>
                <th className="px-5 py-3.5 text-right">{t("timeLabel")}</th>
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
                  <td className="px-5 py-3 text-xs font-mono text-[#86868B]">{log.entity_id ? log.entity_id.slice(0, 8) + "..." : t("noChanges")}</td>
                  <td className="px-5 py-3 text-xs text-[#86868B]">{log.user_id ? log.user_id.slice(0, 8) + "..." : t("system")}</td>
                  <td className="px-5 py-3 text-xs text-[#1D1D1F] max-w-[200px] truncate">
                    {log.new_values ? formatJson(log.new_values) : log.old_values ? `← ${formatJson(log.old_values)}` : t("noChanges")}
                  </td>
                  <td className="px-5 py-3 text-xs text-[#86868B] text-right whitespace-nowrap">{timeAgo(log.created_at)}</td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr><td colSpan={6} className="px-5 py-12 text-center text-[#86868B] text-sm">{t("noEntries")}</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-black/5">
            <span className="text-xs text-[#86868B]">{t("page", { x: page, y: totalPages })}</span>
            <div className="flex gap-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                className="text-xs text-[#ed6d00] font-medium disabled:opacity-30">{t("prev")}</button>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="text-xs text-[#ed6d00] font-medium disabled:opacity-30">{t("next")}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
