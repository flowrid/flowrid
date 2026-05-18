/**
 * FAQ Accordion — SEO 友好折叠问答
 *
 * 支持两种格式：
 * - 新：{ q: string, a: string }[]
 * - 旧：string[]（仅问题，答案用通用文案）
 */
export default function FAQ({
  items,
}: {
  items: string[] | { q: string; a: string }[];
}) {
  if (!items || items.length === 0) return null;

  return (
    <section className="mt-8">
      <h2 className="text-xl font-bold text-text mb-4">
        Frequently Asked Questions
      </h2>
      <div className="space-y-3">
        {items.map((item, i) => {
          const question = typeof item === "string" ? item : item.q;
          const answer =
            typeof item === "string"
              ? "Our AI analyzes real fulfillment data across hundreds of 3PL providers to give you the most accurate answer based on your specific product type, platform, and location requirements."
              : item.a;

          return (
            <details
              key={i}
              className="border border-border rounded-lg bg-card group"
            >
              <summary className="px-4 py-3 text-sm font-medium cursor-pointer hover:text-primary transition-colors select-none">
                {question}
              </summary>
              <p className="px-4 pb-3 text-sm text-text-secondary leading-relaxed">
                {answer}
              </p>
            </details>
          );
        })}
      </div>
    </section>
  );
}
