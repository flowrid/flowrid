-- ============================================
-- Flowrid Brand Integrations — Store connection bridge
-- Brand-owned ecommerce integrations kept separate from 3PL/operator SaaS tenants
-- ============================================

CREATE TABLE IF NOT EXISTS brand_integration_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_user_id UUID NOT NULL,
  brand_email TEXT,
  company_name TEXT,
  platform_type TEXT NOT NULL,
  platform_name TEXT NOT NULL,
  connection_type TEXT DEFAULT 'api',
  credentials JSONB,
  endpoint_url TEXT,
  is_active BOOLEAN DEFAULT true,
  last_sync_at TIMESTAMP,
  sync_frequency TEXT DEFAULT 'manual',
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  UNIQUE(brand_user_id, platform_name)
);

CREATE TABLE IF NOT EXISTS brand_integration_sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id UUID REFERENCES brand_integration_connections(id),
  brand_user_id UUID NOT NULL,
  sync_type TEXT NOT NULL,
  records_processed INTEGER DEFAULT 0,
  records_failed INTEGER DEFAULT 0,
  status TEXT DEFAULT 'running',
  error_message TEXT,
  started_at TIMESTAMP DEFAULT now(),
  completed_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_brand_integrations_user_platform
  ON brand_integration_connections(brand_user_id, platform_name);

CREATE INDEX IF NOT EXISTS idx_brand_integration_logs_user
  ON brand_integration_sync_logs(brand_user_id, started_at DESC);
