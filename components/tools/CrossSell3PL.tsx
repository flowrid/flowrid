/**
 * 交叉推荐 3PL — 可复用的 3PL 交叉推荐区块
 *
 * 接收 state 列表，链接到 `/3pl/[state]` 页面（保证存在）。
 * 用于品类页底部，引导用户从工具选择进入 3PL 选择。
 */

import Link from "next/link";
import ToolIcon from "@/components/tools/ToolIcon";

export interface CrossSell3PLItem {
  state: string;        // 两字母州码，如 "CA"
  stateName: string;    // 州全名，如 "California"
  reason: string;       // 推荐理由
}

const DEFAULT_3PLS: CrossSell3PLItem[] = [
  { state: "ca", stateName: "California", reason: "Largest fulfillment hub — fastest West Coast shipping" },
  { state: "tx", stateName: "Texas", reason: "Central US location — optimal for national coverage" },
  { state: "il", stateName: "Illinois", reason: "Midwest logistics hub — excellent for East/Central US" },
  { state: "fl", stateName: "Florida", reason: "Southeast gateway — strong Latin America connections" },
  { state: "ny", stateName: "New York", reason: "Northeast hub — fastest tri-state area delivery" },
  { state: "pa", stateName: "Pennsylvania", reason: "Strategic Mid-Atlantic location for East Coast coverage" },
  { state: "ga", stateName: "Georgia", reason: "Atlanta hub — Southeast distribution powerhouse" },
  { state: "nv", stateName: "Nevada", reason: "West Coast coverage with lower costs than California" },
  { state: "tn", stateName: "Tennessee", reason: "FedEx & UPS super-hub proximity — fastest delivery times" },
];

export default function CrossSell3PL({
  title,
  description,
  items,
  browseAllLabel,
  browseAllDesc,
}: {
  title: string;
  description: string;
  items?: CrossSell3PLItem[];
  browseAllLabel: string;
  browseAllDesc: string;
}) {
  const display = items && items.length > 0 ? items.slice(0, 3) : DEFAULT_3PLS.slice(0, 3);

  return (
    <section className="mb-12">
      <h2 className="text-xl font-bold text-text mb-2">{title}</h2>
      <p className="text-sm text-text-secondary mb-6 max-w-[600px] leading-relaxed">{description}</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {display.map((item) => (
          <Link
            key={item.state}
            href={`/3pl/${item.state}`}
            className="group bg-card border border-border rounded-2xl p-5 hover:border-primary/40 hover:shadow-md transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3 text-primary">
              <ToolIcon icon="fa-building" className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-text group-hover:text-primary transition-colors">
              {item.stateName} 3PLs
            </h3>
            <p className="text-sm text-text-secondary mt-1">{item.reason}</p>
            <span className="inline-block mt-3 text-xs font-medium text-primary">
              Browse {item.stateName} →
            </span>
          </Link>
        ))}
        <Link
          href="/3pl"
          className="group bg-gray-50 border border-dashed border-border rounded-2xl p-5 hover:border-primary/40 hover:shadow-md transition-all flex flex-col items-center justify-center text-center"
        >
          <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center mb-3 text-text-secondary">
            <ToolIcon icon="fa-search" className="w-4 h-4" />
          </div>
          <h3 className="text-base font-bold text-text group-hover:text-primary transition-colors">
            {browseAllLabel}
          </h3>
          <p className="text-sm text-text-secondary mt-1">{browseAllDesc}</p>
        </Link>
      </div>
    </section>
  );
}
