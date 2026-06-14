import HeroSearch from "@/components/HeroSearch";
import ThreePLCard from "@/components/3PLCard";
import TabbedDirectory from "@/components/TabbedDirectory";
import { createServerClient } from "@/lib/supabase";
import { rankThreePLs } from "@/lib/scoring";
import Link from "next/link";
import type { ThreePL } from "@/types/3pl";

export const dynamic = "force-dynamic";

/**
 * Flowrid 首页 — 搜索入口 + 真实数据导航 + 精选 3PL
 */
export default async function Home() {
  const supabase = createServerClient();

  // 拉取所有 3PL 数据
  const query = supabase
    ?.from("pl_providers")
    .select("*")
    .order("rating", { ascending: false })
    .limit(5000);
  const allProviders = query ? (await query).data : null;

  const providers = (allProviders as ThreePL[]) || [];

  // 提取唯一 Categories
  const categories = [
    ...new Set(providers.flatMap((p) => p.categories || [])),
  ].sort();

  // 提取唯一 States / Countries
  const allStates = [...new Set(providers.map((p) => p.state).filter(Boolean))].sort();

  // 分离 US States 和 International
  const US_STATES = new Set([
    "alabama","alaska","arizona","arkansas","california","colorado","connecticut","delaware",
    "florida","georgia","hawaii","idaho","illinois","indiana","iowa","kansas","kentucky",
    "louisiana","maine","maryland","massachusetts","michigan","minnesota","mississippi",
    "missouri","montana","nebraska","nevada","new-hampshire","new-jersey","new-mexico",
    "new-york","north-carolina","north-dakota","ohio","oklahoma","oregon","pennsylvania",
    "rhode-island","south-carolina","south-dakota","tennessee","texas","utah","vermont",
    "virginia","washington","west-virginia","wisconsin","wyoming",
  ]);

  const usStates = allStates.filter((s) => US_STATES.has(s.toLowerCase()));
  const international = allStates.filter((s) => !US_STATES.has(s.toLowerCase()));

  // 提取唯一 Platforms
  const platforms = [
    ...new Set(providers.flatMap((p) => p.platforms || [])),
  ].sort();

  // 精选推荐：评分排序取前 6
  const featured = providers
    .map((p) => ({
      ...p,
      score: (p.rating || 0),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);

  // Category 显示名映射
  const categoryLabels: Record<string, string> = {
    apparel: "Apparel",
    electronics: "Electronics",
    jewelry: "Jewelry",
    beauty: "Beauty & Cosmetics",
    home: "Home & Garden",
    toys: "Toys & Hobbies",
    sports: "Sports & Outdoors",
    food: "Food & Beverage",
  };

  // State 显示名映射
  const stateLabels: Record<string, string> = {
    california: "California",
    texas: "Texas",
    florida: "Florida",
    "new-york": "New York",
    "new-jersey": "New Jersey",
    georgia: "Georgia",
    illinois: "Illinois",
    nevada: "Nevada",
    washington: "Washington",
    oregon: "Oregon",
  };

  return (
    <div>
      <HeroSearch />

      {/* Featured 3PLs */}
      {featured.length > 0 && (
        <section className="max-w-[1460px] mx-auto px-4 py-12">
          <h2 className="text-xl font-bold text-text text-center mb-2">
            Find the perfect logistics partner for your business, with maximum efficiency
          </h2>
          <p className="text-text-secondary text-center text-sm mb-8">
            Flowrid selects and provides the most comprehensive, multi-dimensional information to meet your needs, identifying the best-fit 3PL partner from our global network.
          </p>
          <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
            {featured.map((item) => (
              <ThreePLCard key={item.id} data={item} />
            ))}
          </div>
          <div className="text-center mt-6">
            <a href="/3pl" className="text-text-secondary hover:text-primary transition-colors text-sm font-medium">
              More 3PL Providers &rarr;
            </a>
          </div>
        </section>
      )}

      {/* 第四屏：Tab 目录 */}
      <TabbedDirectory
        tabs={[
          { key: "category", label: "By Category" },
          { key: "state", label: "By State" },
          { key: "international", label: "International" },
          { key: "platform", label: "By Platform" },
        ]}
        categories={categories.map((cat) => ({
          key: cat,
          display: categoryLabels[cat] || cat.charAt(0).toUpperCase() + cat.slice(1),
          href: `/3pl?category=${cat}`,
        }))}
        states={usStates.map((s) => ({
          key: s,
          display: stateLabels[s] || s.charAt(0).toUpperCase() + s.slice(1),
          href: `/3pl/${s}`,
        }))}
        international={international.map((s) => ({
          key: s,
          display: stateLabels[s] || s.charAt(0).toUpperCase() + s.slice(1),
          href: `/3pl/${s}`,
        }))}
        platforms={platforms.map((p) => ({
          key: p,
          display: p.charAt(0).toUpperCase() + p.slice(1),
          href: `/3pl?platform=${p}`,
        }))}
      />

      {/* 第五屏：Flowrid Workspace */}
      <section className="max-w-[1460px] mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
          <div className="flex-1 max-w-[840px]">
            <img
              src="/images/flowrid-workspace.webp"
              alt="Flowrid Workspace"
              className="w-full rounded-xl shadow-lg"
            />
          </div>
          <div className="flex-1 text-center lg:text-left">
            <h2 className="text-2xl md:text-3xl font-bold text-text leading-tight">
              Bridge the operational management between brands and 3PL
            </h2>
          </div>
        </div>
      </section>

    </div>
  );
}
