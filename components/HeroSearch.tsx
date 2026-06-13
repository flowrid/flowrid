"use client";

import { useState } from "react";

const HERO_IMAGES = [
  { src: "/images/hero/Perfect 3PL Match.webp", alt: "Perfect 3PL Match" },
  { src: "/images/hero/Full-Network Comparison.webp", alt: "Full-Network Comparison" },
  { src: "/images/hero/Warehouse Fit.webp", alt: "Warehouse Fit" },
  { src: "/images/hero/Guaranteed Logistics Stabillty.webp", alt: "Guaranteed Logistics Stability" },
];

/**
 * Hero Search — 首页首屏 + 搜索区域
 * 首屏：左文案 + 右 2×2 图片
 * 第二屏：搜索栏
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
    <>
      {/* ──── 首屏：左右布局 ──── */}
      <section className="max-w-[1460px] mx-auto px-4 py-16 md:py-24">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          {/* 左侧：文案 + 按钮 */}
          <div className="flex-1 text-center lg:text-left">
            <h1 className="text-3xl md:text-5xl font-bold text-text leading-tight">
              You&apos;re not just choosing a 3PL{" "}
              <span className="text-primary">you&apos;re choosing certainty</span>
            </h1>
            <p className="mt-4 text-lg text-text-secondary max-w-xl lg:max-w-none">
              Ensure your business stability by comparing real 3PL performance, operational consistency, and fulfillment fit.
            </p>
            <a
              href="/rfq"
              className="inline-block mt-6 bg-primary text-white px-8 py-3.5 rounded-xl font-semibold text-base hover:bg-primary-dark transition-colors"
            >
              Find Your 3PL
            </a>
          </div>

          {/* 右侧：2×2 图片 */}
          <div className="flex-1 w-full max-w-[560px]">
            <div className="grid grid-cols-2 gap-2">
              {HERO_IMAGES.map((img) => (
                <div key={img.alt} className="relative overflow-hidden rounded-xl">
                  <img
                    src={img.src}
                    alt={img.alt}
                    className="w-full h-full object-cover"
                    loading="eager"
                  />
                  <div className="absolute bottom-0 left-0 right-0 text-white text-xs font-semibold text-center pb-2">
                    {img.alt}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ──── 第二屏：搜索栏 ──── */}
      <section className="max-w-3xl mx-auto px-4 pb-16">
        <form
          onSubmit={handleSearch}
          className="flex flex-col sm:flex-row gap-3"
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
          <a href="/3pl/california/apparel/shopify" className="text-primary hover:underline">
            California Apparel
          </a>
          <span>&middot;</span>
          <a href="/3pl/texas/jewelry/tiktok" className="text-primary hover:underline">
            Texas Jewelry
          </a>
          <span>&middot;</span>
          <a href="/3pl/florida/beauty/amazon" className="text-primary hover:underline">
            Florida Beauty
          </a>
        </div>
      </section>
    </>
  );
}
