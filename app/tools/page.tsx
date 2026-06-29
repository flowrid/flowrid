import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { CATEGORIES } from "@/lib/tools-data";
import ToolIcon from "@/components/tools/ToolIcon";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return {
    title: t("tools.meta.title"),
    description: t("tools.meta.description"),
    keywords: [
      "logistics tools", "ecommerce fulfillment tools", "order tracking software",
      "shipping software", "inventory management", "warehouse tools",
      "3PL tools", "logistics automation", "supply chain software",
    ],
    openGraph: {
      title: t("tools.meta.title"),
      description: t("tools.meta.description"),
      url: "https://www.flowrid.com/tools",
      siteName: "Flowrid",
      type: "website",
    },
  };
}

export default async function ToolsPage() {
  const t = await getTranslations();

  return (
    <div>
      {/* Hero */}
      <section className="mb-12">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-3">
          {t("tools.hero.eyebrow")}
        </p>
        <h1 className="text-3xl md:text-[40px] font-bold tracking-tight text-text leading-[1.15] mb-4 max-w-[720px]">
          {t("tools.hero.title")}
        </h1>
        <p className="text-base md:text-lg text-text-secondary leading-relaxed max-w-[600px]">
          {t("tools.hero.description")}
        </p>
      </section>

      {/* 6 大品类网格 */}
      <section className="mb-16">
        <h2 className="text-xl font-bold text-text mb-6">{t("tools.categories.title")}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={`/tools/${cat.slug}`}
              className="group bg-card border border-border rounded-2xl p-6 hover:border-primary/40 hover:shadow-lg transition-all"
            >
              {/* Color bar */}
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 text-white"
                style={{ backgroundColor: cat.color }}
              >
                <ToolIcon icon={cat.icon} />
              </div>
              <h3 className="text-lg font-bold text-text group-hover:text-primary transition-colors mb-1.5">
                {t(cat.titleKey)}
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed mb-3">
                {t(cat.descriptionKey)}
              </p>
              <p className="text-xs text-text-secondary/60 italic">
                {t(cat.questionKey)}
              </p>
              <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                <span className="text-xs text-text-secondary">
                  {cat.toolSlugs.length} tools reviewed
                </span>
                <span className="text-sm font-medium text-primary group-hover:translate-x-1 transition-transform">
                  Explore →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Free Tools */}
      <section className="mb-16">
        <h2 className="text-xl font-bold text-text mb-2">Free Tools</h2>
        <p className="text-sm text-text-secondary mb-6 max-w-[500px] leading-relaxed">Built by Flowrid. No sign-up required. Just useful tools to help you make better logistics decisions.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link href="/tools/shipping-calculator" className="group bg-card border border-border rounded-2xl p-6 hover:border-primary/40 hover:shadow-lg transition-all">
            <div className="w-10 h-10 rounded-xl bg-[#16A34A]/10 flex items-center justify-center mb-4 text-2xl">📦</div>
            <h3 className="text-lg font-bold text-text group-hover:text-primary transition-colors mb-1.5">Shipping Rate Calculator</h3>
            <p className="text-sm text-text-secondary leading-relaxed mb-3">Compare live rates from USPS, UPS, and FedEx in seconds. Enter your package details and see which carrier saves you the most.</p>
            <span className="text-sm font-medium text-primary group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">Try it →</span>
          </Link>
          <Link href="/tools/rfq-generator" className="group bg-card border border-border rounded-2xl p-6 hover:border-primary/40 hover:shadow-lg transition-all">
            <div className="w-10 h-10 rounded-xl bg-[#7C3AED]/10 flex items-center justify-center mb-4 text-2xl">🎯</div>
            <h3 className="text-lg font-bold text-text group-hover:text-primary transition-colors mb-1.5">RFQ Generator</h3>
            <p className="text-sm text-text-secondary leading-relaxed mb-3">Get matched with the best 3PLs for your business. Answer 4 quick questions and we'll curate a list of perfect-fit fulfillment partners.</p>
            <span className="text-sm font-medium text-primary group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">Get matched →</span>
          </Link>
          <Link href="/tools/fulfillment-cost-estimator" className="group bg-card border border-border rounded-2xl p-6 hover:border-primary/40 hover:shadow-lg transition-all">
            <div className="w-10 h-10 rounded-xl bg-[#FF9500]/10 flex items-center justify-center mb-4 text-2xl">📊</div>
            <h3 className="text-lg font-bold text-text group-hover:text-primary transition-colors mb-1.5">Fulfillment Cost Estimator</h3>
            <p className="text-sm text-text-secondary leading-relaxed mb-3">Estimate your monthly 3PL costs — order processing, pick fees, storage, and shipping. Based on industry benchmarks.</p>
            <span className="text-sm font-medium text-primary group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">Estimate costs →</span>
          </Link>
        </div>
      </section>

      {/* Why Trust Flowrid */}
      <section className="mb-16 bg-card border border-border rounded-2xl p-8">
        <h2 className="text-xl font-bold text-text mb-4">{t("tools.trust.title")}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <TrustItem
            icon="fa-search"
            title={t("tools.trust.researched")}
            description={t("tools.trust.researchedDesc")}
          />
          <TrustItem
            icon="fa-balance-scale"
            title={t("tools.trust.unbiased")}
            description={t("tools.trust.unbiasedDesc")}
          />
          <TrustItem
            icon="fa-refresh"
            title={t("tools.trust.updated")}
            description={t("tools.trust.updatedDesc")}
          />
        </div>
      </section>
    </div>
  );
}

function TrustItem({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-3">
      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 text-primary">
        <ToolIcon icon={icon} />
      </div>
      <div>
        <h3 className="text-sm font-bold text-text mb-1">{title}</h3>
        <p className="text-sm text-text-secondary leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
