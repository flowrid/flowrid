/**
 * Flowrid 工具聚合 — 工具数据定义
 *
 * 所有工具的标准化数据结构。
 * 按 Jobs to Be Done 分类，服务 Brand 和 3PL 双方。
 */

export type ToolCategory =
  | "tracking-visibility"
  | "order-management"
  | "shipping-rates"
  | "inventory-warehouse"
  | "automation-integration"
  | "compliance-documents";

export interface ToolPricing {
  freeTier: string;           // e.g. "Free for up to 50 shipments/month"
  startingPrice: string;      // e.g. "$9/month"
  billingModel: "monthly" | "per-shipment" | "per-order" | "usage-based" | "one-time";
}

export interface ToolData {
  slug: string;
  name: string;
  tagline: string;            // 一句话价值主张
  description: string;        // 2-3 句详细描述
  logoUrl: string;            // 工具 logo 路径
  websiteUrl: string;
  category: ToolCategory;
  pricing: ToolPricing;
  features: string[];         // 核心功能列表
  pros: string[];             // 优点
  cons: string[];             // 缺点/局限性
  bestFor: string[];          // 最适合谁
  notFor: string[];           // 不适合谁
  platformSupport: string[];  // 支持的平台
  integrations: string[];     // 集成能力
  setupTime: string;          // 上手时间
  ratingVendor: string;       // 第三方评分来源（G2/Capterra）
  ratingScore: string;        // 评分
  ratingCount: string;        // 评价数量
  affiliateUrl?: string;      // 联盟链接（可选）
}

export interface CategoryInfo {
  slug: ToolCategory;
  titleKey: string;
  descriptionKey: string;
  questionKey: string;        // "客户在问什么"
  icon: string;               // Font Awesome 图标名
  color: string;              // Tailwind 色值
  toolSlugs: string[];
}

// ==========================================
// 6 大品类定义
// ==========================================

export const CATEGORIES: CategoryInfo[] = [
  {
    slug: "tracking-visibility",
    titleKey: "tools.categories.tracking",
    descriptionKey: "tools.categories.trackingDesc",
    questionKey: "tools.categories.trackingQuestion",
    icon: "fa-map-marker",
    color: "#ed6d00",
    toolSlugs: ["aftership", "17track", "parcelpanel", "narvar", "route", "wesupply"],
  },
  {
    slug: "order-management",
    titleKey: "tools.categories.orderMgmt",
    descriptionKey: "tools.categories.orderMgmtDesc",
    questionKey: "tools.categories.orderMgmtQuestion",
    icon: "fa-list-alt",
    color: "#2563EB",
    toolSlugs: ["shipstation", "shippo", "easyship", "orderdesk", "pipe17"],
  },
  {
    slug: "shipping-rates",
    titleKey: "tools.categories.shipping",
    descriptionKey: "tools.categories.shippingDesc",
    questionKey: "tools.categories.shippingQuestion",
    icon: "fa-truck",
    color: "#16A34A",
    toolSlugs: ["shippo-shipping", "easyship-shipping", "freightos", "flexport", "project44"],
  },
  {
    slug: "inventory-warehouse",
    titleKey: "tools.categories.inventory",
    descriptionKey: "tools.categories.inventoryDesc",
    questionKey: "tools.categories.inventoryQuestion",
    icon: "fa-cubes",
    color: "#7C3AED",
    toolSlugs: ["skubana", "cin7", "tradegecko", "shiphero", "extensiv"],
  },
  {
    slug: "automation-integration",
    titleKey: "tools.categories.automation",
    descriptionKey: "tools.categories.automationDesc",
    questionKey: "tools.categories.automationQuestion",
    icon: "fa-cogs",
    color: "#F59E0B",
    toolSlugs: ["make", "zapier", "n8n", "cartrover", "api"],
  },
  {
    slug: "compliance-documents",
    titleKey: "tools.categories.compliance",
    descriptionKey: "tools.categories.complianceDesc",
    questionKey: "tools.categories.complianceQuestion",
    icon: "fa-check-circle",
    color: "#EF4444",
    toolSlugs: ["avalara", "taxjar", "zonos", "flexport-compliance", "descartes"],
  },
];

// ==========================================
// 追踪 & 可见性工具
// ==========================================

export const TRACKING_TOOLS: ToolData[] = [
  {
    slug: "aftership",
    name: "AfterShip",
    tagline: "The most popular post-purchase tracking platform for ecommerce brands",
    description: "AfterShip helps ecommerce brands reduce WISMO (Where Is My Order) inquiries by providing branded tracking pages, proactive delivery notifications, and a centralized dashboard for managing shipments across 1,000+ carriers worldwide. Its AI-powered delivery estimates give customers accurate arrival predictions.",
    logoUrl: "/images/tools/aftership.png",
    websiteUrl: "https://www.aftership.com",
    category: "tracking-visibility",
    pricing: {
      freeTier: "Free for 50 shipments/month",
      startingPrice: "$11/month (Essential plan)",
      billingModel: "monthly",
    },
    features: [
      "Branded tracking page with your logo and colors",
      "Automated delivery notifications (email + SMS)",
      "1,000+ carrier integrations worldwide",
      "AI-powered estimated delivery date (EDD) predictions",
      "Centralized shipment analytics dashboard",
      "Returns management portal",
      "CSV/API bulk tracking imports",
    ],
    pros: [
      "Largest carrier network in the industry",
      "Excellent branded tracking experience out of the box",
      "Strong Shopify/WooCommerce/Shopify Plus integrations",
      "Reduces WISMO tickets by up to 60%",
    ],
    cons: [
      "Enterprise tier gets expensive quickly at scale",
      "Advanced features (AI EDD, multi-language) require higher plans",
      "Limited B2B/wholesale tracking capabilities",
    ],
    bestFor: [
      "DTC brands shipping 200+ orders/month",
      "Shopify merchants wanting branded post-purchase",
      "Brands using multiple 3PLs who need unified tracking",
    ],
    notFor: [
      "Brands doing under 50 shipments/month (use free tier or 17TRACK)",
      "Heavy B2B/wholesale operations",
      "Amazon-only sellers (Amazon has built-in tracking)",
    ],
    platformSupport: ["Shopify", "WooCommerce", "BigCommerce", "Magento", "Salesforce Commerce Cloud"],
    integrations: ["Shopify", "WooCommerce", "BigCommerce", "Magento", "Klaviyo", "Zendesk", "Gorgias", "Attentive"],
    setupTime: "15-30 minutes",
    ratingVendor: "G2",
    ratingScore: "4.6/5",
    ratingCount: "1,200+ reviews",
  },
  {
    slug: "17track",
    name: "17TRACK",
    tagline: "Free global package tracking with the broadest carrier coverage",
    description: "17TRACK aggregates tracking data from 2,500+ carriers worldwide, making it the most comprehensive free tracking solution. While its consumer-facing interface is basic, the Pro plan offers API access and bulk tracking suitable for small to mid-size ecommerce operations that need global coverage without the premium price tag.",
    logoUrl: "/images/tools/17track.png",
    websiteUrl: "https://www.17track.net",
    category: "tracking-visibility",
    pricing: {
      freeTier: "Free for consumers (no API)",
      startingPrice: "Custom pricing (API plans)",
      billingModel: "monthly",
    },
    features: [
      "2,500+ carriers in a single platform",
      "Bulk tracking API for ecommerce platforms",
      "Multi-language tracking page (30+ languages)",
      "Mobile app for on-the-go tracking",
      "Auto-detection of carrier from tracking number",
      "Webhook notifications for status changes",
    ],
    pros: [
      "Broadest carrier coverage available",
      "Free tier is genuinely useful for small operations",
      "Carrier auto-detection saves manual work",
      "Excellent for international/cross-border shipments",
    ],
    cons: [
      "Branded tracking page requires custom development with API",
      "No built-in email/SMS notification system (API only)",
      "UI feels consumer-grade rather than professional",
      "Limited analytics compared to AfterShip/Narvar",
    ],
    bestFor: [
      "Small brands on a budget who need global tracking",
      "International sellers shipping to 10+ countries",
      "Developers who want to build custom tracking on top of API",
    ],
    notFor: [
      "Brands wanting a polished, branded tracking experience out of the box",
      "Large enterprises needing SLA guarantees",
      "Non-technical users (API-first approach requires dev resources)",
    ],
    platformSupport: ["API-based — works with any platform"],
    integrations: ["Shopify (via third-party apps)", "WooCommerce", "Magento", "Custom API integration"],
    setupTime: "1-2 hours (API integration)",
    ratingVendor: "Trustpilot",
    ratingScore: "4.7/5",
    ratingCount: "15,000+ reviews",
  },
  {
    slug: "parcelpanel",
    name: "ParcelPanel",
    tagline: "Affordable branded order tracking designed for Shopify merchants",
    description: "ParcelPanel is a Shopify-native order tracking solution that combines a beautiful branded tracking page with automated customer notifications. It's designed specifically for DTC brands on Shopify who want AfterShip-level tracking experience at a more accessible price point.",
    logoUrl: "/images/tools/parcelpanel.png",
    websiteUrl: "https://www.parcelpanel.com",
    category: "tracking-visibility",
    pricing: {
      freeTier: "Free for 20 orders/month",
      startingPrice: "$9/month (Starter, 200 orders)",
      billingModel: "monthly",
    },
    features: [
      "Drag-and-drop branded tracking page builder",
      "Automated email notifications with your branding",
      "1,200+ carrier integrations",
      "Estimated delivery date display",
      "Order lookup widget for your store",
      "Delivery performance analytics dashboard",
      "Multi-language tracking page (7 languages)",
    ],
    pros: [
      "Best price-to-feature ratio in the market",
      "Excellent Shopify integration and onboarding",
      "Drag-and-drop page builder requires no coding",
      "Multi-language support out of the box",
    ],
    cons: [
      "Shopify-focused — limited support for other platforms",
      "Carrier coverage smaller than AfterShip/17TRACK",
      "Limited enterprise features (no white-label option)",
      "No SMS notifications on lower tiers",
    ],
    bestFor: [
      "Shopify DTC brands wanting affordable branded tracking",
      "Brands doing 200-5,000 orders/month",
      "Non-technical founders who want plug-and-play setup",
    ],
    notFor: [
      "Non-Shopify stores",
      "Enterprise brands needing white-label solutions",
      "Heavy B2B operations",
    ],
    platformSupport: ["Shopify", "Shopify Plus"],
    integrations: ["Shopify", "Klaviyo", "Omnisend", "Judge.me", "Loox"],
    setupTime: "5-10 minutes",
    ratingVendor: "Shopify App Store",
    ratingScore: "4.9/5",
    ratingCount: "3,800+ reviews",
  },
  {
    slug: "narvar",
    name: "Narvar",
    tagline: "Enterprise post-purchase platform for the world's largest retailers",
    description: "Narvar is the enterprise-grade post-purchase experience platform used by brands like Sephora, Levi's, and Patagonia. It goes beyond tracking to orchestrate the entire post-purchase journey — from order tracking and returns to customer communication and loyalty-driving experiences. Narvar uses AI to predict delivery issues before they happen.",
    logoUrl: "/images/tools/narvar.png",
    websiteUrl: "https://www.narvar.com",
    category: "tracking-visibility",
    pricing: {
      freeTier: "No free tier",
      startingPrice: "Custom (typically $1,000+/month)",
      billingModel: "per-order",
    },
    features: [
      "AI-powered predictive delivery intelligence",
      "Branded tracking with upsell/product recommendations",
      "Intelligent returns & exchanges platform",
      "Multi-carrier tracking with 1,000+ integrations",
      "Proactive issue resolution (delays, exceptions)",
      "Customer sentiment analysis",
      "Post-purchase marketing automation",
      "Concierge service for high-value customers",
    ],
    pros: [
      "Used by Fortune 500 retail brands",
      "AI proactively identifies delivery issues before customers complain",
      "Returns platform integrated with tracking",
      "Post-purchase marketing drives repeat revenue",
    ],
    cons: [
      "Expensive — prohibitive for small/mid-size brands",
      "Complex implementation (weeks, not minutes)",
      "Requires significant order volume to justify ROI",
      "Overkill for brands with simple tracking needs",
    ],
    bestFor: [
      "Enterprise retailers with 10,000+ orders/month",
      "Brands wanting to turn post-purchase into revenue driver",
      "Multi-carrier, multi-warehouse complex logistics",
    ],
    notFor: [
      "Brands under $1M annual revenue",
      "Simple tracking-only use cases",
      "Teams without dedicated ops resources for implementation",
    ],
    platformSupport: ["Salesforce Commerce Cloud", "Shopify Plus", "Magento", "BigCommerce Enterprise", "Custom"],
    integrations: ["Salesforce", "Shopify Plus", "Zendesk", "Klaviyo", "Attentive", "Braze", "Iterable"],
    setupTime: "4-8 weeks (enterprise implementation)",
    ratingVendor: "G2",
    ratingScore: "4.3/5",
    ratingCount: "800+ reviews",
  },
  {
    slug: "route",
    name: "Route",
    tagline: "Package protection + visual tracking built for consumer trust",
    description: "Route combines package protection insurance with a visual order tracking experience. When customers opt in to Route's package protection at checkout, they get a unified tracking app that shows all their online orders in one place — plus guaranteed refunds or replacements for lost, stolen, or damaged packages.",
    logoUrl: "/images/tools/route.png",
    websiteUrl: "https://www.route.com",
    category: "tracking-visibility",
    pricing: {
      freeTier: "Free tracking app for consumers",
      startingPrice: "~1-2% of order value (package protection, paid by customer)",
      billingModel: "per-order",
    },
    features: [
      "Visual order tracking with map view",
      "Package protection (loss/theft/damage coverage)",
      "Unified consumer tracking app (all orders in one place)",
      "AI-powered issue resolution (auto-refund for covered claims)",
      "Branded tracking experience for merchants",
      "Carbon-neutral shipping offsets",
    ],
    pros: [
      "Unique package protection + tracking combo reduces CX tickets",
      "Consumer app creates brand-agnostic loyalty",
      "Claims process is automated and fast",
      "Zero cost to merchant (customer pays for protection)",
    ],
    cons: [
      "Customer-funded model not ideal for all brands",
      "Protection cost can increase cart abandonment at checkout",
      "Less flexible for B2B or high-value shipments",
      "Consumer app may dilute your brand experience",
    ],
    bestFor: [
      "DTC brands with high AOV ($75+) where shipping anxiety is real",
      "Brands seeing high lost/stolen package claims",
      "Apparel, electronics, and luxury goods sellers",
    ],
    notFor: [
      "Low AOV brands where protection fee hurts conversion",
      "B2B brands — protection model is consumer-focused",
      "Brands wanting full control over post-purchase branding",
    ],
    platformSupport: ["Shopify", "Shopify Plus", "WooCommerce", "BigCommerce", "Magento"],
    integrations: ["Shopify", "WooCommerce", "BigCommerce", "Magento", "Salesforce Commerce Cloud"],
    setupTime: "15-30 minutes (Shopify app install)",
    ratingVendor: "Shopify App Store",
    ratingScore: "4.8/5",
    ratingCount: "2,500+ reviews",
  },
  {
    slug: "wesupply",
    name: "WeSupply",
    tagline: "End-to-end post-purchase with self-service returns and in-store pickup",
    description: "WeSupply goes beyond tracking to offer a full post-purchase experience platform including order tracking, self-service returns, in-store pickup notifications, and delivery estimates. It's particularly strong for omnichannel brands that sell both online and in physical retail locations.",
    logoUrl: "/images/tools/wesupply.png",
    websiteUrl: "https://www.wesupply.com",
    category: "tracking-visibility",
    pricing: {
      freeTier: "Free for 100 orders/month",
      startingPrice: "$49/month (Basic, 500 orders)",
      billingModel: "monthly",
    },
    features: [
      "Branded order tracking page",
      "Self-service returns portal (QR code drop-off, printerless)",
      "Buy Online Pick Up In Store (BOPIS) notifications",
      "Estimated delivery date on product pages (pre-purchase)",
      "Automated email + SMS notifications",
      "Returns analytics and reason tracking",
      "Multi-carrier integration",
    ],
    pros: [
      "All-in-one: tracking + returns + BOPIS in one platform",
      "Self-service returns reduce support tickets dramatically",
      "Pre-purchase EDD display improves conversion",
      "Good for omnichannel (online + physical stores)",
    ],
    cons: [
      "Less polished tracking page than AfterShip/Narvar",
      "Setup is more complex due to broad feature set",
      "Higher price point than tracking-only tools",
      "Smaller carrier network than AfterShip",
    ],
    bestFor: [
      "Omnichannel brands with physical stores + online",
      "Brands wanting unified tracking + returns solution",
      "Mid-size brands (500-5,000 orders/month)",
    ],
    notFor: [
      "Online-only brands with simple tracking needs",
      "Very small brands (use free tier first, but 100 orders goes fast)",
      "Brands that already have a returns solution",
    ],
    platformSupport: ["Shopify", "Shopify Plus", "WooCommerce", "BigCommerce", "Magento", "Salesforce Commerce Cloud"],
    integrations: ["Shopify", "WooCommerce", "BigCommerce", "Magento", "Zendesk", "Gorgias", "Klaviyo"],
    setupTime: "1-2 hours",
    ratingVendor: "G2",
    ratingScore: "4.5/5",
    ratingCount: "400+ reviews",
  },
];

// ==========================================
// 所有工具的主索引
// ==========================================

export const ALL_TOOLS: Record<string, ToolData[]> = {
  "tracking-visibility": TRACKING_TOOLS,
};

export function getToolsByCategory(category: ToolCategory): ToolData[] {
  return ALL_TOOLS[category] || [];
}

export function getToolBySlug(slug: string): ToolData | undefined {
  for (const tools of Object.values(ALL_TOOLS)) {
    const found = tools.find((t) => t.slug === slug);
    if (found) return found;
  }
  return undefined;
}
