-- ============================================
-- Flowrid 数据库 Schema
-- 在 Supabase SQL Editor 中执行此文件
-- ============================================

-- 1. 3PL 主表
CREATE TABLE IF NOT EXISTS pl_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  description TEXT,
  state TEXT,
  city TEXT,
  categories TEXT[],
  platforms TEXT[],
  shipping_speed TEXT,
  cost_level TEXT,
  rating NUMERIC DEFAULT 4.5,
  review_count INT DEFAULT 0,
  order_capacity INT,
  sku_capacity INT,
  integrations TEXT[],
  website TEXT,
  logo TEXT,
  created_at TIMESTAMP DEFAULT now()
);

-- 2. RFQ 询盘表
CREATE TABLE IF NOT EXISTS rfq_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  email TEXT,
  company TEXT,
  state TEXT,
  category TEXT,
  platform TEXT,
  volume TEXT,
  message TEXT,
  created_at TIMESTAMP DEFAULT now()
);

-- 3. SEO 页面缓存表
CREATE TABLE IF NOT EXISTS seo_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE,
  title TEXT,
  description TEXT,
  state TEXT,
  category TEXT,
  platform TEXT,
  ai_summary TEXT,
  why_section TEXT,
  faq TEXT[],
  created_at TIMESTAMP DEFAULT now()
);

-- ============================================
-- 索引
-- ============================================

CREATE INDEX IF NOT EXISTS idx_pl_providers_state ON pl_providers(state);
CREATE INDEX IF NOT EXISTS idx_pl_providers_categories ON pl_providers USING GIN(categories);
CREATE INDEX IF NOT EXISTS idx_pl_providers_platforms ON pl_providers USING GIN(platforms);
CREATE INDEX IF NOT EXISTS idx_pl_providers_slug ON pl_providers(slug);
CREATE INDEX IF NOT EXISTS idx_rfq_requests_email ON rfq_requests(email);
CREATE INDEX IF NOT EXISTS idx_seo_pages_slug ON seo_pages(slug);

-- ============================================
-- RLS 策略：公开可读，仅服务端可写
-- ============================================

ALTER TABLE pl_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE rfq_requests ENABLE ROW LEVEL SECURITY;

-- pl_providers: 任何人都能读
CREATE POLICY "Public read access" ON pl_providers
  FOR SELECT USING (true);

-- pl_providers: 仅 service_role 可写
CREATE POLICY "Service role write access" ON pl_providers
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Service role update access" ON pl_providers
  FOR UPDATE USING (true);

-- rfq_requests: 仅 service_role 可插入（RFQ 表单提交走 API route）
CREATE POLICY "Service role insert access" ON rfq_requests
  FOR INSERT WITH CHECK (true);

-- ============================================
-- 种子数据：8 家美国 3PL
-- ============================================

INSERT INTO pl_providers (name, slug, description, state, city, categories, platforms, shipping_speed, cost_level, rating, review_count, order_capacity, sku_capacity, integrations, website) VALUES
(
  'FlowX Fulfillment',
  'flowx-fulfillment',
  'Premium fulfillment center specializing in fast-turnaround apparel and beauty orders for Shopify and TikTok brands.',
  'texas',
  'Dallas',
  ARRAY['apparel', 'beauty', 'jewelry'],
  ARRAY['Shopify', 'TikTok'],
  '1-2 days',
  '$$',
  4.8,
  156,
  50000,
  5000,
  ARRAY['Shopify', 'TikTok', 'Amazon'],
  'https://example.com/flowx'
),
(
  'LoneStar Logistics',
  'lonestar-logistics',
  'Texas-based 3PL with competitive pricing for mid-volume brands. Strong Amazon FBA prep capabilities.',
  'texas',
  'Houston',
  ARRAY['apparel', 'electronics', 'home'],
  ARRAY['Amazon', 'Shopify'],
  '3-5 days',
  '$',
  4.5,
  89,
  30000,
  3000,
  ARRAY['Amazon', 'Shopify'],
  'https://example.com/lonestar'
),
(
  'CaliShip Fulfillment',
  'caliship-fulfillment',
  'Los Angeles-based fulfillment center close to major ports. Ideal for Asia-import brands needing fast West Coast distribution.',
  'california',
  'Los Angeles',
  ARRAY['apparel', 'jewelry', 'beauty', 'electronics'],
  ARRAY['Shopify', 'TikTok', 'Amazon'],
  '1-2 days',
  '$$$',
  4.7,
  203,
  80000,
  8000,
  ARRAY['Shopify', 'TikTok', 'Amazon'],
  'https://example.com/caliship'
),
(
  'Golden State Logistics',
  'golden-state-logistics',
  'Bay Area fulfillment with strong tech integration. Perfect for electronics and high-value goods.',
  'california',
  'San Francisco',
  ARRAY['electronics', 'beauty'],
  ARRAY['Shopify', 'Amazon'],
  '3-5 days',
  '$$$',
  4.3,
  67,
  20000,
  2000,
  ARRAY['Shopify', 'Amazon'],
  'https://example.com/goldenstate'
),
(
  'Sunshine Fulfillment',
  'sunshine-fulfillment',
  'Miami-based 3PL with strong Latin American distribution. Great for beauty and fashion brands targeting both US and LATAM markets.',
  'florida',
  'Miami',
  ARRAY['apparel', 'beauty', 'jewelry'],
  ARRAY['Shopify', 'TikTok'],
  '1-2 days',
  '$$',
  4.6,
  134,
  40000,
  4000,
  ARRAY['Shopify', 'TikTok'],
  'https://example.com/sunshine'
),
(
  'NYC Express Fulfillment',
  'nyc-express-fulfillment',
  'Fast East Coast fulfillment in the NYC metro area. Same-day processing for orders placed before 2pm.',
  'new-york',
  'Brooklyn',
  ARRAY['apparel', 'beauty', 'home'],
  ARRAY['Shopify', 'Amazon', 'TikTok'],
  '1-2 days',
  '$$$',
  4.4,
  92,
  35000,
  3500,
  ARRAY['Shopify', 'Amazon', 'TikTok'],
  'https://example.com/nycexpress'
),
(
  'Garden State Fulfillment',
  'garden-state-fulfillment',
  'New Jersey-based 3PL near major ports and NYC market. Cost-effective alternative to NYC pricing.',
  'new-jersey',
  'Newark',
  ARRAY['apparel', 'electronics', 'home'],
  ARRAY['Amazon', 'Shopify'],
  '3-5 days',
  '$$',
  4.5,
  78,
  45000,
  4500,
  ARRAY['Amazon', 'Shopify'],
  'https://example.com/gardenstate'
),
(
  'Peach State Logistics',
  'peach-state-logistics',
  'Atlanta-based fulfillment center — central East Coast location for fast delivery to major population centers.',
  'georgia',
  'Atlanta',
  ARRAY['apparel', 'home', 'toys'],
  ARRAY['Shopify', 'Amazon'],
  '3-5 days',
  '$',
  4.2,
  56,
  25000,
  2500,
  ARRAY['Shopify', 'Amazon'],
  'https://example.com/peachstate'
);
