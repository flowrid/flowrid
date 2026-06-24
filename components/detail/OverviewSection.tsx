import { getTranslations } from "next-intl/server";

interface OverviewSectionProps {
  name: string;
  overviewText: string;
  secondaryText?: string;
}

export default async function OverviewSection({ name, overviewText, secondaryText }: OverviewSectionProps) {
  const t = await getTranslations();

  return (
    <section>
      <h2 className="text-xl md:text-2xl font-bold text-text mb-4">{t("detail.overviewHeading", { name })}</h2>
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
