import { formatName, formatState } from "@/lib/detail-content";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

// Maps category keys to translation paths under detail.categories
const NICHE_TRANSLATION_KEYS: Record<string, string> = {
  apparel: "apparel",
  shoes: "shoes",
  automotive: "automotive",
  "baby-care": "babyCare",
  baby: "babyCare",
  beauty: "beautyAndPersonalCare",
  cosmetics: "beautyAndPersonalCare",
  "personal-care": "beautyAndPersonalCare",
  books: "booksAndPublishing",
  publishing: "booksAndPublishing",
  electronics: "electronics",
  food: "foodAndBeverage",
  "food-beverage": "foodAndBeverage",
  grocery: "foodAndBeverage",
  health: "healthAndPharma",
  pharma: "healthAndPharma",
  supplements: "healthAndPharma",
  home: "homeAndGarden",
  "home-garden": "homeAndGarden",
  furniture: "homeAndGarden",
  jewelry: "jewelryAndAccessories",
  accessories: "jewelryAndAccessories",
  lighting: "lighting",
  luggage: "luggageAndTravel",
  "travel-gear": "luggageAndTravel",
  office: "officeAndStationery",
  stationery: "officeAndStationery",
  "pet-supplies": "petSupplies",
  pets: "petSupplies",
  sports: "sportsAndOutdoors",
  toys: "toysAndGames",
  games: "toysAndGames",
  "arts-crafts": "artsAndCrafts",
  crafts: "artsAndCrafts",
  collectibles: "artsAndCrafts",
};

// VAS service name to translation key mapping
const VAS_TRANSLATION_KEYS: Record<string, string> = {
  "Quality Control": "qualityControl",
  "Kitting": "kitting",
  "Custom Packaging": "customPackaging",
  "Returns Management": "returnsManagement",
  "FBA Prep": "fbaPrep",
  "B2B Fulfillment": "b2bFulfillment",
  "Subscription Box": "subscriptionBox",
  "Crowdfunding Fulfillment": "crowdfundingFulfillment",
  "Cross-docking": "crossDocking",
  "Labeling & Barcoding": "labelingAndBarcoding",
  "Photography": "photography",
  "Gift Wrapping": "giftWrapping",
  "Insert Marketing": "insertMarketing",
  "Same-Day Shipping": "sameDayShipping",
  "International Shipping": "internationalShipping",
  "Hazmat Handling": "hazmatHandling",
  "Temperature-Controlled Storage": "temperatureControlledStorage",
  "Batch/Lot Tracking": "batchLotTracking",
  "Serial Number Tracking": "serialNumberTracking",
  "EDI Integration": "ediIntegration",
};

function getNicheTranslationKey(category: string): string | null {
  const key = category.toLowerCase().replace(/[^a-z-]/g, "");
  if (NICHE_TRANSLATION_KEYS[category]) return NICHE_TRANSLATION_KEYS[category];
  if (NICHE_TRANSLATION_KEYS[key]) return NICHE_TRANSLATION_KEYS[key];
  for (const [k, v] of Object.entries(NICHE_TRANSLATION_KEYS)) {
    if (category.includes(k) || k.includes(category)) return v;
  }
  return null;
}

function getVasTranslationKey(service: string): string | null {
  if (VAS_TRANSLATION_KEYS[service]) return VAS_TRANSLATION_KEYS[service];
  // Try case-insensitive match
  for (const [k, v] of Object.entries(VAS_TRANSLATION_KEYS)) {
    if (k.toLowerCase() === service.toLowerCase()) return v;
  }
  return null;
}

// Helper to access nested translations like detail.categories.apparel
function tCategory(t: Awaited<ReturnType<typeof getTranslations>>, key: string): string {
  return (t as any)(`detail.categories.${key}`);
}

function tVas(t: Awaited<ReturnType<typeof getTranslations>>, key: string, fallback: string): string {
  const translated = (t as any)(`detail.vas.${key}`);
  // If translation returns the key itself, it's missing; use fallback
  if (translated === `detail.vas.${key}`) return fallback;
  return translated;
}

interface SpecialtiesSectionProps {
  name: string;
  state: string;
  categories: string[];
  platforms: string[];
  integrations: string[];
}

export default async function SpecialtiesSection({
  name,
  state,
  categories,
  platforms,
  integrations,
}: SpecialtiesSectionProps) {
  const t = await getTranslations();
  const stateFormatted = formatState(state);

  return (
    <section className="space-y-8">
      {/* Niches Served */}
      {categories && categories.length > 0 && (
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-text mb-2">{t("detail.nichesServed")}</h2>
          <p className="text-text-secondary text-sm mb-3">
            {t("detail.nichesDesc", { name })}
          </p>
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => {
              const transKey = getNicheTranslationKey(c);
              const iconKey = transKey || c.toLowerCase().replace(/[^a-z-]/g, "");
              return (
                <Link
                  key={c}
                  href={`/3pl/${state}/${c}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-border rounded-lg text-sm text-text-secondary hover:text-text hover:border-primary/40 transition-colors"
                >
                  <img
                    src={`/images/niches/${iconKey}.png`}
                    alt=""
                    className="h-4 w-auto shrink-0"
                  />
                  {transKey ? tCategory(t, transKey) : formatName(c)}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Platform Integrations */}
      {platforms && platforms.length > 0 && (
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-text mb-2">{t("detail.platformIntegrations")}</h2>
          <p className="text-text-secondary text-sm mb-3">
            {t("detail.platformsDesc", { name })}
          </p>
          <div className="flex flex-wrap gap-2">
            {platforms.map((p) => (
              <Link
                key={p}
                href={`/3pl/${state}/${p}`}
                className="px-3 py-1.5 border border-border rounded-lg text-sm text-text-secondary hover:text-text hover:border-primary/40 transition-colors"
              >
                {p}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Value Added Services */}
      {integrations && integrations.length > 0 && (
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-text mb-2">{t("detail.valueAddedServices")}</h2>
          <p className="text-text-secondary text-sm mb-3">
            {t("detail.vasDesc", { name })}
          </p>
          <div className="flex flex-wrap gap-2">
            {integrations.map((s) => {
              const vasKey = getVasTranslationKey(s);
              const displayName = vasKey ? tVas(t, vasKey, s) : s;
              return (
                <span
                  key={s}
                  className="px-3 py-1.5 border border-border rounded-lg text-sm text-text-secondary"
                >
                  {displayName}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Certifications */}
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-text mb-2">{t("detail.certifications")}</h2>
        <p className="text-text-secondary text-sm mb-3">
          {t("detail.certsDesc")}
        </p>
        <div className="flex flex-wrap gap-2">
          <Link href={`/3pl/${state}`} className="px-3 py-1.5 border border-border rounded-lg text-sm text-text-secondary hover:text-text hover:border-primary/40 transition-colors">
            {t("detail.state3PL", { state: stateFormatted })}
          </Link>
          {(categories || []).slice(0, 3).map((c) => (
            <Link
              key={c}
              href={`/3pl/${state}/${c}`}
              className="px-3 py-1.5 border border-border rounded-lg text-sm text-text-secondary hover:text-text hover:border-primary/40 transition-colors"
            >
              {t("detail.categorySpecialist", { category: formatName(c) })}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
