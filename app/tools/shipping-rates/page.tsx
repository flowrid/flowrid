import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { SHIPPING_TOOLS, CATEGORIES } from "@/lib/tools-data";
import ToolCard from "@/components/tools/ToolCard";
import ToolComparisonTable from "@/components/tools/ToolComparisonTable";
import SelectionGuide, { type SelectionOption } from "@/components/tools/SelectionGuide";
import ToolIcon from "@/components/tools/ToolIcon";
import CrossSell3PL from "@/components/tools/CrossSell3PL";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return {
    title: t("tools.categories.shipping"),
    description: t("tools.shipping.metaDesc"),
    keywords: ["shipping software", "multi-carrier shipping", "freight quotes", "Shippo alternative", "Easyship", "international shipping", "compare shipping rates"],
    openGraph: { title: t("tools.categories.shipping") + " | Flowrid Tools", description: t("tools.shipping.metaDesc"), url: "https://www.flowrid.com/tools/shipping-rates", siteName: "Flowrid", type: "website" },
  };
}

const SELECTION_OPTIONS: SelectionOption[] = [
  { condition: "You need affordable domestic shipping with no monthly commitment and great API access", recommendation: "Choose Shippo", toolSlug: "shippo-shipping", reason: "Pay-as-you-go, 85+ carriers, up to 80% off retail rates" },
  { condition: "You ship internationally (20%+ of orders) and need landed cost at checkout to reduce cart abandonment", recommendation: "Choose Easyship", toolSlug: "easyship-shipping", reason: "Best-in-class international: duties + taxes + shipping calculated pre-checkout" },
  { condition: "You import containers/pallets from overseas and need to compare freight forwarder quotes instantly", recommendation: "Choose Freightos", toolSlug: "freightos", reason: "75+ forwarders, instant quotes, free to search — transforms a 2-week process into 30 seconds" },
  { condition: "You want a full-service freight partner to handle everything — not just software, but actual logistics", recommendation: "Choose Flexport", toolSlug: "flexport", reason: "End-to-end managed freight with best-in-class visibility platform" },
  { condition: "You're an enterprise with 1,000+ monthly shipments across multiple modes (ocean/truck/rail/parcel)", recommendation: "Choose project44", toolSlug: "project44", reason: "Most comprehensive carrier network with AI-powered ETA predictions" },
];

export default async function ShippingRatesPage() {
  const t = await getTranslations();
  const cat = CATEGORIES.find((c) => c.slug === "shipping-rates")!;

  return (
    <div>
      <nav className="flex items-center gap-2 text-sm text-text-secondary mt-2 mb-8">
        <Link href="/tools" className="hover:text-text transition-colors">Tools</Link>
        <span>/</span>
        <span className="text-text font-medium">{t(cat.titleKey)}</span>
      </nav>

      <section className="mb-12">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: cat.color }}>
            <ToolIcon icon={cat.icon} />
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">{t("tools.shipping.hero.eyebrow")}</p>
        </div>
        <h1 className="text-3xl md:text-[40px] font-bold tracking-tight text-text leading-[1.15] mb-4 max-w-[720px]">{t("tools.shipping.hero.title")}</h1>
        <p className="text-base md:text-lg text-text-secondary leading-relaxed max-w-[640px]">{t("tools.shipping.hero.description")}</p>
      </section>

      <section className="mb-12 bg-gray-50 rounded-2xl p-6 md:p-8 border border-border">
        <h2 className="text-lg font-bold text-text mb-4">{t("tools.shipping.pain.title")}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: "fa-truck", text: t("tools.shipping.pain.overpaying") },
            { icon: "fa-puzzle-piece", text: t("tools.shipping.pain.forwarderEmails") },
            { icon: "fa-clock-o", text: t("tools.shipping.pain.cartAbandonment") },
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

      <section className="mb-12">
        <h2 className="text-xl font-bold text-text mb-4">{t("tools.shipping.comparison.title")}</h2>
        <p className="text-sm text-text-secondary mb-6 max-w-[600px] leading-relaxed">{t("tools.shipping.comparison.description")}</p>
        <ToolComparisonTable tools={SHIPPING_TOOLS} />
      </section>

      <section className="mb-12">
        <SelectionGuide title={t("tools.shipping.guide.title")} description={t("tools.shipping.guide.description")} options={SELECTION_OPTIONS} tools={SHIPPING_TOOLS} />
      </section>

      <section className="mb-12">
        <h2 className="text-xl font-bold text-text mb-6">{t("tools.shipping.deepDive.title")}</h2>
        <div className="space-y-6">
          {SHIPPING_TOOLS.map((tool) => (<ToolCard key={tool.slug} tool={tool} variant="full" />))}
        </div>
      </section>

      <section className="mb-12 bg-card border border-border rounded-2xl p-6 md:p-8">
        <h2 className="text-xl font-bold text-text mb-2">{t("tools.shipping.tutorial.title")}</h2>
        <p className="text-sm text-text-secondary mb-6 max-w-[600px] leading-relaxed">{t("tools.shipping.tutorial.description")}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1,2,3,4].map((n) => (
            <div key={n} className="flex gap-4">
              <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center shrink-0 text-sm font-bold">{n}</div>
              <div>
                <h3 className="text-sm font-bold text-text mb-1">{t(`tools.shipping.tutorial.step${n}Title`)}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{t(`tools.shipping.tutorial.step${n}Desc`)}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-xl flex items-start gap-3">
          <span className="text-primary text-lg shrink-0">💡</span>
          <div>
            <p className="text-sm font-semibold text-text">{t("tools.shipping.tutorial.proTip")}</p>
            <p className="text-sm text-text-secondary mt-1 leading-relaxed">{t("tools.shipping.tutorial.proTipDesc")}</p>
          </div>
        </div>
      </section>

      <CrossSell3PL title={t("tools.shipping.crossSell.title")} description={t("tools.shipping.crossSell.description")} browseAllLabel={t("tools.shipping.crossSell.browseAll")} browseAllDesc={t("tools.shipping.crossSell.browseAllDesc")} />

      <section className="text-center py-12 bg-gradient-to-b from-white to-gray-50 rounded-2xl border border-border">
        <h2 className="text-2xl font-bold text-text mb-3">{t("tools.shipping.bottomCta.title")}</h2>
        <p className="text-text-secondary mb-6 max-w-[480px] mx-auto leading-relaxed">{t("tools.shipping.bottomCta.description")}</p>
        <Link href="/3pl" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary-dark transition-colors">{t("tools.shipping.bottomCta.button")} →</Link>
      </section>
    </div>
  );
}
