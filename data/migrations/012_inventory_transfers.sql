-- ============================================
-- 库存转移
-- ============================================
CREATE TABLE IF NOT EXISTS inventory_transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) NOT NULL,
  from_warehouse_id UUID REFERENCES warehouses(id) NOT NULL,
  to_warehouse_id UUID REFERENCES warehouses(id) NOT NULL,
  reference_number TEXT NOT NULL,
  reason TEXT,
  status TEXT DEFAULT 'in_progress', -- in_progress, completed, partial, cancelled
  initiated_by UUID REFERENCES users(id),
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_transfers_tenant ON inventory_transfers(tenant_id, status);
