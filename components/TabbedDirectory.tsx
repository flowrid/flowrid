"use client";

import Link from "next/link";
import { useState } from "react";

interface TabItem {
  key: string;
  label: string;
}

interface DirectoryEntry {
  key: string;
  display: string;
  href: string;
}

interface Props {
  tabs: TabItem[];
  categories: DirectoryEntry[];
  states: DirectoryEntry[];
  international: DirectoryEntry[];
  platforms: DirectoryEntry[];
}

export default function TabbedDirectory({ tabs, categories, states, international, platforms }: Props) {
  const [active, setActive] = useState(tabs[0]?.key || "");

  const dataMap: Record<string, DirectoryEntry[]> = {
    category: categories,
    state: states,
    international,
    platform: platforms,
  };

  const entries = dataMap[active] || [];

  return (
    <section className="max-w-[1460px] mx-auto px-4 py-8">
      {/* Tab 菜单 */}
      <div className="flex justify-center gap-1 mb-8 bg-gray-100 rounded-full p-1 w-fit mx-auto flex-wrap">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActive(tab.key)}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
              active === tab.key
                ? "bg-white text-text shadow-sm"
                : "text-text-secondary hover:text-text"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 内容区 — 统一网格 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {entries.map((entry) => (
          <Link
            key={entry.key}
            href={entry.href}
            className="border border-border rounded-xl p-4 bg-card hover:shadow-md hover:border-primary transition-all text-center"
          >
            <span className="text-sm font-medium">{entry.display}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
