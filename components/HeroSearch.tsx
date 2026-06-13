"use client";

import { useState } from "react";

/**
 * Hero Search — 首页搜索入口
 */
export default function HeroSearch() {
  const [product, setProduct] = useState("");
  const [state, setState] = useState("");
  const [platform, setPlatform] = useState("");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();

    const params = new URLSearchParams();
    if (product) params.set("category", product.toLowerCase());
    if (state) params.set("state", state.toLowerCase());
    if (platform) params.set("platform", platform.toLowerCase());

    const queryString = params.toString();

    if (state && product && platform) {
      window.location.href = `/3pl/${state.toLowerCase()}/${product.toLowerCase()}/${platform.toLowerCase()}`;
    } else if (state && product) {
      window.location.href = `/3pl/${state.toLowerCase()}/${product.toLowerCase()}`;
    } else if (state) {
      window.location.href = `/3pl/${state.toLowerCase()}`;
    } else {
      window.location.href = `/3pl${queryString ? `?${queryString}` : ""}`;
    }
  }

  return (
    <section className="text-center py-16 md:py-24 px-4 max-w-3xl mx-auto">
      <h1 className="text-3xl md:text-5xl font-bold text-text leading-tight">
        You&apos;re not just choosing a 3PL—{" "}
        <span className="text-primary">you&apos;re choosing certainty</span>
      </h1>
      <p className="mt-4 text-lg text-text-secondary max-w-xl mx-auto">
        Compare top fulfillment centers by state, product category, and platform.
        Get matched in seconds.
      </p>

      <form
        onSubmit={handleSearch}
        className="mt-8 flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto"
      >
        <input
          type="text"
          placeholder="Product type (e.g. apparel)"
          value={product}
          onChange={(e) => setProduct(e.target.value)}
          className="flex-1 border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-card"
        />
        <input
          type="text"
          placeholder="State (e.g. Texas)"
          value={state}
          onChange={(e) => setState(e.target.value)}
          className="flex-1 border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-card"
        />
        <input
          type="text"
          placeholder="Platform (Shopify)"
          value={platform}
          onChange={(e) => setPlatform(e.target.value)}
          className="flex-1 border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-card"
        />
        <button
          type="submit"
          className="bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors shrink-0"
        >
          Search
        </button>
      </form>

      {/* Quick Links */}
      <div className="mt-6 flex flex-wrap justify-center gap-2 text-sm text-text-secondary">
        <span>Popular:</span>
        <a
          href="/3pl/california/apparel/shopify"
          className="text-primary hover:underline"
        >
          California Apparel
        </a>
        <span>&middot;</span>
        <a
          href="/3pl/texas/jewelry/tiktok"
          className="text-primary hover:underline"
        >
          Texas Jewelry
        </a>
        <span>&middot;</span>
        <a
          href="/3pl/florida/beauty/amazon"
          className="text-primary hover:underline"
        >
          Florida Beauty
        </a>
      </div>
    </section>
  );
}
