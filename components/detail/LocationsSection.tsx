import { formatState } from "@/lib/detail-content";
import Link from "next/link";

interface LocationsSectionProps {
  name: string;
  city: string;
  state: string;
}

export default function LocationsSection({ name, city, state }: LocationsSectionProps) {
  const stateFormatted = formatState(state);

  return (
    <section>
      <h2 className="text-xl md:text-2xl font-bold text-text mb-1">{name} Locations</h2>
      <p className="text-text-secondary text-sm mb-4">
        {name} has fulfillment centers strategically located to optimize shipping times and costs.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 地图占位 */}
        <div className="bg-gradient-to-br from-blue-50 to-slate-100 rounded-xl aspect-[16/10] flex items-center justify-center overflow-hidden relative">
          <div className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: `radial-gradient(circle, #94a3b8 1px, transparent 1px)`,
              backgroundSize: "20px 20px",
            }}
          />
          <div className="relative text-center">
            <svg className="w-10 h-10 mx-auto text-primary/60" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            <p className="text-sm font-medium text-text-secondary mt-2">
              {city ? `${city}, ${stateFormatted}` : stateFormatted}
            </p>
          </div>
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
                <p className="text-sm text-text-secondary mt-0.5">Primary Fulfillment Center</p>
                <p className="text-xs text-text-secondary mt-1">
                  Contact {name} for exact warehouse address and tour availability.
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
            <Link
              href={`/3pl/${state}`}
              className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-text-secondary hover:text-text transition-colors"
            >
              US {stateFormatted.includes(" ") ? stateFormatted.split(" ").pop() : stateFormatted}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
