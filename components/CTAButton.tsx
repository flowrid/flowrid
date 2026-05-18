/**
 * CTA Button — 转化按钮组件
 *
 * Primary: Get Quote（主要转化）
 * Secondary: Compare
 * Sticky: Get Matched Free（页面底部固定）
 */
export function PrimaryCTA({
  href = "/rfq",
  children = "Get Quote",
}: {
  href?: string;
  children?: React.ReactNode;
}) {
  return (
    <a
      href={href}
      className="inline-flex items-center bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors"
    >
      {children}
    </a>
  );
}

export function SecondaryCTA({
  href = "/compare",
  children = "Compare",
}: {
  href?: string;
  children?: React.ReactNode;
}) {
  return (
    <a
      href={href}
      className="inline-flex items-center border border-border rounded-lg px-6 py-3 font-medium hover:bg-gray-50 transition-colors"
    >
      {children}
    </a>
  );
}

export function StickyCTA({
  href = "/rfq",
  children = "Get Matched Free",
}: {
  href?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="fixed bottom-0 left-0 right-0 p-3 bg-card border-t border-border z-50 md:hidden">
      <a
        href={href}
        className="block w-full text-center bg-primary text-white py-3 rounded-xl font-semibold hover:bg-primary-dark transition-colors"
      >
        {children}
      </a>
    </div>
  );
}
