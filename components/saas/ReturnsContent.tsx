"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { authedFetch } from "@/lib/authed-fetch";

interface Return {
  id: string;
  rma_number: string;
  reason?: string;
  condition?: string;
  disposition?: string;
  status: string;
  created_at?: string;
  orders?: { order_number: string; customer_name: string };
}

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-[#8E8E93]/10 text-[#8E8E93]",
  received: "bg-[#007AFF]/10 text-[#007AFF]",
  inspected: "bg-[#AF52DE]/10 text-[#AF52DE]",
  resolved: "bg-[#34C759]/10 text-[#34C759]",
};

export default function ReturnsContent() {
  const t = useTranslations("returnsContent");
  const [returns, setReturns] = useState<Return[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [stats, setStats] = useState({ total: 0, pending: 0 });

  // Create form
  const [creating, setCreating] = useState(false);
  const [createMsg, setCreateMsg] = useState<string | null>(null);
  const [orderNumber, setOrderNumber] = useState("");
  const [reason, setReason] = useState("");
  const [condition, setCondition] = useState("");

  async function fetchReturns() {
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);
      const r = await authedFetch(`/api/saas/returns?${params.toString()}`);
      if (!r.ok) throw new Error(`Request failed (${r.status})`);
      const d = await r.json();
      setReturns(d.data || []);
      setStats(d.stats || { total: 0, pending: 0 });
    } catch (e: any) {
      setError(e.message || t("failedToLoad"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchReturns(); }, [statusFilter]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!orderNumber.trim() || !reason.trim()) {
      setCreateMsg(t("orderNumberAndReasonRequired"));
      return;
    }
    setCreating(true);
    setCreateMsg(null);
    try {
      const r = await authedFetch("/api/saas/returns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_number: orderNumber.trim(), reason: reason.trim(), condition: condition || undefined }),
      });
      if (r.ok) {
        setOrderNumber(""); setReason(""); setCondition("");
        fetchReturns();
      } else {
        const err = await r.json();
        setCreateMsg(err.error || t("failedToCreate"));
      }
    } catch {
      setCreateMsg(t("networkError"));
    } finally {
      setCreating(false);
    }
  }

  async function updateStatus(id: string, newStatus: string) {
    setCreateMsg(null);
    try {
      const res = await authedFetch(`/api/saas/returns/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setCreateMsg(err.error || `Failed to update return (${res.status})`);
        return;
      }
      fetchReturns();
    } catch {
      setCreateMsg(t("networkError"));
    }
  }

  const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  if (loading) return <Skeleton />;
  if (error) return (
    <div className="p-8 text-center">
      <p className="text-[#FF3B30] text-sm mb-3">{error}</p>
      <button onClick={() => { setError(null); setLoading(true); fetchReturns(); }} className="text-sm text-[#ed6d00] font-medium">{t("retry")}</button>
    </div>
  );

  return (
    <div className="p-6 md:p-8 max-w-[1280px]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight text-[#1D1D1F]">{t("title")}</h1>
          <p className="text-[#86868B] text-sm mt-0.5">{stats.total} total · {stats.pending} pending</p>
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-white border border-black/5 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ed6d00]/20">
          <option value="">{t("allStatuses")}</option>
          <option value="pending">{t("pending")}</option>
          <option value="received">{t("received")}</option>
          <option value="inspected">{t("inspected")}</option>
          <option value="resolved">{t("resolved")}</option>
        </select>
      </div>

      {/* New RMA form */}
      <div className="mb-6 bg-white rounded-2xl shadow-sm border border-black/5 p-6">
        <h2 className="text-[15px] font-semibold text-[#1D1D1F] mb-4">{t("newReturn")}</h2>
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-medium text-[#86868B] uppercase tracking-wide mb-1">{t("orderNumber")}</label>
              <input type="text" value={orderNumber} onChange={(e) => setOrderNumber(e.target.value)} placeholder={t("orderNumberPlaceholder")} className="w-full bg-[#F5F5F7] border-0 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ed6d00]/20" />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-[#86868B] uppercase tracking-wide mb-1">{t("reasonRequired")}</label>
              <input type="text" value={reason} onChange={(e) => setReason(e.target.value)} placeholder={t("reasonPlaceholder")} className="w-full bg-[#F5F5F7] border-0 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ed6d00]/20" />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-[#86868B] uppercase tracking-wide mb-1">{t("condition")}</label>
              <select value={condition} onChange={(e) => setCondition(e.target.value)} className="w-full bg-[#F5F5F7] border-0 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ed6d00]/20">
                <option value="">—</option>
                <option value="resellable">{t("conditionResellable")}</option>
                <option value="damaged">{t("conditionDamaged")}</option>
                <option value="defective">{t("conditionDefective")}</option>
                <option value="expired">{t("conditionExpired")}</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button type="submit" disabled={creating} className="bg-[#ed6d00] text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-[#FF8A1F] disabled:opacity-50 transition-colors">
              {creating ? t("creating") : t("createRMA")}
            </button>
            {createMsg && <span className="text-xs text-[#FF3B30]">{createMsg}</span>}
          </div>
        </form>
      </div>

      {/* Returns list */}
      <div className="bg-white rounded-2xl shadow-sm border border-black/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-medium text-[#86868B] border-b border-black/5">
                <th className="px-5 py-3.5">{t("rmaCol")}</th>
                <th className="px-5 py-3.5">{t("orderCol")}</th>
                <th className="px-5 py-3.5">{t("customerCol")}</th>
                <th className="px-5 py-3.5">{t("reasonCol")}</th>
                <th className="px-5 py-3.5">Condition</th>
                <th className="px-5 py-3.5">{t("statusCol")}</th>
                <th className="px-5 py-3.5 text-right">{t("actionCol")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.04]">
              {returns.map((r) => (
                <tr key={r.id} className="hover:bg-black/[0.01]">
                  <td className="px-5 py-3.5 text-sm font-medium text-[#1D1D1F]">{r.rma_number}</td>
                  <td className="px-5 py-3.5 text-sm text-[#86868B]">{r.orders?.order_number || "—"}</td>
                  <td className="px-5 py-3.5 text-sm text-[#1D1D1F]">{r.orders?.customer_name || "—"}</td>
                  <td className="px-5 py-3.5 text-sm text-[#86868B] max-w-[200px] truncate">{r.reason || "—"}</td>
                  <td className="px-5 py-3.5 text-sm text-[#86868B]">{r.condition ? cap(r.condition) : "—"}</td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-medium ${STATUS_STYLES[r.status] || ""}`}>{cap(r.status)}</span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    {r.status === "pending" && (
                      <button onClick={() => updateStatus(r.id, "received")} className="text-xs text-[#ed6d00] font-medium hover:text-[#FF8A1F] mr-3">{t("markReceived")}</button>
                    )}
                    {r.status === "received" && (
                      <button onClick={() => updateStatus(r.id, "resolved")} className="text-xs text-[#34C759] font-medium hover:text-[#30D158] mr-3">{t("resolve")}</button>
                    )}
                  </td>
                </tr>
              ))}
              {returns.length === 0 && (
                <tr><td colSpan={7} className="px-5 py-12 text-center text-[#86868B] text-sm">{t("noReturns")}</td></tr>
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
