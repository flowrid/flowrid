/**
 * 工具推荐嵌入卡片 — 用于 Brand/SaaS 运营页面底部
 * 轻量、统一风格、链接到 /tools/ 对应品类
 */

import Link from "next/link";

interface ToolRecommendation {
  label: string;
  href: string;
  description: string;
}

export default function ToolRecommendationBar({
  title,
  description,
  tools,
}: {
  title: string;
  description: string;
  tools: ToolRecommendation[];
}) {
  return (
    <div className="mt-8 p-5 bg-white rounded-2xl border border-black/5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-text">{title}</p>
          <p className="text-xs text-text-secondary mt-0.5">{description}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {tools.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="text-xs px-3 py-1.5 rounded-lg bg-primary/10 text-primary font-medium hover:bg-primary/20 transition-colors"
              title={tool.description}
            >
              {tool.label} →
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
