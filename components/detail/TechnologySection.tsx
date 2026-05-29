import { PLATFORM_ICONS } from "@/lib/platform-icons";

interface TechnologySectionProps {
  name: string;
  platforms: string[];
  integrations: string[];
}

/** 已知技术合作伙伴的描述 */
const TECH_DESCRIPTIONS: Record<string, string> = {
  shopify: "Industry-leading eCommerce platform with real-time order and inventory sync",
  amazon: "FBA Prep, Seller Central integration, and multi-channel fulfillment",
  woocommerce: "Open-source WordPress eCommerce with flexible fulfillment automation",
  bigcommerce: "Enterprise-grade eCommerce with native multi-warehouse routing",
  magento: "Adobe Commerce platform with advanced order management APIs",
  netsuite: "Oracle ERP with integrated warehouse and order management",
  shipstation: "Multi-carrier shipping platform with rate shopping and batch processing",
  quickbooks: "Accounting and inventory management integration",
  walmart: "Walmart Marketplace and WFS fulfillment integration",
  ebay: "eBay marketplace order management and fulfillment",
  etsy: "Handmade and vintage marketplace fulfillment",
  tiktok: "TikTok Shop social commerce fulfillment",
  chewy: "Pet supplies marketplace fulfillment",
  wayfair: "Home goods and furniture marketplace fulfillment",
  whatnot: "Live shopping marketplace fulfillment",
  shein: "Fast fashion marketplace fulfillment",
  temu: "Cross-border marketplace fulfillment",
};

export default function TechnologySection({ name, platforms, integrations }: TechnologySectionProps) {
  const allTech = [...(platforms || []), ...(integrations || [])];
  const unique = [...new Set(allTech)];

  if (unique.length === 0) {
    return (
      <section>
        <h2 className="text-xl md:text-2xl font-bold text-text mb-1">{name} Technology</h2>
        <p className="text-text-secondary text-sm">
          Technology integration information coming soon. Contact {name} for details about their tech stack.
        </p>
      </section>
    );
  }

  return (
    <section>
      <h2 className="text-xl md:text-2xl font-bold text-text mb-1">{name} Technology</h2>
      <p className="text-text-secondary text-sm mb-4">
        {name} integrates with a wide range of eCommerce platforms and tools to streamline your fulfillment:
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        {unique.slice(0, 12).map((tech) => {
          const key = tech.toLowerCase().trim().replace(/\s+/g, "");
          const icon = PLATFORM_ICONS[key];
          const desc = TECH_DESCRIPTIONS[key] || `Integrated ${tech} solution`;

          return (
            <div
              key={tech}
              className="flex items-start gap-4 p-4 bg-card border border-border rounded-xl hover:shadow-sm transition-shadow"
            >
              {/* 图标/avatar */}
              {icon ? (
                <img
                  src={icon}
                  alt={tech}
                  className="w-10 h-10 rounded-lg object-contain bg-[#F5F5F7] shrink-0"
                />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-[#F5F5F7] flex items-center justify-center text-[#86868B] font-bold text-sm shrink-0 select-none">
                  {tech.charAt(0)}
                </div>
              )}

              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-medium text-text text-sm">{tech}</p>
                  <span className="text-[10px] px-1.5 py-0.5 bg-green-100 text-green-700 rounded-full font-medium">
                    Certified
                  </span>
                </div>
                <p className="text-xs text-text-secondary mt-1 line-clamp-2">{desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
