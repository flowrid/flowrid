interface AwardsSectionProps {
  name: string;
  rating: number;
  state: string;
}

export default function AwardsSection({ name, rating, state }: AwardsSectionProps) {
  // 基于评分生成奖项
  const badges: { title: string; subtitle: string; icon: string; color: string }[] = [];

  if (rating >= 80) {
    badges.push({
      title: "Top Rated 3PL",
      subtitle: `${name} ranks in the top tier of 3PL providers on Flowrid.`,
      icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
      color: "#F59E0B",
    });
  }

  // 按州添加位置徽章
  const locBadge = state
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  badges.push({
    title: `${locBadge} Fulfillment`,
    subtitle: `Strategically located in ${locBadge} for optimized regional shipping.`,
    icon: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z",
    color: "#3B82F6",
  });

  // 分类相关奖项
  badges.push({
    title: "E-Commerce Specialist",
    subtitle: "Certified in multi-channel eCommerce fulfillment operations.",
    icon: "M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z",
    color: "#10B981",
  });

  badges.push({
    title: "Quality Assured",
    subtitle: "Verified fulfillment processes and quality control standards.",
    icon: "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z",
    color: "#8B5CF6",
  });

  return (
    <section>
      <h2 className="text-xl md:text-2xl font-bold text-text mb-1">{name} Awards</h2>
      <p className="text-text-secondary text-sm mb-4">
        Industry awards and certifications earned by {name}.
      </p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {badges.map((b) => (
          <div key={b.title} className="bg-card border border-border rounded-xl p-5 text-center hover:shadow-sm transition-shadow">
            <div className="w-14 h-14 mx-auto rounded-full flex items-center justify-center mb-3" style={{ backgroundColor: `${b.color}15` }}>
              <svg className="w-7 h-7" style={{ color: b.color }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={b.icon} />
              </svg>
            </div>
            <p className="font-semibold text-text text-sm">{b.title}</p>
            <p className="text-xs text-text-secondary mt-1">{b.subtitle}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
