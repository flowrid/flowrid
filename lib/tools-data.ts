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
// 多平台订单管理工具
// ==========================================

export const ORDER_MANAGEMENT_TOOLS: ToolData[] = [
  {
    slug: "shipstation",
    name: "ShipStation",
    tagline: "The most popular multi-channel order management and shipping platform for ecommerce",
    description: "ShipStation is the industry-standard platform for managing orders across 100+ selling channels and automating shipping workflows. It centralizes orders from Shopify, Amazon, eBay, Walmart, and more into a single dashboard, then lets you batch-print labels, set automation rules, and compare carrier rates — all from one interface. Used by over 130,000 merchants worldwide.",
    logoUrl: "/images/tools/shipstation.png",
    websiteUrl: "https://www.shipstation.com",
    category: "order-management",
    pricing: {
      freeTier: "No free tier (30-day free trial)",
      startingPrice: "$9.99/month (Starter, 50 shipments)",
      billingModel: "monthly",
    },
    features: [
      "100+ marketplace and cart integrations",
      "Batch label printing (up to 500 labels at once)",
      "Automation rules engine (if-then shipping logic)",
      "Multi-carrier rate comparison (USPS/UPS/FedEx/DHL)",
      "Branded tracking page and delivery notifications",
      "Returns portal with branded experience",
      "Inventory sync across channels",
      "Mobile app for on-the-go management",
    ],
    pros: [
      "Largest integration ecosystem in the industry",
      "Excellent automation rules save hours of manual work",
      "Strong marketplace support (Amazon, eBay, Walmart, Etsy)",
      "Reliable and mature platform with excellent uptime",
    ],
    cons: [
      "Interface feels dated compared to newer tools",
      "Advanced automation requires higher-tier plans",
      "International shipping features less polished than domestic",
      "Starter plan limits to 50 shipments — grows expensive with volume",
    ],
    bestFor: [
      "Brands selling on 3+ channels (Shopify + Amazon + eBay + etc.)",
      "Merchants doing 200-10,000 orders/month who need batch processing",
      "Brands wanting extensive automation without building custom solutions",
    ],
    notFor: [
      "Single-channel Shopify-only stores (use ShipBob's built-in or ParcelPanel)",
      "Very small brands under 50 orders/month (overkill)",
      "Brands wanting a modern, minimal UI",
    ],
    platformSupport: ["Shopify", "Amazon", "eBay", "Walmart", "Etsy", "WooCommerce", "BigCommerce", "Magento", "Squarespace", "Wix"],
    integrations: ["Shopify", "Amazon", "eBay", "Walmart", "Etsy", "WooCommerce", "BigCommerce", "Magento", "USPS", "UPS", "FedEx", "DHL"],
    setupTime: "30-60 minutes",
    ratingVendor: "G2",
    ratingScore: "4.4/5",
    ratingCount: "1,000+ reviews",
  },
  {
    slug: "orderdesk",
    name: "OrderDesk",
    tagline: "Intelligent order routing and multi-warehouse split-order management",
    description: "OrderDesk is purpose-built for brands that need to route orders to multiple fulfillment centers, suppliers, or dropshippers. Unlike ShipStation (shipping-first), OrderDesk is routing-first — it automatically splits multi-item orders across warehouses based on inventory availability, then sends each piece to the right place. Ideal for brands with complex multi-3PL or hybrid fulfillment setups.",
    logoUrl: "/images/tools/orderdesk.png",
    websiteUrl: "https://www.orderdesk.com",
    category: "order-management",
    pricing: {
      freeTier: "No free tier",
      startingPrice: "$59/month (Starter, 250 orders)",
      billingModel: "monthly",
    },
    features: [
      "Multi-warehouse order routing with split-order logic",
      "Rule-based automation (vendor, SKU, weight, destination)",
      "Inventory sync across multiple fulfillment centers",
      "Built-in dropshipping and supplier management",
      "Order aggregation from 20+ sales channels",
      "Custom packing slips and branded inserts per vendor",
      "CSV/API/FTP import options for custom setups",
    ],
    pros: [
      "Best-in-class multi-warehouse splitting and routing",
      "Excellent for dropshipping + 3PL hybrid models",
      "Custom packing slip and insert rules per vendor",
      "Strong API for custom integrations",
    ],
    cons: [
      "Higher starting price than ShipStation",
      "Smaller integration ecosystem (20 vs 100+ channels)",
      "No built-in shipping label printing (partner with ShipStation)",
      "Learning curve steeper than simpler tools",
    ],
    bestFor: [
      "Brands using multiple 3PLs or warehouses simultaneously",
      "Dropshipping + owned warehouse hybrid operations",
      "Subscription box brands with complex routing needs",
    ],
    notFor: [
      "Single-warehouse brands with simple fulfillment",
      "Very small brands (volume too low to justify $59/mo)",
      "Brands wanting all-in-one solution (OrderDesk routes orders, doesn't ship them)",
    ],
    platformSupport: ["Shopify", "WooCommerce", "BigCommerce", "Magento", "Etsy", "eBay", "Amazon", "Walmart", "Square"],
    integrations: ["Shopify", "WooCommerce", "BigCommerce", "ShipStation", "ShipBob", "Deliverr", "Printful", "Custom API"],
    setupTime: "1-2 hours",
    ratingVendor: "Capterra",
    ratingScore: "4.7/5",
    ratingCount: "200+ reviews",
  },
  {
    slug: "pipe17",
    name: "Pipe17",
    tagline: "Ecommerce integration infrastructure — connect everything without code",
    description: "Pipe17 is a next-generation integration platform that connects your entire ecommerce stack: storefronts → order management → 3PLs → shipping → accounting. Instead of building and maintaining point-to-point integrations, Pipe17 provides a unified integration layer with pre-built connectors and automatic data normalization. It's like Zapier for ecommerce operations, but purpose-built for order flows.",
    logoUrl: "/images/tools/pipe17.png",
    websiteUrl: "https://www.pipe17.com",
    category: "order-management",
    pricing: {
      freeTier: "No free tier",
      startingPrice: "Custom (typically $500+/month)",
      billingModel: "monthly",
    },
    features: [
      "Pre-built connectors for 100+ ecommerce tools and 3PLs",
      "Automatic order data normalization across platforms",
      "Real-time order sync (not batch)",
      "Built-in error handling and retry logic",
      "Multi-currency and multi-language support",
      "Order lifecycle tracking from cart to delivery",
      "Integrates ERPs (NetSuite, QuickBooks, Acumatica)",
    ],
    pros: [
      "Eliminates months of custom integration development",
      "Purpose-built for ecommerce order flows (vs generic iPaaS)",
      "Real-time sync means no latency between systems",
      "Handles edge cases (refunds, partial shipments, cancellations) well",
    ],
    cons: [
      "Expensive — only viable for scaling brands (500+ orders/month)",
      "Pricing not transparent (custom quotes)",
      "Overkill for brands using a single 3PL with native integration",
      "Setup requires understanding of your entire tech stack",
    ],
    bestFor: [
      "Mid-market brands with 500-10,000+ orders/month",
      "Brands needing real-time inventory sync across systems",
      "Companies replacing manual CSV imports/exports between tools",
    ],
    notFor: [
      "Pre-revenue or very early stage brands",
      "Brands with a single 3PL that has native Shopify integration",
      "Simple setups that ShipStation alone can handle",
    ],
    platformSupport: ["Shopify", "Shopify Plus", "BigCommerce", "Magento", "Salesforce Commerce Cloud", "NetSuite", "QuickBooks"],
    integrations: ["ShipBob", "ShipMonk", "Deliverr", "ShipStation", "NetSuite", "QuickBooks", "3PL Central", "Extensiv"],
    setupTime: "1-2 weeks (enterprise onboarding)",
    ratingVendor: "G2",
    ratingScore: "4.8/5",
    ratingCount: "50+ reviews",
  },
  {
    slug: "ecomdash",
    name: "Ecomdash",
    tagline: "Affordable multi-channel inventory + order management for small teams",
    description: "Ecomdash (now part of Webgility) combines order management with real-time inventory sync across channels. It's positioned as the affordable alternative to ShipStation for brands that need inventory management more than shipping automation. Automatic listing quantity updates prevent overselling, while the order dashboard keeps everything in one place.",
    logoUrl: "/images/tools/ecomdash.png",
    websiteUrl: "https://www.ecomdash.com",
    category: "order-management",
    pricing: {
      freeTier: "No free tier",
      startingPrice: "$25/month (Basic, 100 orders)",
      billingModel: "monthly",
    },
    features: [
      "Multi-channel order consolidation (25+ channels)",
      "Real-time inventory sync with auto-listing updates",
      "Purchase order management for suppliers",
      "Barcode scanning for warehouse pick/pack",
      "Bundles and kits support",
      "Low stock alerts across channels",
      "FBA inventory integration",
    ],
    pros: [
      "Affordable compared to competitors at similar feature depth",
      "Strong inventory management features",
      "Barcode scanning included at lower tiers",
      "Good for brands that self-fulfill + use FBA",
    ],
    cons: [
      "Smaller channel ecosystem than ShipStation",
      "UI/UX less polished than modern alternatives",
      "Shipping features basic — pair with carrier software",
      "Support quality inconsistent according to reviews",
    ],
    bestFor: [
      "Self-fulfilling brands doing 100-1,000 orders/month",
      "Brands needing inventory management + order management combined",
      "Amazon FBA sellers managing multi-channel expansion",
    ],
    notFor: [
      "Brands using only 3PL fulfillment (3PL handles inventory)",
      "High-volume brands needing enterprise reliability",
      "Brands wanting modern, polished UI",
    ],
    platformSupport: ["Shopify", "Amazon", "eBay", "Etsy", "WooCommerce", "BigCommerce", "Walmart", "Wix"],
    integrations: ["Shopify", "Amazon", "eBay", "Etsy", "WooCommerce", "BigCommerce", "Walmart", "QuickBooks"],
    setupTime: "1-2 hours",
    ratingVendor: "Capterra",
    ratingScore: "4.2/5",
    ratingCount: "100+ reviews",
  },
  {
    slug: "skubana-orders",
    name: "Skubana",
    tagline: "Unified operations platform for multi-channel brands scaling past 1,000 orders/month",
    description: "Skubana (owned by Extensiv) is an all-in-one operations platform that combines order management, inventory sync, analytics, and purchasing in one system. It's designed for brands that have outgrown spreadsheets and ShipStation to become a central nervous system for ecommerce operations — with real-time profitability analytics per order, per channel, and per SKU.",
    logoUrl: "/images/tools/skubana.png",
    websiteUrl: "https://www.skubana.com",
    category: "order-management",
    pricing: {
      freeTier: "No free tier",
      startingPrice: "Custom (typically $500+/month)",
      billingModel: "monthly",
    },
    features: [
      "Unified order management across all channels",
      "Real-time multi-warehouse inventory sync",
      "Purchase order automation with forecasting",
      "Per-order profitability tracking (COGS, shipping, fees)",
      "Multi-currency and multi-marketplace support",
      "Analytics dashboard with 100+ pre-built reports",
      "FBA, WFS, and 3PL integration hub",
    ],
    pros: [
      "Most comprehensive all-in-one for scaling brands",
      "Profitability analytics per order is a killer feature",
      "Strong inventory forecasting and purchasing",
      "Integrates with 50+ 3PLs and warehouses",
    ],
    cons: [
      "Expensive and complex — overkill under 500 orders/month",
      "Implementation takes weeks, not hours",
      "Learning curve is significant",
      "Contract required (no month-to-month)",
    ],
    bestFor: [
      "Brands doing 1,000-50,000+ orders/month across multiple channels",
      "Operations teams that need profitability analytics",
      "Brands outgrowing ShipStation + spreadsheets combo",
    ],
    notFor: [
      "Brands under 500 orders/month (too expensive and complex)",
      "Solo operators who need simplicity",
      "Single-channel brands with simple operations",
    ],
    platformSupport: ["Shopify", "Shopify Plus", "Amazon", "eBay", "Walmart", "WooCommerce", "BigCommerce", "Magento"],
    integrations: ["ShipBob", "Deliverr", "ShipStation", "QuickBooks", "NetSuite", "50+ 3PLs", "RestockPro", "Helium 10"],
    setupTime: "2-4 weeks",
    ratingVendor: "G2",
    ratingScore: "4.3/5",
    ratingCount: "300+ reviews",
  },
];

// ==========================================
// 运输 & 运费工具
// ==========================================

export const SHIPPING_TOOLS: ToolData[] = [
  {
    slug: "shippo-shipping",
    name: "Shippo",
    tagline: "Multi-carrier shipping API with the best rate comparison for SMBs",
    description: "Shippo is a shipping platform that connects businesses to 85+ global carriers through a single API and dashboard. Unlike ShipStation (order management + shipping), Shippo is shipping-first: its core strength is real-time rate comparison across carriers, discounted commercial rates (up to 80% off retail), and a developer-friendly API that powers shipping for thousands of ecommerce platforms and marketplaces.",
    logoUrl: "/images/tools/shippo.png",
    websiteUrl: "https://www.shippo.com",
    category: "shipping-rates",
    pricing: {
      freeTier: "Pay-as-you-go (no monthly fee)",
      startingPrice: "$0/month + per-label cost (Starter plan)",
      billingModel: "per-shipment",
    },
    features: [
      "85+ carrier integrations (USPS/UPS/FedEx/DHL/regional)",
      "Real-time rate comparison across all carriers",
      "Discounted rates up to 80% off retail (pre-negotiated)",
      "Batch label printing with address validation",
      "Branded tracking pages and customer notifications",
      "International shipping with customs forms generation",
      "Returns management with QR code drop-off",
      "Developer-friendly REST API with extensive docs",
    ],
    pros: [
      "Best pay-as-you-go model — no monthly fee for Starter",
      "Excellent discounted rates (often better than ShipStation)",
      "Clean, modern API for custom integrations",
      "85+ carriers covers most use cases including regional",
    ],
    cons: [
      "Lacks order management features (order import only)",
      "No inventory management or multi-warehouse routing",
      "International features less mature than domestic",
      "Limited automation rules compared to ShipStation",
    ],
    bestFor: [
      "Brands with existing order management who just need shipping",
      "Developers wanting to build custom shipping flows via API",
      "SMBs wanting low-commitment, pay-as-you-go pricing",
    ],
    notFor: [
      "Brands needing order management + shipping in one (use ShipStation)",
      "High-volume shippers wanting deepest FedEx/UPS negotiated rates",
      "Brands needing extensive automation rules",
    ],
    platformSupport: ["Shopify", "WooCommerce", "BigCommerce", "Magento", "Wix", "Squarespace", "Custom API"],
    integrations: ["Shopify", "WooCommerce", "BigCommerce", "Magento", "Wix", "Squarespace", "Weebly", "Etsy", "eBay", "Amazon"],
    setupTime: "15-30 minutes",
    ratingVendor: "G2",
    ratingScore: "4.4/5",
    ratingCount: "700+ reviews",
  },
  {
    slug: "easyship-shipping",
    name: "Easyship",
    tagline: "International shipping made simple — instant landed cost calculation",
    description: "Easyship specializes in cross-border ecommerce shipping. Its standout feature is the ability to show customers the total landed cost (product + shipping + duties + taxes) before checkout, eliminating the #1 reason for international cart abandonment. With 250+ courier solutions and warehouse hubs in 6 countries, Easyship is the go-to platform for brands that ship globally.",
    logoUrl: "/images/tools/easyship.png",
    websiteUrl: "https://www.easyship.com",
    category: "shipping-rates",
    pricing: {
      freeTier: "Free for 50 shipments/month",
      startingPrice: "$29/month (Plus, 500 shipments)",
      billingModel: "monthly",
    },
    features: [
      "Landed cost calculator (duties + taxes + shipping) pre-checkout",
      "250+ courier solutions worldwide",
      "Global warehouse network (US, UK, EU, AU, HK, SG)",
      "Tax and duty automation with IOSS/DDP support",
      "Automated customs documentation generation",
      "Branded tracking and delivery notifications",
      "Multi-currency checkout support",
    ],
    pros: [
      "Best-in-class international shipping features",
      "Landed cost pre-checkout reduces cart abandonment dramatically",
      "Warehouse network enables cost-effective global fulfillment",
      "Handles duty/tax complexity automatically",
    ],
    cons: [
      "Domestic shipping features less differentiated vs Shippo",
      "Free tier very limited (50 shipments)",
      "Global warehouse network adds complexity to returns",
      "Pricing can be opaque on higher tiers",
    ],
    bestFor: [
      "Brands doing 20%+ international orders",
      "Brands that need landed cost shown at checkout",
      "DTC brands expanding from US to EU/APAC markets",
    ],
    notFor: [
      "Domestic-only US shippers (overkill — use Shippo or ShipStation)",
      "Very small brands (50-shipment free cap is tight)",
      "Brands that don't want to manage multi-country inventory",
    ],
    platformSupport: ["Shopify", "WooCommerce", "BigCommerce", "Magento", "Wix", "Squarespace", "Custom API"],
    integrations: ["Shopify", "WooCommerce", "BigCommerce", "Magento", "Wix", "NetSuite", "Klaviyo"],
    setupTime: "30-45 minutes",
    ratingVendor: "Shopify App Store",
    ratingScore: "4.6/5",
    ratingCount: "1,500+ reviews",
  },
  {
    slug: "freightos",
    name: "Freightos",
    tagline: "Digital freight marketplace — instant ocean & air freight quotes",
    description: "Freightos is the world's largest digital freight marketplace, connecting importers and exporters with freight forwarders. Instead of emailing 10 forwarders for quotes, you get instant, comparable rates from 75+ vetted providers on one screen. It covers ocean (FCL/LCL), air freight, and trucking — effectively Expedia for freight shipping.",
    logoUrl: "/images/tools/freightos.png",
    websiteUrl: "https://www.freightos.com",
    category: "shipping-rates",
    pricing: {
      freeTier: "Free to search and compare quotes",
      startingPrice: "Per-shipment (varies by route/volume)",
      billingModel: "per-shipment",
    },
    features: [
      "Instant freight quotes from 75+ forwarders",
      "Ocean (FCL/LCL) + air freight + trucking",
      "Online booking and shipment management",
      "Real-time container tracking",
      "Customs clearance services included",
      "Carbon calculator for emissions tracking",
      "Document management (BOL, commercial invoice, packing list)",
    ],
    pros: [
      "Transforms a 2-week quoting process into 30 seconds",
      "Transparent pricing — no hidden forwarder markups",
      "Excellent for comparing ocean vs air tradeoffs",
      "Enterprise-grade but accessible to SMBs",
    ],
    cons: [
      "Not for parcels — focused on pallet/container-level shipping",
      "Minimum shipment size too large for small DTC brands",
      "Forwarder quality varies — still need due diligence",
      "Platform can't solve physical freight problems (port delays, etc.)",
    ],
    bestFor: [
      "Brands importing containers from overseas manufacturers",
      "Wholesale/distribution businesses moving pallet+ shipments",
      "3PLs managing inbound freight for multiple clients",
    ],
    notFor: [
      "Small parcel shipping (use Shippo/Easyship/ShipStation)",
      "Brands that only ship domestically",
      "DTC brands without freight-level volume",
    ],
    platformSupport: ["Web platform — no ecommerce cart integration needed"],
    integrations: ["SAP", "Oracle", "NetSuite", "QuickBooks", "API available"],
    setupTime: "15 minutes (registration)",
    ratingVendor: "G2",
    ratingScore: "4.5/5",
    ratingCount: "400+ reviews",
  },
  {
    slug: "flexport",
    name: "Flexport",
    tagline: "Full-service digital freight forwarder with end-to-end supply chain visibility",
    description: "Flexport is a tech-enabled freight forwarder that combines a modern digital platform with physical logistics services. Unlike Freightos (marketplace), Flexport is the actual service provider — they manage your ocean, air, and truck freight end-to-end with real-time visibility, proactive exception management, and integrated customs brokerage. Think of it as 'freight forwarding, but with a great UI.'",
    logoUrl: "/images/tools/flexport.png",
    websiteUrl: "https://www.flexport.com",
    category: "shipping-rates",
    pricing: {
      freeTier: "No free tier",
      startingPrice: "Custom (varies by route/volume)",
      billingModel: "per-shipment",
    },
    features: [
      "End-to-end managed freight forwarding",
      "Real-time shipment tracking with milestone alerts",
      "Integrated customs brokerage and compliance",
      "Inventory financing and trade credit options",
      "Carbon visibility and offset program",
      "Supply chain analytics dashboard",
      "Direct integrations with major ERP/WMS systems",
    ],
    pros: [
      "Best-in-class visibility platform for freight",
      "One provider for ocean + air + truck + customs (reduces coordination)",
      "Proactive exception management (they catch issues before you do)",
      "Access to trade financing as a value-add service",
    ],
    cons: [
      "Premium pricing vs traditional forwarders",
      "Minimum volume requirements (too large for small brands)",
      "Vendor lock-in concerns (harder to switch than marketplace model)",
      "Recent layoffs and restructuring raise stability questions",
    ],
    bestFor: [
      "Mid-market to enterprise brands importing 10+ containers/year",
      "Companies needing trade financing alongside freight",
      "Brands that value visibility and service over lowest price",
    ],
    notFor: [
      "Small brands importing a few pallets per year",
      "Price-sensitive shippers who can manage forwarder relationships",
      "Parcel-level shipping (not the right tool at all)",
    ],
    platformSupport: ["Custom integration", "NetSuite", "SAP", "Oracle"],
    integrations: ["NetSuite", "SAP", "Shopify (via partners)", "Custom API"],
    setupTime: "1-2 weeks (onboarding)",
    ratingVendor: "G2",
    ratingScore: "4.2/5",
    ratingCount: "250+ reviews",
  },
  {
    slug: "project44",
    name: "project44",
    tagline: "Enterprise supply chain visibility — track every shipment across every mode",
    description: "project44 is the leading real-time supply chain visibility platform for enterprises. It connects to 175,000+ carriers globally to provide live tracking across ocean, air, rail, truckload, LTL, and parcel — all in a single dashboard. It uses AI to predict delays and ETAs, enabling logistics teams to proactively manage exceptions rather than react to them.",
    logoUrl: "/images/tools/project44.png",
    websiteUrl: "https://www.project44.com",
    category: "shipping-rates",
    pricing: {
      freeTier: "No free tier",
      startingPrice: "Custom (enterprise; typically $50K+/year)",
      billingModel: "monthly",
    },
    features: [
      "Real-time multi-modal tracking (ocean/air/rail/truck/parcel)",
      "175,000+ carrier connections globally",
      "AI-powered ETA predictions with 95%+ accuracy",
      "Automated exception detection and alerting",
      "Carrier performance scorecards and analytics",
      "Integration with major TMS/WMS/ERP systems",
      "Sustainability and emissions tracking",
    ],
    pros: [
      "Most comprehensive carrier network in visibility category",
      "AI ETA predictions are genuinely accurate and valuable",
      "Multi-modal — single pane of glass for all freight modes",
      "Strong API for embedding visibility into your own systems",
    ],
    cons: [
      "Enterprise pricing — prohibitive for SMBs",
      "Complex implementation (months, not days)",
      "Overkill unless you're managing 1,000+ shipments/month",
      "ROI requires existing logistics team to act on insights",
    ],
    bestFor: [
      "Enterprise shippers with 1,000+ monthly shipments",
      "Companies with multi-modal supply chains (ocean + truck + rail)",
      "Logistics teams needing exception management at scale",
    ],
    notFor: [
      "SMBs or mid-market brands (price and complexity)",
      "Companies that only use one carrier for one mode",
      "Teams without logistics analysts to leverage the data",
    ],
    platformSupport: ["E2open", "Blue Yonder", "SAP", "Oracle", "Manhattan Associates"],
    integrations: ["SAP", "Oracle", "Blue Yonder", "E2open", "MercuryGate", "BluJay", "Custom API/SDK"],
    setupTime: "4-12 weeks (enterprise deployment)",
    ratingVendor: "G2",
    ratingScore: "4.4/5",
    ratingCount: "500+ reviews",
  },
];

// ==========================================
// 所有工具的主索引
// ==========================================

export const ALL_TOOLS: Record<string, ToolData[]> = {
  "tracking-visibility": TRACKING_TOOLS,
  "order-management": ORDER_MANAGEMENT_TOOLS,
  "shipping-rates": SHIPPING_TOOLS,
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
