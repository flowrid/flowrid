/**
 * Filter Bar — 筛选条组件
 *
 * 水平滚动的筛选 chips，用于快速切换品类/平台
 */
export default function FilterBar({
  items,
  active,
  onSelect,
  label,
}: {
  items: string[];
  active: string | null;
  onSelect: (item: string) => void;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2">
      <span className="text-xs font-medium text-text-secondary uppercase shrink-0">
        {label}:
      </span>
      {items.map((item) => (
        <button
          key={item}
          onClick={() => onSelect(item)}
          className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors shrink-0 ${
            active === item
              ? "bg-primary text-white"
              : "bg-gray-100 text-text-secondary hover:bg-gray-200"
          }`}
        >
          {item}
        </button>
      ))}
    </div>
  );
}
