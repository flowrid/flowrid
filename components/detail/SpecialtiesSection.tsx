import { formatName, formatState } from "@/lib/detail-content";
import Link from "next/link";

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
            {categories.map((c) => (
              <Link
                key={c}
                href={`/3pl/${state}/${c}`}
                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-text-secondary hover:text-text transition-colors"
              >
                {formatName(c)}
              </Link>
            ))}
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
                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-text-secondary hover:text-text transition-colors"
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
                className="px-3 py-1.5 bg-gray-100 rounded-lg text-sm text-text-secondary"
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
          <Link href={`/3pl/${state}`} className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-text-secondary hover:text-text transition-colors">
            {stateFormatted} 3PL
          </Link>
          {(categories || []).slice(0, 3).map((c) => (
            <Link
              key={c}
              href={`/3pl/${state}/${c}`}
              className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-text-secondary hover:text-text transition-colors"
            >
              {formatName(c)} Specialist
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
