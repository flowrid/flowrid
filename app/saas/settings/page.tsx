"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

const INTEGRATIONS = [
  { name: "Shopify", key: "shopify", type: "shopping_cart", authUrl: "/api/saas/integrations/shopify/auth?shop=YOUR_STORE_NAME" },
  { name: "Amazon Seller Central", key: "amazon", type: "marketplace" },
  { name: "ShipStation", key: "shipstation", type: "shipping" },
  { name: "QuickBooks", key: "quickbooks", type: "erp" },
  { name: "NetSuite", key: "netsuite", type: "erp" },
];

export default function SettingsPage() {
  const [shopifyShop, setShopifyShop] = useState("");
  const [connecting, setConnecting] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const integrated = searchParams.get("integrated");
  const error = searchParams.get("error");

  function connectShopify() {
    if (!shopifyShop.trim()) return;
    const storeName = shopifyShop.trim().replace(".myshopify.com", "");
    window.location.href = `/api/saas/integrations/shopify/auth?shop=${storeName}`;
  }

  return (
    <div className="p-6 md:p-8 max-w-[1280px]">
      <h1 className="text-[28px] font-bold tracking-tight text-[#1D1D1F] mb-8">Settings</h1>

      {integrated === "shopify" && (
        <div className="mb-6 bg-[#34C759]/10 text-[#34C759] rounded-2xl p-4 text-sm font-medium">
          Shopify connected successfully! Orders will sync automatically.
        </div>
      )}
      {error && (
        <div className="mb-6 bg-[#FF3B30]/10 text-[#FF3B30] rounded-2xl p-4 text-sm font-medium">
          Connection failed. Please try again.
        </div>
      )}

      <div className="space-y-6 max-w-2xl">
        {/* Integrations */}
        <section className="bg-white rounded-2xl shadow-sm border border-black/5 p-6">
          <h2 className="text-[17px] font-semibold text-[#1D1D1F] mb-4">Integrations</h2>

          {/* Shopify — Working OAuth */}
          <div className="border border-black/5 rounded-xl p-4 mb-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#1D1D1F]">Shopify</p>
                <p className="text-xs text-[#86868B] mt-0.5">Sync orders, products, and tracking in real-time</p>
              </div>
              <span className="text-[11px] bg-[#FF9500]/10 text-[#FF9500] px-2 py-0.5 rounded-full font-medium">Available</span>
            </div>
            <div className="flex items-center gap-3 mt-3">
              <input
                type="text"
                placeholder="your-store-name"
                value={shopifyShop}
                onChange={(e) => setShopifyShop(e.target.value)}
                className="flex-1 bg-[#F5F5F7] border-0 rounded-xl px-4 py-2.5 text-sm text-[#1D1D1F] placeholder:text-[#86868B] focus:outline-none focus:ring-2 focus:ring-[#0071E3]/20"
              />
              <span className="text-xs text-[#86868B]">.myshopify.com</span>
              <button
                onClick={connectShopify}
                disabled={!shopifyShop.trim()}
                className="bg-[#0071E3] text-white px-4 py-2.5 rounded-full text-sm font-semibold hover:bg-[#0077ED] disabled:opacity-40 transition-colors shrink-0"
              >
                Connect
              </button>
            </div>
          </div>

          {/* Other integrations — coming soon */}
          {INTEGRATIONS.filter(i => i.key !== "shopify").map((int) => (
            <div key={int.key} className="flex items-center justify-between py-3 border-b border-black/[0.04] last:border-0">
              <div>
                <p className="text-sm text-[#1D1D1F]">{int.name}</p>
                <p className="text-[11px] text-[#86868B]">{int.type}</p>
              </div>
              <span className="text-[11px] bg-black/[0.03] text-[#86868B] px-2.5 py-0.5 rounded-full">Coming Soon</span>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
