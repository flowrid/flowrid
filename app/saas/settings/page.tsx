"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";

export default function SettingsPage() {
  const [shop, setShop] = useState("");
  const [token, setToken] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const searchParams = useSearchParams();

  async function connectToken() {
    if (!shop.trim() || !token.trim()) return;
    setStatus("connecting");

    const res = await fetch("/api/saas/integrations/shopify/connect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shop: shop.trim(), access_token: token.trim() }),
    });

    if (res.ok) {
      setStatus("connected");
    } else {
      setStatus("failed");
    }
  }

  return (
    <div className="p-6 md:p-8 max-w-[1280px]">
      <h1 className="text-[28px] font-bold tracking-tight text-[#1D1D1F] mb-8">Settings</h1>

      {status === "connected" && (
        <div className="mb-6 bg-[#34C759]/10 text-[#34C759] rounded-2xl p-4 text-sm font-medium">
          Shopify connected successfully!
        </div>
      )}
      {status === "failed" && (
        <div className="mb-6 bg-[#FF3B30]/10 text-[#FF3B30] rounded-2xl p-4 text-sm font-medium">
          Connection failed. Check your store name and token.
        </div>
      )}

      <div className="space-y-6 max-w-2xl">
        <section className="bg-white rounded-2xl shadow-sm border border-black/5 p-6">
          <h2 className="text-[17px] font-semibold text-[#1D1D1F] mb-4">Integrations</h2>

          {/* Shopify — API Token */}
          <div className="border border-black/5 rounded-xl p-4 mb-3">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-medium text-[#1D1D1F]">Shopify</p>
                <p className="text-xs text-[#86868B] mt-0.5">Connect via Admin API token — instant, no OAuth setup required</p>
              </div>
              <span className="text-[11px] bg-[#34C759]/10 text-[#34C759] px-2 py-0.5 rounded-full font-medium">Token Mode</span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="your-store-name"
                  value={shop}
                  onChange={(e) => setShop(e.target.value)}
                  className="flex-1 bg-[#F5F5F7] border-0 rounded-xl px-4 py-2.5 text-sm text-[#1D1D1F] placeholder:text-[#86868B] focus:outline-none focus:ring-2 focus:ring-[#0071E3]/20"
                />
                <span className="text-xs text-[#86868B] shrink-0">.myshopify.com</span>
              </div>
              <input
                type="password"
                placeholder="Admin API access token (shpat_...)"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="w-full bg-[#F5F5F7] border-0 rounded-xl px-4 py-2.5 text-sm text-[#1D1D1F] placeholder:text-[#86868B] focus:outline-none focus:ring-2 focus:ring-[#0071E3]/20 font-mono"
              />
            </div>

            <div className="mt-3 p-3 bg-[#F5F5F7] rounded-xl text-[11px] text-[#86868B] leading-relaxed">
              Create a custom app at <b>vikenplan.myshopify.com/admin/settings/apps/development</b> →
              Create an app → Configure Admin API scopes → Check <b>read_orders</b>, <b>write_orders</b>, <b>read_products</b> →
              Install app → Copy the Admin API access token
            </div>

            <button
              onClick={connectToken}
              disabled={!shop.trim() || !token.trim() || status === "connecting"}
              className="mt-3 w-full bg-[#0071E3] text-white py-2.5 rounded-full text-sm font-semibold hover:bg-[#0077ED] disabled:opacity-40 transition-colors"
            >
              {status === "connecting" ? "Connecting..." : "Connect Shopify"}
            </button>
          </div>

          {/* Other integrations */}
          {[
            { name: "Amazon Seller Central", type: "marketplace" },
            { name: "ShipStation", type: "shipping" },
            { name: "QuickBooks", type: "erp" },
          ].map((i) => (
            <div key={i.name} className="flex items-center justify-between py-3 border-b border-black/[0.04] last:border-0">
              <div><p className="text-sm text-[#1D1D1F]">{i.name}</p><p className="text-[11px] text-[#86868B]">{i.type}</p></div>
              <span className="text-[11px] bg-black/[0.03] text-[#86868B] px-2.5 py-0.5 rounded-full">Coming Soon</span>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
