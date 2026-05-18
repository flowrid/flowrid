"use client";

/**
 * Mobile Filter — 横向滚动筛选 chips
 *
 * 用于移动端页面顶部快速切换品类/平台
 */
export default function MobileFilter({
  items,
  active,
  onSelect,
}: {
  items: { label: string; value: string }[];
  active: string | null;
  onSelect: (value: string) => void;
}) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 px-4 scrollbar-hide">
      {items.map((item) => (
        <button
          key={item.value}
          onClick={() => onSelect(item.value)}
          className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors shrink-0 ${
            active === item.value
              ? "bg-primary text-white"
              : "bg-gray-100 text-text-secondary active:bg-gray-200"
          }`}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
