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
