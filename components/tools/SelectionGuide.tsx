"use client";

/**
 * 选择指南 — 帮助客户根据自己的情况选择工具
 *
 * "如果你 X，选 A；如果你 Y，选 B" 的决策树式推荐
 */

import type { ToolData } from "@/lib/tools-data";

export interface SelectionOption {
  condition: string;    // "如果你每月发货超过 10,000 单"
  recommendation: string; // "选择 Narvar"
  toolSlug: string;     // 关联的工具 slug（用于锚点链接）
  reason: string;       // 简短理由
}

export default function SelectionGuide({
  title,
  description,
  options,
  tools,
}: {
  title: string;
  description: string;
  options: SelectionOption[];
  tools: ToolData[];
}) {
  const toolMap = new Map(tools.map((t) => [t.slug, t]));

  return (
    <div className="bg-card border border-border rounded-2xl p-6 md:p-8">
      <h2 className="text-xl font-bold text-text mb-2">{title}</h2>
      <p className="text-sm text-text-secondary mb-6 leading-relaxed">{description}</p>

      <div className="space-y-4">
        {options.map((opt, idx) => {
          const tool = toolMap.get(opt.toolSlug);
          return (
            <div
              key={idx}
              className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-xl bg-gray-50 border border-border hover:border-primary/30 transition-all"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text leading-relaxed">
                  {opt.condition}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-primary text-lg">→</span>
                <div className="text-right">
                  <a
                    href={`#${opt.toolSlug}`}
                    className="text-sm font-bold text-primary hover:underline"
                  >
                    {opt.recommendation}
                  </a>
                  <p className="text-xs text-text-secondary mt-0.5">{opt.reason}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
