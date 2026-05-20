import { createServerClient } from "@/lib/supabase";
import { rankThreePLs } from "@/lib/scoring";
import { generateSEOMetadata, generateInternalLinks } from "@/lib/seo";
import ThreePLCard from "@/components/3PLCard";
import FAQ from "@/components/FAQ";
import ComparisonTable from "@/components/ComparisonTable";
import MobileCTA from "@/components/mobile/MobileCTA";
import Link from "next/link";
import type { Metadata } from "next";
import type { ThreePL } from "@/types/3pl";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ state: string; category: string }>;
}

/**
 * 动态 SEO 页面: /3pl/[state]/[category]
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { state, category } = await params;
  const seo = generateSEOMetadata(state, category);
  return {
    title: seo.title,
    description: seo.description,
  };
}

export default async function StateCategoryPage({ params }: Props) {
  const { state, category } = await params;
  const supabase = createServerClient();
  if (!supabase) {
    return (
      <div className="max-w-[1200px] mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Database Not Configured</h1>
        <p className="mt-2 text-text-secondary">Please configure Supabase to view {formatName(category)} 3PLs in {formatName(state)}.</p>
      </div>
    );
  }

  const { data: threePLs } = await supabase
    .from("pl_providers")
    .select("*")
    .eq("state", state.toLowerCase())
    .contains("categories", [category.toLowerCase()]);

  if (!threePLs || threePLs.length === 0) {
    return (
      <div className="max-w-[1200px] mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-text">
          No {formatName(category)} 3PLs Found in {formatName(state)}
        </h1>
        <p className="mt-2 text-text-secondary">
          <a href="/rfq" className="text-primary hover:underline">
            Submit an RFQ
          </a>{" "}
          and we&apos;ll find the right match for you.
        </p>
      </div>
    );
  }

  const scored = rankThreePLs(threePLs, { state, category });

  const links = generateInternalLinks(state.toLowerCase(), category.toLowerCase());

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-8 pb-20">
      <h1 className="text-2xl md:text-3xl font-bold text-text">
        Best {formatName(category)} 3PLs in {formatName(state)}
      </h1>
      <p className="mt-2 text-text-secondary">
        Compare {category.toLowerCase()} fulfillment centers in{" "}
        {formatName(state)}. Find the best match for your brand.
      </p>

      {/* Top Matches */}
      <section className="mt-6">
        <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wide mb-3">
          Top Matches
        </h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {scored.slice(0, 3).map((item) => (
            <ThreePLCard key={item.id} data={item} />
          ))}
        </div>
      </section>

      {/* Full list */}
      {scored.length > 3 && (
        <section className="mt-8">
          <h2 className="text-lg font-bold text-text mb-4">
            All {formatName(category)} 3PLs in {formatName(state)}
          </h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {scored.slice(3).map((item) => (
              <ThreePLCard key={item.id} data={item} />
            ))}
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

      <FAQ
        items={[
          `How much does ${category} 3PL cost in ${formatName(state)}?`,
          `What is the fastest ${category} fulfillment in ${formatName(state)}?`,
          `Which ${category} 3PLs in ${formatName(state)} integrate with Shopify?`,
        ]}
      />

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
