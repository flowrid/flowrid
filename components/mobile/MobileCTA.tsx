/**
 * Mobile Sticky CTA — 页面底部固定转化按钮
 *
 * Google 建议：CTA 必须 sticky，否则移动端转化掉 50%
 */
export default function MobileCTA({
  href = "/rfq",
  label = "Get Matched Free",
}: {
  href?: string;
  label?: string;
}) {
  return (
    <div className="fixed bottom-0 left-0 right-0 p-3 bg-card border-t border-border z-50 md:hidden">
      <a
        href={href}
        className="block w-full text-center bg-primary text-white py-3 rounded-xl font-semibold text-sm hover:bg-primary-dark transition-colors active:scale-[0.98]"
      >
        {label}
      </a>
    </div>
  );
}
