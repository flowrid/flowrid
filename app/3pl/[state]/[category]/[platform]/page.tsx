import { createServerClient } from "@/lib/supabase";
import { rankThreePLs } from "@/lib/scoring";
import { generateSEOMetadata, generateInternalLinks } from "@/lib/seo";
import { generateAISummary } from "@/lib/ai";
import ThreePLCard from "@/components/3PLCard";
import MobileCTA from "@/components/mobile/MobileCTA";
import FAQ from "@/components/FAQ";
import ComparisonTable from "@/components/ComparisonTable";
import Link from "next/link";
import type { Metadata } from "next";
import type { ThreePL } from "@/types/3pl";

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
  const { state, category, platform } = await params;
  const supabase = createServerClient();
  if (!supabase) {
    return (
      <div className="max-w-[1200px] mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Database Not Configured</h1>
        <p className="mt-2 text-text-secondary">
          Please configure Supabase to view {formatName(category)} 3PLs for {platform} in {formatName(state)}.
        </p>
      </div>
    );
  }

  // 1. 查询匹配的 3PL
  const { data: threePLs } = await supabase
    .from("pl_providers")
    .select("*")
    .eq("state", state.toLowerCase())
    .contains("categories", [category.toLowerCase()])
    .contains("platforms", [platform.toLowerCase()]);

  // 2. 评分排序
  const scored = threePLs
    ? rankThreePLs(threePLs as ThreePL[], { state, category, platform })
    : [];

  // 3. AI 摘要
  let aiSummary = "";
  let whySection = "";
  let faqItems: string[] = [];

  try {
    const ai = await generateAISummary(state, category, platform);
    aiSummary = ai.summary;
    whySection = ai.why_section;
    faqItems = ai.faq;
  } catch {
    // AI 失败时使用 fallback
    aiSummary = `${formatName(state)} is a key logistics hub for ${category.toLowerCase()} brands using ${platform}, offering competitive warehousing and fast fulfillment across the United States.`;
    whySection = `- Competitive warehousing costs\n- Strong ${platform} integration ecosystem\n- Fast nationwide shipping coverage`;
    faqItems = [
      `What is the average cost of 3PL for ${category} in ${formatName(state)}?`,
      `How fast can ${platform} orders be fulfilled in ${formatName(state)}?`,
      `Which ${category} 3PLs in ${formatName(state)} have the best reviews?`,
    ];
  }

  // 4. 内链
  const links = generateInternalLinks(
    state.toLowerCase(),
    category.toLowerCase(),
    platform
  );

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-8 pb-20">
      {/* H1 Title */}
      <h1 className="text-2xl md:text-3xl font-bold text-text">
        Best {platform} {formatName(category)} 3PLs in {formatName(state)}
      </h1>

      {/* AI Summary */}
      {aiSummary && (
        <p className="mt-3 text-text-secondary leading-relaxed max-w-3xl">
          {aiSummary}
        </p>
      )}

      {/* Top Match Cards */}
      {scored.length > 0 && (
        <section className="mt-8">
          <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wide mb-3">
            Top Match{scored.length > 1 ? "es" : ""}
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
            All {platform} {formatName(category)} 3PLs in {formatName(state)}
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
            We couldn&apos;t find exact matches for this combination yet.
          </p>
          <p className="mt-2 text-text-secondary">
            But we can still help —{" "}
            <a href="/rfq" className="text-primary hover:underline font-medium">
              submit an RFQ
            </a>{" "}
            and we&apos;ll find the right 3PL for your needs.
          </p>
        </div>
      )}

      {/* Why Section */}
      {whySection && (
        <section className="mt-8 p-4 bg-card border border-border rounded-xl">
          <h2 className="text-lg font-bold text-text mb-2">
            Why {formatName(state)} for {formatName(category)} Fulfillment?
          </h2>
          <div className="text-sm text-text-secondary whitespace-pre-line">
            {whySection}
          </div>
        </section>
      )}

      {/* Comparison Table */}
      {scored.length >= 2 && <ComparisonTable data={scored.slice(0, 5)} />}

      {/* Internal Links (SEO Graph) */}
      <section className="mt-8">
        <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wide mb-3">
          Related Searches
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

      {/* FAQ */}
      <FAQ items={faqItems} />

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
