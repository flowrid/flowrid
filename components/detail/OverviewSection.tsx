interface OverviewSectionProps {
  name: string;
  overviewText: string;
  secondaryText?: string;
}

export default function OverviewSection({ name, overviewText, secondaryText }: OverviewSectionProps) {
  return (
    <section>
      <h2 className="text-xl md:text-2xl font-bold text-text mb-4">{name} Overview</h2>
      <div className="grid grid-cols-1 gap-6">
        {/* 文字区 */}
        <div className="space-y-4">
          <p className="text-text-secondary leading-relaxed text-sm md:text-base">
            {overviewText}
          </p>
          {secondaryText && (
            <p className="text-text-secondary leading-relaxed text-sm md:text-base">
              {secondaryText}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
