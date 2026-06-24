"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

export default function SettingsPage() {
  const t = useTranslations("saas");
  const [shop, setShop] = useState("");
  const [token, setToken] = useState("");
  const [status, setStatus] = useState<"idle"|"testing"|"connecting"|"syncing">("idle");
  const [message, setMessage] = useState<{type:"success"|"error"|"info";text:string}|null>(null);
  const [connected, setConnected] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);

  useEffect(() => { fetchStatus(); }, []);

  async function fetchStatus() {
    const res = await fetch("/api/saas/integrations/shopify/status");
    if (res.ok) {
      const d = await res.json();
      if (d.connected) { setConnected(true); setLastSync(d.lastSync); }
    }
  }

  async function handleTest() {
    if (!shop.trim() || !token.trim()) {
      setMessage({ type: "error", text: t("pleaseEnterStoreAndToken") });
      return;
    }
    setStatus("testing"); setMessage(null);
    const res = await fetch("/api/saas/integrations/shopify/connect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "test", shop: shop.trim(), access_token: token.trim() }),
    });
    const d = await res.json();
    if (res.ok) {
      setMessage({ type: "success", text: t("connectedStoreMsg", { shop: d.shop, plan: d.plan }) });
    } else {
      setMessage({ type: "error", text: d.error || t("connectionFailed") });
    }
    setStatus("idle");
  }

  async function handleConnect() {
    if (!shop.trim() || !token.trim()) return;
    setStatus("connecting"); setMessage(null);
    const res = await fetch("/api/saas/integrations/shopify/connect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "connect", shop: shop.trim(), access_token: token.trim() }),
    });
    const d = await res.json();
    if (res.ok) {
      setConnected(true);
      setMessage({ type: "success", text: t("shopifyConnectedMsg", { shop: d.shop }) });
    } else {
      setMessage({ type: "error", text: d.error || t("failed") });
    }
    setStatus("idle");
  }

  async function handleSync() {
    setStatus("syncing"); setMessage(null);
    const res = await fetch("/api/saas/integrations/shopify/sync", { method: "POST" });
    const d = await res.json();
    if (res.ok) {
      setLastSync(new Date().toISOString());
      setMessage({ type: "success", text: t("syncedOrdersMsg", { count: d.imported }) });
    } else {
      setMessage({ type: "error", text: d.error || t("syncFailed") });
    }
    setStatus("idle");
  }

  return (
    <div className="p-6 md:p-8 max-w-[1280px]">
      <h1 className="text-[28px] font-bold tracking-tight text-[#1D1D1F] mb-8">{t("saasSettings")}</h1>

      {message && (
        <div className={`mb-6 rounded-2xl p-4 text-sm font-medium ${
          message.type === "success" ? "bg-[#34C759]/10 text-[#34C759]" :
          message.type === "error" ? "bg-[#FF3B30]/10 text-[#FF3B30]" :
          "bg-[#ed6d00]/10 text-[#ed6d00]"
        }`}>{message.text}</div>
      )}

      <div className="space-y-6 max-w-2xl">
        {/* Shopify Integration */}
        <section className="bg-white rounded-2xl shadow-sm border border-black/5 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-[17px] font-semibold text-[#1D1D1F]">{t("shopifyIntegration")}</h2>
              <p className="text-xs text-[#86868B] mt-0.5">{t("autoSyncDesc")}</p>
            </div>
            {connected && (
              <span className="inline-flex items-center gap-1.5 text-[11px] bg-[#34C759]/10 text-[#34C759] px-2.5 py-0.5 rounded-full font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-[#34C759]" /> Connected
              </span>
            )}
          </div>

          {/* Step-by-step guide */}
          <div className="bg-[#F5F5F7] rounded-xl p-4 mb-4 text-xs text-[#86868B] space-y-1.5">
            <p className="font-semibold text-[#1D1D1F] text-sm mb-2">{t("howToGetShopifyToken")}</p>
            <p>{t("settingsGuideStep1")}</p>
            <p>{t("settingsGuideStep2")}</p>
            <p>{t("settingsGuideStep3")}</p>
            <p>{t("settingsGuideStep4")}</p>
            <p>{t("settingsGuideStep5")}</p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <input type="text" placeholder={t("integrations.yourStoreName")} value={shop}
                onChange={(e) => setShop(e.target.value)}
                className="flex-1 bg-[#F5F5F7] border-0 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ed6d00]/20" />
              <span className="text-xs text-[#86868B] shrink-0">.myshopify.com</span>
            </div>
            <input type="password" placeholder={t("integrations.shpatPlaceholder")} value={token}
              onChange={(e) => setToken(e.target.value)}
              className="w-full bg-[#F5F5F7] border-0 rounded-xl px-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#ed6d00]/20" />
          </div>

          <div className="flex gap-3 mt-4">
            <button onClick={handleTest} disabled={status !== "idle"}
              className="px-5 py-2.5 rounded-full text-sm font-medium border border-black/10 text-[#1D1D1F] hover:bg-black/[0.02] disabled:opacity-40 transition-colors">
              {status === "testing" ? t("testing") : t("testConnection")}
            </button>
            <button onClick={handleConnect} disabled={status !== "idle"}
              className="px-5 py-2.5 rounded-full text-sm font-semibold bg-[#ed6d00] text-white hover:bg-[#FF8A1F] disabled:opacity-40 transition-colors">
              {status === "connecting" ? t("connecting") : t("saveConnect")}
            </button>
            {connected && (
              <button onClick={handleSync} disabled={status !== "idle"}
                className="px-5 py-2.5 rounded-full text-sm font-medium bg-[#34C759]/10 text-[#34C759] hover:bg-[#34C759]/20 disabled:opacity-40 transition-colors">
                {status === "syncing" ? t("syncing") : t("syncNow")}
              </button>
            )}
          </div>

          {lastSync && (
            <p className="text-[11px] text-[#86868B] mt-3">{t("lastSync", { time: new Date(lastSync).toLocaleString() })}</p>
          )}
        </section>

        {/* Other Integrations */}
        <section className="bg-white rounded-2xl shadow-sm border border-black/5 p-6">
          <h2 className="text-[17px] font-semibold text-[#1D1D1F] mb-4">{t("otherIntegrations")}</h2>
          {[
            { name: "Amazon Seller Central", status: t("comingSoon") },
            { name: "TikTok Shop", status: t("comingSoon") },
            { name: "ShipStation", status: t("comingSoon") },
            { name: "QuickBooks", status: t("comingSoon") },
          ].map((i) => (
            <div key={i.name} className="flex items-center justify-between py-3 border-b border-black/[0.04] last:border-0">
              <p className="text-sm text-[#1D1D1F]">{i.name}</p>
              <span className="text-[11px] bg-black/[0.03] text-[#86868B] px-2.5 py-0.5 rounded-full">{i.status}</span>
            </div>
          ))}
        </section>

        {/* Warehouse Profile */}
        <section className="bg-white rounded-2xl shadow-sm border border-black/5 p-6">
          <h2 className="text-[17px] font-semibold text-[#1D1D1F] mb-4">{t("warehouseProfile")}</h2>
          <div className="grid gap-4">
            <Field label={t("company")} value="Demo Warehouse" />
            <Field label={t("email")} value="ops@demo-warehouse.com" />
            <Field label={t("warehouses")} value="3 active (Dallas, Los Angeles, Newark)" />
          </div>
        </section>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] font-medium text-[#86868B] uppercase tracking-wide mb-1">{label}</p>
      <p className="text-sm text-[#1D1D1F]">{value}</p>
    </div>
  );
}
