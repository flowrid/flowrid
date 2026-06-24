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

  // 清理国际数据：过滤脏数据 + 归一化省份缩写
  const PROVINCE_NORMALIZE: Record<string, string> = {
    // 加拿大省份缩写
    on: "ontario", qc: "quebec", bc: "british-columbia", ab: "alberta",
    nb: "new-brunswick", mb: "manitoba", ns: "nova-scotia",
    sk: "saskatchewan", pe: "prince-edward-island", nl: "newfoundland-and-labrador",
    // 澳大利亚州缩写
    nsw: "new-south-wales", vic: "victoria", qld: "queensland",
    sa: "south-australia", wa: "western-australia",
    // 德国州代码
    nrw: "north-rhine-westphalia", nds: "lower-saxony",
    // 英国地区代码
    eng: "england", sct: "scotland", wls: "wales",
  };

  // 已知有效的短代码（ISO国家代码等）
  const KNOWN_SHORT_CODES = new Set(["us", "uk", "ca", "au", "de", "fr", "es", "it",
    "nl", "be", "cn", "jp", "kr", "br", "in", "mx", "pl", "se", "ch", "at", "pt",
    "nz", "sg", "dk", "no", "fi", "ie", "cz", "gr", "hu", "ro", "bg", "ae"]);

  function isValidLocation(s: string): boolean {
    if (!s || s.length < 2 || s.length > 40) return false;
    // 排除含数字的（邮编、门牌号如 46970, 11th-floor, unit-1-xxx）
    if (/\d/.test(s)) return false;
    // 排除含 # 符号的地址
    if (s.includes("#")) return false;
    // 排除过长路径（超过4段）
    if (s.split("-").length > 4) return false;
    // 排除2-3字符的缩写（如 "hu", "he", "d", "an"），只保留已知的
    if (s.length <= 3 && !KNOWN_SHORT_CODES.has(s.toLowerCase())) return false;
    // 排除已知非地点的地址关键词
    const junkWords = ["unit", "floor", "street", "road", "lane", "drive", "avenue",
      "business", "industrial", "trading", "centre", "center", "park", "estate",
      "building", "suite", "office", "warehouse", "depot", "port", "airport",
      "behind", "ground", "upper", "lower", "junction", "exchange", "villa",
      "sitio", "narvarte", "ricardo", "jongno"];
    const lower = s.toLowerCase();
    if (junkWords.some((w) => lower.includes(w))) return false;
    return true;
  }

  const international = allStates
    .filter((s) => !US_STATES.has(s.toLowerCase()))
    .map((s) => PROVINCE_NORMALIZE[s.toLowerCase()] || s)
    .filter(isValidLocation);
  const uniqueInternational = [...new Set(international)].sort();

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

      {/* 第五屏：Flowrid Workspace */}
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
            <h2 className="text-2xl md:text-3xl font-bold text-text leading-tight">
              {t("home.workspaceHeading")}
            </h2>
          </div>
        </div>
      </section>

    </div>
  );
}
