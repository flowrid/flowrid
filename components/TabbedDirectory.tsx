"use client";

import Link from "next/link";
import { useState } from "react";

interface TabItem {
  key: string;
  label: string;
}

interface DirectoryTab {
  label: string;
  href: string;
  displayName: string;
}

interface Props {
  tabs: TabItem[];
  categories: { key: string; display: string; href: string }[];
  states: { key: string; display: string; href: string }[];
}

export default function TabbedDirectory({ tabs, categories, states }: Props) {
  const [active, setActive] = useState(tabs[0]?.key || "");

  return (
    <section className="max-w-[1460px] mx-auto px-4 py-8">
      {/* Tab 菜单 */}
      <div className="flex justify-center gap-1 mb-8 bg-gray-100 rounded-full p-1 w-fit mx-auto">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActive(tab.key)}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
              active === tab.key
                ? "bg-white text-text shadow-sm"
                : "text-text-secondary hover:text-text"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Category 内容 */}
      {active === "category" && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.key}
              href={cat.href}
              className="border border-border rounded-xl p-4 bg-card hover:shadow-md hover:border-primary transition-all text-center"
            >
              <span className="text-sm font-medium">{cat.display}</span>
            </Link>
          ))}
        </div>
      )}

      {/* State 内容 */}
      {active === "state" && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {states.map((s) => (
            <Link
              key={s.key}
              href={s.href}
              className="border border-border rounded-lg p-3 bg-card hover:shadow-sm hover:border-primary transition-all text-center text-sm"
            >
              {s.display}
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
