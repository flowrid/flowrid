"use client";

import DirectorySearch from "@/components/DirectorySearch";

const HERO_IMAGES = [
  { src: "/images/hero/Perfect 3PL Match.webp", alt: "Perfect 3PL Match" },
  { src: "/images/hero/Full-Network Comparison.webp", alt: "Full-Network Comparison" },
  { src: "/images/hero/Warehouse Fit.webp", alt: "Warehouse Fit" },
  { src: "/images/hero/Guaranteed Logistics Stabillty.webp", alt: "Guaranteed Logistics Stability" },
];

/**
 * Hero Search — 首页首屏
 * 左文案 + 右 2×2 图片
 */
export default function HeroSearch() {
  return (
    <>
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
                  <div className="absolute left-0 right-0 text-white text-xs md:text-sm font-semibold text-center bottom-[5%] md:bottom-0 md:-translate-y-[10px]">
                    {img.alt}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="mt-[30px]">
        <DirectorySearch />
      </div>
    </>
  );
}
