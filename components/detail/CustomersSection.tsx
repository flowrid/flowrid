interface CustomersSectionProps {
  name: string;
  categories: string[];
}

/** 根据分类生成模拟客户 */
function generateCustomers(categories: string[]) {
  const cats = (categories || []).map((c) => c.toLowerCase());

  const allCustomers = [
    { name: "Native Roots", niche: "apparel" },
    { name: "Pure Glow Co.", niche: "beauty" },
    { name: "FlexFit Gear", niche: "sporting-goods" },
    { name: "BiteBox", niche: "food-beverage" },
    { name: "Paw & Co.", niche: "pet-supplies" },
    { name: "ModMuse", niche: "home-garden" },
    { name: "Little Cubs", niche: "baby-care" },
    { name: "TechGlide", niche: "electronics" },
    { name: "Velvet Moon", niche: "apparel" },
    { name: "EverGreen Supply", niche: "home-garden" },
  ];

  if (cats.length === 0) return allCustomers.slice(0, 5);

  // 匹配分类
  const matched = allCustomers.filter((c) =>
    cats.some((cat) => c.niche.includes(cat) || cat.includes(c.niche))
  );

  if (matched.length >= 5) return matched.slice(0, 5);
  return [...matched, ...allCustomers.filter((c) => !matched.includes(c))].slice(0, 5);
}

export default function CustomersSection({ name, categories }: CustomersSectionProps) {
  const customers = generateCustomers(categories);
  const colors = ["#F97316", "#3B82F6", "#10B981", "#8B5CF6", "#EC4899"];

  return (
    <section>
      <h2 className="text-xl md:text-2xl font-bold text-text mb-1">{name} Customers</h2>
      <p className="text-text-secondary text-sm mb-4">
        Brands that trust {name} with their fulfillment.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
        {customers.map((cust, i) => (
          <div
            key={cust.name}
            className="bg-card border border-border rounded-xl p-6 flex flex-col items-center justify-center gap-3 hover:shadow-sm transition-shadow"
            style={{ minHeight: "120px" }}
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg"
              style={{ backgroundColor: colors[i % colors.length] }}
            >
              {cust.name.charAt(0)}
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-text">{cust.name}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
