import { ThreePLCardData } from "@/types/3pl";

/**
 * Mobile Top Match — 最优匹配高亮卡片
 *
 * 金色边框 + "Best Match" 标签，只显示 1-3 个
 */
export default function MobileTopMatch({ data }: { data: ThreePLCardData }) {
  return (
    <div className="border-2 border-warning rounded-xl p-3 bg-card shadow-sm mb-4 relative">
      <span className="absolute -top-2 left-3 bg-warning text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
        Best Match
      </span>

      <div className="flex items-start justify-between gap-2 mt-1">
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-bold truncate">{data.name}</h3>
          <p className="text-xs text-text-secondary mt-0.5">
            {data.city ? `${data.city}, ${formatState(data.state)}` : formatState(data.state)} · {data.shipping_speed} shipping
          </p>
        </div>
        <span className="inline-flex items-center justify-center bg-success text-white text-xs font-bold rounded-lg w-10 h-7 shrink-0">
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
