import Link from "next/link";

/**
 * Compare 页面 — 多 3PL 并排对比入口
 */
export default function ComparePage() {
  return (
    <div className="max-w-[1200px] mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-text">Compare 3PL Providers</h1>
      <p className="mt-2 text-text-secondary">
        Select multiple fulfillment centers to compare side by side — pricing,
        speed, integrations, and more.
      </p>

      <div className="mt-8 text-center py-16">
        <p className="text-text-secondary text-lg">
          Browse the{" "}
          <Link href="/3pl" className="text-primary hover:underline font-medium">
            3PL Directory
          </Link>{" "}
          to find providers, then use the compare feature to evaluate them side by
          side.
        </p>
      </div>
    </div>
  );
}
