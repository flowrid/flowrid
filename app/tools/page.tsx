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

      {/* Bottom CTA — connect with 3PL */}
      <section className="text-center py-12 bg-gradient-to-b from-white to-gray-50 rounded-2xl border border-border">
        <h2 className="text-2xl font-bold text-text mb-3">
          {t("tools.cta.title")}
        </h2>
        <p className="text-text-secondary mb-6 max-w-[480px] mx-auto leading-relaxed">
          {t("tools.cta.description")}
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link
            href="/3pl"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary-dark transition-colors"
          >
            {t("tools.cta.browse3PL")} →
          </Link>
          <Link
            href="/rfq"
            className="inline-flex items-center gap-2 px-6 py-3 border border-border text-text text-sm font-semibold rounded-xl hover:border-primary hover:text-primary transition-colors"
          >
            {t("tools.cta.submitRFQ")}
          </Link>
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
