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
// Supports direct match, trimmed match, case-insensitive, and fuzzy partial match
const VAS_TRANSLATION_KEYS: Record<string, string> = {
  "Quality Control": "qualityControl",
  "Quality Control Inspections": "qualityControl",
  "QC Inspections": "qualityControl",
  "QC": "qualityControl",
  "Kitting": "kitting",
  "Kitting & Assembly": "kitting",
  "Kitting and Assembly": "kitting",
  "Assembly": "kitting",
  "Custom Packaging": "customPackaging",
  "Custom Packaging & Branding": "customPackaging",
  "Packaging": "customPackaging",
  "Returns Management": "returnsManagement",
  "Returns Processing": "returnsManagement",
  "Returns": "returnsManagement",
  "FBA Prep": "fbaPrep",
  "FBA Preparation": "fbaPrep",
  "Amazon FBA Prep": "fbaPrep",
  "FBA": "fbaPrep",
  "B2B Fulfillment": "b2bFulfillment",
  "B2B": "b2bFulfillment",
  "Wholesale Fulfillment": "b2bFulfillment",
  "Subscription Box": "subscriptionBox",
  "Subscription Boxes": "subscriptionBox",
  "Subscription": "subscriptionBox",
  "Crowdfunding Fulfillment": "crowdfundingFulfillment",
  "Crowdfunding": "crowdfundingFulfillment",
  "Cross-docking": "crossDocking",
  "Cross Docking": "crossDocking",
  "Crossdock": "crossDocking",
  "Labeling & Barcoding": "labelingAndBarcoding",
  "Labeling and Barcoding": "labelingAndBarcoding",
  "Barcoding": "labelingAndBarcoding",
  "Labeling": "labelingAndBarcoding",
  "Photography": "photography",
  "Product Photography": "photography",
  "Photo": "photography",
  "Gift Wrapping": "giftWrapping",
  "Gift Wrap": "giftWrapping",
  "Insert Marketing": "insertMarketing",
  "Marketing Inserts": "insertMarketing",
  "Same-Day Shipping": "sameDayShipping",
  "Same Day Shipping": "sameDayShipping",
  "Same Day": "sameDayShipping",
  "International Shipping": "internationalShipping",
  "International": "internationalShipping",
  "Hazmat Handling": "hazmatHandling",
  "Hazmat": "hazmatHandling",
  "Hazardous Materials": "hazmatHandling",
  "Temperature-Controlled Storage": "temperatureControlledStorage",
  "Temperature Controlled Storage": "temperatureControlledStorage",
  "Cold Storage": "temperatureControlledStorage",
  "Cold Chain": "temperatureControlledStorage",
  "Refrigerated Storage": "temperatureControlledStorage",
  "Batch/Lot Tracking": "batchLotTracking",
  "Batch Lot Tracking": "batchLotTracking",
  "Lot Tracking": "batchLotTracking",
  "Serial Number Tracking": "serialNumberTracking",
  "Serial Tracking": "serialNumberTracking",
  "EDI Integration": "ediIntegration",
  "EDI": "ediIntegration",
  "Pick and Pack": "pickAndPack",
  "Pick & Pack": "pickAndPack",
  "Warehousing": "warehousing",
  "Storage": "warehousing",
  "Freight Forwarding": "freightForwarding",
  "Freight": "freightForwarding",
  "DTF Fulfillment": "dtfFulfillment",
  "DTF": "dtfFulfillment",
  "Print on Demand": "printOnDemand",
  "POD": "printOnDemand",
  "Dropshipping": "dropshipping",
  "Drop Ship": "dropshipping",
  // User-reported missing services
  "Customization - Embroidery": "customizationEmbroidery",
  "Embroidery": "customizationEmbroidery",
  "Logistics - Domestic (FTL & LTL)": "logisticsDomestic",
  "Domestic FTL": "logisticsDomestic",
  "Domestic LTL": "logisticsDomestic",
  "FTL & LTL": "logisticsDomestic",
  "Logistics - End To End Import": "logisticsEndToEndImport",
  "End To End Import": "logisticsEndToEndImport",
  "Import Logistics": "logisticsEndToEndImport",
  "Logistics - Port Drayage": "logisticsPortDrayage",
  "Port Drayage": "logisticsPortDrayage",
  "Drayage": "logisticsPortDrayage",
  "Product Auditing & QA": "productAuditingQA",
  "Product Auditing and QA": "productAuditingQA",
  "Auditing & QA": "productAuditingQA",
  "QA": "productAuditingQA",
  "Ticketing and Packing": "ticketingAndPacking",
  "Ticketing & Packing": "ticketingAndPacking",
  "Bagging and Sealing": "baggingAndSealing",
  "Bagging & Sealing": "baggingAndSealing",
  "Sealing": "baggingAndSealing",
  "Customization - Handwritten Note": "customizationHandwrittenNote",
  "Handwritten Note": "customizationHandwrittenNote",
  "Operations - Customer Service Call Center": "operationsCustomerServiceCallCenter",
  "Customer Service Call Center": "operationsCustomerServiceCallCenter",
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
  if (!service) return null;
  const trimmed = service.trim();
  if (!trimmed) return null;

  // Direct match (most specific first)
  if (VAS_TRANSLATION_KEYS[trimmed]) return VAS_TRANSLATION_KEYS[trimmed];

  // Case-insensitive direct match
  const lowerTrimmed = trimmed.toLowerCase();
  for (const [k, v] of Object.entries(VAS_TRANSLATION_KEYS)) {
    if (k.toLowerCase() === lowerTrimmed) return v;
  }

  // Fuzzy: try to find any key that is contained within the service name or vice versa
  // Match longer keys first for specificity
  const sortedKeys = Object.keys(VAS_TRANSLATION_KEYS).sort((a, b) => b.length - a.length);
  for (const k of sortedKeys) {
    const lowerK = k.toLowerCase();
    if (lowerTrimmed.includes(lowerK) || lowerK.includes(lowerTrimmed)) {
      return VAS_TRANSLATION_KEYS[k];
    }
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
