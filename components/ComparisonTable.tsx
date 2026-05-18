import { ThreePLCardData } from "@/types/3pl";

/**
 * Comparison Table — 3PL 对比表格
 */
export default function ComparisonTable({
  data,
}: {
  data: ThreePLCardData[];
}) {
  if (!data || data.length < 2) return null;

  return (
    <section className="mt-8 overflow-x-auto">
      <h2 className="text-xl font-bold text-text mb-4">Quick Comparison</h2>
      <table className="w-full text-sm border border-border rounded-lg overflow-hidden">
        <thead>
          <tr className="bg-gray-50 text-left">
            <th className="px-4 py-3 font-semibold">3PL</th>
            <th className="px-4 py-3 font-semibold">Speed</th>
            <th className="px-4 py-3 font-semibold">Cost</th>
            <th className="px-4 py-3 font-semibold">Score</th>
            <th className="px-4 py-3 font-semibold">Action</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.id} className="border-t border-border hover:bg-gray-50">
              <td className="px-4 py-3 font-medium">{item.name}</td>
              <td className="px-4 py-3">{item.shipping_speed}</td>
              <td className="px-4 py-3">{item.cost_level}</td>
              <td className="px-4 py-3">
                <span
                  className={`inline-flex px-2 py-0.5 rounded text-white text-xs font-bold ${
                    item.score >= 90
                      ? "bg-success"
                      : item.score >= 70
                        ? "bg-primary"
                        : "bg-gray-400"
                  }`}
                >
                  {item.score}
                </span>
              </td>
              <td className="px-4 py-3">
                <a
                  href={`/rfq?pl=${item.slug}`}
                  className="text-primary hover:underline font-medium text-xs"
                >
                  Get Quote
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
