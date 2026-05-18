/**
 * 种子数据 — MVP 阶段的模拟 3PL 数据
 *
 * 在 Supabase 建表后，运行此数据填充初始 SEO 页面内容
 */
export const seedThreePLs = [
  {
    name: "FlowX Fulfillment",
    slug: "flowx-fulfillment",
    description:
      "Premium fulfillment center specializing in fast-turnaround apparel and beauty orders for Shopify and TikTok brands.",
    state: "texas",
    city: "Dallas",
    categories: ["apparel", "beauty", "jewelry"],
    platforms: ["Shopify", "TikTok"],
    shipping_speed: "1-2 days",
    cost_level: "$$",
    rating: 4.8,
    review_count: 156,
    order_capacity: 50000,
    sku_capacity: 5000,
    integrations: ["Shopify", "TikTok", "Amazon"],
    website: "https://example.com/flowx",
  },
  {
    name: "LoneStar Logistics",
    slug: "lonestar-logistics",
    description:
      "Texas-based 3PL with competitive pricing for mid-volume brands. Strong Amazon FBA prep capabilities.",
    state: "texas",
    city: "Houston",
    categories: ["apparel", "electronics", "home"],
    platforms: ["Amazon", "Shopify"],
    shipping_speed: "3-5 days",
    cost_level: "$",
    rating: 4.5,
    review_count: 89,
    order_capacity: 30000,
    sku_capacity: 3000,
    integrations: ["Amazon", "Shopify"],
    website: "https://example.com/lonestar",
  },
  {
    name: "CaliShip Fulfillment",
    slug: "caliship-fulfillment",
    description:
      "Los Angeles-based fulfillment center close to major ports. Ideal for Asia-import brands needing fast West Coast distribution.",
    state: "california",
    city: "Los Angeles",
    categories: ["apparel", "jewelry", "beauty", "electronics"],
    platforms: ["Shopify", "TikTok", "Amazon"],
    shipping_speed: "1-2 days",
    cost_level: "$$$",
    rating: 4.7,
    review_count: 203,
    order_capacity: 80000,
    sku_capacity: 8000,
    integrations: ["Shopify", "TikTok", "Amazon"],
    website: "https://example.com/caliship",
  },
  {
    name: "Golden State Logistics",
    slug: "golden-state-logistics",
    description:
      "Bay Area fulfillment with strong tech integration. Perfect for electronics and high-value goods.",
    state: "california",
    city: "San Francisco",
    categories: ["electronics", "beauty"],
    platforms: ["Shopify", "Amazon"],
    shipping_speed: "3-5 days",
    cost_level: "$$$",
    rating: 4.3,
    review_count: 67,
    order_capacity: 20000,
    sku_capacity: 2000,
    integrations: ["Shopify", "Amazon"],
    website: "https://example.com/goldenstate",
  },
  {
    name: "Sunshine Fulfillment",
    slug: "sunshine-fulfillment",
    description:
      "Miami-based 3PL with strong Latin American distribution. Great for beauty and fashion brands targeting both US and LATAM markets.",
    state: "florida",
    city: "Miami",
    categories: ["apparel", "beauty", "jewelry"],
    platforms: ["Shopify", "TikTok"],
    shipping_speed: "1-2 days",
    cost_level: "$$",
    rating: 4.6,
    review_count: 134,
    order_capacity: 40000,
    sku_capacity: 4000,
    integrations: ["Shopify", "TikTok"],
    website: "https://example.com/sunshine",
  },
  {
    name: "NYC Express Fulfillment",
    slug: "nyc-express-fulfillment",
    description:
      "Fast East Coast fulfillment in the NYC metro area. Same-day processing for orders placed before 2pm.",
    state: "new-york",
    city: "Brooklyn",
    categories: ["apparel", "beauty", "home"],
    platforms: ["Shopify", "Amazon", "TikTok"],
    shipping_speed: "1-2 days",
    cost_level: "$$$",
    rating: 4.4,
    review_count: 92,
    order_capacity: 35000,
    sku_capacity: 3500,
    integrations: ["Shopify", "Amazon", "TikTok"],
    website: "https://example.com/nycexpress",
  },
  {
    name: "Garden State Fulfillment",
    slug: "garden-state-fulfillment",
    description:
      "New Jersey-based 3PL near major ports and NYC market. Cost-effective alternative to NYC pricing.",
    state: "new-jersey",
    city: "Newark",
    categories: ["apparel", "electronics", "home"],
    platforms: ["Amazon", "Shopify"],
    shipping_speed: "3-5 days",
    cost_level: "$$",
    rating: 4.5,
    review_count: 78,
    order_capacity: 45000,
    sku_capacity: 4500,
    integrations: ["Amazon", "Shopify"],
    website: "https://example.com/gardenstate",
  },
  {
    name: "Peach State Logistics",
    slug: "peach-state-logistics",
    description:
      "Atlanta-based fulfillment center — central East Coast location for fast delivery to major population centers.",
    state: "georgia",
    city: "Atlanta",
    categories: ["apparel", "home", "toys"],
    platforms: ["Shopify", "Amazon"],
    shipping_speed: "3-5 days",
    cost_level: "$",
    rating: 4.2,
    review_count: 56,
    order_capacity: 25000,
    sku_capacity: 2500,
    integrations: ["Shopify", "Amazon"],
    website: "https://example.com/peachstate",
  },
];

/**
 * 将种子数据转为 Supabase INSERT 语句格式
 */
export function getSeedSQL(): string {
  return seedThreePLs
    .map(
      (p) => `INSERT INTO pl_providers (name, slug, description, state, city, categories, platforms, shipping_speed, cost_level, rating, review_count, order_capacity, sku_capacity, integrations, website)
VALUES (
  '${p.name}',
  '${p.slug}',
  '${p.description}',
  '${p.state}',
  '${p.city}',
  ARRAY[${p.categories.map((c) => `'${c}'`).join(", ")}],
  ARRAY[${p.platforms.map((p) => `'${p}'`).join(", ")}],
  '${p.shipping_speed}',
  '${p.cost_level}',
  ${p.rating},
  ${p.review_count},
  ${p.order_capacity},
  ${p.sku_capacity},
  ARRAY[${p.integrations.map((i) => `'${i}'`).join(", ")}],
  '${p.website}'
);`
    )
    .join("\n\n");
}
