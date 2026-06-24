import { createServerClient } from "@/lib/supabase";
import { getTranslations } from "next-intl/server";
import { rankThreePLs } from "@/lib/scoring";
import { generateSEOMetadata } from "@/lib/seo";
import ThreePLCard from "@/components/3PLCard";
import FAQ from "@/components/FAQ";
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
  const t = await getTranslations();
  const { state } = await params;
  const supabase = createServerClient();
  if (!supabase) {
    return (
      <div className="max-w-[1460px] mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">{t("directory.dbError")}</h1>
        <p className="mt-2 text-text-secondary">{t("directory.dbErrorMsg")}</p>
      </div>
    );
  }

  const { data: threePLs } = await supabase
    .from("pl_providers")
    .select("*")
    .eq("state", state.toLowerCase())
    .limit(5000);

  if (!threePLs || threePLs.length === 0) {
    const msg = t("directory.noResultsStateMsg");
    const parts = msg.split("Submit an RFQ");
    return (
      <div className="max-w-[1460px] mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-text">
          {t("directory.noResultsState", { state: formatName(state) })}
        </h1>
        <p className="mt-2 text-text-secondary">
          {parts[0]}
          <a href="/rfq" className="text-primary hover:underline">
            Submit an RFQ
          </a>
          {parts[1] || ""}
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
    <div className="max-w-[1460px] mx-auto px-4 py-8 pb-20">
      <h1 className="text-2xl md:text-3xl font-bold text-text">
        {t("directory.bestState", { state: formatName(state) })}
      </h1>
      <p className="mt-2 text-text-secondary">
        {t("directory.descState", { state: formatName(state) })}
      </p>

      {/* Top Match */}
      {scored.length > 0 && (
        <section className="mt-6">
          <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wide mb-3">
            {t("directory.topMatch")}
          </h2>
          <div className="grid grid-cols-2 gap-3 lg:gap-5 lg:grid-cols-6">
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
            {t("directory.allIn", { state: formatName(state) })}
          </h2>
          <div className="grid grid-cols-2 gap-3 lg:gap-5 lg:grid-cols-6">
            {scored.slice(3).map((item) => (
              <ThreePLCard key={item.id} data={item} />
            ))}
          </div>
        </section>
      )}

      {/* FAQ */}
      <FAQ
        items={[
          t("directory.faqAvgCost", { state: formatName(state) }),
          t("directory.faqSpeed", { state: formatName(state) }),
          t("directory.faqPlatforms", { state: formatName(state) }),
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
