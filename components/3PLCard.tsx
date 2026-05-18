import { ThreePLCardData } from "@/types/3pl";

/**
 * 3PL Card — Flowrid 最核心 UI 组件
 *
 * 设计目的：让用户快速做出选择决策
 * 信息层级：Score → Speed → Platform → Location → CTA
 */
export default function ThreePLCard({ data }: { data: ThreePLCardData }) {
  const scoreColor =
    data.score >= 90 ? "bg-success" : data.score >= 70 ? "bg-primary" : "bg-text-secondary";

  return (
    <div className="border border-border rounded-xl p-4 bg-card shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-bold truncate">{data.name}</h3>
          <p className="text-sm text-text-secondary">
            {data.city}, {formatStateName(data.state)}
          </p>
        </div>
        <ScoreBadge score={data.score} />
      </div>

      {/* Platform Tags */}
      <div className="flex flex-wrap gap-1.5 mt-3">
        {data.platforms.map((p) => (
          <span
            key={p}
            className="text-xs bg-gray-100 text-text px-2 py-0.5 rounded font-medium"
          >
            {p}
          </span>
        ))}
      </div>

      {/* Speed & Cost */}
      <div className="flex items-center gap-4 mt-2 text-sm text-text-secondary">
        <span>Speed: {data.shipping_speed}</span>
        <span>Cost: {data.cost_level}</span>
      </div>

      {/* Categories */}
      <div className="flex flex-wrap gap-1 mt-1.5">
        {data.categories.slice(0, 4).map((c) => (
          <span key={c} className="text-xs text-text-secondary">
            {c}
          </span>
        ))}
      </div>

      {/* CTA */}
      <div className="flex gap-2 mt-3">
        <a
          href={`/3pl/${data.state.toLowerCase()}/${data.slug}`}
          className="flex-1 text-center text-sm border border-border rounded-lg py-2 hover:bg-gray-50 transition-colors font-medium"
        >
          View Details
        </a>
        <a
          href={`/rfq?pl=${data.slug}`}
          className="flex-1 text-center text-sm bg-primary text-white rounded-lg py-2 hover:bg-primary-dark transition-colors font-medium"
        >
          Get Quote
        </a>
      </div>
    </div>
  );
}

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 90 ? "bg-success" : score >= 70 ? "bg-primary" : "bg-text-secondary";

  return (
    <span
      className={`inline-flex items-center justify-center ${color} text-white text-sm font-bold rounded-lg min-w-[3rem] h-8 px-2 shrink-0`}
    >
      {score}
    </span>
  );
}

function formatStateName(state: string): string {
  return state
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
