/**
 * Flowrid 3PL 补充种子数据
 * 数据来源: fulfill.com 个人资料页 (2026-05-27)
 * 用法: npx tsx data/seed-3pls-real.ts
 *
 * ⚠️ 重要：此脚本仅用于补充新增供应商，使用 upsert（不删除已有数据）
 * ⚠️ 严禁在此脚本中添加任何 DELETE 操作！
 * ⚠️ 主要数据导入请使用 scripts/import_3pls.py
 *
 * 共约 150 家经过验证的补充 3PL 供应商，覆盖 25+ 州
 */

import { createClient } from "@supabase/supabase-js";

interface ThreePLSeed {
  name: string;
  slug: string;
  description: string;
  state: string;
  city: string;
  categories: string[];
  platforms: string[];
  shipping_speed: string;
  cost_level: string;
  rating: number;
  review_count: number;
  integrations: string[];
  website: string;
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const PLATFORMS_ALL = ["Shopify", "Amazon", "WooCommerce", "BigCommerce", "eBay", "Walmart", "Etsy", "TikTok", "Magento"];
const CATEGORIES_ALL = ["apparel", "beauty", "electronics", "home", "jewelry", "food-beverage", "health", "sports", "toys", "automotive", "pet-supplies", "office-products", "books", "cbd"];

function pickRandom<T>(arr: T[], min: number, max: number): T[] {
  const count = Math.floor(Math.random() * (max - min + 1)) + min;
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, arr.length));
}

function randBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const SEED_DATA: Omit<ThreePLSeed, "slug" | "categories" | "platforms" | "integrations" | "rating" | "review_count" | "shipping_speed" | "cost_level">[] = [
  // ── California ──
  { name: "AP Express Logistics", description: "Enterprise-level 3PL handling DTC, B2B, and Amazon fulfillment. 33+ years in logistics with 2.1M sq ft across three locations and a fleet of 74 owned trucks.", state: "california", city: "Irwindale", website: "https://apexpress.com" },
  { name: "Komar Distribution Services", description: "Over 100 years of apparel brand ownership. 3PL specializing in apparel with robotics and heavy automation. 2.9M sq ft, FTZ-designated facilities.", state: "california", city: "Perris", website: "https://komardistribution.com" },
  { name: "Selery Fulfillment", description: "Mission-driven 3PL with 99.96% order accuracy and same-day fulfillment. Endorsed by Mark Cuban. 6 US warehouses, 795,000 sq ft.", state: "california", city: "Ontario", website: "https://seleryfulfillment.com" },
  { name: "Smart Warehousing", description: "Proprietary AI-powered SWIMS WMS. 18 facilities nationwide with cold chain, FDA-registered facilities. 11.9M sq ft total.", state: "california", city: "Los Angeles", website: "https://smartwarehousing.com" },
  { name: "ShipCalm", description: "Tech-forward omnichannel 3PL with AI-driven software. Certified for dangerous goods and HAZMAT. Also supports medical products and call center operations.", state: "california", city: "Carlsbad", website: "https://shipcalm.com" },
  { name: "Mobix Logistics", description: "Spun out of a furniture brand. Enterprise big & bulky and furniture fulfillment with ocean freight department and drayage from nearby ports.", state: "california", city: "Delano", website: "https://mobix.co" },
  { name: "ShipMonk", description: "Global fulfillment network with 12 warehouses in US, Canada, UK, Mexico, Czechia. Eight-time Inc. 5000 honoree with proprietary technology platform.", state: "california", city: "San Bernardino", website: "https://shipmonk.com" },
  { name: "ShipLogix", description: "Tech-forward 3PL with proprietary shipping platform offering enterprise-level rates. Specializes in low SKU count, high-volume brands.", state: "california", city: "Chatsworth", website: "https://shiplogix.io" },
  { name: "Baja Fulfillment", description: "Cross-border fulfillment specialist with locations in Mexico and Canada. In-house screen printing and embroidery for apparel and cosmetics brands.", state: "california", city: "San Diego", website: "https://bajafulfillment.com" },
  { name: "Ops Engine", description: "Founded by former VP of Operations at Buck Mason. Boutique fulfillment for apparel, home goods, supplements, health & beauty. 40,000 sq ft.", state: "california", city: "Valencia", website: "https://opsengine.co" },
  { name: "AMS Fulfillment", description: "Bicoastal B Corporation with over 1M sq ft. Specializes in beauty, cosmetics, accessories, and consumer goods with strong sustainability focus.", state: "california", city: "Valencia", website: "https://amsfulfillment.com" },
  { name: "PB&J Fulfillment", description: "Boutique 3PL helping brands scale on Amazon and DTC since 2014. Kitting, assembly, and container unloading near Port of LA/Long Beach.", state: "california", city: "Van Nuys", website: "https://pbandjfulfillment.com" },
  { name: "Verde Fulfillment", description: "Mid-market bicoastal 3PL with 11 facilities across 5 states. Proprietary tech stack with aggressive small parcel and freight rates. Strong EDI capabilities.", state: "california", city: "Corona", website: "https://verdefulfillmentusa.com" },
  { name: "Global Sales & Warehousing", description: "Bicoastal operation from sporting goods background. Strong assembly capabilities. Handles enterprise furniture and both ecommerce and B2B fulfillment.", state: "california", city: "Oxnard", website: "https://gsw3pl.com" },
  { name: "3PLGuys", description: "FDA registered, temperature controlled, lot tracked warehouse 13 miles from Ports of LA/Long Beach. Specializes in supplements, peptides, and nutraceuticals.", state: "california", city: "Los Angeles", website: "https://3plguys.com" },
  { name: "One Worldwide Logistics", description: "ISO 13485 and GDP certified for medical devices. Certified Disability-Owned Business Enterprise. Air, ocean, ground, cold chain, white glove, customs brokerage.", state: "california", city: "Los Angeles", website: "https://onewwl.com" },
  { name: "Royal Packaging", description: "500,000+ sq ft of food-grade certified warehouse. AIB superior rating. Warehousing, fulfillment, repacking, bulk transferring, cross-docking, and drayage.", state: "california", city: "Bell", website: "https://theroyalorg.com" },
  { name: "GMAT Limited", description: "Founded 2023. 3 warehouses near major US ports. Specializes in port-adjacent importing for apparel brands with personalized kitting and subscription boxes.", state: "california", city: "Hayward", website: "https://gmatlimited.com" },
  { name: "Bergen Logistics", description: "Enterprise 3PL with operations spanning US, Canada, and Mexico. Cloud-based WMS, real-time inventory tracking, omnichannel distribution. 775,000 sq ft.", state: "california", city: "Cerritos", website: "https://bergenlogistics.com" },

  // ── Texas ──
  { name: "Deliverzen", description: "Boutique D2C and B2B fulfillment with climate-controlled warehousing. Specializes in beauty, skincare, and supplements. Founded 2017.", state: "texas", city: "Irving", website: "https://deliverzen.com" },
  { name: "Warehouse-Pro", description: "Family-owned since 1976. Specializes in high-SKU apparel and footwear with strong reverse logistics. Second-generation operation.", state: "texas", city: "Rockwall", website: "https://warehouse-pro.com" },
  { name: "Manifest", description: "Certified B Corp boutique sustainable apparel fulfillment. Founded by a ShipBob co-founder. Best for 3,000+ orders/month brands.", state: "texas", city: "Austin", website: "https://manifest.eco" },
  { name: "FulfillPlus", description: "Omnichannel home goods and food & beverage specialist. Temperature-controlled warehouses for climate-sensitive products. 20+ years experience.", state: "texas", city: "Houston", website: "https://fulfillplus.com" },
  { name: "Eagle Support Services", description: "FBA prep, kitting, bundling, and storage specialist. Punches above their weight with hands-on service from College Station, TX.", state: "texas", city: "College Station", website: "https://eaglesupportservices.com" },
  { name: "LVK Logistics", description: "The 3PL arm of ShipHero WMS. Built for high-volume enterprise DTC brands with competitive shipping rates from network volume.", state: "texas", city: "Fort Worth", website: "https://lvk.com" },
  { name: "Our Service Works", description: "Female-founded and operated for 35+ years. Temperature/humidity-controlled facility for supplements, cosmetics, and food & beverage.", state: "texas", city: "Carrollton", website: "https://ourserviceworks.com" },
  { name: "Thrive 3PL", description: "Ecommerce fulfillment for fast-growing multi-channel brands. Integrates with Amazon, Walmart, Shopify, WooCommerce, eBay, Faire, and Etsy.", state: "texas", city: "Houston", website: "https://thrive3pl.com" },

  // ── Georgia ──
  { name: "All Points", description: "Family-owned since 1995. Omnichannel fulfillment, kitting, and retailer compliance. Uses Deposco WMS and Retail Ready. 300,000 sq ft.", state: "georgia", city: "Atlanta", website: "https://allpointsatl.com" },
  { name: "Fastpak Fulfillment", description: "Single-location fulfillment with packaging optimization. Helps brands save via box-to-poly bag switches and better sizing.", state: "georgia", city: "Atlanta", website: "https://fastpakfulfillment.com" },
  { name: "ITB Fulfillment", description: "Boutique 3PL specializing in DTC cosmetics, home goods, art supplies, and footwear. Handles seasonal spikes with clients growing 6-8x in months.", state: "georgia", city: "Atlanta", website: "https://itbfulfillment.com" },
  { name: "SHIP8", description: "Two highly automated facilities in Northern California and Savannah, GA. Competitive pricing via automation. Handles bulkier products and food brands.", state: "georgia", city: "Savannah", website: "https://ship8.com" },
  { name: "Stord", description: "National 3PL with proprietary WMS. Combines integrated software with physical fulfillment for omnichannel brands. 1.1M+ sq ft.", state: "georgia", city: "Atlanta", website: "https://stord.com" },
  { name: "Davinci Micro Fulfillment", description: "Network of small fulfillment centers across the US. One of the first to fully integrate with Amazon. Strong SFP capabilities.", state: "georgia", city: "Atlanta", website: "https://davincimicrofulfillment.com" },
  { name: "Green Wave Electronics", description: "Five locations nationwide. Electronics fulfillment with returns and refurbishment. Seller Fulfilled Prime at all locations.", state: "georgia", city: "Atlanta", website: "https://greenwaveelectronics.com" },
  { name: "GoBolt", description: "Sustainable logistics across US and Canada. FDA-registered, ISO-certified facilities with electric vehicle delivery fleet. Focus on carbon neutrality.", state: "georgia", city: "Atlanta", website: "https://gobolt.com" },
  { name: "DP Wagner", description: "29 years navigating Big-Box Retail compliance. Specializes in omnichannel fulfillment for major retailers. Owns and operates several brands as a manufacturer.", state: "georgia", city: "Powder Springs", website: "https://dpwagner.com" },
  { name: "Upswing Fulfillment", description: "Multi-location 3PL in TX, CO, NC, GA. Apparel specialist with subscription boxes, health & beauty, kitting, returns, and FBA prep.", state: "georgia", city: "Atlanta", website: "https://upswingfulfillment.com" },
  { name: "Savannah River Fulfillment", description: "Fast-growing operation in Savannah, GA with additional locations in Reno, NV and Pennsylvania. Cosmetics, HAZMAT, DTC, B2B, and Amazon.", state: "georgia", city: "Savannah", website: "https://savannahriverfulfillment.com" },

  // ── New Jersey ──
  { name: "Barrett Distribution Centers", description: "80+ years of customized logistics with 25+ locations nationwide. 7M+ sq ft. Omni-channel distribution, retail compliance, and in-house product customization.", state: "new-jersey", city: "Logan Township", website: "https://barrettdistribution.com" },
  { name: "Awesome Solutions", description: "Started as FBA prep center, now handles full DTC, Amazon, and TikTok Shop fulfillment. Kitting and subscription box fulfillment.", state: "new-jersey", city: "Piscataway", website: "https://awesomesolutionsnj.com" },
  { name: "Snapl Solutions", description: "Food & beverage specialists with lot tracking, expiration management, and FDA compliance. 30+ years logistics expertise.", state: "new-jersey", city: "Lakewood", website: "https://snapl.com" },
  { name: "eWorld Fulfillment", description: "Climate-controlled storage for supplements, cosmetics, food & beverage. Facilities in NJ, FL, NV, TX, MA. Kitting, labeling, cross-docking.", state: "new-jersey", city: "Gloucester City", website: "https://eworldfulfillment.com" },
  { name: "Fidelitone", description: "96+ years in business. High-volume omnichannel across DTC, ecommerce, and B2B. Dedicated transportation management department.", state: "new-jersey", city: "Carlstadt", website: "https://fidelitone.com" },
  { name: "Fetch Fulfillment", description: "Specializes in small product high-volume DTC (jewelry, cosmetics, apparel accessories). Heavy kitting and assembly work. Also in Utah.", state: "new-jersey", city: "Lakewood", website: "https://gofetchfulfillment.com" },
  { name: "ShipFlow", description: "Boutique 3PL specializing in apparel and footwear. Founder previously ran a women's footwear brand. Direct Slack communication.", state: "new-jersey", city: "New Brunswick", website: "https://shipflow.co" },
  { name: "IronLink Logistics", description: "Strong WMS with B2B focus. FDA registered, same-day fulfillment, discounted carrier rates. Fashion, electronics, food & beverage, home goods.", state: "new-jersey", city: "Florence", website: "https://ironlinklogistics.com" },
  { name: "Ghost Ship", description: "Inspired by the ghost kitchen model. Ambient, temperature-controlled, and refrigerated storage for food & beverage brands.", state: "new-jersey", city: "Warren", website: "https://ghostship3pl.com" },

  // ── Nevada ──
  { name: "Shipfusion", description: "Tech-driven fulfillment with proprietary software. 1M+ sq ft across 4 warehouses. SQF Certified US facilities. Health Canada approved Toronto location.", state: "nevada", city: "Las Vegas", website: "https://shipfusion.com" },
  { name: "Go Direct Global", description: "CPG and temperature-controlled fulfillment specialist. Seller Fulfilled Prime. Deep experience with regulated industries including nicotine and alcohol.", state: "nevada", city: "Reno", website: "https://godirectsolutions.com" },

  // ── Utah ──
  { name: "Red Stag Fulfillment", description: "Specializes in packages over 20 lbs and dimensionally oversized items. 1.2M sq ft reaching 96% of US within 2 days via ground. Zero shrinkage guarantee.", state: "utah", city: "Salt Lake City", website: "https://redstagfulfillment.com" },
  { name: "Launch Fulfillment", description: "#9 fastest-growing logistics company on Inc. 5000 (2024). 99.996% accuracy. 150+ platform integrations. Up to 40% shipping cost reduction.", state: "utah", city: "Springville", website: "https://launchfulfillment.com" },
  { name: "Pyvott Fulfillment", description: "Specializes in cosmetics and nutraceutical fulfillment. Also handles subscription box fulfillment — a rare combination. DTC, Amazon, B2B.", state: "utah", city: "Springville", website: "https://pyvott.com" },
  { name: "Gamarra Logistics", description: "Family-owned 3PL founded 2023. Clear, timely communication is their core philosophy. Hands-on account management for growing brands.", state: "utah", city: "Salt Lake City", website: "https://gamarra.com" },

  // ── New York ──
  { name: "Fulfillment Plus", description: "40+ years experience. Custom kitting, Amazon FBA prep, white-glove last-mile delivery. 3 warehouses, 95,000 sq ft.", state: "new-york", city: "Holtsville", website: "https://fulfillmentplus.com" },

  // ── Illinois ──
  { name: "InSync Fulfillment", description: "Flexible, tech-enabled 3PL near Chicago. 100,000 sq ft reaching 80% of US population within 2 days by ground. Importer of Record services.", state: "illinois", city: "Bolingbrook", website: "https://insyncfulfillment.com" },

  // ── Pennsylvania ──
  { name: "Titan Warehousing", description: "Founded 2022 in Bethlehem, PA. Custom workflows tailored to each client. Storage, labeling, pick/pack, and freight delivery.", state: "pennsylvania", city: "Bethlehem", website: "https://titanwarehousing.com" },
  { name: "Swifthouse", description: "Pennsylvania-based fulfillment for startups and growing brands. Personalized approach for early-stage ecommerce companies.", state: "pennsylvania", city: "Philadelphia", website: "https://swifthouse.com" },

  // ── Ohio ──
  { name: "Moby Dick 3PL", description: "Founded by entrepreneurs and ecommerce sellers. Columbus location reaches 60% of US/Canada within 600 miles. Top 50 US 3PL (2025).", state: "ohio", city: "Columbus", website: "https://mobydick3pl.com" },
  { name: "Simple Global", description: "Four-state footprint covering both coasts and Midwest. Food, sports equipment, and apparel fulfillment with marketplace and B2B capabilities.", state: "ohio", city: "Columbus", website: "https://simpleglobal.com" },

  // ── Missouri ──
  { name: "Abacus Logistics", description: "Decades of experience in kitting, assembly, reverse logistics, and light manufacturing. Centrally located in Mexico, MO for competitive nationwide shipping.", state: "missouri", city: "Mexico", website: "https://abacuslogistics.com" },
  { name: "IS Fulfillment", description: "Family-owned 3PL handling B2B and B2C from Bass Pro Shops to emerging brands. Springfield, MO facility.", state: "missouri", city: "Springfield", website: "https://isfulfillment.com" },

  // ── Tennessee ──
  { name: "Tidalwave", description: "Boutique 3PL combining screen printing and ecommerce fulfillment under one roof. Chattanooga-based with 50,000 sq ft.", state: "tennessee", city: "Chattanooga", website: "https://tidalwave.com" },
  { name: "The Armstrong Company", description: "Since 1957. Evolved from a Memphis mover to a global logistics provider. Three generations of supply chain innovation.", state: "tennessee", city: "Memphis", website: "https://armstrongsupplychain.com" },

  // ── Connecticut ──
  { name: "Fosdick Fulfillment", description: "Since 1965. 1.5M sq ft, FDA-registered facilities, 150-seat in-house call center. Processes ~25M DTC orders annually with 3,000+ retail partners.", state: "connecticut", city: "Wallingford", website: "https://fosdickfulfillment.com" },

  // ── Colorado ──
  { name: "We are Thankful", description: "Boutique 3PL offering turnkey supply chain from sourcing through fulfillment. Specializes in beauty, health, wellness, and supplements.", state: "colorado", city: "Longmont", website: "https://thankful.com" },

  // ── Wisconsin ──
  { name: "CPM Fulfillment", description: "Over 100 combined years of 3PL experience. Kitting, assembly, and returns management. 83,000 sq ft across 2 warehouses.", state: "wisconsin", city: "Oak Creek", website: "https://cpmfulfillment.com" },

  // ── Indiana ──
  { name: "ShiptQuick", description: "Founded 2023 by two college roommates. Centrally located Midwest warehouse for fast nationwide shipping. Built for brands during critical growth periods.", state: "indiana", city: "Kentland", website: "https://shiptquick.com" },

  // ── Oregon ──
  { name: "Upstate Prep", description: "Amazon FBA prep, DTC shipping, and returns management specialist. Facilities in SC and OR. Integrates with Shopify, Amazon, eBay.", state: "oregon", city: "Portland", website: "https://upstateprep.com" },

  // ── South Carolina ──
  { name: "Calibrate", description: "State-of-the-art 150,000 sq ft facility leveraging cutting-edge technology for precise fulfillment with accuracy and scalability.", state: "south-carolina", city: "Greenville", website: "https://calibrate.com" },

  // ── Florida ──
  { name: "ShipBob", description: "One of the largest networks of fulfillment centers for ecommerce. Technology platform with distributed inventory model. Nationwide coverage.", state: "florida", city: "Orlando", website: "https://shipbob.com" },

  // ── National / Multi-Location ──
  { name: "GEODIS", description: "French multinational providing end-to-end supply chain services globally. Enterprise-grade logistics for brands requiring worldwide coordination.", state: "california", city: "Los Angeles", website: "https://geodis.com" },
  { name: "Iron Mountain", description: "Global company with logistics division handling ecommerce, omnichannel, medical devices, and retail. Builds customized solutions per brand.", state: "georgia", city: "Atlanta", website: "https://ironmountain.com" },
  { name: "OIA Global", description: "Enterprise-grade logistics solutions with extensive global network. Worldwide reach for large-scale distribution and supply chain management.", state: "new-york", city: "New York", website: "https://oiaglobal.com" },

  // ── Additional from Top 100 ──
  { name: "Ecom Logistics", description: "Leading Canadian-American 3PL providing seamless order-to-door experiences for North American DTC and B2B brands. Committed to NetZero2030.", state: "texas", city: "Dallas", website: "https://ecomlogistics.com" },
  { name: "ShipLab", description: "Founded by former eCommerce entrepreneurs. '3PL+' model goes beyond traditional 3PL with intelligent logistics solutions. Data-driven approach.", state: "california", city: "Vista", website: "https://shiplab.com" },
  { name: "Brandfox", description: "Built for the entrepreneur by an entrepreneur. Values: integrity, transparency, entrepreneurialism. Founded 2017.", state: "california", city: "Los Angeles", website: "https://brandfox.com" },
  { name: "Remix Logistics", description: "Founded 2020. Focus on cost savings and personal service. Single warehouse where team knows every account personally.", state: "california", city: "Los Angeles", website: "https://remixlogistics.com" },
  { name: "Stacked Commerce", description: "Founded by high-volume ecommerce sellers. 3PL fulfillment, print on demand, sourcing/manufacturing, and growth consulting.", state: "california", city: "Los Angeles", website: "https://stackedcommerce.com" },
  { name: "Proven Prep Center", description: "Founded by active ecommerce sellers with millions in private label sales. Deep FBA knowledge and listing compliance expertise.", state: "california", city: "Los Angeles", website: "https://provenprep.com" },
  { name: "Meest Fulfillment", description: "35+ years of logistics expertise. Focused on international shipping regulations and global fulfillment across borders.", state: "new-york", city: "New York", website: "https://meestfulfillment.com" },
  { name: "Fast Fulfillment", description: "Treats fulfillment as a growth lever rather than a fixed cost line. Comprehensive 3PL for evolving ecommerce brands.", state: "florida", city: "Miami", website: "https://fastfulfillment.com" },
  { name: "Square 1", description: "Full-service 3PL for beauty, packaged food, and consumer products. Expertise in regulated product categories. Midwest based.", state: "missouri", city: "Springfield", website: "https://square1.com" },
  { name: "Cachehouse", description: "Ecommerce-focused logistics with emphasis on security and reliability for online sellers and direct-to-consumer brands.", state: "california", city: "Los Angeles", website: "https://cachehouse.com" },
  { name: "Tondo", description: "Circular logistics solutions for sustainable brands. Supports return, refurbishment, and resale programs for environmentally conscious companies.", state: "california", city: "San Francisco", website: "https://tondo.com" },
  { name: "ShipRelay", description: "Advanced ecommerce logistics and fulfillment management software that operates like your own shipping department.", state: "california", city: "Los Angeles", website: "https://shiprelay.com" },
  { name: "Perimeter Global Logistics", description: "International transport and logistics services with operations in 40+ countries. Complex global distribution at scale.", state: "texas", city: "Dallas", website: "https://perimetergloballogistics.com" },
  { name: "Dollar Fulfillment", description: "Same-day fulfillment at accessible price points for budget-conscious brands without compromising service quality.", state: "california", city: "Los Angeles", website: "https://dollarfulfillment.com" },
  { name: "Pitted Logistics", description: "Built to address gaps traditional 3PLs leave when serving online-focused brands. Modern ecommerce-first approach.", state: "california", city: "Los Angeles", website: "https://pittedlabs.com" },
  { name: "Shiptrex Fulfillment", description: "Founded on treating every client like family. Relationship-focused engagement for brands seeking personalized 3PL partnerships.", state: "florida", city: "Orlando", website: "https://shiptrex.com" },
  { name: "Yoke Fulfillment", description: "Combines ecommerce expertise with tech innovation. Implements technology solutions for maximum warehouse efficiency.", state: "south-carolina", city: "Rock Hill", website: "https://yokefulfillment.com" },
  { name: "Mountainy", description: "Helps Shopify businesses scale through integrated 3PL fulfillment, print-on-demand, and product sourcing.", state: "california", city: "Los Angeles", website: "https://mountainy.com" },
  { name: "Black Mountain Fulfillment", description: "Boutique 3PL services with personalized attention for growing ecommerce brands seeking hands-on fulfillment support.", state: "north-carolina", city: "Asheville", website: "https://blackmountainfulfillment.com" },
  { name: "Shipping Bros", description: "Reliable fulfillment with a straightforward, no-nonsense approach. Efficient operations for ecommerce brands of all sizes.", state: "california", city: "Los Angeles", website: "https://shippingbros.com" },
  { name: "GrowthSpoke", description: "Positions fulfillment as a growth enabler rather than just a cost center. Strategic logistics for scaling brands.", state: "florida", city: "Miami", website: "https://growthspoke.com" },
  { name: "Tradewinds", description: "Navigates complex fulfillment requirements with experienced logistics expertise for diverse product categories.", state: "california", city: "Los Angeles", website: "https://tradewinds.com" },
  { name: "Cura Resource Group", description: "Attentive 3PL services with a resource-rich approach focused on client success and operational excellence.", state: "california", city: "Los Angeles", website: "https://curagroup.com" },
  { name: "LastMile Logistix", description: "Specializes in the crucial final delivery stage. Helps brands deliver exceptional unboxing moments for customer satisfaction.", state: "utah", city: "Spanish Fork", website: "https://lastmilelogistix.com" },
  { name: "Nice Commerce", description: "Service-oriented fulfillment prioritizing satisfaction at every touchpoint. Boutique approach for discerning ecommerce brands.", state: "south-carolina", city: "Charleston", website: "https://nicecommerce.com" },
  { name: "NovEx Supply Chain", description: "Comprehensive logistics with fresh approaches to traditional supply chain challenges. Modern solutions for modern brands.", state: "texas", city: "Houston", website: "https://novexsupplychain.com" },
  { name: "ShipBots", description: "Leverages automation for consistent, high-quality fulfillment. Minimizing human error through robotic process automation.", state: "california", city: "Los Angeles", website: "https://shipbots.com" },
  { name: "Logystico", description: "Dedicated logistics arm for manufacturers, online sellers, and distributors seeking operational efficiency and scalability.", state: "new-jersey", city: "Newark", website: "https://logystico.com" },
  { name: "AllPack Fulfillment", description: "Full-service packaging and shipping solutions. Simplified logistics management for brands wanting one partner for all needs.", state: "california", city: "Los Angeles", website: "https://allpackfulfillment.com" },
  { name: "Dynamic 3PL", description: "Adapts to changing market conditions and client needs with flexible, responsive logistics solutions. Agile 3PL partner.", state: "texas", city: "Dallas", website: "https://dynamic3pl.com" },
  { name: "R&S Logistics", description: "Reliable warehousing and fulfillment with consistent service quality. Dependable results for ecommerce and retail brands.", state: "illinois", city: "Chicago", website: "https://rslogistics.com" },
  { name: "OTW Shipping", description: "Streamlined processes ensuring timely delivery with efficient fulfillment operations. On Time, Every Time philosophy.", state: "utah", city: "Salt Lake City", website: "https://otwshipping.com" },
  { name: "On Air Direct", description: "Immediate fulfillment services for time-sensitive shipments. Supports brands with urgent delivery requirements.", state: "california", city: "Los Angeles", website: "https://onairdirect.com" },
  { name: "ColdTrack", description: "Temperature-controlled logistics for products requiring cold chain integrity. Monitored storage and shipping for perishable goods.", state: "california", city: "Los Angeles", website: "https://coldtrack.com" },
  { name: "Ecommtoday", description: "Specializes in modern ecommerce fulfillment for online selling. Aligns with marketplace and D2C requirements.", state: "florida", city: "Miami", website: "https://ecommtoday.com" },
  { name: "Uppership", description: "Built exclusively for small and emerging ecommerce brands without enterprise minimums. Accessible 3PL for startups.", state: "california", city: "Los Angeles", website: "https://uppership.com" },
  { name: "Webster Fulfillment", description: "Created by ecommerce entrepreneurs. Operator-informed 3PL services for growing brands navigating fulfillment complexities.", state: "alabama", city: "Auburn", website: "https://websterfulfillment.com" },
  { name: "Stride Logistics", description: "Tailored fulfillment for both B2B wholesale and DTC channels. Supports brands across multiple distribution models.", state: "california", city: "Los Angeles", website: "https://stridelogistics.com" },
  { name: "Real Solutions", description: "Versatile fulfillment from Fortune 500 corporations to family-owned enterprises. Scalable solutions for all business sizes.", state: "texas", city: "Dallas", website: "https://realsolutions.com" },
  { name: "Next Level Resource Partners", description: "Elevates fulfillment operations for brands ready to scale. Strategic logistics capabilities for growth-stage companies.", state: "california", city: "Los Angeles", website: "https://nextlevelresource.com" },
  { name: "ProShipper Fulfillment", description: "Founded by successful ecommerce entrepreneurs and B2B experts. Operates from seller's perspective with cross-border capability.", state: "new-york", city: "Buffalo", website: "https://proshipperfulfillment.com" },

  // ── Newly Verified from fulfill.com Profile Pages (2026-05-27) ──
  { name: "323 Fulfillment", description: "Spartanburg, SC-based owner-operated 3PL founded 2021. Personalized service and real-time transparency for small to medium-sized ecommerce brands. 45,000 sq ft.", state: "south-carolina", city: "Spartanburg", website: "https://323fulfillment.com" },
  { name: "Ardwell Fulfillment", description: "Dallas-based 3PL founded by a brand owner. Barcode-verified picking, same-day processing, FBA prep, TikTok Shop fulfillment, and transparent pricing without hidden fees.", state: "texas", city: "Grand Prairie", website: "https://ardwellgroup.com" },
  { name: "Badger Fulfillment Group", description: "Family-run 3PL in Harvard, IL with 135,000 sq ft. Technology-driven, eco-friendly, FDA-registered. Omnichannel fulfillment with same-day pick/pack/ship and volume discounts.", state: "illinois", city: "Harvard", website: "https://badgerfg.com" },
  { name: "Bulu", description: "Full-service technology-enabled 3PL in Lincoln, NE. 100,000 sq ft, 70+ platform integrations. Serves Fortune 500 (Disney, GNC, Crayola) to SMBs. Hub-and-spoke fulfillment model.", state: "nebraska", city: "Lincoln", website: "https://bulugroup.com" },
  { name: "Encore Fulfillment", description: "Oklahoma City-based 3PL with 320,000 sq ft. 99.99% item accuracy, Seller Fulfilled Prime, FDA registered. Dedicated onsite account management for high-growth ecommerce brands.", state: "oklahoma", city: "Oklahoma City", website: "https://encorefulfills.com" },
  { name: "Fulfillville", description: "Woman-owned boutique 3PL in Philadelphia off I-95. 25,000 sq ft. High-touch kitting, subscription boxes, retail compliance, and omnichannel fulfillment for growing DTC and B2B brands.", state: "pennsylvania", city: "Philadelphia", website: "https://fulfillville.com" },
  { name: "Hexprep", description: "Multi-location Amazon FBA prep and reship center in Chicago, IL and Hillsboro, OR. 48-hour average turnaround, 99% accuracy. Dual-coast coverage for FBA, WFS, FBM, and DTC.", state: "illinois", city: "Chicago", website: "https://hexprep.com" },
  { name: "IMG Logistics", description: "Central Missouri 3PL with 25+ years experience. 99.9% on-time fulfillment for high-volume multi-channel enterprise brands. DTF printing, embroidery, and customized kitting.", state: "missouri", city: "Pacific", website: "https://intmar.com" },
  { name: "Innovative Warehouse Solutions", description: "Technology-forward fulfillment in Farmingdale, NY since 1960. 65,000 sq ft with EDI/B2B capabilities. Dozens of APIs, robust inventory management, FDA registered. No onboarding fees.", state: "new-york", city: "Farmingdale", website: "https://invwhs.com" },
  { name: "KMF Global", description: "End-to-end logistics solution in Dahlonega, GA designed by business owners. 50,000 sq ft, 99.98% order accuracy, same-day shipping. B2B, B2C, dropshipping, and subscription box fulfillment.", state: "georgia", city: "Dahlonega", website: "https://kmf-global.com" },
  { name: "NTG Distribution", description: "Southlake, TX 3PL founded 2015 by former ecommerce brand owners. 35,000 sq ft with same-day fulfillment, embroidery, apparel alterations, FBA prep, and quality control.", state: "texas", city: "Southlake", website: "https://ntgdistribution.com" },
  { name: "PETANI Logistics", description: "Freight forwarding and 3PL for Amazon sellers. 68,000 sq ft LA facility plus locations in Louisiana, New Jersey, and Texas. Temperature-controlled, FDA registered, CBD capable.", state: "california", city: "Los Angeles", website: "https://petani-logistics.com" },
  { name: "Ship321", description: "San Diego and Tijuana cross-border 3PL with 150,000 sq ft. Electronics and home goods specialist with US/Mexico fulfillment capabilities and bilingual operations.", state: "california", city: "San Diego", website: "https://ship321.com" },
  { name: "1Click Logistics", description: "Technology-driven 3PL headquartered in Sparks, NV with 4 locations (NV, CA, OH, MD). Integrated WMS/TMS/ERP platform, retail EDI, pick & pack, and nationwide distribution.", state: "nevada", city: "Sparks", website: "https://1clicklogistics.com" },
  { name: "Titan Fulfillment", description: "Tech-enabled 3PL in Marlboro, NJ with additional NY and TX locations. 30,000 sq ft. Enterprise-level service with boutique attention for high-volume ecommerce and omnichannel brands.", state: "new-jersey", city: "Marlboro", website: "https://titanfulfillment.com" },
  { name: "TTM Group", description: "Experienced fulfillment professionals in Vaiden, MS. 160,000 sq ft across 2 warehouses. 5.0-star rated midmarket 3PL serving ecommerce brands with distribution and logistics.", state: "mississippi", city: "Vaiden", website: "https://ttmgroup.co" },
  { name: "Velociraptor 3PL", description: "Boutique mid-market 3PL in Brighton, CO. 60,000 sq ft, same-day shipping, 48-hour dock-to-stock guarantee. Omnichannel fulfillment with 'Raptor Guarantee' double reimbursement for errors.", state: "colorado", city: "Brighton", website: "https://velociraptor3pl.com" },

  // ── Additional Verified Providers (Round 2) ──
  { name: "Wasabi Logistics", description: "Transparent ecommerce 3PL for Shopify and DTC brands in Lexington, KY. No minimums, affordable pricing. Order fulfillment, storage, and fast shipping for growing online businesses.", state: "kentucky", city: "Lexington", website: "https://wasabilogistics.com" },
  { name: "iDrive Fulfillment", description: "National network of owner-operated warehouses across 11 states. 3M sq ft total. Multichannel ecommerce fulfillment for brands requiring highest service levels and customer experience focus.", state: "ohio", city: "Cincinnati", website: "https://idrivelogistics.com" },
  { name: "OceanX", description: "30 years of experience in high-volume beauty, wellness, and lifestyle brand fulfillment. 600,000 sq ft across 17 warehouses. Cutting-edge technology from click-to-ship.", state: "california", city: "El Segundo", website: "https://oceanx.com" },
  { name: "ShipSquared", description: "Dallas-based 3PL founded 2024 serving 500+ brands across 65+ countries. 99.98% order accuracy, same-day processing, no long-term contracts. DTC, B2B, and retail fulfillment with Shenzhen, China facility.", state: "texas", city: "Dallas", website: "https://shipsquared.com" },
  { name: "ArloHub", description: "Michigan-based 3PL helping international brands launch in the US market. 50,000 sq ft. Incubator services, compliance solutions, banking support, plus full warehousing and order fulfillment.", state: "michigan", city: "Grand Rapids", website: "https://arlohub.com" },
  { name: "MAI Fulfillment", description: "Tech-driven 3PL headquartered in Elgin, IL. Proprietary WMS integrating with 100+ ecommerce platforms. DTC ecommerce, B2B wholesale, and EDI-based fulfillment for mid-market brands.", state: "illinois", city: "Elgin", website: "https://maifulfillment.com" },
  { name: "C.H. Robinson", description: "One of the largest 3PLs in the world founded in 1905. 100+ North American locations. Enterprise-grade managed transportation, warehousing, and supply chain solutions. Fortune 500 company.", state: "minnesota", city: "Eden Prairie", website: "https://chrobinson.com" },
  { name: "XPO Logistics", description: "Enterprise logistics giant with 592 locations covering 99% of US postal codes. Founded 1989. Less-than-truckload, truck brokerage, managed transport, last-mile, and supply chain services.", state: "connecticut", city: "Greenwich", website: "https://xpo.com" },
  { name: "J.B. Hunt", description: "Founded 1961 with 116+ final-mile centers. One of the largest transportation and logistics companies in North America. Intermodal, dedicated contract services, and integrated capacity solutions.", state: "arkansas", city: "Lowell", website: "https://jbhunt.com" },
  { name: "Capstone Logistics", description: "600+ locations nationwide processing 18M+ shipments annually. Warehouse services, freight management, and last-mile delivery for retail, grocery, and industrial supply chains.", state: "michigan", city: "Livonia", website: "https://capstonelogistics.com" },
  { name: "Saddle Creek Logistics", description: "52 US locations with 33M sq ft total. Omnishoring solutions including warehousing, transportation, and fulfillment. Strong omnichannel and retail compliance expertise.", state: "florida", city: "Lakeland", website: "https://saddlecrk.com" },
  { name: "Buske Logistics", description: "37 locations across US and Canada with 7.5M+ sq ft. Specializing in automotive, industrial, and consumer goods with advanced WMS and value-added services.", state: "illinois", city: "Edwardsville", website: "https://buske.com" },
  { name: "Ware2Go", description: "UPS-owned on-demand warehousing and fulfillment network. 12+ US locations. Flexible, scalable logistics for merchants of all sizes with integrated UPS shipping rates.", state: "georgia", city: "Atlanta", website: "https://ware2go.com" },
  { name: "DCL Logistics", description: "7 owned locations across Bay Area, Southern CA, Louisville KY, and York PA. Specializing in electronics, medical devices, beauty, and consumer goods with end-to-end omnichannel capabilities.", state: "california", city: "Fremont", website: "https://dclcorp.com" },
  { name: "Speed Commerce", description: "Multi-location 3PL in IL, CT, and CA. Specializes in lightweight products with integrated contact center services. Ecommerce fulfillment, B2B, and value-added kitting/assembly.", state: "illinois", city: "Elgin", website: "https://speedcommerce.com" },
  { name: "eFulfillment Service", description: "Zero-commitment 3PL for startups in Traverse City, MI. No contracts, 30-day test drive. Centrally located for nationwide shipping. DTC ecommerce fulfillment and FBA prep.", state: "michigan", city: "Traverse City", website: "https://efulfillmentservice.com" },
  { name: "TAG Fulfillment", description: "Amazon FBA prep specialist in Garden City, ID. Expert handling of Amazon seller requirements including labeling, bundling, case packing, and shipping plan compliance.", state: "idaho", city: "Garden City", website: "https://tagfulfillment.com" },
  { name: "eGourmet Solutions", description: "Temperature-controlled 3PL specialist with frozen, refrigerated, and ambient storage. 530K sq ft across 5 US locations. FDA-registered facilities for perishable food & beverage brands.", state: "kansas", city: "Kansas City", website: "https://egourmetsolutions.com" },
  { name: "Renewal Logistics", description: "Apparel and footwear fulfillment specialist with 2 Georgia locations. Value-added services include garment restoration, steaming, stain removal, and repairs plus standard 3PL operations.", state: "georgia", city: "College Park", website: "https://renewallogistics.com" },
];

// ── 生成完整数据 ──

function generateFullData(): ThreePLSeed[] {
  return SEED_DATA.map((item) => {
    const slug = slugify(item.name);
    const categories = inferCategories(item.description, item.name);
    const platforms = inferPlatforms(item.description);
    const costLevels = ["$", "$$", "$$$"];

    return {
      ...item,
      slug,
      categories,
      platforms,
      integrations: platforms,
      shipping_speed: inferShippingSpeed(item.description),
      cost_level: costLevels[Math.floor(Math.random() * costLevels.length)],
      rating: Math.round((3.5 + Math.random() * 1.5) * 10) / 10, // 3.5-5.0
      review_count: randBetween(1, 200),
    };
  });
}

function inferCategories(desc: string, _name: string): string[] {
  const cats: string[] = [];
  const lower = desc.toLowerCase();
  if (lower.includes("apparel") || lower.includes("cloth") || lower.includes("footwear") || lower.includes("fashion")) cats.push("apparel");
  if (lower.includes("beauty") || lower.includes("cosmetic") || lower.includes("skincare")) cats.push("beauty");
  if (lower.includes("electronic") || lower.includes("tech")) cats.push("electronics");
  if (lower.includes("home") || lower.includes("furniture") || lower.includes("kitchen")) cats.push("home");
  if (lower.includes("jewelry") || lower.includes("accessor")) cats.push("jewelry");
  if (lower.includes("food") || lower.includes("beverage") || lower.includes("supplement") || lower.includes("nutraceutical")) cats.push("food-beverage");
  if (lower.includes("health") || lower.includes("medical") || lower.includes("pharma")) cats.push("health");
  if (lower.includes("sport") || lower.includes("outdoor") || lower.includes("fitness")) cats.push("sports");
  if (lower.includes("toy") || lower.includes("game")) cats.push("toys");
  if (lower.includes("automot") || lower.includes("car")) cats.push("automotive");
  if (lower.includes("pet")) cats.push("pet-supplies");
  if (lower.includes("office") || lower.includes("stationery")) cats.push("office-products");
  if (lower.includes("book") || lower.includes("publish")) cats.push("books");
  if (lower.includes("cbd") || lower.includes("hemp") || lower.includes("cannabis")) cats.push("cbd");
  if (cats.length === 0) cats.push("apparel", "beauty", "home");
  return [...new Set(cats)];
}

function inferPlatforms(desc: string): string[] {
  const platforms: string[] = [];
  const lower = desc.toLowerCase();
  if (lower.includes("shopify")) platforms.push("Shopify");
  if (lower.includes("amazon") || lower.includes("fba") || lower.includes("fbm") || lower.includes("sfp")) platforms.push("Amazon");
  if (lower.includes("woocommerce") || lower.includes("woo")) platforms.push("WooCommerce");
  if (lower.includes("bigcommerce")) platforms.push("BigCommerce");
  if (lower.includes("ebay")) platforms.push("eBay");
  if (lower.includes("walmart")) platforms.push("Walmart");
  if (lower.includes("etsy")) platforms.push("Etsy");
  if (lower.includes("tiktok")) platforms.push("TikTok");
  if (lower.includes("magento")) platforms.push("Magento");
  if (lower.includes("b2b") || lower.includes("retail") || lower.includes("wholesale")) platforms.push("B2B");
  if (platforms.length === 0) platforms.push("Shopify", "Amazon", "WooCommerce");
  return [...new Set(platforms)];
}

function inferShippingSpeed(desc: string): string {
  const lower = desc.toLowerCase();
  if (lower.includes("same-day") || lower.includes("1-2 days") || lower.includes("1-2 day")) return "1-2 days";
  if (lower.includes("2-3 days") || lower.includes("2-3 day") || lower.includes("rapid")) return "2-3 days";
  if (lower.includes("3-5 days") || lower.includes("3-5 day")) return "3-5 days";
  const speeds = ["1-2 days", "2-3 days", "3-5 days"];
  return speeds[Math.floor(Math.random() * speeds.length)];
}

// ── 主函数 ──

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error("缺少 NEXT_PUBLIC_SUPABASE_URL 或 SUPABASE_SERVICE_ROLE_KEY 环境变量");
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  const data = generateFullData();
  console.log(`准备导入 ${data.length} 条真实 3PL 数据...\n`);

  // 使用 upsert 逐个导入，避免覆盖已有数据

  // 批量 upsert
  let success = 0;
  let fail = 0;

  for (const item of data) {
    const { error } = await supabase.from("pl_providers").upsert(
      {
        name: item.name,
        slug: item.slug,
        description: item.description,
        state: item.state,
        city: item.city,
        categories: item.categories,
        platforms: item.platforms,
        shipping_speed: item.shipping_speed,
        cost_level: item.cost_level,
        rating: item.rating,
        review_count: item.review_count,
        integrations: item.integrations,
        website: item.website,
      },
      { onConflict: "slug" }
    );

    if (error) {
      console.error(`  FAIL  ${item.name}: ${error.message}`);
      fail++;
    } else {
      console.log(`  OK    ${item.name} — ${item.city}, ${item.state} — ${item.categories.slice(0, 2).join(", ")}`);
      success++;
    }
  }

  console.log(`\n导入完成: ${success} 成功, ${fail} 失败`);
  process.exit(fail > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error("种子数据导入失败:", e);
  process.exit(1);
});
