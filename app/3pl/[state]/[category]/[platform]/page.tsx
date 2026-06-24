import { createServerClient } from "@/lib/supabase";
import { getTranslations } from "next-intl/server";
import { rankThreePLs } from "@/lib/scoring";
import { generateSEOMetadata, generateInternalLinks } from "@/lib/seo";
import { generateAISummary } from "@/lib/ai";
import ThreePLCard from "@/components/3PLCard";
import MobileCTA from "@/components/mobile/MobileCTA";
import FAQ from "@/components/FAQ";
import ComparisonTable from "@/components/ComparisonTable";
import Link from "next/link";
import type { Metadata } from "next";
import type { ThreePL, AISummary } from "@/types/3pl";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ state: string; category: string; platform: string }>;
}

/**
 * ⭐ 核心 Programmatic SEO 页面: /3pl/[state]/[category]/[platform]
 *
 * 这是 Flowrid 最重要的流量入口页
 * 页面 = 数据查询 + 模板 + AI 差异化 + SEO 结构
 *
 * 结构：H1 → AI Summary → Top Match → Full List → Why Section → Comparison → FAQ → Links → CTA
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { state, category, platform } = await params;
  const seo = generateSEOMetadata(state, category, platform);
  return {
    title: seo.title,
    description: seo.description,
  };
}

export default async function FullSEOPage({ params }: Props) {
  const t = await getTranslations();
  const { state, category, platform } = await params;
  const supabase = createServerClient();
  if (!supabase) {
    return (
      <div className="max-w-[1460px] mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">{t("directory.dbError")}</h1>
        <p className="mt-2 text-text-secondary">{t("directory.dbErrorMsg")}</p>
      </div>
    );
  }

  // 1. 查询匹配的 3PL
  const { data: threePLs } = await supabase
    .from("pl_providers")
    .select("*")
    .eq("state", state.toLowerCase())
    .contains("categories", [category.toLowerCase()])
    .contains("platforms", [platform.toLowerCase()])
    .limit(5000);

  // 2. 评分排序
  const scored = threePLs
    ? rankThreePLs(threePLs as ThreePL[], { state, category, platform })
    : [];

  // 3. AI 摘要
  let aiContent: AISummary | null = null;

  try {
    aiContent = await generateAISummary(state, category, platform);
  } catch {
    // fallback built into generateAISummary
  }

  // 4. 内链
  const links = generateInternalLinks(
    state.toLowerCase(),
    category.toLowerCase(),
    platform
  );

  return (
    <div className="max-w-[1460px] mx-auto px-4 py-8 pb-20">
      {/* H1 Title */}
      <h1 className="text-2xl md:text-3xl font-bold text-text">
        {t("directory.bestPlatform", { platform, category: formatName(category), state: formatName(state) })}
      </h1>

      {aiContent && (
        <>
          {/* Executive Summary */}
          <p className="mt-3 text-text-secondary leading-relaxed max-w-3xl">
            {aiContent.summary}
          </p>

          {/* Cost Guide */}
          <section className="mt-8 p-4 bg-card border border-border rounded-xl">
            <h2 className="text-lg font-bold text-text mb-2">
              {t("directory.costGuide", { category: formatName(category), state: formatName(state) })}
            </h2>
            <p className="text-sm text-text-secondary leading-relaxed">
              {aiContent.cost_guide}
            </p>
          </section>

          {/* Shipping Insights */}
          <section className="mt-4 p-4 bg-card border border-border rounded-xl">
            <h2 className="text-lg font-bold text-text mb-2">
              {t("directory.shippingFrom", { state: formatName(state) })}
            </h2>
            <p className="text-sm text-text-secondary leading-relaxed">
              {aiContent.shipping_insights}
            </p>
          </section>

          {/* Key Considerations */}
          {aiContent.key_considerations.length > 0 && (
            <section className="mt-8">
              <h2 className="text-lg font-bold text-text mb-3">
                {t("directory.whatToLook", { category: formatName(category) })}
              </h2>
              <ul className="space-y-2">
                {aiContent.key_considerations.map((item, i) => (
                  <li key={i} className="flex gap-2 text-sm text-text-secondary">
                    <span className="text-primary shrink-0 mt-0.5">&#10003;</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}

      {/* Top Match Cards */}
      {scored.length > 0 && (
        <section className="mt-8">
          <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wide mb-3">
            {t("directory.topMatch")}
          </h2>
          <div className="grid grid-cols-2 gap-3 lg:gap-5 md:grid-cols-2 lg:grid-cols-6">
            {scored.slice(0, 3).map((item) => (
              <ThreePLCard key={item.id} data={item} />
            ))}
          </div>
        </section>
      )}

      {/* Full List */}
      {scored.length > 3 && (
        <section className="mt-8">
          <h2 className="text-lg font-bold text-text mb-4">
            {t("directory.allPlatform", { platform, category: formatName(category), state: formatName(state) })}
          </h2>
          <div className="grid grid-cols-2 gap-3 lg:gap-5 md:grid-cols-2 lg:grid-cols-6">
            {scored.slice(3).map((item) => (
              <ThreePLCard key={item.id} data={item} />
            ))}
          </div>
        </section>
      )}

      {/* Empty State */}
      {scored.length === 0 && (
        <div className="text-center py-12">
          <p className="text-text-secondary text-lg">
            {t("directory.noResultsCombo").split(". But")[0]}.
          </p>
          <p className="mt-2 text-text-secondary">
            {t("directory.noResultsCombo").split(". But")[1]?.replace(
              "submit an RFQ",
              ""
            ) || "But we can still help —"}
            {" "}
            <a href="/rfq" className="text-primary hover:underline font-medium">
              submit an RFQ
            </a>
            {t("directory.noResultsCombo").split("submit an RFQ")[1] || ""}
          </p>
        </div>
      )}

      {/* Comparison Table */}
      {scored.length >= 2 && <ComparisonTable data={scored.slice(0, 5)} />}

      {/* FAQ */}
      {aiContent && <FAQ items={aiContent.faq} />}

      {/* Internal Links (SEO Graph) */}
      <section className="mt-8">
        <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wide mb-3">
          {t("directory.relatedSearches")}
        </h2>
        <div className="flex flex-wrap gap-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-primary hover:underline"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </section>

      {/* Sticky CTA */}
      <MobileCTA />
    </div>
  );
}

function formatName(s: string): string {
  return s
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
