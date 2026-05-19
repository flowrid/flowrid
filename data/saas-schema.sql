-- ============================================
-- Flowrid SaaS — 3PL 操作系统数据库 Schema
-- 对标 Extensiv: WMS + Integration Hub + Billing + Analytics
-- ============================================

-- ============================================
-- 1. 租户（3PL 公司 / Warehouse）
-- ============================================
CREATE TABLE IF NOT EXISTS tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  logo TEXT,
  website TEXT,
  email TEXT,
  phone TEXT,
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  country TEXT DEFAULT 'US',
  tax_id TEXT,
  subscription_tier TEXT DEFAULT 'free', -- free, pro, enterprise
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- ============================================
-- 2. 仓库
-- ============================================
CREATE TABLE IF NOT EXISTS warehouses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) NOT NULL,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  country TEXT DEFAULT 'US',
  sq_footage INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now()
);

-- ============================================
-- 3. 库位 / 货架
-- ============================================
CREATE TABLE IF NOT EXISTS locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  warehouse_id UUID REFERENCES warehouses(id) NOT NULL,
  zone TEXT,        -- receiving, storage, picking, shipping, returns
  aisle TEXT,
  rack TEXT,
  shelf TEXT,
  bin TEXT,
  barcode TEXT UNIQUE,
  is_occupied BOOLEAN DEFAULT false,
  max_weight_lbs NUMERIC,
  max_volume_cuft NUMERIC,
  created_at TIMESTAMP DEFAULT now()
);

-- ============================================
-- 4. 产品 / SKU
-- ============================================
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) NOT NULL,
  sku TEXT NOT NULL,
  upc TEXT,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  brand TEXT,
  image_url TEXT,
  unit_weight_lbs NUMERIC,
  unit_length_in NUMERIC,
  unit_width_in NUMERIC,
  unit_height_in NUMERIC,
  requires_lot_tracking BOOLEAN DEFAULT false,
  requires_serial_tracking BOOLEAN DEFAULT false,
  requires_expiration BOOLEAN DEFAULT false,
  is_hazmat BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  UNIQUE(tenant_id, sku)
);

-- ============================================
-- 5. 库存
-- ============================================
CREATE TABLE IF NOT EXISTS inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) NOT NULL,
  warehouse_id UUID REFERENCES warehouses(id) NOT NULL,
  location_id UUID REFERENCES locations(id),
  quantity_on_hand INTEGER DEFAULT 0,
  quantity_allocated INTEGER DEFAULT 0,
  quantity_available INTEGER GENERATED ALWAYS AS (quantity_on_hand - quantity_allocated) STORED,
  lot_number TEXT,
  serial_number TEXT,
  expiration_date DATE,
  received_date DATE,
  last_updated TIMESTAMP DEFAULT now(),
  UNIQUE(product_id, warehouse_id, lot_number, serial_number)
);

-- ============================================
-- 6. 客户（使用 3PL 的品牌）
-- ============================================
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) NOT NULL,
  name TEXT NOT NULL,
  company TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  address_line1 TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  client_since DATE,
  is_active BOOLEAN DEFAULT true,
  billing_terms TEXT DEFAULT 'net30',
  created_at TIMESTAMP DEFAULT now()
);

-- ============================================
-- 7. 入库单 (ASN / Receiving)
-- ============================================
CREATE TABLE IF NOT EXISTS receiving_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) NOT NULL,
  warehouse_id UUID REFERENCES warehouses(id) NOT NULL,
  client_id UUID REFERENCES clients(id),
  order_number TEXT NOT NULL,
  reference_number TEXT,
  carrier TEXT,
  tracking_number TEXT,
  expected_date DATE,
  received_date TIMESTAMP,
  status TEXT DEFAULT 'pending', -- pending, partial, complete, cancelled
  notes TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS receiving_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  receiving_id UUID REFERENCES receiving_orders(id) NOT NULL,
  product_id UUID REFERENCES products(id) NOT NULL,
  quantity_expected INTEGER DEFAULT 0,
  quantity_received INTEGER DEFAULT 0,
  lot_number TEXT,
  expiration_date DATE,
  created_at TIMESTAMP DEFAULT now()
);

-- ============================================
-- 8. 出库单 / 订单
-- ============================================
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) NOT NULL,
  warehouse_id UUID REFERENCES warehouses(id) NOT NULL,
  client_id UUID REFERENCES clients(id),
  order_number TEXT NOT NULL,
  external_order_id TEXT,   -- 来自 Shopify/Amazon 等的订单号
  source TEXT,              -- shopify, amazon, tiktok, manual, edi
  customer_name TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  shipping_address_line1 TEXT,
  shipping_address_line2 TEXT,
  shipping_city TEXT,
  shipping_state TEXT,
  shipping_zip TEXT,
  shipping_country TEXT DEFAULT 'US',
  shipping_method TEXT,
  status TEXT DEFAULT 'pending',  -- pending, allocated, picking, packed, shipped, delivered, cancelled, returned
  priority TEXT DEFAULT 'normal',  -- normal, high, rush
  notes TEXT,
  tags TEXT[],
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) NOT NULL,
  product_id UUID REFERENCES products(id) NOT NULL,
  sku TEXT NOT NULL,
  quantity_ordered INTEGER DEFAULT 1,
  quantity_picked INTEGER DEFAULT 0,
  quantity_packed INTEGER DEFAULT 0,
  quantity_shipped INTEGER DEFAULT 0,
  unit_price NUMERIC(10,2),
  lot_number TEXT,
  serial_number TEXT,
  created_at TIMESTAMP DEFAULT now()
);

-- ============================================
-- 9. 拣货任务
-- ============================================
CREATE TABLE IF NOT EXISTS pick_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) NOT NULL,
  warehouse_id UUID REFERENCES warehouses(id) NOT NULL,
  batch_id TEXT,
  assigned_to TEXT,          -- picker user ID
  status TEXT DEFAULT 'pending',  -- pending, in_progress, complete, cancelled
  priority TEXT DEFAULT 'normal',
  pick_type TEXT DEFAULT 'single',  -- single, batch, wave
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pick_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pick_task_id UUID REFERENCES pick_tasks(id) NOT NULL,
  order_item_id UUID REFERENCES order_items(id) NOT NULL,
  product_id UUID REFERENCES products(id) NOT NULL,
  location_id UUID REFERENCES locations(id),
  quantity_to_pick INTEGER DEFAULT 0,
  quantity_picked INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending',
  picked_at TIMESTAMP
);

-- ============================================
-- 10. 打包
-- ============================================
CREATE TABLE IF NOT EXISTS packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) NOT NULL,
  order_id UUID REFERENCES orders(id) NOT NULL,
  tracking_number TEXT,
  carrier TEXT,
  service_level TEXT,
  weight_lbs NUMERIC,
  length_in NUMERIC,
  width_in NUMERIC,
  height_in NUMERIC,
  shipping_cost NUMERIC(10,2),
  label_url TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS package_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id UUID REFERENCES packages(id) NOT NULL,
  order_item_id UUID REFERENCES order_items(id) NOT NULL,
  quantity INTEGER DEFAULT 1
);

-- ============================================
-- 11. 发货
-- ============================================
CREATE TABLE IF NOT EXISTS shipments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) NOT NULL,
  order_id UUID REFERENCES orders(id) NOT NULL,
  package_id UUID REFERENCES packages(id),
  carrier TEXT NOT NULL,
  service_level TEXT,
  tracking_number TEXT,
  shipping_cost NUMERIC(10,2),
  label_url TEXT,
  shipped_at TIMESTAMP DEFAULT now(),
  estimated_delivery DATE,
  actual_delivery DATE,
  status TEXT DEFAULT 'shipped'
);

-- ============================================
-- 12. 退货
-- ============================================
CREATE TABLE IF NOT EXISTS returns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) NOT NULL,
  order_id UUID REFERENCES orders(id) NOT NULL,
  rma_number TEXT NOT NULL,
  reason TEXT,
  condition TEXT,
  disposition TEXT,  -- restock, quarantine, destroy, return_to_vendor
  received_at TIMESTAMP,
  processed_at TIMESTAMP,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS return_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  return_id UUID REFERENCES returns(id) NOT NULL,
  order_item_id UUID REFERENCES order_items(id) NOT NULL,
  quantity_returned INTEGER DEFAULT 1,
  disposition TEXT
);

-- ============================================
-- 13. Billing / 计费引擎
-- ============================================
CREATE TABLE IF NOT EXISTS billing_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) NOT NULL,
  client_id UUID REFERENCES clients(id),
  charge_type TEXT NOT NULL,  -- storage, receiving, pick_pack, shipping, labeling, kitting, account_management
  charge_unit TEXT NOT NULL,   -- per_order, per_unit, per_pallet, per_hour, per_month, flat
  rate NUMERIC(10,4) NOT NULL,
  min_charge NUMERIC(10,2),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS billing_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) NOT NULL,
  client_id UUID REFERENCES clients(id),
  charge_type TEXT NOT NULL,
  reference_type TEXT,       -- order, receiving, storage, service
  reference_id UUID,
  description TEXT,
  quantity NUMERIC(10,2),
  unit_rate NUMERIC(10,4),
  total_amount NUMERIC(10,2) NOT NULL,
  billing_period_start DATE,
  billing_period_end DATE,
  is_invoiced BOOLEAN DEFAULT false,
  invoice_id UUID,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) NOT NULL,
  client_id UUID REFERENCES clients(id),
  invoice_number TEXT NOT NULL,
  subtotal NUMERIC(10,2) DEFAULT 0,
  tax_amount NUMERIC(10,2) DEFAULT 0,
  total_amount NUMERIC(10,2) DEFAULT 0,
  due_date DATE,
  status TEXT DEFAULT 'draft',  -- draft, sent, paid, overdue, cancelled
  paid_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT now()
);

-- ============================================
-- 14. Integration Hub / 集成连接
-- ============================================
CREATE TABLE IF NOT EXISTS integration_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) NOT NULL,
  client_id UUID REFERENCES clients(id),
  platform_type TEXT NOT NULL,  -- shopping_cart, marketplace, erp, shipping, edi, custom
  platform_name TEXT NOT NULL,  -- shopify, amazon, netsuite, shipstation, sps_commerce, etc.
  connection_type TEXT DEFAULT 'api',  -- api, ftp, edi, csv, webhook
  credentials JSONB,           -- encrypted API keys, tokens
  endpoint_url TEXT,
  is_active BOOLEAN DEFAULT true,
  last_sync_at TIMESTAMP,
  sync_frequency TEXT DEFAULT 'realtime',  -- realtime, hourly, daily, manual
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS integration_sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id UUID REFERENCES integration_connections(id) NOT NULL,
  sync_type TEXT NOT NULL,  -- order_import, inventory_export, shipment_update, product_sync
  records_processed INTEGER DEFAULT 0,
  records_failed INTEGER DEFAULT 0,
  status TEXT DEFAULT 'running',
  error_message TEXT,
  started_at TIMESTAMP DEFAULT now(),
  completed_at TIMESTAMP
);

-- ============================================
-- 15. API Keys / 开放平台
-- ============================================
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) NOT NULL,
  name TEXT NOT NULL,
  key_hash TEXT UNIQUE NOT NULL,
  key_prefix TEXT NOT NULL,  -- 前8位用于展示
  scopes TEXT[] DEFAULT '{read}',
  last_used_at TIMESTAMP,
  expires_at TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS api_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key_id UUID REFERENCES api_keys(id),
  tenant_id UUID REFERENCES tenants(id) NOT NULL,
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL,
  status_code INTEGER,
  response_time_ms INTEGER,
  ip_address TEXT,
  created_at TIMESTAMP DEFAULT now()
);

-- ============================================
-- 16. 用户 / 权限
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) NOT NULL,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'operator',  -- admin, manager, supervisor, operator, picker, viewer
  warehouse_ids UUID[],
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT now(),
  UNIQUE(tenant_id, email)
);

-- ============================================
-- 17. 报表 / 分析数据缓存
-- ============================================
CREATE TABLE IF NOT EXISTS analytics_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) NOT NULL,
  warehouse_id UUID REFERENCES warehouses(id),
  snapshot_date DATE NOT NULL,
  metric_type TEXT NOT NULL,   -- orders_processed, revenue, inventory_value, picking_accuracy, etc.
  metric_value NUMERIC(15,2),
  metadata JSONB,
  created_at TIMESTAMP DEFAULT now()
);

-- ============================================
-- 索引
-- ============================================
CREATE INDEX IF NOT EXISTS idx_orders_tenant_status ON orders(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_orders_external ON orders(external_order_id);
CREATE INDEX IF NOT EXISTS idx_inventory_product_wh ON inventory(product_id, warehouse_id);
CREATE INDEX IF NOT EXISTS idx_inventory_location ON inventory(location_id);
CREATE INDEX IF NOT EXISTS idx_pick_tasks_status ON pick_tasks(warehouse_id, status);
CREATE INDEX IF NOT EXISTS idx_billing_client_period ON billing_transactions(client_id, billing_period_start, billing_period_end);
CREATE INDEX IF NOT EXISTS idx_integration_connections_tenant ON integration_connections(tenant_id, platform_name);
CREATE INDEX IF NOT EXISTS idx_shipments_tracking ON shipments(tracking_number);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
