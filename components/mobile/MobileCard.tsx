import { ThreePLCardData } from "@/types/3pl";

/**
 * Mobile 3PL Card — 紧凑型卡片
 *
 * 信息层级：Score → Speed → Platform Tags → Location → CTA
 * 高度 120-160px，全宽 CTA 按钮
 */
export default function MobileCard({ data }: { data: ThreePLCardData }) {
  const scoreColor =
    data.score >= 90 ? "bg-success" : data.score >= 70 ? "bg-primary" : "bg-gray-400";

  return (
    <div className="border border-border rounded-xl p-3 bg-card shadow-sm mb-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-bold truncate">{data.name}</h3>
          <p className="text-xs text-text-secondary mt-0.5">
            {data.city}, {formatState(data.state)} · {data.shipping_speed}
          </p>
        </div>
        <span
          className={`inline-flex items-center justify-center ${scoreColor} text-white text-xs font-bold rounded-lg w-10 h-7 shrink-0`}
        >
          {data.score}
        </span>
      </div>

      <div className="flex flex-wrap gap-1 mt-2">
        {data.platforms.map((p) => (
          <span
            key={p}
            className="text-[10px] bg-gray-100 text-text px-1.5 py-0.5 rounded font-medium"
          >
            {p}
          </span>
        ))}
      </div>

      <a
        href={`/rfq?pl=${data.slug}`}
        className="block w-full text-center mt-2 bg-primary text-white text-sm rounded-lg py-2 font-medium hover:bg-primary-dark transition-colors"
      >
        Get Quote
      </a>
    </div>
  );
}

function formatState(s: string): string {
  return s
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
