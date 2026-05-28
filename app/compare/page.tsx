import { createServerClient } from "@/lib/supabase";
import Link from "next/link";
import type { ThreePL } from "@/types/3pl";

export const dynamic = "force-dynamic";

/**
 * Compare 页面 — 并排对比选中的 3PL
 * URL: /compare?pls=slug1,slug2,slug3
 */
export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const params = await searchParams;
  const slugs = params.pls?.split(",").filter(Boolean) || [];

  const supabase = createServerClient();

  if (!supabase || slugs.length === 0) {
    return (
      <div className="max-w-[1460px] mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-text">Compare 3PL Providers</h1>
        <div className="mt-8 text-center py-16">
          <p className="text-text-secondary text-lg">
            Go to the{" "}
            <Link href="/3pl" className="text-primary hover:underline font-medium">
              3PL Directory
            </Link>{" "}
            and check the boxes on the cards to select providers for comparison.
          </p>
        </div>
      </div>
    );
  }

  const { data } = await supabase
    .from("pl_providers")
    .select("*")
    .in("slug", slugs);

  const providers = (data as ThreePL[]) || [];

  if (providers.length < 2) {
    return (
      <div className="max-w-[1460px] mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-text">Compare 3PL Providers</h1>
        <p className="mt-8 text-center text-text-secondary">
          Select at least 2 providers to compare.
        </p>
      </div>
    );
  }

  // 计算评分
  const scored = providers.map((p) => ({
    ...p,
    score: Math.round(p.rating || 0),
  }));

  return (
    <div className="max-w-[1460px] mx-auto px-4 py-8 pb-20">
      <h1 className="text-2xl font-bold text-text">
        Compare {providers.length} 3PL Providers
      </h1>
      <p className="mt-1 text-text-secondary">
        Side-by-side evaluation of your selected fulfillment centers.
      </p>

      {/* Score Comparison */}
      <section className="mt-8">
        <h2 className="text-lg font-bold text-text mb-4">Overall Score</h2>
        <div className="flex gap-4 flex-wrap">
          {scored.map((p) => (
            <div
              key={p.id}
              className="flex-1 min-w-[200px] p-4 bg-card border border-border rounded-xl text-center"
            >
              <p className="text-sm font-medium text-text truncate">{p.name}</p>
              <p
                className={`text-3xl font-bold mt-2 ${
                  p.score >= 90
                    ? "text-success"
                    : p.score >= 70
                      ? "text-primary"
                      : "text-text-secondary"
                }`}
              >
                {p.score}
              </p>
              <p className="text-xs text-text-secondary">/ 100</p>
            </div>
          ))}
        </div>
      </section>

      {/* Side-by-Side Table */}
      <section className="mt-8 overflow-x-auto">
        <table className="w-full text-sm border border-border rounded-lg">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-3 text-left font-semibold w-32">Metric</th>
              {scored.map((p) => (
                <th key={p.id} className="px-4 py-3 text-left font-semibold">
                  {p.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            <CompareRow label="Location" values={scored.map((p) => p.city ? `${p.city}, ${formatState(p.state)}` : formatState(p.state))} />
            <CompareRow label="Rating" values={scored.map((p) => `${p.rating}/100 (${p.review_count} reviews)`)} />
            <CompareRow label="Shipping" values={scored.map((p) => p.shipping_speed)} />
            <CompareRow label="Cost Level" values={scored.map((p) => p.cost_level)} />
            <CompareRow
              label="Categories"
              values={scored.map((p) => (p.categories || []).map(formatName).join(", "))}
            />
            <CompareRow
              label="Platforms"
              values={scored.map((p) => (p.platforms || []).join(", "))}
            />
            <CompareRow
              label="Capacity"
              values={scored.map((p) => `${(p.order_capacity || 0).toLocaleString()} orders/mo`)}
            />
            <CompareRow label="Description" values={scored.map((p) => p.description || "-")} />
            <tr className="bg-gray-50">
              <td className="px-4 py-3 font-semibold">Action</td>
              {scored.map((p) => (
                <td key={p.id} className="px-4 py-3">
                  <a
                    href={`/rfq?pl=${p.slug}`}
                    className="text-primary hover:underline font-medium text-xs"
                  >
                    Get Quote
                  </a>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </section>

      {/* Best Pick */}
      <section className="mt-8 p-4 bg-green-50 border border-success/20 rounded-xl">
        <h2 className="text-lg font-bold text-success">
          Our Pick: {scored[0].name}
        </h2>
        <p className="text-sm text-text-secondary mt-1">
          Based on overall score, {scored[0].name} is the best match among your
          selected providers. But the right choice depends on your specific needs
          — request quotes from all {providers.length} to compare real pricing.
        </p>
        <a
          href={`/rfq?pl=${scored[0].slug}`}
          className="inline-block mt-3 bg-success text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors"
        >
          Get Quote from {scored[0].name}
        </a>
      </section>

      <div className="mt-6 text-center">
        <Link href="/3pl" className="text-primary hover:underline text-sm">
          &larr; Back to Directory
        </Link>
      </div>
    </div>
  );
}

function CompareRow({
  label,
  values,
}: {
  label: string;
  values: string[];
}) {
  return (
    <tr className="hover:bg-gray-50">
      <td className="px-4 py-3 font-medium text-text-secondary">{label}</td>
      {values.map((v, i) => (
        <td key={i} className="px-4 py-3 text-text">
          {v}
        </td>
      ))}
    </tr>
  );
}

function formatState(s: string): string {
  return s
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function formatName(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
