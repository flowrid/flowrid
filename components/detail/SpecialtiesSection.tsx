import { formatName, formatState } from "@/lib/detail-content";
import Link from "next/link";

const NICHE_ICONS: Record<string, string> = {
  apparel: "Apparel",
  shoes: "Shoes",
  automotive: "Automotive",
  "baby-care": "Baby Care",
  baby: "Baby Care",
  beauty: "Beauty & Personal Care",
  cosmetics: "Beauty & Personal Care",
  "personal-care": "Beauty & Personal Care",
  books: "Books & Publishing",
  publishing: "Books & Publishing",
  electronics: "Electronics",
  food: "Food & Beverage",
  "food-beverage": "Food & Beverage",
  grocery: "Food & Beverage",
  health: "Health & Pharma",
  pharma: "Health & Pharma",
  supplements: "Health & Pharma",
  home: "Home & Garden",
  "home-garden": "Home & Garden",
  furniture: "Home & Garden",
  jewelry: "Jewelry & Accessories",
  accessories: "Jewelry & Accessories",
  lighting: "Lighting",
  luggage: "Luggage & Travel",
  "travel-gear": "Luggage & Travel",
  office: "Office & Stationery",
  stationery: "Office & Stationery",
  "pet-supplies": "Pet Supplies",
  pets: "Pet Supplies",
  sports: "Sports & Outdoors",
  toys: "Toys & Games",
  games: "Toys & Games",
  "arts-crafts": "Arts & Crafts",
  crafts: "Arts & Crafts",
  "collectibles": "Arts & Crafts",
};

function getNicheIcon(category: string): { icon: string; label: string } | null {
  const key = category.toLowerCase().replace(/[^a-z-]/g, "");
  let match: string | null = null;
  if (NICHE_ICONS[category]) match = NICHE_ICONS[category];
  else if (NICHE_ICONS[key]) match = NICHE_ICONS[key];
  else {
    for (const [k, v] of Object.entries(NICHE_ICONS)) {
      if (category.includes(k) || k.includes(category)) { match = v; break; }
    }
  }
  if (!match) return null;
  return { icon: match, label: match };
}

interface SpecialtiesSectionProps {
  name: string;
  state: string;
  categories: string[];
  platforms: string[];
  integrations: string[];
}

export default function SpecialtiesSection({
  name,
  state,
  categories,
  platforms,
  integrations,
}: SpecialtiesSectionProps) {
  const stateFormatted = formatState(state);

  return (
    <section className="space-y-8">
      {/* Niches Served */}
      {categories && categories.length > 0 && (
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-text mb-2">Niches Served</h2>
          <p className="text-text-secondary text-sm mb-3">
            Product categories and industries {name} specializes in.
          </p>
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => {
              const info = getNicheIcon(c);
              return (
                <Link
                  key={c}
                  href={`/3pl/${state}/${c}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-border rounded-lg text-sm text-text-secondary hover:text-text hover:border-primary/40 transition-colors"
                >
                  {info && (
                    <img
                      src={`/images/niches/${info.icon}.png`}
                      alt=""
                      className="h-4 w-auto shrink-0"
                    />
                  )}
                  {info ? info.label : formatName(c)}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Platform Integrations */}
      {platforms && platforms.length > 0 && (
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-text mb-2">Platform Integrations</h2>
          <p className="text-text-secondary text-sm mb-3">
            eCommerce platforms and marketplaces {name} integrates with.
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
          <h2 className="text-xl md:text-2xl font-bold text-text mb-2">Value Added Services</h2>
          <p className="text-text-secondary text-sm mb-3">
            Additional services {name} provides beyond core fulfillment.
          </p>
          <div className="flex flex-wrap gap-2">
            {integrations.map((s) => (
              <span
                key={s}
                className="px-3 py-1.5 border border-border rounded-lg text-sm text-text-secondary"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Certifications */}
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-text mb-2">Certifications</h2>
        <p className="text-text-secondary text-sm mb-3">
          Industry certifications and compliance standards.
        </p>
        <div className="flex flex-wrap gap-2">
          <Link href={`/3pl/${state}`} className="px-3 py-1.5 border border-border rounded-lg text-sm text-text-secondary hover:text-text hover:border-primary/40 transition-colors">
            {stateFormatted} 3PL
          </Link>
          {(categories || []).slice(0, 3).map((c) => (
            <Link
              key={c}
              href={`/3pl/${state}/${c}`}
              className="px-3 py-1.5 border border-border rounded-lg text-sm text-text-secondary hover:text-text hover:border-primary/40 transition-colors"
            >
              {formatName(c)} Specialist
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
