import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { AUTOMATION_TOOLS, CATEGORIES } from "@/lib/tools-data";
import ToolCard from "@/components/tools/ToolCard";
import ToolComparisonTable from "@/components/tools/ToolComparisonTable";
import SelectionGuide, { type SelectionOption } from "@/components/tools/SelectionGuide";
import ToolIcon from "@/components/tools/ToolIcon";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return { title: t("tools.categories.automation"), description: t("tools.automation.metaDesc"),
    keywords: ["workflow automation", "logistics automation", "no-code integration", "Make vs Zapier", "n8n", "CartRover", "ecommerce integration"],
    openGraph: { title: t("tools.categories.automation") + " | Flowrid Tools", description: t("tools.automation.metaDesc"), url: "https://www.flowrid.com/tools/automation-integration", siteName: "Flowrid", type: "website" } };
}

const SELECTION_OPTIONS: SelectionOption[] = [
  { condition: "You want the easiest possible setup with the widest app connections — and don't mind paying per task", recommendation: "Choose Zapier", toolSlug: "zapier", reason: "7,000+ integrations, easiest learning curve, mature platform" },
  { condition: "You need complex branching, error handling, and data transformations in your logistics workflows", recommendation: "Choose Make", toolSlug: "make", reason: "Visual scenario builder with best-in-class error handling — 10x more free ops than Zapier" },
  { condition: "You handle sensitive client logistics data and need complete privacy — or want to build AI-powered automation", recommendation: "Choose n8n", toolSlug: "n8n", reason: "Self-hosted, unlimited workflows, AI-native with LLM nodes" },
  { condition: "You're a 3PL connecting multiple brands to your WMS and need logistics-specific middleware", recommendation: "Choose CartRover", toolSlug: "cartrover", reason: "Purpose-built for ecommerce ↔ WMS integration with EDI support" },
  { condition: "You have development resources and need maximum flexibility for custom integrations", recommendation: "Build with APIs", toolSlug: "api", reason: "Complete control, no vendor lock-in, handle any edge case" },
];

export default async function AutomationPage() {
  const t = await getTranslations();
  const cat = CATEGORIES.find((c) => c.slug === "automation-integration")!;
  return (
    <div>
      <nav className="flex items-center gap-2 text-sm text-text-secondary mt-2 mb-8"><Link href="/tools" className="hover:text-text transition-colors">Tools</Link><span>/</span><span className="text-text font-medium">{t(cat.titleKey)}</span></nav>

      <section className="mb-12">
        <div className="flex items-center gap-3 mb-3"><div className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: cat.color }}><ToolIcon icon={cat.icon} /></div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">{t("tools.automation.hero.eyebrow")}</p></div>
        <h1 className="text-3xl md:text-[40px] font-bold tracking-tight text-text leading-[1.15] mb-4 max-w-[720px]">{t("tools.automation.hero.title")}</h1>
        <p className="text-base md:text-lg text-text-secondary leading-relaxed max-w-[640px]">{t("tools.automation.hero.description")}</p>
      </section>

      <section className="mb-12 bg-gray-50 rounded-2xl p-6 md:p-8 border border-border">
        <h2 className="text-lg font-bold text-text mb-4">{t("tools.automation.pain.title")}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[{ icon: "fa-cogs", text: t("tools.automation.pain.manualData") }, { icon: "fa-puzzle-piece", text: t("tools.automation.pain.disconnected") }, { icon: "fa-clock-o", text: t("tools.automation.pain.csvLife") }].map((item) => (
            <div key={item.text} className="flex items-start gap-3 p-4 bg-white rounded-xl border border-border"><div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 text-primary"><ToolIcon icon={item.icon} className="w-4 h-4" /></div><p className="text-sm text-text leading-relaxed">{item.text}</p></div>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-xl font-bold text-text mb-4">{t("tools.automation.comparison.title")}</h2>
        <p className="text-sm text-text-secondary mb-6 max-w-[600px] leading-relaxed">{t("tools.automation.comparison.description")}</p>
        <ToolComparisonTable tools={AUTOMATION_TOOLS} />
      </section>

      <section className="mb-12"><SelectionGuide title={t("tools.automation.guide.title")} description={t("tools.automation.guide.description")} options={SELECTION_OPTIONS} tools={AUTOMATION_TOOLS} /></section>

      <section className="mb-12"><h2 className="text-xl font-bold text-text mb-6">{t("tools.automation.deepDive.title")}</h2><div className="space-y-6">{AUTOMATION_TOOLS.map((tool) => (<ToolCard key={tool.slug} tool={tool} variant="full" />))}</div></section>

      <section className="mb-12 bg-card border border-border rounded-2xl p-6 md:p-8">
        <h2 className="text-xl font-bold text-text mb-2">{t("tools.automation.tutorial.title")}</h2>
        <p className="text-sm text-text-secondary mb-6 max-w-[600px] leading-relaxed">{t("tools.automation.tutorial.description")}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1,2,3,4].map((n) => (<div key={n} className="flex gap-4"><div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center shrink-0 text-sm font-bold">{n}</div><div><h3 className="text-sm font-bold text-text mb-1">{t(`tools.automation.tutorial.step${n}Title`)}</h3><p className="text-sm text-text-secondary leading-relaxed">{t(`tools.automation.tutorial.step${n}Desc`)}</p></div></div>))}
        </div>
        <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-xl flex items-start gap-3"><span className="text-primary text-lg shrink-0">💡</span><div><p className="text-sm font-semibold text-text">{t("tools.automation.tutorial.proTip")}</p><p className="text-sm text-text-secondary mt-1 leading-relaxed">{t("tools.automation.tutorial.proTipDesc")}</p></div></div>
      </section>

      <section className="mb-12"><h2 className="text-xl font-bold text-text mb-2">{t("tools.automation.crossSell.title")}</h2><p className="text-sm text-text-secondary mb-6 max-w-[600px] leading-relaxed">{t("tools.automation.crossSell.description")}</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">{[{ name: "ShipBob", state: "IL", category: "general" }, { name: "Deliverr", state: "CA", category: "general" }, { name: "ShipMonk", state: "FL", category: "general" }].map((pl) => (<Link key={pl.name} href={`/3pl/${pl.state}/${pl.category}`} className="group bg-card border border-border rounded-2xl p-5 hover:border-primary/40 hover:shadow-md transition-all"><div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3 text-primary"><ToolIcon icon="fa-building" className="w-4 h-4" /></div><h3 className="text-base font-bold text-text group-hover:text-primary transition-colors">{pl.name}</h3><p className="text-sm text-text-secondary mt-1">{pl.state} · {pl.category}</p><span className="inline-block mt-3 text-xs font-medium text-primary">View profile →</span></Link>))}<Link href="/3pl" className="group bg-gray-50 border border-dashed border-border rounded-2xl p-5 hover:border-primary/40 hover:shadow-md transition-all flex flex-col items-center justify-center text-center"><div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center mb-3 text-text-secondary"><ToolIcon icon="fa-search" className="w-4 h-4" /></div><h3 className="text-base font-bold text-text group-hover:text-primary transition-colors">{t("tools.automation.crossSell.browseAll")}</h3><p className="text-sm text-text-secondary mt-1">{t("tools.automation.crossSell.browseAllDesc")}</p></Link></div>
      </section>

      <section className="text-center py-12 bg-gradient-to-b from-white to-gray-50 rounded-2xl border border-border"><h2 className="text-2xl font-bold text-text mb-3">{t("tools.automation.bottomCta.title")}</h2><p className="text-text-secondary mb-6 max-w-[480px] mx-auto leading-relaxed">{t("tools.automation.bottomCta.description")}</p><Link href="/3pl" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary-dark transition-colors">{t("tools.automation.bottomCta.button")} →</Link></section>
    </div>
  );
}
