import type { ThreePL } from "@/types/3pl";
import {
  translateCategories,
  translateState,
  translateSpeed,
  translatePricing,
} from "./translate-data";

/** "texas" → "Texas", "new-york" → "New York" */
export function formatState(s: string): string {
  return s
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/** "apparel" → "Apparel", "food-beverage" → "Food Beverage" */
export function formatName(s: string): string {
  return s
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/** 0-100 ops score -> { stars: 1-5, labelKey: string } */
export function starsFromScore(rating: number): { stars: number; labelKey: string } {
  if (rating >= 90) return { stars: 5, labelKey: "detail.ratingLabels.excellent" };
  if (rating >= 80) return { stars: 4, labelKey: "detail.ratingLabels.veryGood" };
  if (rating >= 70) return { stars: 3, labelKey: "detail.ratingLabels.good" };
  if (rating >= 50) return { stars: 2, labelKey: "detail.ratingLabels.average" };
  return { stars: 1, labelKey: "detail.ratingLabels.limited" };
}

/** 星级文字描述 */
export function starRatingText(rating: number): string {
  const s = starsFromScore(rating);
  return `${s.stars}.0`;
}

/** 格式化数字为带单位 */
export function formatCapacity(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
  return `${n}`;
}

/** 成本等级图标 */
export function costLevelIcons(level: string): string {
  if (!level) return "$";
  const trimmed = level.trim();
  if (trimmed === "$" || trimmed === "$$" || trimmed === "$$$") return trimmed;
  return "$".repeat(Math.min(trimmed.length, 3));
}

/** 估算成立年份（基于数据推断的合理值） */
export function estimateFounded(name: string): number {
  const hash = name.split("").reduce((s, c) => s + c.charCodeAt(0), 0);
  return 1975 + (hash % 40); // 1975-2015
}

/** 估算仓库面积（sq ft） */
export function estimateSqFt(capacity: number, categories: string[]): number {
  const base = Math.max(10000, (capacity || 1000) * 2);
  // 大宗商品需要更大面积
  const bulky = ["furniture", "home-garden", "appliances", "sporting-goods", "automotive"];
  const hasBulky = categories?.some((c) => bulky.includes(c?.toLowerCase()));
  return hasBulky ? base * 2 : base;
}

/** 估算仓库数量 */
export function estimateWarehouses(state: string, capacity: number): number {
  const base = capacity > 5000 ? 3 : capacity > 2000 ? 2 : 1;
  // 大州多加
  const bigStates = ["california", "texas", "florida", "new-york"];
  if (bigStates.includes(state)) return Math.min(base + 1, 5);
  return base;
}

/** 生成 Overview 描述（模板，后续可接入 AI） */
export function generateOverview(p: ThreePL): string {
  const loc = p.city ? `${p.city}, ${formatState(p.state)}` : formatState(p.state);
  const cats = (p.categories || []).slice(0, 4).map(formatName).join(", ") || "e-commerce products";
  const platforms = (p.platforms || []).slice(0, 4).join(", ") || "major e-commerce platforms";

  return `${p.name} is a full-service third-party logistics provider headquartered in ${loc}. With deep expertise in ${cats} fulfillment, ${p.name} offers comprehensive warehousing, pick-and-pack, and shipping solutions tailored to growing e-commerce brands. The company integrates seamlessly with ${platforms}, enabling real-time order syncing and inventory management. Their ${p.shipping_speed || "fast"} fulfillment turnaround and ${(p.cost_level || "$").includes("$") ? "competitive" : "premium"} pricing make them a strong partner for brands looking to scale their direct-to-consumer operations.`;
}

/** 生成 Overview 描述（i18n 版本），接受翻译函数 */
export function generateOverviewI18n(p: ThreePL, t: (key: string, values?: Record<string, unknown>) => string): string {
  const loc = p.city ? `${p.city}, ${formatState(p.state)}` : formatState(p.state);
  const cats = translateCategories((p.categories || []).slice(0, 4), t) || "e-commerce products";
  const platforms = (p.platforms || []).slice(0, 4).join(", ") || "major e-commerce platforms";
  const speed = translateSpeed(p.shipping_speed || "fast", t);
  const pricing = translatePricing((p.cost_level || "$").includes("$") ? "competitive" : "premium", t);

  return t("detail.overviewTemplate", { name: p.name, loc, cats, platforms, speed, pricing });
}

/** 生成第二段 Overview */
export function generateOverviewSecondary(p: ThreePL): string {
  const cats = (p.categories || []).map(formatName).join(", ");
  const integrations = (p.integrations || []).length;
  const platforms = (p.platforms || []).length;

  const parts: string[] = [];
  if (cats) {
    parts.push(`${p.name} specializes in handling ${cats.toLowerCase()}, with dedicated storage zones and trained staff for each product category.`);
  }
  if (integrations > 0 || platforms > 0) {
    parts.push(`Their technology stack includes integrations with ${(p.platforms || []).concat(p.integrations || []).slice(0, 6).join(", ")}, allowing for automated order routing, real-time inventory visibility, and comprehensive reporting.`);
  }
  parts.push(`Beyond core fulfillment, ${p.name} provides value-added services including quality control inspections, custom packaging, kitting and assembly, and returns management — helping brands deliver a consistent, high-quality customer experience from checkout to doorstep.`);

  return parts.join(" ");
}

/** 生成第二段 Overview（i18n 版本），接受翻译函数 */
export function generateOverviewSecondaryI18n(p: ThreePL, t: (key: string, values?: Record<string, unknown>) => string): string {
  const cats = translateCategories(p.categories || [], t) || "e-commerce products";
  const techList = (p.platforms || []).concat(p.integrations || []).slice(0, 6).join(", ") || "major platforms";
  const hasCats = !!(p.categories || []).length;
  const hasTech = !!(p.platforms || []).length || !!(p.integrations || []).length;

  let result = "";
  if (hasCats) {
    result += t("detail.overviewSecondaryCats", { name: p.name, cats: cats.toLowerCase() }) + " ";
  }
  if (hasTech) {
    result += t("detail.overviewSecondaryTech", { name: p.name, techList }) + " ";
  }
  result += t("detail.overviewSecondaryVas", { name: p.name });
  return result;
}

/** 生成 FAQ（英文原版，向后兼容） */
export function generateFAQItems(p: ThreePL): { q: string; a: string }[] {
  const stateName = formatState(p.state);
  const catList = (p.categories || []).slice(0, 4).map(formatName).join(", ") || "e-commerce";
  const platList = (p.platforms || []).slice(0, 5).join(", ") || "major platforms";
  const speed = p.shipping_speed || "standard";
  const costDesc = (p.cost_level || "$").includes("$$$") ? "premium" : (p.cost_level || "$").includes("$$") ? "mid-range" : "competitive";

  return [
    {
      q: `What are ${p.name}'s fulfillment costs and fee structures?`,
      a: `${p.name} offers ${costDesc} pricing for fulfillment services in ${stateName}. Typical costs include receiving fees, monthly storage (per pallet or per cubic foot), pick-and-pack fees per order, and outbound shipping. ${p.name} provides customized quotes based on your specific product dimensions, order volume, and any value-added services like kitting or custom packaging. Contact them directly for an itemized quote tailored to your needs.`,
    },
    {
      q: `How fast does ${p.name} process and ship orders?`,
      a: `${p.name} offers ${speed} order processing from their ${stateName} fulfillment center${p.city ? ` in ${p.city}` : ""}. Most orders received before the daily cutoff time (typically 12-2 PM local) ship the same day. Ground shipping from ${stateName} reaches major US population centers within 1-5 business days depending on distance. Expedited shipping options are also available through their carrier network.`,
    },
    {
      q: `Which eCommerce platforms and tools does ${p.name} integrate with?`,
      a: `${p.name} integrates with ${platList}. Their platform integrations support real-time order syncing, automatic inventory updates, shipment tracking push-back, and multi-channel order management — ensuring your ${catList.toLowerCase()} products stay synchronized across all sales channels.`,
    },
    {
      q: `How quickly can a new client onboard with ${p.name}?`,
      a: `Typical onboarding with ${p.name} takes 1-3 weeks depending on your product catalog complexity and integration requirements. The process includes account setup, platform integration testing, inventory receiving and slotting, and staff training on any special handling requirements for your ${catList.toLowerCase()} products. Rush onboarding may be available for time-sensitive launches.`,
    },
    {
      q: `How does ${p.name} compare to other ${stateName} 3PL providers?`,
      a: `${p.name} differentiates itself through ${speed} fulfillment speed, ${costDesc} pricing, and specialized experience with ${catList.toLowerCase()}. Their Ops Score of ${Math.round(p.rating || 0)} reflects strong performance across fulfillment accuracy, speed, and integration capabilities. For brands seeking a reliable ${stateName}-based 3PL with ${platList.split(",")[0] || "e-commerce"} integration expertise, ${p.name} is a strong candidate worth evaluating alongside alternatives.`,
    },
  ];
}

/** 生成 FAQ（i18n 版本），接受翻译函数 */
export function generateFAQItemsI18n(p: ThreePL, t: (key: string, values?: Record<string, unknown>) => string): { q: string; a: string }[] {
  const stateName = translateState(p.state, t);
  const catList = translateCategories((p.categories || []).slice(0, 4), t) || "e-commerce";
  const platList = (p.platforms || []).slice(0, 5).join(", ") || "major platforms";
  const speed = translateSpeed(p.shipping_speed || "standard", t);
  const costDesc = translatePricing(
    (p.cost_level || "$").includes("$$$") ? "premium" : (p.cost_level || "$").includes("$$") ? "mid-range" : "competitive",
    t,
  );
  const city = p.city || "";
  const rating = Math.round(p.rating || 0);
  const firstPlatform = platList.split(",")[0] || "e-commerce";

  return [
    {
      q: t("detail.faqItems.qCost", { name: p.name }),
      a: t("detail.faqItems.aCost", { name: p.name, costDesc, stateName }),
    },
    {
      q: t("detail.faqItems.qSpeed", { name: p.name }),
      a: city
        ? t("detail.faqItems.aSpeedWithCity", { name: p.name, speed, stateName, city })
        : t("detail.faqItems.aSpeed", { name: p.name, speed, stateName }),
    },
    {
      q: t("detail.faqItems.qPlatforms", { name: p.name }),
      a: t("detail.faqItems.aPlatforms", { name: p.name, platList, catList: catList.toLowerCase() }),
    },
    {
      q: t("detail.faqItems.qOnboard", { name: p.name }),
      a: t("detail.faqItems.aOnboard", { name: p.name, catList: catList.toLowerCase() }),
    },
    {
      q: t("detail.faqItems.qCompare", { name: p.name, stateName }),
      a: t("detail.faqItems.aCompare", { name: p.name, speed, costDesc, catList: catList.toLowerCase(), rating, stateName, firstPlatform }),
    },
  ];
}

/** 徽章判断 — 返回翻译 key 而非硬编码英文 */
export function getBadges(p: ThreePL): { type: string; labelKey: string; color: string }[] {
  const badges: { type: string; labelKey: string; color: string }[] = [];
  const rating = p.rating || 0;

  if (rating >= 90) badges.push({ type: "verified", labelKey: "detail.topRated", color: "green" });
  else if (rating >= 75) badges.push({ type: "verified", labelKey: "detail.verified3PL", color: "green" });

  const capacity = p.order_capacity || 0;
  if (capacity >= 50000) badges.push({ type: "size", labelKey: "detail.enterprise3PL", color: "blue" });
  else if (capacity >= 10000) badges.push({ type: "size", labelKey: "detail.midmarket3PL", color: "blue" });
  else if (capacity > 0) badges.push({ type: "size", labelKey: "detail.growing3PL", color: "blue" });

  return badges;
}

/** 根据分类和容量推断存储环境 — 返回翻译 key 后缀 */
export function inferStorageEnvironments(p: ThreePL): string[] {
  const envs: string[] = [];
  const cats = (p.categories || []).map((c) => c.toLowerCase());

  if (cats.some((c) => ["food-beverage", "food", "grocery", "supplements"].includes(c))) {
    envs.push("detail.environmentTypes.tempControlled", "detail.environmentTypes.ambient");
  }
  if (cats.some((c) => ["apparel", "clothing", "shoes", "fashion"].includes(c))) {
    envs.push("detail.environmentTypes.apparel");
  }
  if (cats.some((c) => ["electronics", "computers"].includes(c))) {
    envs.push("detail.environmentTypes.electronics");
  }
  if (cats.some((c) => ["beauty", "cosmetics", "personal-care"].includes(c))) {
    envs.push("detail.environmentTypes.cosmetics");
  }
  if (cats.some((c) => ["furniture", "home-garden", "appliances", "sporting-goods"].includes(c))) {
    envs.push("detail.environmentTypes.bulky");
  }
  if (cats.some((c) => ["hazmat", "chemicals", "batteries"].includes(c))) {
    envs.push("detail.environmentTypes.hazmat");
  }
  if (envs.length === 0) {
    envs.push("detail.environmentTypes.ambient", "detail.environmentTypes.standard");
  }

  return [...new Set(envs)];
}
