"use client";

/**
 * Brand Automation Center v2
 *
 * 借鉴 OpenWMS TMS Routing (BPMN 规则引擎) + Ever Demand 多端通知
 * - 真实数据驱动：从 Supabase 加载规则和日志
 * - 预置模板：一键启用的自动化场景
 * - 工具推荐：链接到 /tools/automation-integration
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { createBrowserClient } from "@/lib/supabase";
import { useTranslations } from "next-intl";

interface AutomationRule {
  id: string;
  name: string;
  trigger_event: string;
  is_active: boolean;
  last_triggered_at: string | null;
  created_at: string;
}

interface AutomationLog {
  id: string;
  rule_name?: string;
  event: string;
  entity_id: string;
  success: boolean;
  error?: string;
  created_at: string;
}

const PRESET_TEMPLATES = [
  {
    trigger: "order.created",
    action: "send_notification",
    titleKey: "templates.orderCreated.title",
    descKey: "templates.orderCreated.desc",
    icon: "📦",
  },
  {
    trigger: "inventory.low_stock",
    action: "send_notification",
    titleKey: "templates.lowStock.title",
    descKey: "templates.lowStock.desc",
    icon: "⚠️",
  },
  {
    trigger: "shipment.delivered",
    action: "send_notification",
    titleKey: "templates.shipmentDelivered.title",
    descKey: "templates.shipmentDelivered.desc",
    icon: "✅",
  },
  {
    trigger: "order.shipped",
    action: "shopify.export_shipment",
    titleKey: "templates.shopifySync.title",
    descKey: "templates.shopifySync.desc",
    icon: "🔄",
  },
];

const TRIGGER_LABELS: Record<string, string> = {
  "order.created": "Order Created",
  "order.status_changed": "Order Status Changed",
  "order.shipped": "Order Shipped",
  "inventory.low_stock": "Low Stock",
  "inventory.out_of_stock": "Out of Stock",
  "shipment.delivered": "Shipment Delivered",
  "return.created": "Return Created",
  "pick_task.completed": "Pick Completed",
};

export default function AccountAutomationPage() {
  const t = useTranslations();
  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [logs, setLogs] = useState<AutomationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    async function load() {
      const supabase = createBrowserClient();
      if (!supabase) { setLoading(false); return; }
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData?.session?.user?.id;
      if (!userId) { setLoading(false); return; }

      try {
        // 加载规则
        const { data: rulesData } = await supabase
          .from("automation_rules")
          .select("*")
          .eq("tenant_id", userId)
          .order("created_at", { ascending: false })
          .limit(20);
        setRules((rulesData || []) as AutomationRule[]);

        // 加载日志
        const { data: logsData } = await supabase
          .from("automation_logs")
          .select("*")
          .eq("tenant_id", userId)
          .order("created_at", { ascending: false })
          .limit(10);
        setLogs((logsData || []) as AutomationLog[]);
      } catch {} finally { setLoading(false); }
    }
    load();
  }, []);

  async function createFromTemplate(trigger: string, action: string, name: string) {
    setCreating(true);
    setMsg(null);
    try {
      const supabase = createBrowserClient();
      if (!supabase) throw new Error("DB unavailable");
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData?.session?.user?.id;

      const res = await fetch("/api/saas/automation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          trigger,
          conditions: [],
          actions: [{ type: action, config: { notification_type: "info" } }],
          tenant_id: userId,
        }),
      });

      if (res.ok) {
        setMsg({ type: "success", text: "Template activated! You can customize it below." });
        // Refresh rules
        const { data: rulesData } = await supabase
          .from("automation_rules")
          .select("*")
          .eq("tenant_id", userId)
          .order("created_at", { ascending: false })
          .limit(20);
        setRules((rulesData || []) as AutomationRule[]);
      } else {
        const err = await res.json();
        setMsg({ type: "error", text: err.error || "Failed to create rule" });
      }
    } catch (e: any) {
      setMsg({ type: "error", text: e.message });
    } finally { setCreating(false); }
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 w-48 bg-black/5 rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-white/50 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  const activeRules = rules.filter((r) => r.is_active);
  const todayTriggers = logs.filter((l) => {
    const today = new Date().toDateString();
    return new Date(l.created_at).toDateString() === today;
  });

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">{t("account.growth")}</p>
        <h1 className="mt-2 text-[28px] font-bold tracking-tight text-text">{t("account.automation.title")}</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-text-secondary">
          Automate your brand operations. Rules trigger when events happen — like when an order ships or inventory runs low.
        </p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard value={rules.length} label="Total Rules" sub={`${activeRules.length} active`} accent="primary" />
        <MetricCard value={logs.length} label="Total Executions" sub="all time" accent="neutral" />
        <MetricCard value={todayTriggers.length} label="Today's Triggers" sub={new Date().toLocaleDateString()} accent="success" />
        <MetricCard value={logs.filter((l) => !l.success).length} label="Errors" sub="needs attention" accent={logs.filter((l) => !l.success).length > 0 ? "danger" : "success"} />
      </div>

      {msg && (
        <div className={`mb-6 text-sm px-4 py-3 rounded-xl border ${msg.type === "success" ? "text-[#34C759] bg-[#34C759]/5 border-[#34C759]/20" : "text-[#FF3B30] bg-[#FF3B30]/5 border-[#FF3B30]/20"}`}>
          {msg.text}
        </div>
      )}

      {/* Quick Start Templates */}
      <section className="mb-8">
        <h2 className="text-lg font-bold text-text mb-4">Quick Start Templates</h2>
        <p className="text-sm text-text-secondary mb-4">One-click setup for the most common automation scenarios.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {PRESET_TEMPLATES.map((tmpl) => {
            const alreadyExists = rules.some((r) => r.trigger_event === tmpl.trigger);
            return (
              <div key={tmpl.trigger} className={`bg-white border rounded-2xl p-4 flex items-center gap-4 transition-all ${alreadyExists ? "border-[#34C759]/30 bg-[#34C759]/[0.02]" : "border-black/5 hover:border-primary/30"}`}>
                <span className="text-2xl shrink-0">{tmpl.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-text">{t(tmpl.titleKey) || tmpl.titleKey}</p>
                  <p className="text-xs text-text-secondary mt-0.5">{t(tmpl.descKey) || tmpl.descKey}</p>
                </div>
                <button
                  onClick={() => createFromTemplate(tmpl.trigger, tmpl.action, t(tmpl.titleKey) || tmpl.trigger)}
                  disabled={creating || alreadyExists}
                  className={`shrink-0 text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${alreadyExists ? "bg-[#34C759]/10 text-[#34C759] cursor-default" : "bg-primary text-white hover:bg-primary-dark disabled:opacity-50"}`}
                >
                  {alreadyExists ? "Active" : creating ? "..." : "Enable"}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Existing Rules */}
      <section className="mb-8">
        <h2 className="text-lg font-bold text-text mb-4">Your Rules</h2>
        {rules.length === 0 ? (
          <div className="bg-gray-50 border border-dashed border-border rounded-2xl p-8 text-center">
            <p className="text-text-secondary">No rules yet. Enable a template above to get started.</p>
          </div>
        ) : (
          <div className="bg-white border border-black/5 rounded-2xl overflow-hidden">
            <table className="w-full">
              <thead><tr className="text-left text-xs font-medium text-text-secondary border-b border-black/5">
                <th className="px-4 py-3">Name</th><th className="px-4 py-3">Trigger</th>
                <th className="px-4 py-3">Status</th><th className="px-4 py-3">Last Triggered</th>
              </tr></thead>
              <tbody className="divide-y divide-black/[0.04]">
                {rules.map((rule) => (
                  <tr key={rule.id}>
                    <td className="px-4 py-3 text-sm font-medium text-text">{rule.name}</td>
                    <td className="px-4 py-3 text-xs font-mono text-text-secondary">{TRIGGER_LABELS[rule.trigger_event] || rule.trigger_event}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${rule.is_active ? "bg-[#34C759]/10 text-[#34C759]" : "bg-gray-100 text-text-secondary"}`}>
                        {rule.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-text-secondary">
                      {rule.last_triggered_at ? new Date(rule.last_triggered_at).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "Never"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Recent Activity */}
      {logs.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-bold text-text mb-4">Recent Activity</h2>
          <div className="bg-white border border-black/5 rounded-2xl overflow-hidden">
            <div className="divide-y divide-black/[0.04] max-h-64 overflow-y-auto">
              {logs.slice(0, 10).map((log) => (
                <div key={log.id} className="px-4 py-2.5 flex items-center gap-3 text-xs">
                  <span className={log.success ? "text-[#34C759]" : "text-[#FF3B30]"}>{log.success ? "✓" : "✗"}</span>
                  <span className="text-text-secondary font-mono">{log.event}</span>
                  <span className="text-text-secondary/60 truncate">{log.entity_id}</span>
                  {log.error && <span className="text-[#FF3B30] truncate ml-auto">{log.error}</span>}
                  <span className="text-text-secondary/40 ml-auto shrink-0">{new Date(log.created_at).toLocaleTimeString()}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Tool Recommendations */}
      <section className="bg-white border border-black/5 rounded-2xl p-6">
        <h2 className="text-lg font-bold text-text mb-2">Need More Power?</h2>
        <p className="text-sm text-text-secondary mb-4">
          Flowrid's built-in automations cover essential logistics events. For advanced multi-step workflows across your entire ecommerce stack, these tools can help.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="/tools/automation-integration" className="text-sm px-4 py-2 rounded-xl bg-primary/10 text-primary font-medium hover:bg-primary/20 transition-colors">
            Compare Automation Tools →
          </Link>
          <Link href="/tools/order-management" className="text-sm px-4 py-2 rounded-xl bg-gray-100 text-text-secondary font-medium hover:bg-gray-200 transition-colors">
            Order Management Tools →
          </Link>
        </div>
      </section>
    </div>
  );
}

function MetricCard({ value, label, sub, accent }: { value: number; label: string; sub: string; accent: string }) {
  const colors: Record<string, string> = {
    primary: "text-primary",
    neutral: "text-text",
    success: "text-[#34C759]",
    danger: "text-[#FF3B30]",
  };
  return (
    <div className="bg-white rounded-2xl border border-black/5 p-5 shadow-sm">
      <p className={`text-2xl font-bold ${colors[accent] || colors.neutral}`}>{value}</p>
      <p className="text-[11px] font-medium text-text-secondary uppercase tracking-wide mt-1">{label}</p>
      <p className="text-[10px] text-text-secondary/60 mt-0.5">{sub}</p>
    </div>
  );
}
