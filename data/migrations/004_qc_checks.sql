-- ============================================
-- 18. 质量控制
-- ============================================
CREATE TABLE IF NOT EXISTS qc_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) NOT NULL,
  order_id UUID REFERENCES orders(id) NOT NULL,
  warehouse_id UUID REFERENCES warehouses(id),
  inspector_name TEXT,
  packer_name TEXT,
  passed BOOLEAN DEFAULT true,
  results JSONB DEFAULT '[]',
  notes TEXT,
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_qc_checks_tenant ON qc_checks(tenant_id);
CREATE INDEX IF NOT EXISTS idx_qc_checks_order ON qc_checks(order_id);
