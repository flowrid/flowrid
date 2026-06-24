"use client";

import { useTranslations } from "next-intl";
import { PLATFORM_ICONS } from "@/lib/platform-icons";

interface TechnologySectionProps {
  name: string;
  platforms: string[];
  integrations: string[];
}

export default function TechnologySection({ name, platforms, integrations }: TechnologySectionProps) {
  const t = useTranslations("detail");

  const allTech = [...(platforms || [])];
  const unique = [...new Set(allTech.map(p => p.toLowerCase().trim()))];

  if (unique.length === 0) {
    return (
      <section>
        <h2 className="text-xl md:text-2xl font-bold text-text mb-1">{t("technologyEmptyTitle", { name })}</h2>
        <p className="text-text-secondary text-sm">
          {t("technologyEmptyDesc", { name })}
        </p>
      </section>
    );
  }

  return (
    <section>
      <h2 className="text-xl md:text-2xl font-bold text-text mb-1">{t("platformIntegrations")}</h2>
      <p className="text-text-secondary text-sm mb-4">
        {t("platformIntegrationsDesc", { name })}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        {unique.slice(0, 12).map((tech) => {
          const key = tech.toLowerCase().trim().replace(/\s+/g, "");
          const icon = PLATFORM_ICONS[key];
          const descKey = `techDesc.${key}`;
          const desc = t(descKey as any);
          // If translation key doesn't exist (returns the key itself), use fallback
          const hasDesc = desc !== `detail.${descKey}`;

          return (
            <div
              key={tech}
              className="flex items-start gap-4 p-4 bg-card border border-border rounded-xl hover:shadow-sm transition-shadow"
            >
              {/* 图标/avatar */}
              {icon ? (
                <img
                  src={icon}
                  alt={tech}
                  className="w-10 h-10 rounded-lg object-contain bg-[#F5F5F7] shrink-0"
                />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-[#F5F5F7] flex items-center justify-center text-[#86868B] font-bold text-sm shrink-0 select-none">
                  {tech.charAt(0)}
                </div>
              )}

              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-medium text-text text-sm">{tech}</p>
                  <span className="text-[10px] px-1.5 py-0.5 bg-green-100 text-green-700 rounded-full font-medium">
                    {t("certified")}
                  </span>
                </div>
                <p className="text-xs text-text-secondary mt-1 line-clamp-2">
                  {hasDesc ? desc : t("integratedSolution", { tech })}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
