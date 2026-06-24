import { formatCapacity, costLevelIcons, inferStorageEnvironments } from "@/lib/detail-content";
import { formatState } from "@/lib/detail-content";
import { getTranslations } from "next-intl/server";

interface AtAGlanceSectionProps {
  name: string;
  state: string;
  city: string;
  shippingSpeed: string;
  costLevel: string;
  orderCapacity: number;
  skuCapacity: number;
  categories: string[];
  platforms: string[];
  integrations: string[];
}

export default async function AtAGlanceSection({
  name,
  state,
  city,
  shippingSpeed,
  costLevel,
  orderCapacity,
  skuCapacity,
  categories,
  platforms,
  integrations,
}: AtAGlanceSectionProps) {
  const t = await getTranslations();
  const stateFormatted = formatState(state);
  const environments = inferStorageEnvironments({ state, categories } as any);

  const facts = [
    { label: t("detail.location"), value: city ? `${city}, ${stateFormatted}` : stateFormatted },
    { label: t("detail.shippingSpeed"), value: shippingSpeed || "Contact provider" },
    { label: t("detail.costLevel"), value: costLevelIcons(costLevel || "$") },
    { label: t("detail.orderCapacity"), value: `${formatCapacity(orderCapacity || 0)} orders/mo` },
    { label: t("detail.skuCapacity"), value: `${formatCapacity(skuCapacity || 0)} SKUs` },
    { label: t("detail.categories"), value: `${(categories || []).length} served` },
    { label: t("detail.platforms"), value: `${(platforms || []).length} platforms` },
    { label: t("detail.techPartners"), value: `${(integrations || []).length} partners` },
  ];

  return (
    <section>
      <h2 className="text-xl md:text-2xl font-bold text-text mb-4">{t("detail.atAGlance", { name })}</h2>

      {/* 事实网格 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 md:gap-3 mb-4 md:mb-6">
        {facts.map((f) => (
          <div key={f.label} className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs text-text-secondary uppercase tracking-wide">{f.label}</p>
            <p className="text-base font-bold text-text mt-1 break-words">{f.value}</p>
          </div>
        ))}
      </div>

      {/* 存储环境 */}
      {environments.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-5">
          <p className="text-xs text-text-secondary uppercase tracking-wide mb-2">{t("detail.storageEnvironments")}</p>
          <div className="flex flex-wrap gap-2">
            {environments.map((env) => (
              <span key={env} className="px-3 py-1.5 bg-gray-100 rounded-lg text-sm text-text">
                {env}
              </span>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
