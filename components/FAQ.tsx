/**
 * FAQ Accordion — SEO 友好折叠问答
 */
export default function FAQ({ items }: { items: string[] }) {
  if (!items || items.length === 0) return null;

  return (
    <section className="mt-8">
      <h2 className="text-xl font-bold text-text mb-4">
        Frequently Asked Questions
      </h2>
      <div className="space-y-3">
        {items.map((question, i) => (
          <details
            key={i}
            className="border border-border rounded-lg bg-card group"
          >
            <summary className="px-4 py-3 text-sm font-medium cursor-pointer hover:text-primary transition-colors select-none">
              {question}
            </summary>
            <p className="px-4 pb-3 text-sm text-text-secondary">
              Our AI analyzes real fulfillment data across hundreds of 3PL
              providers to give you the most accurate answer based on your
              specific product type, platform, and location requirements.
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
