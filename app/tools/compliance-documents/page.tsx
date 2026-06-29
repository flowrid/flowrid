import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { COMPLIANCE_TOOLS, CATEGORIES } from "@/lib/tools-data";
import ToolCard from "@/components/tools/ToolCard";
import ToolComparisonTable from "@/components/tools/ToolComparisonTable";
import SelectionGuide, { type SelectionOption } from "@/components/tools/SelectionGuide";
import ToolIcon from "@/components/tools/ToolIcon";
import CrossSell3PL from "@/components/tools/CrossSell3PL";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return { title: t("tools.categories.compliance"), description: t("tools.compliance.metaDesc"),
    keywords: ["tax compliance", "sales tax automation", "cross-border duties", "customs brokerage", "HS codes", "Avalara", "TaxJar", "Zonos", "landed cost", "denied party screening"],
    openGraph: { title: t("tools.categories.compliance") + " | Flowrid Tools", description: t("tools.compliance.metaDesc"), url: "https://www.flowrid.com/tools/compliance-documents", siteName: "Flowrid", type: "website" } };
}

const SELECTION_OPTIONS: SelectionOption[] = [
  { condition: "You have economic nexus in 5+ US states and need comprehensive tax automation with filing in every jurisdiction", recommendation: "Choose Avalara", toolSlug: "avalara", reason: "Industry standard: 13,000+ jurisdictions, auto-filing in all states, exemption management" },
  { condition: "You're a DTC ecommerce brand selling in 2-10 US states and want simple, affordable auto-filing", recommendation: "Choose TaxJar", toolSlug: "taxjar", reason: "Ecommerce-native, $19/month AutoFile, setup in days not weeks" },
  { condition: "You sell internationally (20%+ of orders) and need landed cost at checkout + HS code classification", recommendation: "Choose Zonos", toolSlug: "zonos", reason: "Best-in-class cross-border: landed cost, AI HS codes, denied party screening" },
  { condition: "You import containers into the US and need customs brokerage with modern digital visibility", recommendation: "Choose Flexport Customs", toolSlug: "flexport-compliance", reason: "Licensed brokers + digital dashboard — best of both worlds" },
  { condition: "You're an enterprise with complex global supply chains in 20+ countries, dealing with export controls and sanctions", recommendation: "Choose Descartes", toolSlug: "descartes", reason: "Enterprise standard for global trade compliance: 220+ countries, daily updates" },
];

export default async function CompliancePage() {
  const t = await getTranslations();
  const cat = CATEGORIES.find((c) => c.slug === "compliance-documents")!;
  return (
    <div>
      <nav className="flex items-center gap-2 text-sm text-text-secondary mt-2 mb-8"><Link href="/tools" className="hover:text-text transition-colors">Tools</Link><span>/</span><span className="text-text font-medium">{t(cat.titleKey)}</span></nav>

      <section className="mb-12">
        <div className="flex items-center gap-3 mb-3"><div className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: cat.color }}><ToolIcon icon={cat.icon} /></div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">{t("tools.compliance.hero.eyebrow")}</p></div>
        <h1 className="text-3xl md:text-[40px] font-bold tracking-tight text-text leading-[1.15] mb-4 max-w-[720px]">{t("tools.compliance.hero.title")}</h1>
        <p className="text-base md:text-lg text-text-secondary leading-relaxed max-w-[640px]">{t("tools.compliance.hero.description")}</p>
      </section>

      <section className="mb-12 bg-gray-50 rounded-2xl p-6 md:p-8 border border-border">
        <h2 className="text-lg font-bold text-text mb-4">{t("tools.compliance.pain.title")}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[{ icon: "fa-check-circle", text: t("tools.compliance.pain.nexus") }, { icon: "fa-puzzle-piece", text: t("tools.compliance.pain.hsCodes") }, { icon: "fa-clock-o", text: t("tools.compliance.pain.cartAbandonment") }].map((item) => (
            <div key={item.text} className="flex items-start gap-3 p-4 bg-white rounded-xl border border-border"><div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 text-primary"><ToolIcon icon={item.icon} className="w-4 h-4" /></div><p className="text-sm text-text leading-relaxed">{item.text}</p></div>
          ))}
        </div>
      </section>

      <section className="mb-12"><h2 className="text-xl font-bold text-text mb-4">{t("tools.compliance.comparison.title")}</h2><p className="text-sm text-text-secondary mb-6 max-w-[600px] leading-relaxed">{t("tools.compliance.comparison.description")}</p><ToolComparisonTable tools={COMPLIANCE_TOOLS} /></section>

      <section className="mb-12"><SelectionGuide title={t("tools.compliance.guide.title")} description={t("tools.compliance.guide.description")} options={SELECTION_OPTIONS} tools={COMPLIANCE_TOOLS} /></section>

      <section className="mb-12"><h2 className="text-xl font-bold text-text mb-6">{t("tools.compliance.deepDive.title")}</h2><div className="space-y-6">{COMPLIANCE_TOOLS.map((tool) => (<ToolCard key={tool.slug} tool={tool} variant="full" />))}</div></section>

      <section className="mb-12 bg-card border border-border rounded-2xl p-6 md:p-8">
        <h2 className="text-xl font-bold text-text mb-2">{t("tools.compliance.tutorial.title")}</h2>
        <p className="text-sm text-text-secondary mb-6 max-w-[600px] leading-relaxed">{t("tools.compliance.tutorial.description")}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1,2,3,4].map((n) => (<div key={n} className="flex gap-4"><div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center shrink-0 text-sm font-bold">{n}</div><div><h3 className="text-sm font-bold text-text mb-1">{t(`tools.compliance.tutorial.step${n}Title`)}</h3><p className="text-sm text-text-secondary leading-relaxed">{t(`tools.compliance.tutorial.step${n}Desc`)}</p></div></div>))}
        </div>
        <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-xl flex items-start gap-3"><span className="text-primary text-lg shrink-0">💡</span><div><p className="text-sm font-semibold text-text">{t("tools.compliance.tutorial.proTip")}</p><p className="text-sm text-text-secondary mt-1 leading-relaxed">{t("tools.compliance.tutorial.proTipDesc")}</p></div></div>
      </section>

      <CrossSell3PL title={t("tools.compliance.crossSell.title")} description={t("tools.compliance.crossSell.description")} browseAllLabel={t("tools.compliance.crossSell.browseAll")} browseAllDesc={t("tools.compliance.crossSell.browseAllDesc")} />

      <section className="text-center py-12 bg-gradient-to-b from-white to-gray-50 rounded-2xl border border-border"><h2 className="text-2xl font-bold text-text mb-3">{t("tools.compliance.bottomCta.title")}</h2><p className="text-text-secondary mb-6 max-w-[480px] mx-auto leading-relaxed">{t("tools.compliance.bottomCta.description")}</p><Link href="/3pl" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary-dark transition-colors">{t("tools.compliance.bottomCta.button")} →</Link></section>
    </div>
  );
}
