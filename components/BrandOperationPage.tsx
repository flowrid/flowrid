"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

type Metric = {
  label: string;
  value: string;
  tone?: "default" | "success" | "warning" | "danger";
};

type Action = {
  label: string;
  href: string;
  primary?: boolean;
};

type BrandOperationPageProps = {
  /** Translation namespace prefix, e.g. "account.automation" */
  ns: string;
  eyebrow: string;
  title: string;
  description: string;
  metrics: Metric[];
  actions: Action[];
  sections: {
    title: string;
    description: string;
    items: string[];
  }[];
  emptyTitle: string;
  emptyDescription: string;
};

const toneClasses = {
  default: "text-[#1D1D1F]",
  success: "text-[#34C759]",
  warning: "text-[#FF9500]",
  danger: "text-[#FF3B30]",
} as const;

export default function BrandOperationPage({
  ns,
  eyebrow,
  title,
  description,
  metrics,
  actions,
  sections,
  emptyTitle,
  emptyDescription,
}: BrandOperationPageProps) {
  const t = useTranslations();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#ed6d00]">{eyebrow}</p>
          <h1 className="mt-2 text-[28px] font-bold tracking-tight text-[#1D1D1F]">{title}</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[#86868B]">{description}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {actions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                action.primary
                  ? "bg-[#ed6d00] text-white hover:bg-[#FF8A1F]"
                  : "border border-black/10 bg-white text-[#1D1D1F] hover:bg-black/[0.03]"
              }`}
            >
              {action.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {metrics.map((metric) => (
          <div key={metric.label} className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
            <p className="text-[11px] font-medium uppercase tracking-wide text-[#86868B]">{metric.label}</p>
            <p className={`mt-2 text-2xl font-bold ${toneClasses[metric.tone || "default"]}`}>{metric.value}</p>
          </div>
        ))}
      </div>

      <section className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
        <div className="rounded-2xl border border-dashed border-black/10 bg-[#F5F5F7] px-6 py-10 text-center">
          <p className="text-lg font-semibold text-[#1D1D1F]">{emptyTitle}</p>
          <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-[#86868B]">{emptyDescription}</p>
          <div className="mt-5 flex justify-center gap-3">
            <Link
              href="/account/integrations"
              className="rounded-full bg-[#ed6d00] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#FF8A1F]"
            >
              {t("account.automation.connectData")}
            </Link>
            <Link
              href="/account/rfqs"
              className="rounded-full border border-black/10 bg-white px-5 py-2.5 text-sm font-semibold text-[#1D1D1F] transition-colors hover:bg-black/[0.03]"
            >
              {t("account.reviewRFQs")}
            </Link>
          </div>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-3">
        {sections.map((section) => (
          <section key={section.title} className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
            <h2 className="text-[17px] font-semibold text-[#1D1D1F]">{section.title}</h2>
            <p className="mt-2 text-sm leading-6 text-[#86868B]">{section.description}</p>
            <ul className="mt-4 space-y-2 text-sm text-[#1D1D1F]">
              {section.items.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#ed6d00]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
