"use client";

// 自动化规则引擎

import { useEffect, useState } from "react";

const TRIGGERS = [
  "order.created", "order.status_changed", "order.shipped",
  "inventory.low_stock", "inventory.out_of_stock",
  "shipment.delivered", "return.created", "pick_task.completed",
];

const ACTION_TYPES = ["send_notification", "update_order_status", "create_task", "webhook"];

export default function AutomationPage() {
  const [rules, setRules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Create form
  const [name, setName] = useState("");
  const [trigger, setTrigger] = useState("order.created");
  const [actions, setActions] = useState<any[]>([{ type: "send_notification", config: {} }]);
  const [creating, setCreating] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function fetchRules() {
    try {
      const r = await fetch("/api/saas/automation");
      const d = await r.json();
      setRules(d.data || []);
    } catch {} finally { setLoading(false); }
  }

  useEffect(() => { fetchRules(); }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setCreating(true);
    setMsg(null);
    try {
      const r = await fetch("/api/saas/automation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), trigger, conditions: [], actions }),
      });
      if (r.ok) {
        setName(""); setTrigger("order.created"); setActions([{ type: "send_notification", config: {} }]);
        fetchRules();
        setMsg("Rule created");
      } else {
        const err = await r.json();
        setMsg(err.error || "Failed");
      }
    } catch { setMsg("Network error"); }
    finally { setCreating(false); }
  }

  async function toggleRule(rule: any) {
    await fetch(`/api/saas/automation/${rule.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !rule.is_active }),
    });
    fetchRules();
  }

  async function deleteRule(id: string) {
    await fetch(`/api/saas/automation/${id}`, { method: "DELETE" });
    fetchRules();
  }

  return (
    <div className="p-6 md:p-8 max-w-[1280px]">
      <h1 className="text-[28px] font-bold tracking-tight text-[#1D1D1F] mb-6">Automation Rules</h1>

      <div className="mb-6 bg-white rounded-2xl shadow-sm border border-black/5 p-6">
        <h2 className="text-[15px] font-semibold text-[#1D1D1F] mb-4">New Rule</h2>
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-medium text-[#86868B] uppercase mb-1">Rule Name *</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Auto-ship confirmation"
                className="w-full bg-[#F5F5F7] border-0 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ed6d00]/20" />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-[#86868B] uppercase mb-1">Trigger Event</label>
              <select value={trigger} onChange={(e) => setTrigger(e.target.value)}
                className="w-full bg-[#F5F5F7] border-0 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ed6d00]/20">
                {TRIGGERS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button type="submit" disabled={creating}
              className="bg-[#ed6d00] text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-[#FF8A1F] disabled:opacity-50 transition-colors">
              {creating ? "Creating..." : "Create Rule"}
            </button>
            {msg && <span className={`text-xs ${msg === "Rule created" ? "text-[#34C759]" : "text-[#FF3B30]"}`}>{msg}</span>}
          </div>
        </form>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-black/5 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="text-left text-xs font-medium text-[#86868B] border-b border-black/5">
              <th className="px-5 py-3.5">Name</th>
              <th className="px-5 py-3.5">Trigger</th>
              <th className="px-5 py-3.5">Status</th>
              <th className="px-5 py-3.5">Last Triggered</th>
              <th className="px-5 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/[0.04]">
            {rules.map((rule: any) => (
              <tr key={rule.id}>
                <td className="px-5 py-3.5 text-sm font-medium text-[#1D1D1F]">{rule.name}</td>
                <td className="px-5 py-3.5 text-xs font-mono text-[#86868B]">{rule.trigger_event}</td>
                <td className="px-5 py-3.5">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${rule.is_active ? "bg-[#34C759]/10 text-[#34C759]" : "bg-[#8E8E93]/10 text-[#8E8E93]"}`}>
                    {rule.is_active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-xs text-[#86868B]">
                  {rule.last_triggered_at ? new Date(rule.last_triggered_at).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "Never"}
                </td>
                <td className="px-5 py-3.5 text-right space-x-2">
                  <button onClick={() => toggleRule(rule)} className="text-xs text-[#ed6d00] font-medium">{rule.is_active ? "Disable" : "Enable"}</button>
                  <button onClick={() => deleteRule(rule.id)} className="text-xs text-[#FF3B30] font-medium">Delete</button>
                </td>
              </tr>
            ))}
            {rules.length === 0 && (
              <tr><td colSpan={5} className="px-5 py-12 text-center text-[#86868B] text-sm">No automation rules yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
