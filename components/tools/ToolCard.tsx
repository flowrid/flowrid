/**
 * 工具卡片 — 可复用的工具展示卡片
 *
 * 用于品类页的工具对比区和主页的热门推荐。
 * 支持紧凑模式和完整模式。
 */

import type { ToolData } from "@/lib/tools-data";

export default function ToolCard({
  tool,
  variant = "full",
  rank,
}: {
  tool: ToolData;
  variant?: "full" | "compact" | "mini";
  rank?: number;
}) {
  if (variant === "mini") {
    return (
      <a
        href={tool.websiteUrl}
        target="_blank"
        rel="noopener"
        className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card hover:border-primary/40 hover:shadow-sm transition-all group"
      >
        <div className="w-10 h-10 rounded-lg bg-gray-50 border border-border flex items-center justify-center shrink-0 overflow-hidden">
          <img
            src={tool.logoUrl}
            alt={tool.name}
            className="w-7 h-7 object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
              (e.target as HTMLImageElement).parentElement!.textContent = tool.name.charAt(0);
            }}
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-text group-hover:text-primary transition-colors truncate">
            {tool.name}
          </p>
          <p className="text-xs text-text-secondary truncate">{tool.tagline}</p>
        </div>
      </a>
    );
  }

  if (variant === "compact") {
    return (
      <div className="bg-card border border-border rounded-2xl p-5 hover:border-primary/30 hover:shadow-md transition-all group relative">
        {rank && (
          <span className="absolute -top-2.5 -left-2.5 w-7 h-7 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center shadow-sm">
            {rank}
          </span>
        )}
        <div className="flex items-start gap-4 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gray-50 border border-border flex items-center justify-center shrink-0 overflow-hidden">
            <img
              src={tool.logoUrl}
              alt={tool.name}
              className="w-8 h-8 object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
                (e.target as HTMLImageElement).parentElement!.textContent = tool.name.charAt(0);
              }}
            />
          </div>
          <div className="min-w-0">
            <h3 className="text-lg font-bold text-text group-hover:text-primary transition-colors">
              {tool.name}
            </h3>
            <p className="text-sm text-text-secondary mt-0.5">{tool.tagline}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mb-3">
          <span className="text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full font-medium">
            {tool.pricing.freeTier.includes("No free") ? "No free tier" : "Free tier available"}
          </span>
          <span className="text-xs bg-gray-100 text-text-secondary px-2.5 py-1 rounded-full font-medium">
            Starts {tool.pricing.startingPrice}
          </span>
          <span className="text-xs bg-gray-100 text-text-secondary px-2.5 py-1 rounded-full font-medium">
            ⭐ {tool.ratingScore}
          </span>
        </div>
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
          <a
            href={tool.websiteUrl}
            target="_blank"
            rel="noopener"
            className="text-sm font-medium text-primary hover:underline"
          >
            Visit website →
          </a>
          <span className="text-xs text-text-secondary">Setup: {tool.setupTime}</span>
        </div>
      </div>
    );
  }

  // full variant — used in category detail pages
  return (
    <div className="bg-card border border-border rounded-2xl p-6 hover:border-primary/30 hover:shadow-md transition-all group" id={tool.slug}>
      {/* Header */}
      <div className="flex items-start gap-5 mb-5">
        <div className="w-16 h-16 rounded-2xl bg-gray-50 border border-border flex items-center justify-center shrink-0 overflow-hidden">
          <img
            src={tool.logoUrl}
            alt={tool.name}
            className="w-11 h-11 object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
              (e.target as HTMLImageElement).parentElement!.textContent = tool.name.charAt(0);
            }}
          />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-xl font-bold text-text">{tool.name}</h3>
          <p className="text-sm text-text-secondary mt-1 leading-relaxed">{tool.tagline}</p>
          <p className="text-sm text-text-secondary mt-1.5 leading-relaxed">{tool.description}</p>
        </div>
      </div>

      {/* Pricing Badges */}
      <div className="flex flex-wrap gap-2 mb-5">
        <PricingBadge label={tool.pricing.freeTier} variant="free" />
        <PricingBadge label={`Starts at ${tool.pricing.startingPrice}`} variant="price" />
        <PricingBadge label={`⭐ ${tool.ratingScore} (${tool.ratingCount})`} variant="rating" />
        <PricingBadge label={`Setup: ${tool.setupTime}`} variant="setup" />
      </div>

      {/* Features + Pros/Cons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2">
            Key Features
          </h4>
          <ul className="space-y-1.5">
            {tool.features.slice(0, 5).map((f) => (
              <li key={f} className="text-sm text-text flex items-start gap-2">
                <span className="text-primary mt-1 shrink-0">•</span>
                {f}
              </li>
            ))}
            {tool.features.length > 5 && (
              <li className="text-xs text-text-secondary">+{tool.features.length - 5} more features</li>
            )}
          </ul>
        </div>
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-[#16A34A] mb-2">
            Pros
          </h4>
          <ul className="space-y-1.5">
            {tool.pros.slice(0, 3).map((p) => (
              <li key={p} className="text-sm text-text flex items-start gap-2">
                <span className="text-[#16A34A] mt-1 shrink-0">✓</span>
                {p}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-[#EF4444] mb-2">
            Cons
          </h4>
          <ul className="space-y-1.5">
            {tool.cons.map((c) => (
              <li key={c} className="text-sm text-text-secondary flex items-start gap-2">
                <span className="text-[#EF4444] mt-1 shrink-0">✗</span>
                {c}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Best For / Not For */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5 p-4 bg-gray-50 rounded-xl">
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-primary mb-1.5">
            Best For
          </h4>
          <ul className="space-y-1">
            {tool.bestFor.map((b) => (
              <li key={b} className="text-sm text-text flex items-start gap-2">
                <span className="text-primary shrink-0">▶</span>
                {b}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-text-secondary mb-1.5">
            Not Ideal For
          </h4>
          <ul className="space-y-1">
            {tool.notFor.map((n) => (
              <li key={n} className="text-sm text-text-secondary flex items-start gap-2">
                <span className="text-text-secondary shrink-0">▶</span>
                {n}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Integrations + CTA */}
      <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-border">
        <div className="flex flex-wrap gap-1.5 flex-1">
          <span className="text-xs text-text-secondary font-medium">Integrates:</span>
          {tool.integrations.slice(0, 4).map((i) => (
            <span key={i} className="text-xs bg-gray-100 text-text-secondary px-2 py-0.5 rounded-full">
              {i}
            </span>
          ))}
          {tool.integrations.length > 4 && (
            <span className="text-xs text-text-secondary">+{tool.integrations.length - 4}</span>
          )}
        </div>
        <a
          href={tool.websiteUrl}
          target="_blank"
          rel="noopener"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary-dark transition-colors shrink-0"
        >
          Visit {tool.name} →
        </a>
      </div>
    </div>
  );
}

function PricingBadge({ label, variant }: { label: string; variant: "free" | "price" | "rating" | "setup" }) {
  const styles: Record<string, string> = {
    free: "bg-[#16A34A]/10 text-[#16A34A]",
    price: "bg-primary/10 text-primary",
    rating: "bg-[#F59E0B]/10 text-[#92400E]",
    setup: "bg-gray-100 text-text-secondary",
  };
  return (
    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${styles[variant]}`}>
      {label}
    </span>
  );
}
