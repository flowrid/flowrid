/**
 * translate-data.ts
 *
 * Translates DB values (category slugs, state slugs, speed labels, pricing labels)
 * into localized strings before inserting them into i18n templates.
 *
 * This prevents mixed-language results like:
 *   "FlowX 是一家总部位于 California 的物流商，专注于 Apparel, Electronics"
 */

// ── Category slug → translation key (mirrors SpecialtiesSection NICHE_TRANSLATION_KEYS) ──
const CATEGORY_TRANSLATION_MAP: Record<string, string> = {
  apparel: "detail.categories.apparel",
  shoes: "detail.categories.shoes",
  automotive: "detail.categories.automotive",
  "baby-care": "detail.categories.babyCare",
  baby: "detail.categories.babyCare",
  beauty: "detail.categories.beautyAndPersonalCare",
  cosmetics: "detail.categories.beautyAndPersonalCare",
  "personal-care": "detail.categories.beautyAndPersonalCare",
  books: "detail.categories.booksAndPublishing",
  publishing: "detail.categories.booksAndPublishing",
  electronics: "detail.categories.electronics",
  food: "detail.categories.foodAndBeverage",
  "food-beverage": "detail.categories.foodAndBeverage",
  grocery: "detail.categories.foodAndBeverage",
  health: "detail.categories.healthAndPharma",
  pharma: "detail.categories.healthAndPharma",
  supplements: "detail.categories.healthAndPharma",
  home: "detail.categories.homeAndGarden",
  "home-garden": "detail.categories.homeAndGarden",
  furniture: "detail.categories.homeAndGarden",
  jewelry: "detail.categories.jewelryAndAccessories",
  accessories: "detail.categories.jewelryAndAccessories",
  lighting: "detail.categories.lighting",
  luggage: "detail.categories.luggageAndTravel",
  "travel-gear": "detail.categories.luggageAndTravel",
  office: "detail.categories.officeAndStationery",
  stationery: "detail.categories.officeAndStationery",
  "pet-supplies": "detail.categories.petSupplies",
  pets: "detail.categories.petSupplies",
  sports: "detail.categories.sportsAndOutdoors",
  toys: "detail.categories.toysAndGames",
  games: "detail.categories.toysAndGames",
  "arts-crafts": "detail.categories.artsAndCrafts",
  crafts: "detail.categories.artsAndCrafts",
  collectibles: "detail.categories.artsAndCrafts",
};

// ── State slug → translation key ──
const STATE_TRANSLATION_MAP: Record<string, string> = {
  alabama: "detail.states.alabama",
  alaska: "detail.states.alaska",
  arizona: "detail.states.arizona",
  arkansas: "detail.states.arkansas",
  california: "detail.states.california",
  colorado: "detail.states.colorado",
  connecticut: "detail.states.connecticut",
  delaware: "detail.states.delaware",
  florida: "detail.states.florida",
  georgia: "detail.states.georgia",
  hawaii: "detail.states.hawaii",
  idaho: "detail.states.idaho",
  illinois: "detail.states.illinois",
  indiana: "detail.states.indiana",
  iowa: "detail.states.iowa",
  kansas: "detail.states.kansas",
  kentucky: "detail.states.kentucky",
  louisiana: "detail.states.louisiana",
  maine: "detail.states.maine",
  maryland: "detail.states.maryland",
  massachusetts: "detail.states.massachusetts",
  michigan: "detail.states.michigan",
  minnesota: "detail.states.minnesota",
  mississippi: "detail.states.mississippi",
  missouri: "detail.states.missouri",
  montana: "detail.states.montana",
  nebraska: "detail.states.nebraska",
  nevada: "detail.states.nevada",
  "new-hampshire": "detail.states.newHampshire",
  "new-jersey": "detail.states.newJersey",
  "new-mexico": "detail.states.newMexico",
  "new-york": "detail.states.newYork",
  "north-carolina": "detail.states.northCarolina",
  "north-dakota": "detail.states.northDakota",
  ohio: "detail.states.ohio",
  oklahoma: "detail.states.oklahoma",
  oregon: "detail.states.oregon",
  pennsylvania: "detail.states.pennsylvania",
  "rhode-island": "detail.states.rhodeIsland",
  "south-carolina": "detail.states.southCarolina",
  "south-dakota": "detail.states.southDakota",
  tennessee: "detail.states.tennessee",
  texas: "detail.states.texas",
  utah: "detail.states.utah",
  vermont: "detail.states.vermont",
  virginia: "detail.states.virginia",
  washington: "detail.states.washington",
  "west-virginia": "detail.states.westVirginia",
  wisconsin: "detail.states.wisconsin",
  wyoming: "detail.states.wyoming",
  canada: "detail.states.canada",
  mexico: "detail.states.mexico",
  "united-kingdom": "detail.states.unitedKingdom",
  germany: "detail.states.germany",
  france: "detail.states.france",
  spain: "detail.states.spain",
  italy: "detail.states.italy",
  netherlands: "detail.states.netherlands",
  belgium: "detail.states.belgium",
  china: "detail.states.china",
  japan: "detail.states.japan",
  "south-korea": "detail.states.southKorea",
  australia: "detail.states.australia",
  brazil: "detail.states.brazil",
  india: "detail.states.india",
  poland: "detail.states.poland",
  sweden: "detail.states.sweden",
  switzerland: "detail.states.switzerland",
  austria: "detail.states.austria",
  portugal: "detail.states.portugal",
  // Canadian provinces
  ontario: "detail.states.ontario",
  quebec: "detail.states.quebec",
  "british-columbia": "detail.states.britishColumbia",
  alberta: "detail.states.alberta",
  "new-brunswick": "detail.states.newBrunswick",
  manitoba: "detail.states.manitoba",
  "nova-scotia": "detail.states.novaScotia",
  saskatchewan: "detail.states.saskatchewan",
  "prince-edward-island": "detail.states.princeEdwardIsland",
  "newfoundland-and-labrador": "detail.states.newfoundlandAndLabrador",
  // Australian states
  "new-south-wales": "detail.states.newSouthWales",
  victoria: "detail.states.victoria",
  queensland: "detail.states.queensland",
  "south-australia": "detail.states.southAustralia",
  "western-australia": "detail.states.westernAustralia",
  // German states
  "north-rhine-westphalia": "detail.states.northRhineWestphalia",
  "lower-saxony": "detail.states.lowerSaxony",
  // UK regions
  england: "detail.states.england",
  scotland: "detail.states.scotland",
  wales: "detail.states.wales",
  // Additional countries
  denmark: "detail.states.denmark",
  "new-zealand": "detail.states.newZealand",
  singapore: "detail.states.singapore",
  indonesia: "detail.states.indonesia",
  malaysia: "detail.states.malaysia",
  vietnam: "detail.states.vietnam",
  thailand: "detail.states.thailand",
  philippines: "detail.states.philippines",
  taiwan: "detail.states.taiwan",
  "hong-kong": "detail.states.hongKong",
  "czech-republic": "detail.states.czechRepublic",
  greece: "detail.states.greece",
  hungary: "detail.states.hungary",
  romania: "detail.states.romania",
  bulgaria: "detail.states.bulgaria",
  norway: "detail.states.norway",
  finland: "detail.states.finland",
  ireland: "detail.states.ireland",
  argentina: "detail.states.argentina",
  chile: "detail.states.chile",
  colombia: "detail.states.colombia",
  peru: "detail.states.peru",
  uruguay: "detail.states.uruguay",
  panama: "detail.states.panama",
  "united-arab-emirates": "detail.states.unitedArabEmirates",
  "saudi-arabia": "detail.states.saudiArabia",
  turkey: "detail.states.turkey",
  israel: "detail.states.israel",
  "south-africa": "detail.states.southAfrica",
  egypt: "detail.states.egypt",
  nigeria: "detail.states.nigeria",
  kenya: "detail.states.kenya",
  europe: "detail.states.europe",
  "middle-east": "detail.states.middleEast",
  "asia-pacific": "detail.states.asiaPacific",
};

// ── Speed slug → translation key ──
const SPEED_TRANSLATION_MAP: Record<string, string> = {
  standard: "detail.speedLabels.standard",
  fast: "detail.speedLabels.fast",
  express: "detail.speedLabels.express",
  "same-day": "detail.speedLabels.sameDay",
};

// ── Pricing label → translation key ──
const PRICING_TRANSLATION_MAP: Record<string, string> = {
  competitive: "detail.pricingLabels.competitive",
  "mid-range": "detail.pricingLabels.midRange",
  premium: "detail.pricingLabels.premium",
};

// ── Helper: find translation key from a map with fallback ──
function findKey(map: Record<string, string>, value: string): string | null {
  const lower = value.toLowerCase().replace(/[^a-z-]/g, "");
  if (map[value]) return map[value];
  if (map[lower]) return map[lower];
  for (const [k, v] of Object.entries(map)) {
    if (value.includes(k) || k.includes(value)) return v;
  }
  return null;
}

// ── Public API ──

/**
 * Translate a single category slug into the current locale.
 * Falls back to title-cased display name if no translation key matches.
 */
export function translateCategory(cat: string, t: (key: string) => string): string {
  const key = findKey(CATEGORY_TRANSLATION_MAP, cat);
  if (key) {
    const translated = t(key);
    // If the translation returns the key itself, it's missing — fall back
    if (translated === key) {
      return formatNameFallback(cat);
    }
    return translated;
  }
  return formatNameFallback(cat);
}

/**
 * Translate an array of category slugs, join with the locale-appropriate separator.
 */
export function translateCategories(cats: string[], t: (key: string) => string): string {
  if (!cats || cats.length === 0) return "";
  return cats.map((c) => translateCategory(c, t)).join(", ");
}

/**
 * Translate a state slug (e.g. "california" -> "加利福尼亚州" in zh).
 * Falls back to title-cased display name.
 */
export function translateState(stateSlug: string, t: (key: string) => string): string {
  const key = findKey(STATE_TRANSLATION_MAP, stateSlug);
  if (key) {
    const translated = t(key);
    if (translated === key) {
      return formatNameFallback(stateSlug);
    }
    return translated;
  }
  return formatNameFallback(stateSlug);
}

/**
 * Translate a shipping speed label (e.g. "fast" -> "快速" in zh).
 */
export function translateSpeed(speed: string, t: (key: string) => string): string {
  const lower = speed.toLowerCase().trim();
  const key = SPEED_TRANSLATION_MAP[lower];
  if (key) {
    const translated = t(key);
    if (translated === key) return speed; // fallback to original English
    return translated;
  }
  return speed;
}

/**
 * Translate a pricing level label (e.g. "competitive" -> "具有竞争力" in zh).
 */
export function translatePricing(costLevel: string, t: (key: string) => string): string {
  const key = PRICING_TRANSLATION_MAP[costLevel];
  if (key) {
    const translated = t(key);
    if (translated === key) return costLevel; // fallback to original English
    return translated;
  }
  return costLevel;
}

// ── Fallback formatter (same logic as formatName) ──
function formatNameFallback(s: string): string {
  return s
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
