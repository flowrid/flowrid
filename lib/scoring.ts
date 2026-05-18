import { ThreePL, PageParams } from "@/types/3pl";

/**
 * Flowrid 评分算法
 *
 * 品类匹配 30% + 平台匹配 25% + 地区匹配 20% + 速度 15% + 成本 10%
 */
export function calculateScore(
  threePL: ThreePL,
  query: PageParams
): number {
  let score = 0;

  // 品类匹配（30%）
  if (query.category && threePL.categories.includes(query.category)) {
    score += 30;
  }

  // 平台匹配（25%）
  if (query.platform && threePL.platforms.includes(query.platform)) {
    score += 25;
  }

  // 地区匹配（20%）
  if (query.state && threePL.state.toLowerCase() === query.state.toLowerCase()) {
    score += 20;
  }

  // 速度（15%）
  if (threePL.shipping_speed === "fast" || threePL.shipping_speed === "1-2 days") {
    score += 15;
  } else if (threePL.shipping_speed === "3-5 days") {
    score += 8;
  }

  // 成本（10%）
  if (threePL.cost_level === "low" || threePL.cost_level === "$") {
    score += 10;
  } else if (threePL.cost_level === "$$" || threePL.cost_level === "medium") {
    score += 5;
  }

  return score;
}

/**
 * 对 3PL 列表进行评分并排序
 */
export function rankThreePLs(
  threePLs: ThreePL[],
  query: PageParams
) {
  return threePLs
    .map((item) => ({
      ...item,
      score: calculateScore(item, query),
    }))
    .sort((a, b) => b.score - a.score);
}
