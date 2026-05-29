import ThreePLCard from "@/components/3PLCard";
import { formatState } from "@/lib/detail-content";
import Link from "next/link";
import type { ThreePL } from "@/types/3pl";

interface AlternativesSectionProps {
  currentSlug: string;
  currentName: string;
  state: string;
  alternatives: ThreePL[];
}

export default function AlternativesSection({
  currentSlug,
  currentName,
  state,
  alternatives,
}: AlternativesSectionProps) {
  const stateFormatted = formatState(state);

  return (
    <section>
      <h2 className="text-xl md:text-2xl font-bold text-text mb-1">
        {currentName} Alternatives
      </h2>
      <p className="text-text-secondary text-sm mb-4">
        Looking for similar 3PL providers? Here are the top alternatives based on
        services, specializations, and fulfillment capabilities.
      </p>

      {alternatives.length === 0 ? (
        <div className="text-center py-8 border border-dashed border-border rounded-xl">
          <p className="text-text-secondary mb-2">
            No alternatives found in {stateFormatted}.
          </p>
          <Link
            href={`/3pl/${state}`}
            className="text-primary hover:underline text-sm"
          >
            Browse all 3PLs in {stateFormatted} &rarr;
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {alternatives.map((alt) => (
            <ThreePLCard
              key={alt.id}
              data={{
                ...alt,
                score: Math.round(alt.rating || 0),
              }}
            />
          ))}
        </div>
      )}
    </section>
  );
}
