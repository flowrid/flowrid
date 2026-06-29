/**
 * 工具对比表 — 品类页核心对比矩阵
 *
 * 表格式对比：定价 / 特色 / 最适合 / 评分 / 上手时间
 */

import type { ToolData } from "@/lib/tools-data";

export default function ToolComparisonTable({ tools }: { tools: ToolData[] }) {
  if (tools.length < 2) return null;

  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-card">
      <table className="w-full min-w-[700px]">
        <thead>
          <tr className="border-b border-border bg-gray-50">
            <th className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-text-secondary">
              Tool
            </th>
            {tools.map((t) => (
              <th key={t.slug} className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-text">
                {t.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          <CompareRow label="Pricing">
            {tools.map((t) => (
              <td key={t.slug} className="px-5 py-3">
                <p className="text-sm font-medium text-text">{t.pricing.startingPrice}</p>
                <p className="text-xs text-text-secondary mt-0.5">{t.pricing.freeTier}</p>
              </td>
            ))}
          </CompareRow>
          <CompareRow label="Best For">
            {tools.map((t) => (
              <td key={t.slug} className="px-5 py-3">
                <p className="text-sm text-text">{t.bestFor[0]}</p>
              </td>
            ))}
          </CompareRow>
          <CompareRow label="Rating">
            {tools.map((t) => (
              <td key={t.slug} className="px-5 py-3">
                <p className="text-sm font-semibold text-text">
                  ⭐ {t.ratingScore}
                </p>
                <p className="text-xs text-text-secondary">{t.ratingVendor} • {t.ratingCount}</p>
              </td>
            ))}
          </CompareRow>
          <CompareRow label="Setup Time">
            {tools.map((t) => (
              <td key={t.slug} className="px-5 py-3">
                <span className="text-sm text-text">{t.setupTime}</span>
              </td>
            ))}
          </CompareRow>
          <CompareRow label="Platform Support">
            {tools.map((t) => (
              <td key={t.slug} className="px-5 py-3">
                <div className="flex flex-wrap gap-1">
                  {t.platformSupport.slice(0, 3).map((p) => (
                    <span key={p} className="text-xs bg-gray-100 text-text-secondary px-1.5 py-0.5 rounded">
                      {p}
                    </span>
                  ))}
                  {t.platformSupport.length > 3 && (
                    <span className="text-xs text-text-secondary">+{t.platformSupport.length - 3}</span>
                  )}
                </div>
              </td>
            ))}
          </CompareRow>
          <CompareRow label="Visit">
            {tools.map((t) => (
              <td key={t.slug} className="px-5 py-3">
                <a
                  href={t.websiteUrl}
                  target="_blank"
                  rel="noopener"
                  className="text-sm font-medium text-primary hover:underline"
                >
                  Website →
                </a>
              </td>
            ))}
          </CompareRow>
        </tbody>
      </table>
    </div>
  );
}

function CompareRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <tr>
      <td className="px-5 py-3 text-xs font-semibold text-text-secondary uppercase tracking-wider whitespace-nowrap">
        {label}
      </td>
      {children}
    </tr>
  );
}
