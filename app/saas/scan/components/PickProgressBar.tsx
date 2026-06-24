"use client";

import { useTranslations } from "next-intl";

export default function PickProgressBar({ current, total, complete }: { current: number; total: number; complete: boolean }) {
  const t = useTranslations("scan");
  const pct = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-black/5">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium text-[#1D1D1F]">{t("pickTasks")}</p>
        <span className="text-xs text-[#86868B]">{current}/{total} items</span>
      </div>
      <div className="h-2.5 bg-[#F5F5F7] rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${complete ? "bg-[#34C759]" : "bg-[#ed6d00]"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {complete && (
        <p className="text-[#34C759] text-sm font-medium mt-3 text-center">{t("pickTasks")}</p>
      )}
    </div>
  );
}
