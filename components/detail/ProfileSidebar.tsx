import { estimateFounded, estimateSqFt, estimateWarehouses, inferStorageEnvironments, formatCapacity } from "@/lib/detail-content";
import { formatState } from "@/lib/detail-content";
import type { ThreePL } from "@/types/3pl";
import { getTranslations } from "next-intl/server";

interface ProfileSidebarProps {
  threePL: ThreePL;
}

export default async function ProfileSidebar({ threePL: p }: ProfileSidebarProps) {
  const t = await getTranslations();
  const stateFormatted = formatState(p.state);
  const founded = estimateFounded(p.name);
  const warehouses = estimateWarehouses(p.state, p.order_capacity || 0);
  const sqFt = estimateSqFt(p.order_capacity || 0, p.categories || []);
  const environments = inferStorageEnvironments(p as any);

  return (
    <aside className="bg-card border border-border rounded-2xl p-5 md:p-6 space-y-5">
      {/* 标题 */}
      <div>
        <h3 className="text-lg font-bold text-text">{t("detail.atAGlance", { name: p.name })}</h3>
        <p className="text-sm text-text-secondary mt-1">
          {p.city ? `${p.city}, ${stateFormatted}` : stateFormatted}
        </p>
      </div>

      {/* 关键统计 */}
      <div className="grid grid-cols-2 gap-3">
        <StatBox label={t("detail.founded")} value={String(founded)} />
        <StatBox label={t("detail.warehouses")} value={String(warehouses)} />
        <StatBox label={t("detail.totalSqFt")} value={formatSqFt(sqFt)} />
        <StatBox label={t("detail.orderCapacity")} value={t("detail.perMonth", { value: formatCapacity(p.order_capacity || 0) })} />
        <StatBox label={t("detail.skuCapacity")} value={formatCapacity(p.sku_capacity || 0)} />
        <StatBox label={t("detail.shippingSpeed")} value={p.shipping_speed || t("detail.contactForInfo")} />
        <StatBox label={t("detail.categories")} value={t("detail.countTypes", { count: (p.categories || []).length })} />
        <StatBox label={t("detail.platforms")} value={t("detail.countIntegrated", { count: (p.platforms || []).length })} />
        <StatBox label={t("detail.techPartners")} value={t("detail.countSystems", { count: (p.integrations || []).length })} />
      </div>

      {/* 存储环境 */}
      {environments.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2">
            {t("detail.storageEnvironments")}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {environments.map((envKey) => (
              <span key={envKey} className="px-2.5 py-1 bg-gray-100 rounded-lg text-xs text-text">
                {t(envKey as any)}
              </span>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-50 rounded-lg p-2.5">
      <p className="text-[10px] text-text-secondary uppercase tracking-wide">{label}</p>
      <p className="text-sm font-bold text-text mt-0.5">{value}</p>
    </div>
  );
}

function formatSqFt(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
  return String(n);
}
