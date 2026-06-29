import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { INVENTORY_TOOLS, CATEGORIES } from "@/lib/tools-data";
import ToolCard from "@/components/tools/ToolCard";
import ToolComparisonTable from "@/components/tools/ToolComparisonTable";
import SelectionGuide, { type SelectionOption } from "@/components/tools/SelectionGuide";
import ToolIcon from "@/components/tools/ToolIcon";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  return { title: t("tools.categories.inventory"), description: t("tools.inventory.metaDesc"),
    keywords: ["inventory management", "warehouse management", "WMS", "multi-channel inventory", "stock sync", "Cin7", "ShipHero"],
    openGraph: { title: t("tools.categories.inventory") + " | Flowrid Tools", description: t("tools.inventory.metaDesc"), url: "https://www.flowrid.com/tools/inventory-warehouse", siteName: "Flowrid", type: "website" } };
}

const SELECTION_OPTIONS: SelectionOption[] = [
  { condition: "You're a scaling brand ($1M+) with multi-channel operations, BOM/kitting, and wholesale alongside DTC", recommendation: "Choose Cin7", toolSlug: "cin7", reason: "Comprehensive inventory lifecycle, landed cost tracking, EDI support" },
  { condition: "You self-fulfill 500+ orders/day and need professional warehouse workflows (pick/pack/ship)", recommendation: "Choose ShipHero", toolSlug: "shiphero", reason: "Ecommerce-native WMS — not a repurposed industrial system" },
  { condition: "You're a 3PL warehouse looking for the industry-standard operating system", recommendation: "Choose Extensiv", toolSlug: "extensiv", reason: "Multi-client WMS + CartRover integration hub + automated billing" },
  { condition: "You're an SMB with wholesale + DTC, already using QuickBooks, and want affordable inventory control", recommendation: "Choose TradeGecko", toolSlug: "tradegecko", reason: "Most affordable entry point with B2B wholesale portal" },
  { condition: "You want unified inventory + orders + profitability analytics in one platform", recommendation: "Choose Skubana", toolSlug: "skubana", reason: "All-in-one operations with demand forecasting and true COGS" },
];

const RELATED_3PLS = [{ name: "ShipBob", state: "IL", category: "general" }, { name: "ShipMonk", state: "FL", category: "general" }, { name: "Extensiv Partner 3PL", state: "CA", category: "general" }];

export default async function InventoryPage() {
  const t = await getTranslations();
  const cat = CATEGORIES.find((c) => c.slug === "inventory-warehouse")!;
  return (
    <div>
      <nav className="flex items-center gap-2 text-sm text-text-secondary mt-2 mb-8"><Link href="/tools" className="hover:text-text transition-colors">Tools</Link><span>/</span><span className="text-text font-medium">{t(cat.titleKey)}</span></nav>

      <section className="mb-12">
        <div className="flex items-center gap-3 mb-3"><div className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: cat.color }}><ToolIcon icon={cat.icon} /></div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">{t("tools.inventory.hero.eyebrow")}</p></div>
        <h1 className="text-3xl md:text-[40px] font-bold tracking-tight text-text leading-[1.15] mb-4 max-w-[720px]">{t("tools.inventory.hero.title")}</h1>
        <p className="text-base md:text-lg text-text-secondary leading-relaxed max-w-[640px]">{t("tools.inventory.hero.description")}</p>
      </section>

      <section className="mb-12 bg-gray-50 rounded-2xl p-6 md:p-8 border border-border">
        <h2 className="text-lg font-bold text-text mb-4">{t("tools.inventory.pain.title")}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[{ icon: "fa-cubes", text: t("tools.inventory.pain.overselling") }, { icon: "fa-puzzle-piece", text: t("tools.inventory.pain.scattered") }, { icon: "fa-clock-o", text: t("tools.inventory.pain.counting") }].map((item) => (
            <div key={item.text} className="flex items-start gap-3 p-4 bg-white rounded-xl border border-border"><div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 text-primary"><ToolIcon icon={item.icon} className="w-4 h-4" /></div><p className="text-sm text-text leading-relaxed">{item.text}</p></div>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-xl font-bold text-text mb-4">{t("tools.inventory.comparison.title")}</h2>
        <p className="text-sm text-text-secondary mb-6 max-w-[600px] leading-relaxed">{t("tools.inventory.comparison.description")}</p>
        <ToolComparisonTable tools={INVENTORY_TOOLS} />
      </section>

      <section className="mb-12"><SelectionGuide title={t("tools.inventory.guide.title")} description={t("tools.inventory.guide.description")} options={SELECTION_OPTIONS} tools={INVENTORY_TOOLS} /></section>

      <section className="mb-12"><h2 className="text-xl font-bold text-text mb-6">{t("tools.inventory.deepDive.title")}</h2><div className="space-y-6">{INVENTORY_TOOLS.map((tool) => (<ToolCard key={tool.slug} tool={tool} variant="full" />))}</div></section>

      <section className="mb-12 bg-card border border-border rounded-2xl p-6 md:p-8">
        <h2 className="text-xl font-bold text-text mb-2">{t("tools.inventory.tutorial.title")}</h2>
        <p className="text-sm text-text-secondary mb-6 max-w-[600px] leading-relaxed">{t("tools.inventory.tutorial.description")}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1,2,3,4].map((n) => (<div key={n} className="flex gap-4"><div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center shrink-0 text-sm font-bold">{n}</div><div><h3 className="text-sm font-bold text-text mb-1">{t(`tools.inventory.tutorial.step${n}Title`)}</h3><p className="text-sm text-text-secondary leading-relaxed">{t(`tools.inventory.tutorial.step${n}Desc`)}</p></div></div>))}
        </div>
        <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-xl flex items-start gap-3"><span className="text-primary text-lg shrink-0">💡</span><div><p className="text-sm font-semibold text-text">{t("tools.inventory.tutorial.proTip")}</p><p className="text-sm text-text-secondary mt-1 leading-relaxed">{t("tools.inventory.tutorial.proTipDesc")}</p></div></div>
      </section>

      <section className="mb-12"><h2 className="text-xl font-bold text-text mb-2">{t("tools.inventory.crossSell.title")}</h2><p className="text-sm text-text-secondary mb-6 max-w-[600px] leading-relaxed">{t("tools.inventory.crossSell.description")}</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">{RELATED_3PLS.map((pl) => (<Link key={pl.name} href={`/3pl/${pl.state}/${pl.category}`} className="group bg-card border border-border rounded-2xl p-5 hover:border-primary/40 hover:shadow-md transition-all"><div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3 text-primary"><ToolIcon icon="fa-building" className="w-4 h-4" /></div><h3 className="text-base font-bold text-text group-hover:text-primary transition-colors">{pl.name}</h3><p className="text-sm text-text-secondary mt-1">{pl.state} · {pl.category}</p><span className="inline-block mt-3 text-xs font-medium text-primary">View profile →</span></Link>))}<Link href="/3pl" className="group bg-gray-50 border border-dashed border-border rounded-2xl p-5 hover:border-primary/40 hover:shadow-md transition-all flex flex-col items-center justify-center text-center"><div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center mb-3 text-text-secondary"><ToolIcon icon="fa-search" className="w-4 h-4" /></div><h3 className="text-base font-bold text-text group-hover:text-primary transition-colors">{t("tools.inventory.crossSell.browseAll")}</h3><p className="text-sm text-text-secondary mt-1">{t("tools.inventory.crossSell.browseAllDesc")}</p></Link></div>
      </section>

      <section className="text-center py-12 bg-gradient-to-b from-white to-gray-50 rounded-2xl border border-border"><h2 className="text-2xl font-bold text-text mb-3">{t("tools.inventory.bottomCta.title")}</h2><p className="text-text-secondary mb-6 max-w-[480px] mx-auto leading-relaxed">{t("tools.inventory.bottomCta.description")}</p><Link href="/3pl" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary-dark transition-colors">{t("tools.inventory.bottomCta.button")} →</Link></section>
    </div>
  );
}
