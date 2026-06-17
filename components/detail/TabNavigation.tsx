interface Tab {
  id: string;
  label: string;
}

interface TabNavigationProps {
  tabs: Tab[];
}

/** 纯服务端渲染的 Tab 导航 — 无客户端 JS，消除水合问题 */
export default function TabNavigation({ tabs }: TabNavigationProps) {
  return (
    <nav className="sticky top-[72px] z-40 bg-white/95 backdrop-blur border-b border-border">
      <div className="max-w-[1460px] mx-auto px-4">
        <div
          className="flex gap-1 md:gap-0 overflow-x-auto py-2"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {tabs.map((tab) => (
            <a
              key={tab.id}
              href={`#${tab.id}`}
              className="shrink-0 px-3.5 py-2 text-xs md:text-sm font-medium rounded-full bg-gray-100 text-text-secondary hover:bg-gray-200 transition-colors whitespace-nowrap"
            >
              {tab.label}
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
}
