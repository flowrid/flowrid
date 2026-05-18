import { createServerClient } from "@/lib/supabase";
import { rankThreePLs } from "@/lib/scoring";
import { generateSEOMetadata } from "@/lib/seo";
import ThreePLCard from "@/components/3PLCard";
import FAQ from "@/components/FAQ";
import ComparisonTable from "@/components/ComparisonTable";
import MobileCTA from "@/components/mobile/MobileCTA";
import type { Metadata } from "next";
import type { ThreePL } from "@/types/3pl";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ state: string }>;
}

/**
 * 动态 SEO 页面: /3pl/[state]
 *
 * 页面结构：H1 → AI Summary → Top Match → Full List → FAQ → CTA
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { state } = await params;
  const seo = generateSEOMetadata(state);
  return {
    title: seo.title,
    description: seo.description,
  };
}

export default async function StatePage({ params }: Props) {
  const { state } = await params;
  const supabase = createServerClient();
  if (!supabase) {
    return (
      <div className="max-w-[1200px] mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Database Not Configured</h1>
        <p className="mt-2 text-text-secondary">Please configure Supabase to view 3PLs in {formatName(state)}.</p>
      </div>
    );
  }

  const { data: threePLs } = await supabase
    .from("pl_providers")
    .select("*")
    .eq("state", state.toLowerCase());

  if (!threePLs || threePLs.length === 0) {
    return (
      <div className="max-w-[1200px] mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-text">
          No 3PLs Found in {formatName(state)}
        </h1>
        <p className="mt-2 text-text-secondary">
          We couldn&apos;t find any 3PLs in this state yet.{" "}
          <a href="/rfq" className="text-primary hover:underline">
            Submit an RFQ
          </a>{" "}
          and we&apos;ll match you.
        </p>
      </div>
    );
  }

  const scored = threePLs
    .map((item: ThreePL) => ({
      ...item,
      score: rankThreePLs([item], { state }).find((s) => s.id === item.id)
        ?.score ?? 50,
    }))
    .sort((a, b) => b.score - a.score);

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-8 pb-20">
      <h1 className="text-2xl md:text-3xl font-bold text-text">
        Best 3PL Fulfillment Centers in {formatName(state)}
      </h1>
      <p className="mt-2 text-text-secondary">
        Compare top-rated third-party logistics providers in {formatName(state)}.
        Filter by category, platform, speed, and cost.
      </p>

      {/* Top Match */}
      {scored.length > 0 && (
        <section className="mt-6">
          <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wide mb-3">
            Top Match
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
            All {formatName(state)} 3PLs
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {scored.slice(3).map((item) => (
              <ThreePLCard key={item.id} data={item} />
            ))}
          </div>
        </section>
      )}

      {/* FAQ */}
      <FAQ
        items={[
          `What is the average cost of 3PL in ${formatName(state)}?`,
          `How fast can orders be fulfilled in ${formatName(state)}?`,
          `Which platforms do ${formatName(state)} 3PLs support?`,
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
