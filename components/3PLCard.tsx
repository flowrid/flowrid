"use client";

import { ThreePLCardData } from "@/types/3pl";
import { useState } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { estimateWarehouses } from "@/lib/detail-content";
import { PLATFORM_ICONS } from "@/lib/platform-icons";

function formatStateName(state: string): string {
  return state
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function getCardTagline(data: ThreePLCardData, t: ReturnType<typeof useTranslations>): { label: string; hasColdChain: boolean } {
  const cats = data.categories || [];
  const wh = estimateWarehouses(data.state, data.order_capacity || 0);
  const base = `${wh} WH`;

  // 品类标签 — 优先翻译，回退 catMap
  const catMap: Record<string, string> = {
    apparel: "Apparel", electronics: "Electronics", beauty: "Beauty",
    jewelry: "Jewelry", home: "Home Decor", toys: "Toys",
    food: "Food & Beverage", sports: "Sports", automotive: "Auto",
    "food-beverage": "Food & Bev", "home-garden": "Home & Garden",
    "pet-supplies": "Pet Supplies", health: "Health",
    books: "Books", pharma: "Pharma",
  };

  let label: string;
  if (cats.length >= 5) {
    label = `${t("detail.fullService")} · ${base}`;
  } else if (cats.length >= 2) {
    label = `${t("detail.multiCat")} · ${base}`;
  } else if (cats.length === 1) {
    const c = cats[0];
    const name = t(`card.categories.${c}`) || catMap[c] || c.charAt(0).toUpperCase() + c.slice(1);
    label = `${name} · ${base}`;
  } else {
    label = `${t("detail.fulfillment")} · ${base}`;
  }

  // 冷链追加 — 用图标代替文字
  const coldCats = ["food", "food-beverage", "grocery", "frozen", "pharma", "supplements"];
  const hasColdChain = cats.some((c: string) => coldCats.includes(c));

  return { label, hasColdChain };
}

interface ThreePLCardProps {
  data: ThreePLCardData;
  selected?: boolean;
  onToggleSelect?: () => void;
}

/**
 * 3PL Card — 三板块布局，高度+30%，长方形卡片
 *
 * 板块一：Logo + Ops Score + 3PL 名称 + 地址
 * 板块二：平台图标 + 文字介绍
 * 板块三：Speed + View Details
 */
export default function ThreePLCard({ data, selected, onToggleSelect }: ThreePLCardProps) {
  const t = useTranslations();
  const showCompare = typeof onToggleSelect === "function";
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);
  const isActive = hovered || pressed;
  const tagline = getCardTagline(data, t);

  return (
    <div
      className="relative w-full bg-card rounded-xl aspect-[1/1.3] lg:aspect-[1/1.35] shadow-[0.98px_1.95px_20px_rgba(0,0,0,0.1)] card-glow flex flex-col"
      style={{ containerType: "inline-size", padding: "5% 6%" }}
    >
      {/* ═══ 板块一：Logo + Ops Score + 标题 + 地址 ═══ */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Logo（左） + 选择框 & Ops Score（右） */}
        <div className="flex justify-between items-start">
          {/* 3PL Logo — 放大 20% */}
          <div
            className="shrink-0 rounded-lg overflow-hidden bg-[#F5F5F7] flex items-center justify-center"
            style={{ width: "34.3%", aspectRatio: "1" }}
          >
            {data.logo ? (
              <img
                src={data.logo}
                alt={data.name}
                className="w-full h-full object-contain"
              />
            ) : (
              <span
                className="font-bold text-[#86868B] select-none"
                style={{ fontSize: "clamp(0.5rem, 10cqw, 3rem)" }}
              >
                {data.name.charAt(0)}
              </span>
            )}
          </div>

          {/* 右上：选择框 + Ops Score（无白底框） */}
          <div className="flex flex-col items-end shrink-0">
            {/* Compare 选择框 — 放大 20%，线条变细 50% */}
            {showCompare && (
              <button
                onClick={onToggleSelect}
                className="rounded-[3px] border flex items-center justify-center font-bold transition-all"
                style={{
                  width: "max(4.8%, 12px)",
                  aspectRatio: "1",
                  fontSize: "clamp(0.25rem, 2cqw, 0.5rem)",
                  borderColor: selected ? "var(--color-primary)" : "#A5A5A5",
                  background: selected ? "var(--color-primary)" : "transparent",
                  color: selected ? "white" : "transparent",
                }}
              >
                {selected ? "✓" : ""}
              </button>
            )}

            {/* Ops Score — 下移拉开与选择框距离，数字右边缘对齐O左边缘 */}
            <div style={{ textAlign: "right", marginTop: "28%" }}>
              <div
                className="font-normal text-[#86868B] leading-none"
                style={{ fontSize: "clamp(0.37rem, 5.04cqw, 1.29rem)" }}
              >
              {t("card.opsScore")}
              </div>
              <div className="flex items-baseline justify-end">
                <span
                  className="font-semibold text-[#181B25] leading-none"
                  style={{ fontSize: "clamp(0.9rem, 10.9cqw, 2.7rem)", marginRight: "clamp(7px, 2.9%, 16px)" }}
                >
                  {data.score}
                </span>
                <img
                  src="/platforms/verified.png"
                  alt=""
                  style={{ width: "20%", maxWidth: "30px", height: "auto" }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 标题 */}
        <h3
          className="font-semibold text-[#181B25] leading-tight line-clamp-2"
          style={{ marginTop: "4.8%", fontSize: "clamp(0.8rem, 7.8cqw, 2.5rem)" }}
        >
          {data.name}
        </h3>

        {/* 地址 */}
        <p
          className="text-[#86868B] leading-tight"
          style={{ marginTop: "2.4%", fontSize: "clamp(0.55rem, 6.4cqw, 1.75rem)" }}
        >
          {data.city ? `${data.city}, ${formatStateName(data.state)}` : formatStateName(data.state)}
        </p>
      </div>

      {/* ═══ 板块二：平台图标 + 描述 ═══ */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        {data.platforms && data.platforms.length > 0 && (
          <div className="flex flex-wrap items-center" style={{ gap: "1.5%" }}>
            {data.platforms.map((p) => {
              const key = p.toLowerCase().trim().replace(/\s+/g, "");
              const icon = PLATFORM_ICONS[key];
              if (!icon) return null;
              return (
                <img
                  key={p}
                  src={icon}
                  alt={p}
                  title={p}
                  style={{ width: "8.6%", aspectRatio: "1", maxWidth: "40px" }}
                />
              );
            })}
          </div>
        )}

        <p
          className="text-[#86868B] leading-tight whitespace-nowrap overflow-x-auto"
          style={{ marginTop: "2%", fontSize: "clamp(0.55rem, 6.4cqw, 1.75rem)", scrollbarWidth: "none" }}
        >
          {data.description || (data.city ? t("card.fulfillmentCenter", { city: data.city }) : "")}
        </p>
      </div>

      {/* ═══ 板块三：定位介绍 + View Details ═══ */}
      <div className="flex items-center justify-between" style={{ marginTop: "3%" }}>
        {/* 定位标签 — 品类专精 */}
        <div className="flex items-center gap-1">
          <span
            className="text-black leading-none whitespace-nowrap"
            style={{ fontSize: "clamp(0.6rem, 6cqw, 1.6rem)" }}
          >
            {tagline.label}
          </span>
          {tagline.hasColdChain && (
            <img src="/images/cold-chain.png" alt={t("card.coldChain")} className="w-3 h-3 shrink-0" />
          )}
        </div>

        {/* View Details — 方形按钮，文字可分行 */}
        <Link
          href={`/3pl/d/${data.slug}`}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onPointerDown={() => setPressed(true)}
          onPointerUp={() => setPressed(false)}
          onPointerCancel={() => setPressed(false)}
          onTouchStart={() => setPressed(true)}
          onTouchEnd={() => setPressed(false)}
          onTouchCancel={() => setPressed(false)}
          className="view-details-button"
          style={{
            display: "inline-flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "0.5rem",
            fontWeight: 500,
            flexShrink: 0,
            textAlign: "center",
            lineHeight: 1.25,
            textDecoration: "none",
            width: "max(42px, 14cqw)",
            height: "max(42px, 14cqw)",
            fontSize: "clamp(0.6rem, 4.4cqw, 1.1rem)",
            padding: "4%",
            background: isActive ? "#ed6d00" : "#fff",
            color: isActive ? "#fff" : "#ed6d00",
            border: "1px solid #ed6d00",
            transition: "all 0.2s ease",
            cursor: "pointer",
            position: "relative",
            zIndex: 10,
          }}
        >
          <span>{t("card.viewDetails")}</span>
        </Link>
      </div>
    </div>
  );
}
