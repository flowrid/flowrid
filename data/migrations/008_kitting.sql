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
