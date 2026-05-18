import HeroSearch from "@/components/HeroSearch";
import ThreePLCard from "@/components/3PLCard";
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
    .order("rating", { ascending: false });
  const allProviders = query ? (await query).data : null;

  const providers = (allProviders as ThreePL[]) || [];

  // 提取唯一 Categories
  const categories = [
    ...new Set(providers.flatMap((p) => p.categories || [])),
  ].sort();

  // 提取唯一 States
  const states = [...new Set(providers.map((p) => p.state).filter(Boolean))].sort();

  // 精选推荐：评分排序取前 3
  const featured = providers
    .map((p) => ({
      ...p,
      score: (p.rating || 0) * 20, // 简化评分：rating × 20
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

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
        <section className="max-w-[1200px] mx-auto px-4 py-12">
          <h2 className="text-xl font-bold text-text text-center mb-2">
            Top-Rated 3PL Providers
          </h2>
          <p className="text-text-secondary text-center text-sm mb-8">
            Highest rated fulfillment centers on Flowrid
          </p>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {featured.map((item) => (
              <ThreePLCard key={item.id} data={item} />
            ))}
          </div>
        </section>
      )}

      {/* Dynamic Category Entry Points */}
      {categories.length > 0 && (
        <section className="max-w-[1200px] mx-auto px-4 py-8">
          <h2 className="text-xl font-bold text-text text-center mb-8">
            Find 3PLs by Category
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat}
                href={`/3pl?category=${cat}`}
                className="border border-border rounded-xl p-4 bg-card hover:shadow-md hover:border-primary transition-all text-center"
              >
                <span className="text-sm font-medium">
                  {categoryLabels[cat] || cat.charAt(0).toUpperCase() + cat.slice(1)}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Dynamic State Entry Points */}
      {states.length > 0 && (
        <section className="max-w-[1200px] mx-auto px-4 py-8">
          <h2 className="text-xl font-bold text-text text-center mb-8">
            Find 3PLs by State
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {states.map((s) => (
              <Link
                key={s}
                href={`/3pl/${s}`}
                className="border border-border rounded-lg p-3 bg-card hover:shadow-sm hover:border-primary transition-all text-center text-sm"
              >
                {stateLabels[s] || s.charAt(0).toUpperCase() + s.slice(1)}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="text-center py-12 px-4">
        <h2 className="text-2xl font-bold text-text">
          Ready to Find Your Perfect 3PL?
        </h2>
        <p className="mt-2 text-text-secondary">
          Get matched with top fulfillment centers in under 60 seconds.
        </p>
        <a
          href="/rfq"
          className="inline-block mt-6 bg-primary text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-primary-dark transition-colors text-lg"
        >
          Get Matched Free
        </a>
      </section>
    </div>
  );
}
