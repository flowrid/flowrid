-- ============================================
-- 周期盘点
-- ============================================
CREATE TABLE IF NOT EXISTS cycle_count_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) NOT NULL,
  warehouse_id UUID REFERENCES warehouses(id) NOT NULL,
  name TEXT NOT NULL,
  count_type TEXT DEFAULT 'full', -- full, zone, abc, random
  zone_filter TEXT,
  status TEXT DEFAULT 'created', -- created, in_progress, completed, cancelled
  assigned_to UUID REFERENCES users(id),
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS cycle_count_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES cycle_count_sessions(id) NOT NULL,
  product_id UUID REFERENCES products(id) NOT NULL,
  location_id UUID REFERENCES locations(id),
  expected_quantity INTEGER DEFAULT 0,
  counted_quantity INTEGER,
  variance INTEGER,
  counted_by UUID REFERENCES users(id),
  counted_at TIMESTAMP,
  status TEXT DEFAULT 'pending' -- pending, counted, verified, disputed
);

CREATE INDEX IF NOT EXISTS idx_cycle_count_session ON cycle_count_items(session_id);
CREATE INDEX IF NOT EXISTS idx_cycle_count_tenant ON cycle_count_sessions(tenant_id, status);
