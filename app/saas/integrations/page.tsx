"use client";

/**
 * SaaS Integration Hub — 平台连接中心
 *
 * 借鉴 OpenWMS Common Services 层：
 *   - 平台连接器目录（29 个平台）
 *   - 已连接 vs 可连接状态可视化
 *   - 每个平台的同步状态管理
 */

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { PLATFORM_CATALOG } from "@/lib/saas-integration-hub";
import type { IntegrationConnection, PlatformType } from "@/types/saas";

const PLATFORM_ICONS: Record<string, string> = {
  shopping_cart: "🛒",
  marketplace: "🏪",
  erp: "🏢",
  oms: "📋",
  wms: "🏭",
  shipping: "🚚",
  edi: "📄",
  crm: "🤝",
  pos: "💳",
  custom: "🔧",
};

const PLATFORM_LABELS: Record<string, string> = {
  shopping_cart: "Shopping Carts",
  marketplace: "Marketplaces",
  erp: "ERP Systems",
  oms: "Order Management",
  wms: "Warehouse Management",
  shipping: "Shipping Platforms",
  edi: "EDI / Compliance",
  crm: "CRM",
  pos: "Point of Sale",
  custom: "Custom",
};

export default function SaasIntegrationsPage() {
  const t = useTranslations();
  const [connections, setConnections] = useState<IntegrationConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<PlatformType | "all">("all");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/saas/integrations");
        if (res.ok) {
          const data = await res.json();
          setConnections(data.connections || []);
        }
      } catch {} finally { setLoading(false); }
    }
    load();
  }, []);

  const connectedMap = new Map(connections.map((c) => [c.platform_name.toLowerCase(), c]));

  const platformTypes = Object.keys(PLATFORM_CATALOG) as PlatformType[];
  const filteredTypes = activeTab === "all" ? platformTypes : [activeTab];

  const totalPlatforms = platformTypes.reduce((sum, type) => sum + PLATFORM_CATALOG[type].length, 0);
  const connectedCount = connections.length;

  if (loading) {
    return (
      <div className="p-6 md:p-8 max-w-[1280px]">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-black/5 rounded-xl" />
          <div className="h-4 w-64 bg-black/5 rounded-xl" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
            {[...Array(6)].map((_, i) => <div key={i} className="h-32 bg-white/50 rounded-2xl" />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-[1280px]">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-[28px] font-bold tracking-tight text-[#1D1D1F]">{t("saas.integrations") || "Integrations"}</h1>
        <p className="text-[#86868B] text-sm mt-1">
          {connectedCount} of {totalPlatforms} platforms connected
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard value={connectedCount} label="Connected" accent="green" />
        <StatCard value={totalPlatforms - connectedCount} label="Available" accent="blue" />
        <StatCard value={totalPlatforms} label="Total Platforms" accent="neutral" />
        <StatCard value={connections.filter(c => c.is_active).length} label="Active Sync" accent="amber" />
      </div>

      {/* Tab Filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setActiveTab("all")}
          className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${activeTab === "all" ? "bg-[#ed6d00] text-white" : "bg-gray-100 text-text-secondary hover:bg-gray-200"}`}
        >
          All ({totalPlatforms})
        </button>
        {platformTypes.map((type) => (
          <button
            key={type}
            onClick={() => setActiveTab(type)}
            className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${activeTab === type ? "bg-[#ed6d00] text-white" : "bg-gray-100 text-text-secondary hover:bg-gray-200"}`}
          >
            {PLATFORM_ICONS[type]} {PLATFORM_LABELS[type]}
          </button>
        ))}
      </div>

      {/* Platform Grid */}
      {filteredTypes.map((type) => {
        const platforms = PLATFORM_CATALOG[type];
        if (!platforms?.length) return null;

        return (
          <div key={type} className="mb-8">
            <h2 className="text-[15px] font-semibold text-[#1D1D1F] mb-3 flex items-center gap-2">
              <span>{PLATFORM_ICONS[type]}</span>
              <span>{PLATFORM_LABELS[type]}</span>
              <span className="text-xs text-text-secondary font-normal">({platforms.length})</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {platforms.map((p) => {
                const conn = connectedMap.get(p.name.toLowerCase());
                const isConnected = !!conn;
                const isActive = conn?.is_active;

                return (
                  <div
                    key={`${p.type}-${p.name}`}
                    className={`bg-white rounded-2xl border p-4 transition-all ${isConnected ? "border-[#34C759]/30 bg-[#34C759]/[0.02]" : "border-black/5 hover:border-primary/30"}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2.5">
                        <span className="text-lg">{PLATFORM_ICONS[p.type]}</span>
                        <div>
                          <p className="text-sm font-semibold text-[#1D1D1F]">{p.name}</p>
                          <p className="text-[10px] text-text-secondary">
                            {p.supports.map((s) => s.replace(/_/g, " ")).slice(0, 2).join(" · ")}
                          </p>
                        </div>
                      </div>
                      <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${isConnected ? (isActive ? "bg-[#34C759]/10 text-[#34C759]" : "bg-[#FF9500]/10 text-[#FF9500]") : "bg-gray-100 text-text-secondary"}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? (isActive ? "bg-[#34C759]" : "bg-[#FF9500]") : "bg-text-secondary"}`} />
                        {isConnected ? (isActive ? "Active" : "Paused") : "Available"}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 mt-3">
                      {isConnected ? (
                        <>
                          <button className="text-[10px] text-[#ed6d00] font-medium hover:underline">Configure</button>
                          <span className="text-text-secondary/40">·</span>
                          <button className="text-[10px] text-text-secondary font-medium hover:text-[#FF3B30]">Disconnect</button>
                          {conn?.last_sync_at && (
                            <span className="text-[10px] text-text-secondary/60 ml-auto">
                              Last sync: {new Date(conn.last_sync_at).toLocaleDateString()}
                            </span>
                          )}
                        </>
                      ) : (
                        <button className="text-[11px] px-3 py-1.5 bg-[#ed6d00] text-white rounded-lg font-medium hover:bg-[#FF8A1F] transition-colors">
                          Connect
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* API Access Section — OpenWMS style adapter pattern */}
      <div className="mt-8 bg-white rounded-2xl border border-black/5 p-6">
        <h2 className="text-[15px] font-semibold text-[#1D1D1F] mb-2">API Access</h2>
        <p className="text-sm text-text-secondary mb-4">
          Use the Flowrid Integration Hub API to build custom connectors. REST + Webhook endpoints available.
        </p>
        <div className="flex items-center gap-3">
          <code className="text-xs bg-gray-50 px-3 py-2 rounded-lg font-mono text-text-secondary">
            POST /api/saas/integrations/webhook
          </code>
          <button className="text-xs text-[#ed6d00] font-medium hover:underline">View API Docs →</button>
        </div>
      </div>
    </div>
  );
}

function StatCard({ value, label, accent }: { value: number; label: string; accent: string }) {
  const colors: Record<string, string> = {
    green: "text-[#34C759]",
    blue: "text-[#ed6d00]",
    amber: "text-[#FF9500]",
    neutral: "text-[#1D1D1F]",
  };
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-black/5">
      <p className={`text-[28px] font-bold tracking-tight ${colors[accent] || colors.neutral}`}>{value}</p>
      <p className="text-[11px] font-medium text-[#86868B] uppercase tracking-wide mt-1">{label}</p>
    </div>
  );
}
