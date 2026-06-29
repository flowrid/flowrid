import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { TRACKING_TOOLS, CATEGORIES } from "@/lib/tools-data";
import ToolCard from "@/components/tools/ToolCard";
import ToolComparisonTable from "@/components/tools/ToolComparisonTable";
import SelectionGuide, { type SelectionOption } from "@/components/tools/SelectionGuide";
import ToolIcon from "@/components/tools/ToolIcon";
import CrossSell3PL from "@/components/tools/CrossSell3PL";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return {
    title: t("tools.categories.tracking"),
    description: t("tools.tracking.metaDesc"),
    keywords: [
      "order tracking software", "package tracking", "post-purchase experience",
      "branded tracking page", "delivery notifications", "AfterShip alternative",
      "17TRACK", "Narvar", "Route", "ParcelPanel",
    ],
    openGraph: {
      title: t("tools.categories.tracking") + " | Flowrid Tools",
      description: t("tools.tracking.metaDesc"),
      url: "https://www.flowrid.com/tools/tracking-visibility",
      siteName: "Flowrid",
      type: "website",
    },
  };
}

const SELECTION_OPTIONS: SelectionOption[] = [
  {
    condition: "You're a Shopify DTC brand doing 200-5,000 orders/month and want a polished experience without breaking the bank",
    recommendation: "Choose ParcelPanel",
    toolSlug: "parcelpanel",
    reason: "Best price-to-feature ratio for Shopify merchants",
  },
  {
    condition: "You need the broadest carrier coverage on a tight budget, and don't mind getting your hands dirty with APIs",
    recommendation: "Choose 17TRACK",
    toolSlug: "17track",
    reason: "2,500+ carriers, free tier available",
  },
  {
    condition: "You want the gold standard — a polished branded experience, AI predictions, and don't mind paying for the best",
    recommendation: "Choose AfterShip",
    toolSlug: "aftership",
    reason: "Most popular, 1,000+ carriers, reduces WISMO by 60%",
  },
  {
    condition: "You're an enterprise retailer doing 10,000+ orders/month and want post-purchase to drive repeat revenue",
    recommendation: "Choose Narvar",
    toolSlug: "narvar",
    reason: "Enterprise-grade with AI issue prediction and post-purchase marketing",
  },
  {
    condition: "You want tracking + package protection in one, especially if you sell high-AOV products ($75+)",
    recommendation: "Choose Route",
    toolSlug: "route",
    reason: "Package protection eliminates lost/stolen/damaged claims",
  },
  {
    condition: "You run an omnichannel brand (online + physical stores) and need both tracking and self-service returns",
    recommendation: "Choose WeSupply",
    toolSlug: "wesupply",
    reason: "All-in-one: tracking + returns + BOPIS in one platform",
  },
];

export default async function TrackingVisibilityPage() {
  const t = await getTranslations();
  const category = CATEGORIES.find((c) => c.slug === "tracking-visibility")!;

  return (
    <div>
      {/* Breadcrumb extension */}
      <nav className="flex items-center gap-2 text-sm text-text-secondary mt-2 mb-8">
        <Link href="/tools" className="hover:text-text transition-colors">
          Tools
        </Link>
        <span>/</span>
        <span className="text-text font-medium">{t(category.titleKey)}</span>
      </nav>

      {/* Hero */}
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
            style={{ backgroundColor: category.color }}
          >
            <ToolIcon icon={category.icon} />
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            {t("tools.tracking.hero.eyebrow")}
          </p>
        </div>
        <h1 className="text-3xl md:text-[40px] font-bold tracking-tight text-text leading-[1.15] mb-4 max-w-[720px]">
          {t("tools.tracking.hero.title")}
        </h1>
        <p className="text-base md:text-lg text-text-secondary leading-relaxed max-w-[640px]">
          {t("tools.tracking.hero.description")}
        </p>
      </section>

      {/* Pain Points — "You're Experiencing" */}
      <section className="mb-12 bg-gray-50 rounded-2xl p-6 md:p-8 border border-border">
        <h2 className="text-lg font-bold text-text mb-4">
          {t("tools.tracking.pain.title")}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: "fa-comments", text: t("tools.tracking.pain.wismo") },
            { icon: "fa-puzzle-piece", text: t("tools.tracking.pain.multiCarrier") },
            { icon: "fa-clock-o", text: t("tools.tracking.pain.time") },
          ].map((item) => (
            <div key={item.text} className="flex items-start gap-3 p-4 bg-white rounded-xl border border-border">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 text-primary">
                <ToolIcon icon={item.icon} className="w-4 h-4" />
              </div>
              <p className="text-sm text-text leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tool Comparison Summary Table */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-text mb-4">
          {t("tools.tracking.comparison.title")}
        </h2>
        <p className="text-sm text-text-secondary mb-6 leading-relaxed max-w-[600px]">
          {t("tools.tracking.comparison.description")}
        </p>
        <ToolComparisonTable tools={TRACKING_TOOLS} />
      </section>

      {/* Selection Guide */}
      <section className="mb-12">
        <SelectionGuide
          title={t("tools.tracking.guide.title")}
          description={t("tools.tracking.guide.description")}
          options={SELECTION_OPTIONS}
          tools={TRACKING_TOOLS}
        />
      </section>

      {/* Deep Dive — Individual Tool Cards */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-text mb-6">
          {t("tools.tracking.deepDive.title")}
        </h2>
        <div className="space-y-6">
          {TRACKING_TOOLS.map((tool) => (
            <ToolCard key={tool.slug} tool={tool} variant="full" />
          ))}
        </div>
      </section>

      {/* Tutorial / Best Practices */}
      <section className="mb-12 bg-card border border-border rounded-2xl p-6 md:p-8">
        <h2 className="text-xl font-bold text-text mb-2">
          {t("tools.tracking.tutorial.title")}
        </h2>
        <p className="text-sm text-text-secondary mb-6 leading-relaxed max-w-[600px]">
          {t("tools.tracking.tutorial.description")}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TutorialStep
            number={1}
            title={t("tools.tracking.tutorial.step1Title")}
            description={t("tools.tracking.tutorial.step1Desc")}
          />
          <TutorialStep
            number={2}
            title={t("tools.tracking.tutorial.step2Title")}
            description={t("tools.tracking.tutorial.step2Desc")}
          />
          <TutorialStep
            number={3}
            title={t("tools.tracking.tutorial.step3Title")}
            description={t("tools.tracking.tutorial.step3Desc")}
          />
          <TutorialStep
            number={4}
            title={t("tools.tracking.tutorial.step4Title")}
            description={t("tools.tracking.tutorial.step4Desc")}
          />
        </div>
        {/* Pro Tip */}
        <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-xl flex items-start gap-3">
          <span className="text-primary text-lg shrink-0">💡</span>
          <div>
            <p className="text-sm font-semibold text-text">{t("tools.tracking.tutorial.proTip")}</p>
            <p className="text-sm text-text-secondary mt-1 leading-relaxed">
              {t("tools.tracking.tutorial.proTipDesc")}
            </p>
          </div>
        </div>
      </section>

      <CrossSell3PL title={t("tools.tracking.crossSell.title")} description={t("tools.tracking.crossSell.description")} browseAllLabel={t("tools.tracking.crossSell.browseAll")} browseAllDesc={t("tools.tracking.crossSell.browseAllDesc")} />

      {/* Bottom CTA */}      {/* Bottom CTA */}
      <section className="text-center py-12 bg-gradient-to-b from-white to-gray-50 rounded-2xl border border-border">
        <h2 className="text-2xl font-bold text-text mb-3">
          {t("tools.tracking.bottomCta.title")}
        </h2>
        <p className="text-text-secondary mb-6 max-w-[480px] mx-auto leading-relaxed">
          {t("tools.tracking.bottomCta.description")}
        </p>
        <Link
          href="/3pl"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary-dark transition-colors"
        >
          {t("tools.tracking.bottomCta.button")} →
        </Link>
      </section>
    </div>
  );
}

function TutorialStep({
  number,
  title,
  description,
}: {
  number: number;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-4">
      <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center shrink-0 text-sm font-bold">
        {number}
      </div>
      <div>
        <h3 className="text-sm font-bold text-text mb-1">{title}</h3>
        <p className="text-sm text-text-secondary leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
