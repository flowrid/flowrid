/**
 * 品类占位页 — 内容即将上线
 *
 * 给尚未完成深度内容的品类一个专业的 Coming Soon 页面。
 * 避免 404，给搜索引擎积极信号。
 */

import Link from "next/link";
import ToolIcon from "@/components/tools/ToolIcon";

export default function CategoryPlaceholder({
  icon,
  color,
  title,
  description,
  question,
}: {
  icon: string;
  color: string;
  title: string;
  description: string;
  question: string;
}) {
  const otherPages = [
    { slug: "tracking-visibility", label: "Tracking & Visibility", done: true },
    { slug: "order-management", label: "Order Management", done: false },
    { slug: "shipping-rates", label: "Shipping & Rates", done: false },
    { slug: "inventory-warehouse", label: "Inventory & Warehouse", done: false },
    { slug: "automation-integration", label: "Automation & Integration", done: false },
    { slug: "compliance-documents", label: "Compliance & Documents", done: false },
  ];

  return (
    <div>
      <nav className="flex items-center gap-2 text-sm text-text-secondary mt-2 mb-8">
        <Link href="/tools" className="hover:text-text transition-colors">
          Tools
        </Link>
        <span>/</span>
        <span className="text-text font-medium">{title}</span>
      </nav>

      {/* Hero */}
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
            style={{ backgroundColor: color }}
          >
            <ToolIcon icon={icon} />
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Coming Soon
          </p>
        </div>
        <h1 className="text-3xl md:text-[40px] font-bold tracking-tight text-text leading-[1.15] mb-4 max-w-[720px]">
          {title}
        </h1>
        <p className="text-base md:text-lg text-text-secondary leading-relaxed max-w-[640px]">
          {description}
        </p>
      </section>

      {/* Coming Soon */}
      <section className="mb-12 bg-card border border-border rounded-2xl p-8 md:p-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6 text-primary">
          <ToolIcon icon={icon} className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-text mb-3">
          Full guide coming soon
        </h2>
        <p className="text-text-secondary max-w-[480px] mx-auto leading-relaxed mb-6">
          We&apos;re researching and testing the best tools to answer: <strong>{question}</strong>
        </p>
        <p className="text-sm text-text-secondary/60">
          Expected: July 2026
        </p>
      </section>

      {/* Progress */}
      <section className="mb-12">
        <h2 className="text-lg font-bold text-text mb-4">What&apos;s available now</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {otherPages.map((p) => (
            <Link
              key={p.slug}
              href={p.done ? `/tools/${p.slug}` : "#"}
              className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                p.done
                  ? "border-primary/30 bg-primary/5 hover:border-primary/60 hover:shadow-sm"
                  : "border-border bg-gray-50 cursor-default opacity-50"
              }`}
            >
              <span className={`text-sm ${p.done ? "text-[#34C759]" : "text-text-secondary"}`}>
                {p.done ? "●" : "○"}
              </span>
              <span className={`text-sm font-medium ${p.done ? "text-text" : "text-text-secondary"}`}>
                {p.label}
              </span>
              <span className="text-xs text-text-secondary ml-auto shrink-0">
                {p.done ? "Live" : "Soon"}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="text-center py-12 bg-gradient-to-b from-white to-gray-50 rounded-2xl border border-border">
        <h2 className="text-xl font-bold text-text mb-3">
          Don&apos;t wait for the guide — find your 3PL now
        </h2>
        <p className="text-text-secondary mb-6 max-w-[400px] mx-auto leading-relaxed">
          The right tools work best with the right 3PL partner. Start there.
        </p>
        <Link
          href="/3pl"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary-dark transition-colors"
        >
          Browse 3PL Directory →
        </Link>
      </section>
    </div>
  );
}
