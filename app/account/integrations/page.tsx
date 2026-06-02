"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { createBrowserClient } from "@/lib/supabase";

export default function AccountIntegrationsPage() {
  const [shop, setShop] = useState("");
  const [token, setToken] = useState("");
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [connectedShop, setConnectedShop] = useState<string | null>(null);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "testing" | "connecting" | "syncing">("idle");
  const [message, setMessage] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);

  const fetchStatus = useCallback(async (sessionToken: string) => {
    const res = await fetch("/api/account/integrations/shopify/status", {
      headers: { Authorization: `Bearer ${sessionToken}` },
    });

    const data = await res.json();
    if (res.ok) {
      setConnected(Boolean(data.connected));
      setConnectedShop(data.shop || null);
      setLastSync(data.lastSync || null);
      if (data.shop) setShop(data.shop);
    } else {
      setMessage({ type: "error", text: data.error || "Could not load Shopify status." });
    }
  }, []);

  const loadSessionAndStatus = useCallback(async () => {
    const supabase = createBrowserClient();
    if (!supabase) {
      setLoading(false);
      return;
    }

    const { data } = await supabase.auth.getSession();
    const sessionToken = data?.session?.access_token || null;
    setAccessToken(sessionToken);

    if (sessionToken) {
      await fetchStatus(sessionToken);
    }

    setLoading(false);
  }, [fetchStatus]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadSessionAndStatus();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadSessionAndStatus]);

  async function callShopify(action: "test" | "connect") {
    if (!accessToken) {
      setMessage({ type: "error", text: "Please log in before connecting a store." });
      return;
    }

    if (!shop.trim() || !token.trim()) {
      setMessage({ type: "error", text: "Please enter your Shopify store name and Admin API token." });
      return;
    }

    setStatus(action === "test" ? "testing" : "connecting");
    setMessage(null);

    const res = await fetch("/api/account/integrations/shopify/connect", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ action, shop: shop.trim(), access_token: token.trim() }),
    });

    const data = await res.json();
    if (res.ok) {
      if (action === "connect") {
        setConnected(true);
        setConnectedShop(data.shop || shop.trim());
        setToken("");
      }
      setMessage({
        type: "success",
        text: action === "test"
          ? `Connection works — ${data.shop}${data.plan ? ` (${data.plan})` : ""}.`
          : `Shopify connected — ${data.shop}.`,
      });
      await fetchStatus(accessToken);
    } else {
      setMessage({ type: "error", text: data.error || "Shopify connection failed." });
    }

    setStatus("idle");
  }

  async function syncShopify() {
    if (!accessToken) return;

    setStatus("syncing");
    setMessage(null);

    const res = await fetch("/api/account/integrations/shopify/sync", {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const data = await res.json();
    if (res.ok) {
      setLastSync(new Date().toISOString());
      setMessage({ type: "success", text: `Synced ${data.imported} recent Shopify orders for matching analysis.` });
    } else {
      setMessage({ type: "error", text: data.error || "Shopify sync failed." });
    }

    setStatus("idle");
  }

  if (loading) {
    return <div className="text-center py-12"><p className="text-text-secondary">Loading integrations...</p></div>;
  }

  if (!accessToken) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-text mb-2">Store Integrations</h1>
        <p className="text-text-secondary mb-6">Log in to connect your ecommerce store to Flowrid.</p>
        <Link href="/login" className="inline-block bg-primary text-white px-6 py-2.5 rounded-xl font-medium text-sm hover:bg-primary-dark transition-colors">
          Log in
        </Link>
      </div>
    );
  }

  const inputClass = "w-full px-4 py-3 border border-border rounded-xl bg-white text-text placeholder:text-text-secondary/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all";

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text mb-2">Store Integrations</h1>
        <p className="text-text-secondary">
          Connect your ecommerce stack so Flowrid can understand your order volume, SKU mix, and shipping zones before matching you with 3PLs.
        </p>
      </div>

      {message && (
        <div className={`mb-6 text-sm px-4 py-3 rounded-xl border ${
          message.type === "success" ? "text-success bg-success/5 border-success/20" :
          message.type === "error" ? "text-danger bg-danger/5 border-danger/20" :
          "text-primary bg-primary/5 border-primary/20"
        }`}>
          {message.text}
        </div>
      )}

      <section className="bg-card border border-border rounded-2xl p-6 mb-6">
        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            <h2 className="text-lg font-semibold text-text">Shopify</h2>
            <p className="text-sm text-text-secondary mt-1">
              Import recent orders as matching signals. Flowrid will not expose your token in the browser after saving.
            </p>
          </div>
          {connected && (
            <span className="inline-flex items-center gap-1.5 text-xs bg-success/10 text-success px-3 py-1 rounded-full font-medium shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-success" /> Connected
            </span>
          )}
        </div>

        <div className="bg-background border border-border rounded-xl p-4 mb-5 text-xs text-text-secondary space-y-1.5">
          <p className="font-semibold text-text text-sm mb-2">How to get your Shopify Admin API token:</p>
          <p>1. Shopify admin → <b>Settings</b> → <b>Apps and sales channels</b></p>
          <p>2. Click <b>Develop apps</b> → <b>Create an app</b></p>
          <p>3. Configure Admin API scopes: <code className="bg-black/5 px-1 rounded">read_orders</code>, <code className="bg-black/5 px-1 rounded">read_products</code></p>
          <p>4. Install the app and copy the Admin API access token that starts with <code className="bg-black/5 px-1 rounded">shpat_</code></p>
        </div>

        {connectedShop && (
          <div className="mb-4 text-sm text-text-secondary">
            Connected store: <span className="font-medium text-text">{connectedShop}.myshopify.com</span>
            {lastSync && <span className="block text-xs mt-1">Last sync: {new Date(lastSync).toLocaleString()}</span>}
          </div>
        )}

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="your-store-name"
              value={shop}
              onChange={(e) => setShop(e.target.value)}
              className={`${inputClass} flex-1`}
            />
            <span className="text-xs text-text-secondary shrink-0">.myshopify.com</span>
          </div>
          <input
            type="password"
            placeholder="shpat_xxxxxxxxxxxxxxxxxxxx"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            className={`${inputClass} font-mono`}
          />
        </div>

        <div className="flex flex-wrap gap-3 mt-5">
          <button
            onClick={() => callShopify("test")}
            disabled={status !== "idle"}
            className="px-5 py-2.5 rounded-xl text-sm font-medium border border-border text-text hover:border-primary hover:text-primary disabled:opacity-40 transition-colors"
          >
            {status === "testing" ? "Testing..." : "Test Connection"}
          </button>
          <button
            onClick={() => callShopify("connect")}
            disabled={status !== "idle"}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-primary text-white hover:bg-primary-dark disabled:opacity-40 transition-colors"
          >
            {status === "connecting" ? "Connecting..." : "Save & Connect"}
          </button>
          {connected && (
            <button
              onClick={syncShopify}
              disabled={status !== "idle"}
              className="px-5 py-2.5 rounded-xl text-sm font-medium bg-success/10 text-success hover:bg-success/20 disabled:opacity-40 transition-colors"
            >
              {status === "syncing" ? "Syncing..." : "Sync Now"}
            </button>
          )}
        </div>
      </section>

      <section className="bg-card border border-border rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-text mb-4">Other Integrations</h2>
        {[
          "Amazon Seller Central",
          "WooCommerce",
          "BigCommerce",
          "ShipStation",
          "QuickBooks",
          "EDI",
        ].map((name) => (
          <div key={name} className="flex items-center justify-between py-3 border-b border-border last:border-0">
            <p className="text-sm text-text">{name}</p>
            <span className="text-xs bg-background text-text-secondary px-3 py-1 rounded-full">Coming Soon</span>
          </div>
        ))}
      </section>
    </>
  );
}
