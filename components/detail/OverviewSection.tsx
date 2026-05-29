interface OverviewSectionProps {
  name: string;
  overviewText: string;
  secondaryText?: string;
}

export default function OverviewSection({ name, overviewText, secondaryText }: OverviewSectionProps) {
  return (
    <section>
      <h2 className="text-xl md:text-2xl font-bold text-text mb-4">{name} Overview</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 文字区 */}
        <div className="lg:col-span-2 space-y-4">
          <p className="text-text-secondary leading-relaxed text-sm md:text-base">
            {overviewText}
          </p>
          {secondaryText && (
            <p className="text-text-secondary leading-relaxed text-sm md:text-base">
              {secondaryText}
            </p>
          )}
        </div>
        {/* 仓库图片占位 */}
        <div className="lg:col-span-1">
          <div className="bg-gradient-to-br from-gray-200 to-gray-100 rounded-xl aspect-[4/3] flex items-center justify-center overflow-hidden">
            <div className="text-center text-gray-400">
              <svg className="w-14 h-14 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <p className="text-xs mt-2">{name}</p>
              <p className="text-xs opacity-70">Fulfillment Center</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
