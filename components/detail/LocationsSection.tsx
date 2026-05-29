import { formatState } from "@/lib/detail-content";
import MapView from "@/components/detail/MapView";
import Link from "next/link";

interface LocationsSectionProps {
  name: string;
  city: string;
  state: string;
  lat?: number;
  lng?: number;
}

export default function LocationsSection({
  name,
  city,
  state,
  lat,
  lng,
}: LocationsSectionProps) {
  const stateFormatted = formatState(state);
  const hasCoords = lat !== undefined && lng !== undefined;

  return (
    <section>
      <h2 className="text-xl md:text-2xl font-bold text-text mb-1">
        {name} Locations
      </h2>
      <p className="text-text-secondary text-sm mb-4">
        {name} has fulfillment centers strategically located to optimize
        shipping times and costs.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 动态地图 */}
        <div className="rounded-xl overflow-hidden" style={{ minHeight: "300px" }}>
          {hasCoords ? (
            <MapView
              lat={lat!}
              lng={lng!}
              name={name}
              city={city}
              state={state}
              className="rounded-xl"
            />
          ) : (
            <div className="bg-gray-100 rounded-xl flex items-center justify-center"
              style={{ minHeight: "300px" }}>
              <div className="text-center text-text-secondary">
                <svg className="w-10 h-10 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <p className="text-sm">
                  {city ? `${city}, ${stateFormatted}` : stateFormatted}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* 地点列表 */}
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-text">
                  {city ? `${city}, ${stateFormatted}` : stateFormatted}
                </p>
                <p className="text-sm text-text-secondary mt-0.5">
                  Primary Fulfillment Center
                </p>
                <p className="text-xs text-text-secondary mt-1">
                  Contact {name} for exact warehouse address and tour
                  availability.
                </p>
              </div>
            </div>
          </div>

          {/* 位置标签链接 */}
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/3pl/${state}`}
              className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-text-secondary hover:text-text transition-colors"
            >
              {stateFormatted}
            </Link>
            {hasCoords && (
              <a
                href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}&zoom=14`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-primary hover:text-primary-dark transition-colors"
              >
                View Larger Map &rarr;
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
