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
-- ============================================
-- 自动化规则引�?-- ============================================
CREATE TABLE IF NOT EXISTS automation_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  trigger_event TEXT NOT NULL,
  conditions JSONB DEFAULT '[]',
  actions JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0,
  cooldown_minutes INTEGER DEFAULT 0,
  last_triggered_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS automation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_id UUID REFERENCES automation_rules(id),
  tenant_id UUID REFERENCES tenants(id) NOT NULL,
  event TEXT NOT NULL,
  entity_id UUID,
  success BOOLEAN DEFAULT true,
  error TEXT,
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_automation_rules_tenant ON automation_rules(tenant_id, is_active);
CREATE INDEX IF NOT EXISTS idx_automation_logs_tenant ON automation_logs(tenant_id, created_at);
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
-- ============================================
-- Kitting / 组装
-- ============================================
CREATE TABLE IF NOT EXISTS kits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) NOT NULL,
  kit_product_id UUID REFERENCES products(id) NOT NULL,
  labor_cost NUMERIC(10,2),
  instructions TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS kit_components (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kit_id UUID REFERENCES kits(id) NOT NULL,
  component_product_id UUID REFERENCES products(id) NOT NULL,
  quantity_per_kit INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS kit_assembly_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) NOT NULL,
  warehouse_id UUID REFERENCES warehouses(id),
  kit_product_id UUID REFERENCES products(id),
  quantity INTEGER DEFAULT 0,
  action TEXT DEFAULT 'assemble', -- assemble, disassemble
  components_snapshot JSONB,
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_kits_tenant ON kits(tenant_id, is_active);
CREATE INDEX IF NOT EXISTS idx_kit_components_kit ON kit_components(kit_id);
-- ============================================
-- Container / Movable Unit
-- ============================================
CREATE TABLE IF NOT EXISTS containers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) NOT NULL,
  warehouse_id UUID REFERENCES warehouses(id) NOT NULL,
  container_type TEXT NOT NULL, -- pallet, tote, cart, cage, trailer
  barcode TEXT UNIQUE NOT NULL,
  name TEXT,
  location_id UUID REFERENCES locations(id),
  status TEXT DEFAULT 'available', -- available, in_use, staged, shipped
  max_weight_lbs NUMERIC(10,2),
  max_volume_cuft NUMERIC(10,2),
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS container_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  container_id UUID REFERENCES containers(id) NOT NULL,
  product_id UUID REFERENCES products(id) NOT NULL,
  inventory_id UUID REFERENCES inventory(id),
  quantity INTEGER DEFAULT 1,
  lot_number TEXT,
  added_at TIMESTAMP DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_containers_warehouse ON containers(warehouse_id, status);
CREATE INDEX IF NOT EXISTS idx_container_items_container ON container_items(container_id);
-- ============================================
-- 通知中心
-- ============================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) NOT NULL,
  user_id UUID REFERENCES users(id),
  title TEXT NOT NULL,
  body TEXT,
  type TEXT DEFAULT 'info', -- info, warning, success, error
  category TEXT, -- order, inventory, shipment, billing, system
  entity_type TEXT,
  entity_id UUID,
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(tenant_id, user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(tenant_id, created_at DESC);
-- ============================================
-- 审计日志
-- ============================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) NOT NULL,
  user_id UUID REFERENCES users(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address TEXT,
  user_agent TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_tenant ON audit_logs(tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_logs(tenant_id, action, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_logs(entity_type, entity_id);
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
