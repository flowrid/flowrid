import { SEOData } from "@/types/3pl";

/**
 * 动态生成 SEO metadata
 */
export function generateSEOMetadata(
  state: string,
  category?: string,
  platform?: string
): SEOData {
  const stateName = formatStateName(state);

  if (category && platform) {
    return {
      title: `Best ${platform} ${category} 3PLs in ${stateName} — Compare & Get Quotes`,
      description: `Find top-rated ${category} fulfillment centers for ${platform} sellers in ${stateName}. Compare pricing, speed, and integrations. Get free quotes today.`,
    };
  }

  if (category) {
    return {
      title: `Best ${category} 3PLs in ${stateName} — Compare Fulfillment Services`,
      description: `Compare ${category} fulfillment centers in ${stateName}. Find the best 3PL with competitive pricing and fast shipping.`,
    };
  }

  return {
    title: `Best 3PL Fulfillment Centers in ${stateName} — Compare & Choose`,
    description: `Find and compare top third-party logistics providers in ${stateName}. Filter by category, platform, shipping speed, and cost.`,
  };
}

/**
 * 格式化州名：texas → Texas
 */
function formatStateName(state: string): string {
  return state
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * 生成页面对应的内链列表（SEO Graph 核心）
 */
export function generateInternalLinks(
  state: string,
  category?: string,
  platform?: string
): { label: string; href: string }[] {
  const links: { label: string; href: string }[] = [];

  links.push({ label: `All 3PLs in ${formatStateName(state)}`, href: `/3pl/${state}` });

  if (category) {
    links.push({
      label: `${formatStateName(category)} 3PLs`,
      href: `/3pl/${category}`,
    });
    links.push({
      label: `${formatStateName(category)} 3PLs in ${formatStateName(state)}`,
      href: `/3pl/${state}/${category}`,
    });
  }

  if (platform) {
    links.push({
      label: `${platform} 3PLs`,
      href: `/3pl/${platform}`,
    });
  }

  links.push({ label: "All 3PL Providers", href: "/3pl" });

  return links;
}
