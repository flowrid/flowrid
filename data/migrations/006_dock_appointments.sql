-- ============================================
-- 月台预约调度
-- ============================================
CREATE TABLE IF NOT EXISTS dock_appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) NOT NULL,
  warehouse_id UUID REFERENCES warehouses(id) NOT NULL,
  dock_door TEXT NOT NULL,
  appointment_type TEXT DEFAULT 'inbound', -- inbound, outbound
  reference_type TEXT, -- purchase_order, transfer, shipment
  reference_id UUID,
  carrier TEXT,
  trailer_number TEXT,
  scheduled_start TIMESTAMP NOT NULL,
  scheduled_end TIMESTAMP NOT NULL,
  actual_start TIMESTAMP,
  actual_end TIMESTAMP,
  status TEXT DEFAULT 'scheduled', -- scheduled, checked_in, loading, completed, cancelled
  notes TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_dock_warehouse ON dock_appointments(warehouse_id, scheduled_start);
CREATE INDEX IF NOT EXISTS idx_dock_status ON dock_appointments(tenant_id, status);
