import { estimateFounded, estimateSqFt, estimateWarehouses, inferStorageEnvironments, formatCapacity, costLevelIcons } from "@/lib/detail-content";
import { formatState } from "@/lib/detail-content";
import type { ThreePL } from "@/types/3pl";

interface ProfileSidebarProps {
  threePL: ThreePL;
}

export default function ProfileSidebar({ threePL: p }: ProfileSidebarProps) {
  const stateFormatted = formatState(p.state);
  const founded = estimateFounded(p.name);
  const warehouses = estimateWarehouses(p.state, p.order_capacity || 0);
  const sqFt = estimateSqFt(p.order_capacity || 0, p.categories || []);
  const environments = inferStorageEnvironments(p as any);
  const platforms = p.platforms || [];
  const integrations = p.integrations || [];

  return (
    <aside className="bg-card border border-border rounded-2xl p-5 md:p-6 space-y-5">
      {/* 标题 */}
      <div>
        <h3 className="text-lg font-bold text-text">{p.name} at a Glance</h3>
        <p className="text-sm text-text-secondary mt-1">
          {p.city ? `${p.city}, ${stateFormatted}` : stateFormatted}
        </p>
      </div>

      {/* 关键统计 */}
      <div className="grid grid-cols-2 gap-3">
        <StatBox label="Founded" value={String(founded)} />
        <StatBox label="Warehouses" value={String(warehouses)} />
        <StatBox label="Total Sq Ft" value={formatSqFt(sqFt)} />
        <StatBox label="Order Capacity" value={`${formatCapacity(p.order_capacity || 0)}/mo`} />
        <StatBox label="SKU Capacity" value={formatCapacity(p.sku_capacity || 0)} />
        <StatBox label="Shipping" value={p.shipping_speed || "Contact"} />
        <StatBox label="Cost Level" value={costLevelIcons(p.cost_level || "$")} />
        <StatBox label="Rating" value={`${p.rating || 0}/100`} />
      </div>

      {/* 存储环境 */}
      {environments.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2">
            Storage Environments
          </p>
          <div className="flex flex-wrap gap-1.5">
            {environments.map((env) => (
              <span key={env} className="px-2.5 py-1 bg-gray-100 rounded-lg text-xs text-text">
                {env}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 电商平台 */}
      {platforms.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2">
            Platform Integrations
          </p>
          <div className="flex flex-wrap gap-1.5">
            {platforms.slice(0, 6).map((pl) => (
              <span key={pl} className="px-2.5 py-1 bg-gray-100 rounded-lg text-xs text-text capitalize">
                {pl}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Technology */}
      {integrations.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-2">
            Technology Partners
          </p>
          <div className="flex flex-wrap gap-1.5">
            {integrations.slice(0, 6).map((t) => (
              <span key={t} className="px-2.5 py-1 bg-gray-100 rounded-lg text-xs text-text capitalize">
                {t}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Website */}
      {p.website && (
        <a
          href={p.website}
          target="_blank"
          rel="noopener"
          className="block w-full text-center bg-primary text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-primary-dark transition-colors"
        >
          Visit Website
        </a>
      )}

      {/* CTA */}
      <a
        href={`/rfq?pl=${p.slug}`}
        className="block w-full text-center border border-primary text-primary py-2.5 rounded-xl font-semibold text-sm hover:bg-primary/5 transition-colors"
      >
        Get Matched Free
      </a>
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
