import HeroSearch from "@/components/HeroSearch";
import ThreePLCard from "@/components/3PLCard";
import TabbedDirectory from "@/components/TabbedDirectory";
import { createServerClient } from "@/lib/supabase";
import { getTranslations } from "next-intl/server";
import { rankThreePLs } from "@/lib/scoring";
import { translateCategory, translateState } from "@/lib/translate-data";
import Link from "next/link";
import type { ThreePL } from "@/types/3pl";

export const dynamic = "force-dynamic";

/**
 * Flowrid 首页 — 搜索入口 + 真实数据导航 + 精选 3PL
 */
export default async function Home() {
  const t = await getTranslations();
  const supabase = createServerClient();

  // 拉取所有 3PL 数据
  const query = supabase
    ?.from("pl_providers")
    .select("*")
    .order("rating", { ascending: false })
    .limit(5000);
  const allProviders = query ? (await query).data : null;

  const providers = (allProviders as ThreePL[]) || [];

  // 提取唯一 Categories
  const categories = [
    ...new Set(providers.flatMap((p) => p.categories || [])),
  ].sort();

  // 提取唯一 States / Countries
  const allStates = [...new Set(providers.map((p) => p.state).filter(Boolean))].sort();

  // 分离 US States 和 International
  const US_STATES = new Set([
    "alabama","alaska","arizona","arkansas","california","colorado","connecticut","delaware",
    "florida","georgia","hawaii","idaho","illinois","indiana","iowa","kansas","kentucky",
    "louisiana","maine","maryland","massachusetts","michigan","minnesota","mississippi",
    "missouri","montana","nebraska","nevada","new-hampshire","new-jersey","new-mexico",
    "new-york","north-carolina","north-dakota","ohio","oklahoma","oregon","pennsylvania",
    "rhode-island","south-carolina","south-dakota","tennessee","texas","utah","vermont",
    "virginia","washington","west-virginia","wisconsin","wyoming",
  ]);

  const usStates = allStates.filter((s) => US_STATES.has(s.toLowerCase()));

  // 第一步：缩写/代码归一化为完整名称
  const ABBREV_NORMALIZE: Record<string, string> = {
    // 加拿大省份
    on: "ontario", qc: "quebec", bc: "british-columbia", ab: "alberta",
    nb: "new-brunswick", mb: "manitoba", ns: "nova-scotia",
    sk: "saskatchewan", pe: "prince-edward-island", nl: "newfoundland-and-labrador",
    // 澳大利亚
    nsw: "new-south-wales", vic: "victoria", qld: "queensland",
    sa: "south-australia", wa: "western-australia",
    // 德国
    nrw: "north-rhine-westphalia", nds: "lower-saxony", d: "germany",
    he: "hesse", // Hesse
    // 英国
    eng: "england", sct: "scotland", wls: "wales",
    // 其他
    hu: "hungary", is: "iceland",
  };

  // 短代码明确排除列表（不是有效地点）
  const EXCLUDED_CODES = new Set(["dl", "hb", "an", "li", "zh", "ti"]);

  // 第二步：地理位置→国家（所有非国家地名归入所属国家）
  const GEO_TO_COUNTRY: Record<string, string> = {
    // ===== 美国 =====
    "united-states": "united-states", "us-east": "united-states",
    // ===== 亚洲 =====
    china: "china", "guangdong-province": "china", "shenzhen-city": "china",
    "shang-hai-shi": "china", "jiang-su-sheng": "china",
    japan: "japan", "south-korea": "south-korea", "jongno-gu-seoul": "south-korea",
    india: "india", haryana: "india",
    singapore: "singapore", indonesia: "indonesia", jakarta: "indonesia",
    banten: "indonesia", malaysia: "malaysia", selangor: "malaysia",
    vietnam: "vietnam", "binh-thanh-dist-ho-chi-minh": "vietnam",
    "ha-noi": "vietnam",
    thailand: "thailand", philippines: "philippines",
    taiwan: "taiwan", "hong-kong": "hong-kong",
    // ===== 欧洲 =====
    "united-kingdom": "united-kingdom", england: "united-kingdom",
    scotland: "united-kingdom", wales: "united-kingdom",
    // 英国城市/郡
    crawley: "united-kingdom", "cheshire-neston": "united-kingdom",
    "leicestershire-coalville": "united-kingdom",
    germany: "germany", "north-rhine-westphalia": "germany",
    "lower-saxony": "germany", bavaria: "germany", hesse: "germany",
    france: "france", "provence-alpes-côte-dazur": "france",
    "auvergne-rhône-alpes": "france",
    spain: "spain", italy: "italy", veneto: "italy",
    netherlands: "netherlands", belgium: "belgium",
    "région-wallonne": "belgium", vlaanderen: "belgium",
    poland: "poland", "województwo-śląskie": "poland",
    sweden: "sweden", "stockholms-län": "sweden",
    switzerland: "switzerland", austria: "austria",
    niederosterreich: "austria",
    portugal: "portugal", denmark: "denmark", norway: "norway",
    oslo: "norway", finland: "finland", ireland: "ireland",
    "czech-republic": "czech-republic", prague: "czech-republic",
    greece: "greece", hungary: "hungary", romania: "romania",
    bulgaria: "bulgaria", plovdiv: "bulgaria",
    iceland: "iceland",
    // ===== 北美 =====
    canada: "canada", ontario: "canada", quebec: "canada",
    "british-columbia": "canada", alberta: "canada",
    "new-brunswick": "canada", manitoba: "canada",
    "nova-scotia": "canada", saskatchewan: "canada",
    "prince-edward-island": "canada", "newfoundland-and-labrador": "canada",
    mexico: "mexico", "ciudad-de-méxico": "mexico",
    "narvarte-poniente-ciudad-de-méxico": "mexico",
    "ricardo-flores-magón-veracruz": "mexico",
    // ===== 南美 =====
    brazil: "brazil", argentina: "argentina",
    "cdad.-autónoma-de-buenos-aires": "argentina",
    chile: "chile", "región-metropolitana": "chile",
    colombia: "colombia", peru: "peru",
    uruguay: "uruguay", "departamento-de-montevideo": "uruguay",
    panama: "panama", "provincia-de-colón": "panama",
    // ===== 大洋洲 =====
    australia: "australia", "new-south-wales": "australia",
    victoria: "australia", queensland: "australia",
    "south-australia": "australia", "western-australia": "australia",
    "new-zealand": "new-zealand", auckland: "new-zealand",
    "auckland-region": "new-zealand",
    // ===== 中东/非洲 =====
    "united-arab-emirates": "united-arab-emirates", dubai: "united-arab-emirates",
    "jabal-ali-south-dubai": "united-arab-emirates",
    "behind-dubai-duty-free-dubai": "united-arab-emirates",
    "saudi-arabia": "saudi-arabia", turkey: "turkey",
    israel: "israel", "south-africa": "south-africa",
    egypt: "egypt", nigeria: "nigeria", kenya: "kenya",
    // ===== 区域 =====
    europe: "europe", "middle-east": "middle-east", apac: "asia-pacific",
  };

  // 处理流程：缩写归一化 → 国家映射 → 去重
  const internationalRaw = allStates.filter((s) => !US_STATES.has(s.toLowerCase()));
  const internationalMapped = internationalRaw
    .map((s) => {
      const lower = s.toLowerCase().trim();
      // 排除纯数字和明显地址（含数字的）
      if (/^\d/.test(lower) || /\d/.test(lower)) return null;
      if (lower.includes("#") || lower.includes("floor") || lower.includes("unit-")) return null;
      if (EXCLUDED_CODES.has(lower)) return null;
      // 检查缩写表
      if (lower in ABBREV_NORMALIZE) {
        const normalized = ABBREV_NORMALIZE[lower];
        return GEO_TO_COUNTRY[normalized] || null;
      }
      // 直接匹配国家映射
      return GEO_TO_COUNTRY[lower] || null;
    })
    .filter((s): s is string => s !== null);
  const uniqueInternational = [...new Set(internationalMapped)].sort();

  // 提取唯一 Platforms
  const platforms = [
    ...new Set(providers.flatMap((p) => p.platforms || [])),
  ].sort();

  // 精选推荐：评分排序取前 6
  const featured = providers
    .map((p) => ({
      ...p,
      score: (p.rating || 0),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);

  // Category 显示名 — 使用 translate-data 的正确 slug→key 映射
  function catDisplay(cat: string): string {
    return translateCategory(cat, t as (k: string) => string);
  }

  // State 显示名 — 使用 translate-data
  function stateDisplay(s: string): string {
    return translateState(s, t as (k: string) => string);
  }

  return (
    <div>
      <HeroSearch />

      {/* Featured 3PLs */}
      {featured.length > 0 && (
        <section className="max-w-[1460px] mx-auto px-4 py-12">
          <h2 className="text-xl font-bold text-text text-center mb-2">
            {t("home.sectionHeading")}
          </h2>
          <p className="text-text-secondary text-center text-sm mb-8">
            {t("home.sectionDesc")}
          </p>
          <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
            {featured.map((item) => (
              <ThreePLCard key={item.id} data={item} />
            ))}
          </div>
          <div className="text-center mt-6">
            <a href="/3pl" className="text-text-secondary hover:text-primary transition-colors text-sm font-medium">
              {t("home.more3PL")}
            </a>
          </div>
        </section>
      )}

      {/* 第四屏：Tab 目录 */}
      <TabbedDirectory
        tabs={[
          { key: "category", label: t("home.tabByCategory") },
          { key: "state", label: t("home.tabByState") },
          { key: "international", label: t("home.tabInternational") },
          { key: "platform", label: t("home.tabByPlatform") },
        ]}
        categories={categories.map((cat) => ({
          key: cat,
          display: catDisplay(cat),
          href: `/3pl?category=${cat}`,
        }))}
        states={usStates.map((s) => ({
          key: s,
          display: stateDisplay(s),
          href: `/3pl/${s}`,
        }))}
        international={uniqueInternational.map((s) => ({
          key: s,
          display: stateDisplay(s),
          href: `/3pl/${s}`,
        }))}
        platforms={platforms.map((p) => ({
          key: p,
          display: p.charAt(0).toUpperCase() + p.slice(1),
          href: `/3pl?platform=${p}`,
        }))}
      />

      {/* 第五屏：Trust Signals */}
      <section className="max-w-[1460px] mx-auto px-4 py-10">
        <div className="bg-card border border-border rounded-2xl p-8 md:p-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <p className="text-3xl md:text-4xl font-bold text-primary">4,000+</p>
              <p className="text-sm font-semibold text-text mt-2">{t("home.trust3pls")}</p>
              <p className="text-xs text-text-secondary mt-1">{t("home.trust3plsDesc")}</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-bold text-primary">50</p>
              <p className="text-sm font-semibold text-text mt-2">{t("home.trustStates")}</p>
              <p className="text-xs text-text-secondary mt-1">{t("home.trustStatesDesc")}</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-bold text-primary">20+</p>
              <p className="text-sm font-semibold text-text mt-2">{t("home.trustCategories")}</p>
              <p className="text-xs text-text-secondary mt-1">{t("home.trustCategoriesDesc")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* 第六屏：Flowrid Workspace */}
      <section className="max-w-[1460px] mx-auto px-4 py-12">
        <div className="flex flex-col lg:grid lg:grid-cols-[65%_35%] items-center gap-10 lg:gap-16">
          <div>
            <img
              src="/images/flowrid-workspace.webp"
              alt="Flowrid Workspace"
              className="w-full rounded-xl shadow-lg"
            />
          </div>
          <div className="text-center lg:text-left">
            <h2 className="text-2xl md:text-3xl font-bold text-text leading-tight mb-4">
              {t("home.workspaceHeading")}
            </h2>
            <p className="text-text-secondary leading-relaxed mb-6">
              {t("home.workspaceDesc")}
            </p>
            <a
              href="/join"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary-dark transition-colors"
            >
              {t("home.workspaceCTA")} →
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}
