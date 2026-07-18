import { ThreePL, PageParams } from "@/types/3pl";

/**
 * Flowrid 混合评分算法 v2
 *
 * 基础质量分（Ops Score）= rating 字段 (0-100) × 40%
 * + 查询匹配度 (0-100) × 60%
 *
 * 匹配维度：品类30 + 平台25 + 地区20 + 速度15 + 成本10
 */
export function calculateScore(
  threePL: ThreePL,
  query: PageParams
): number {
  let matchScore = 0;

  // 品类匹配（30%）
  if (query.category && threePL.categories.includes(query.category)) {
    matchScore += 30;
  }

  // 平台匹配（25%）
  if (query.platform && threePL.platforms.includes(query.platform)) {
    matchScore += 25;
  }

  // 地区匹配（20%）
  if (query.state && threePL.state.toLowerCase() === query.state.toLowerCase()) {
    matchScore += 20;
  }

  // 速度（15%）
  if (threePL.shipping_speed === "fast" || threePL.shipping_speed === "1-2 days") {
    matchScore += 15;
  } else if (threePL.shipping_speed === "2-3 days") {
    matchScore += 10;
  } else if (threePL.shipping_speed === "3-5 days") {
    matchScore += 5;
  }

  // 成本（10%）
  if (threePL.cost_level === "low" || threePL.cost_level === "$") {
    matchScore += 10;
  } else if (threePL.cost_level === "$$" || threePL.cost_level === "medium") {
    matchScore += 5;
  }

  // 基础质量分：rating 字段存储 Ops Score (0-100)
  const baseScore = typeof threePL.rating === "number" ? threePL.rating : 50;

  // 混合：40% 基础质量 + 60% 查询匹配
  return Math.round(baseScore * 0.4 + matchScore * 0.6);
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
