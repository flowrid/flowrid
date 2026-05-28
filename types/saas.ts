// ============================================
// Flowrid SaaS — 3PL Operating System Types
// ============================================

// ---- Tenant & Warehouse ----

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  website?: string;
  email?: string;
  phone?: string;
  address_line1?: string;
  city?: string;
  state?: string;
  zip?: string;
  country: string;
  tax_id?: string;
  subscription_tier: "free" | "pro" | "enterprise";
  created_at: string;
}

export interface Warehouse {
  id: string;
  tenant_id: string;
  name: string;
  code: string;
  address_line1?: string;
  city?: string;
  state?: string;
  zip?: string;
  country: string;
  sq_footage?: number;
  is_active: boolean;
}

export interface Location {
  id: string;
  warehouse_id: string;
  zone: string;
  aisle?: string;
  rack?: string;
  shelf?: string;
  bin?: string;
  barcode?: string;
  is_occupied: boolean;
  max_weight_lbs?: number;
}

// ---- Product & Inventory ----

export interface Product {
  id: string;
  tenant_id: string;
  sku: string;
  upc?: string;
  name: string;
  description?: string;
  category?: string;
  brand?: string;
  image_url?: string;
  unit_weight_lbs?: number;
  unit_length_in?: number;
  unit_width_in?: number;
  unit_height_in?: number;
  requires_lot_tracking: boolean;
  requires_serial_tracking: boolean;
  requires_expiration: boolean;
  is_hazmat: boolean;
  is_active: boolean;
}

export interface Inventory {
  id: string;
  product_id: string;
  warehouse_id: string;
  location_id?: string;
  quantity_on_hand: number;
  quantity_allocated: number;
  quantity_available: number;
  lot_number?: string;
  serial_number?: string;
  expiration_date?: string;
  received_date?: string;
}

// ---- Client ----

export interface Client {
  id: string;
  tenant_id: string;
  name: string;
  company?: string;
  email: string;
  phone?: string;
  address_line1?: string;
  city?: string;
  state?: string;
  zip?: string;
  client_since?: string;
  is_active: boolean;
  billing_terms: string;
}

// ---- Receiving ----

export interface ReceivingOrder {
  id: string;
  tenant_id: string;
  warehouse_id: string;
  client_id?: string;
  order_number: string;
  reference_number?: string;
  carrier?: string;
  tracking_number?: string;
  expected_date?: string;
  received_date?: string;
  status: "pending" | "partial" | "complete" | "cancelled";
}

export interface ReceivingItem {
  id: string;
  receiving_id: string;
  product_id: string;
  quantity_expected: number;
  quantity_received: number;
  lot_number?: string;
  expiration_date?: string;
}

// ---- Orders ----

export interface Order {
  id: string;
  tenant_id: string;
  warehouse_id: string;
  client_id?: string;
  order_number: string;
  external_order_id?: string;
  source?: string; // shopify, amazon, tiktok, manual, edi
  customer_name?: string;
  customer_email?: string;
  shipping_address_line1?: string;
  shipping_city?: string;
  shipping_state?: string;
  shipping_zip?: string;
  shipping_country: string;
  shipping_method?: string;
  status: OrderStatus;
  priority: "normal" | "high" | "rush";
  tags?: string[];
}

export type OrderStatus =
  | "pending"
  | "allocated"
  | "picking"
  | "packed"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "returned";

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  sku: string;
  quantity_ordered: number;
  quantity_picked: number;
  quantity_packed: number;
  quantity_shipped: number;
  unit_price?: number;
  lot_number?: string;
  serial_number?: string;
}

// ---- Picking ----

export interface PickTask {
  id: string;
  tenant_id: string;
  warehouse_id: string;
  batch_id?: string;
  assigned_to?: string;
  status: "pending" | "in_progress" | "complete" | "cancelled";
  priority: string;
  pick_type: "single" | "batch" | "wave";
  started_at?: string;
  completed_at?: string;
}

export interface PickItem {
  id: string;
  pick_task_id: string;
  order_item_id: string;
  product_id: string;
  location_id?: string;
  quantity_to_pick: number;
  quantity_picked: number;
  status: "pending" | "picked" | "skipped";
}

// ---- Packing & Shipping ----

export interface Package {
  id: string;
  tenant_id: string;
  order_id: string;
  tracking_number?: string;
  carrier?: string;
  service_level?: string;
  weight_lbs?: number;
  length_in?: number;
  width_in?: number;
  height_in?: number;
  shipping_cost?: number;
  label_url?: string;
  status: "pending" | "created" | "shipped";
}

export interface Shipment {
  id: string;
  tenant_id: string;
  order_id: string;
  package_id?: string;
  carrier: string;
  service_level?: string;
  tracking_number?: string;
  shipping_cost?: number;
  label_url?: string;
  shipped_at: string;
  estimated_delivery?: string;
  actual_delivery?: string;
  status: string;
}

// ---- Returns ----

export interface Return {
  id: string;
  tenant_id: string;
  order_id: string;
  rma_number: string;
  reason?: string;
  condition?: string;
  disposition?: "restock" | "quarantine" | "destroy" | "return_to_vendor";
  status: "pending" | "received" | "processed";
}

// ---- Billing ----

export interface BillingRate {
  id: string;
  tenant_id: string;
  client_id?: string;
  charge_type: string;
  charge_unit: string;
  rate: number;
  min_charge?: number;
  is_active: boolean;
}

export interface BillingTransaction {
  id: string;
  tenant_id: string;
  client_id?: string;
  charge_type: string;
  reference_type?: string;
  reference_id?: string;
  description?: string;
  quantity: number;
  unit_rate: number;
  total_amount: number;
  billing_period_start?: string;
  billing_period_end?: string;
  is_invoiced: boolean;
  invoice_id?: string;
}

export interface Invoice {
  id: string;
  tenant_id: string;
  client_id?: string;
  invoice_number: string;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  due_date?: string;
  status: "draft" | "sent" | "paid" | "overdue" | "cancelled";
  paid_at?: string;
}

// ---- Integration Hub ----

export interface IntegrationConnection {
  id: string;
  tenant_id: string;
  client_id?: string;
  platform_type: PlatformType;
  platform_name: string;
  connection_type: "api" | "ftp" | "edi" | "csv" | "webhook";
  credentials?: Record<string, string>;
  endpoint_url?: string;
  is_active: boolean;
  last_sync_at?: string;
  sync_frequency: "realtime" | "hourly" | "daily" | "manual";
}

export type PlatformType =
  | "shopping_cart"
  | "marketplace"
  | "erp"
  | "oms"
  | "wms"
  | "shipping"
  | "edi"
  | "crm"
  | "pos"
  | "custom";

export interface IntegrationSyncLog {
  id: string;
  connection_id: string;
  sync_type: string;
  records_processed: number;
  records_failed: number;
  status: "running" | "completed" | "failed";
  error_message?: string;
  started_at: string;
  completed_at?: string;
}

// ---- API & Auth ----

export interface OperatorJwtPayload {
  userId: string;
  email: string;
  tenantId: string;
  role?: string;
}

export interface ApiKey {
  id: string;
  tenant_id: string;
  name: string;
  key_prefix: string;
  scopes: string[];
  last_used_at?: string;
  expires_at?: string;
  is_active: boolean;
}

export interface User {
  id: string;
  tenant_id: string;
  email: string;
  name: string;
  role: "admin" | "manager" | "supervisor" | "operator" | "picker" | "viewer";
  warehouse_ids: string[];
  is_active: boolean;
  last_login_at?: string;
}

// ---- Analytics ----

export interface AnalyticsSnapshot {
  id: string;
  tenant_id: string;
  warehouse_id?: string;
  snapshot_date: string;
  metric_type: string;
  metric_value: number;
  metadata?: Record<string, unknown>;
}

// ---- Scanner ----

export type ScanMode = "receive" | "pick" | "lookup";

export interface ScanResult {
  type: "product" | "location" | "order" | "unknown";
  data?: Product | Location | Order | null;
}

export interface OfflineQueueItem {
  id: string;
  action: string;
  payload: unknown;
  timestamp: number;
}

// ---- Shipping Rates ----

export interface ShipmentRequest {
  originZip: string;
  destinationZip: string;
  weightLbs: number;
  lengthIn: number;
  widthIn: number;
  heightIn: number;
  isResidential: boolean;
  isHazmat: boolean;
  declaredValue?: number;
}

export interface RateQuote {
  carrier: string;
  carrierName: string;
  serviceLevel: string;
  serviceName: string;
  totalCost: number;
  baseRate: number;
  fuelSurcharge: number;
  residentialSurcharge: number;
  dimensionalWeight: number;
  billableWeight: number;
  estimatedDays: number;
  deliveryDate: string;
  isSimulated: boolean;
}

export interface RateTableEntry {
  basePerLb: number;
  minCharge: number;
  maxWeight: number;
  deliveryDays: Record<string, number>;
}
