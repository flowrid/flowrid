import { z } from "zod";

/**
 * 转义 PostgREST ILIKE 搜索中的通配符，防止 LIKE 模式注入。
 * 移除 %, _ 和控制字符，同时防止 .or() 过滤器被篡改。
 */
export function sanitizeSearch(input: string): string {
  return input.replace(/[%,_\\]/g, "").trim();
}

// ─── 通用 ───
export const PaginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(500).default(20),
});

export const IdParamSchema = z.object({
  id: z.string().uuid(),
});

// ─── 订单 ───
export const OrderStatusSchema = z.enum([
  "pending", "allocated", "picking", "picked", "packing", "packed", "shipped", "delivered", "cancelled",
]);

export const OrderUpdateSchema = z.object({
  status: OrderStatusSchema.optional(),
  shipping_carrier: z.string().min(1).max(100).optional(),
  tracking_number: z.string().max(100).optional(),
  notes: z.string().max(2000).optional(),
  warehouse_id: z.string().uuid().optional(),
});

export const OrderListSchema = PaginationSchema.extend({
  status: OrderStatusSchema.optional(),
  search: z.string().max(200).optional(),
  client_id: z.string().uuid().optional(),
  warehouse_id: z.string().uuid().optional(),
  date_from: z.string().datetime().optional(),
  date_to: z.string().datetime().optional(),
});

// ── 客户 ───
export const ClientCreateSchema = z.object({
  name: z.string().min(1).max(200),
  company: z.string().max(200).optional(),
  email: z.string().email().max(255),
  phone: z.string().max(50).optional(),
  address_line1: z.string().max(255).optional(),
  address_city: z.string().max(100).optional(),
  address_state: z.string().max(100).optional(),
  address_zip: z.string().max(20).optional(),
  address_country: z.string().max(2).default("US"),
  billing_terms: z.string().max(50).optional(),
});

export const ClientUpdateSchema = ClientCreateSchema.partial();

// ─── 产品 ───
export const ProductCreateSchema = z.object({
  sku: z.string().min(1).max(100),
  name: z.string().min(1).max(255),
  description: z.string().max(2000).optional(),
  barcode: z.string().max(100).optional(),
  upc: z.string().max(50).optional(),
  category: z.string().max(100).optional(),
  brand: z.string().max(100).optional(),
  image_url: z.string().url().optional().or(z.literal("")),
  unit_price: z.number().min(0).optional(),
  unit_cost: z.number().min(0).optional(),
  unit_weight_lbs: z.number().min(0).optional(),
  weight_lbs: z.number().min(0).optional(),
  unit_length_in: z.number().min(0).optional(),
  unit_width_in: z.number().min(0).optional(),
  unit_height_in: z.number().min(0).optional(),
  dimensions_lwh: z.string().max(50).optional(),
  requires_lot: z.boolean().optional(),
  requires_serial: z.boolean().optional(),
  requires_lot_tracking: z.boolean().optional(),
  requires_serial_tracking: z.boolean().optional(),
  requires_expiration: z.boolean().optional(),
  is_hazmat: z.boolean().optional(),
  is_active: z.boolean().optional(),
  min_quantity: z.number().int().min(0).optional(),
  max_quantity: z.number().int().min(0).optional(),
  reorder_point: z.number().int().min(0).optional(),
});

export const ProductUpdateSchema = ProductCreateSchema.partial();

export const ProductListSchema = PaginationSchema.extend({
  search: z.string().max(200).optional(),
  q: z.string().max(200).optional(),
  category: z.string().max(100).optional(),
});

// ─── 退货 RMA ───
export const ReturnCreateSchema = z.object({
  order_id: z.string().uuid(),
  reason: z.string().min(1).max(500),
  condition: z.enum(["resellable", "damaged", "expired", "defective"]).optional(),
  disposition: z.enum(["restock", "quarantine", "dispose", "return_to_supplier"]).optional(),
  items: z.array(z.object({
    product_id: z.string().uuid(),
    quantity: z.number().int().min(1),
    condition: z.enum(["resellable", "damaged", "expired", "defective"]).default("resellable"),
  })).min(1).optional(),
  refund_type: z.enum(["full", "partial", "exchange", "store_credit"]).optional(),
  notes: z.string().max(1000).optional(),
});

export const ReturnUpdateSchema = z.object({
  disposition: z.enum(["restock", "quarantine", "dispose", "return_to_supplier"]).optional(),
  status: z.enum(["pending", "received", "inspected", "resolved"]).optional(),
  condition: z.enum(["resellable", "damaged", "expired", "defective"]).optional(),
  notes: z.string().max(1000).optional(),
});

// ─── 仓库 ───
export const WarehouseCreateSchema = z.object({
  name: z.string().min(1).max(200),
  code: z.string().min(1).max(20),
  address_line1: z.string().max(255).optional(),
  address_city: z.string().max(100).optional(),
  city: z.string().max(100).optional(),
  address_state: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  address_zip: z.string().max(20).optional(),
  zip: z.string().max(20).optional(),
  address_country: z.string().max(2).default("US"),
  country: z.string().max(2).default("US"),
  timezone: z.string().max(50).default("America/Chicago"),
  sq_footage: z.number().min(0).optional(),
  is_active: z.boolean().optional(),
});

export const WarehouseUpdateSchema = WarehouseCreateSchema.partial();

// ─── 用户 ───
export const UserCreateSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(128).optional(),
  name: z.string().min(1).max(200),
  role: z.enum(["admin", "manager", "operator", "viewer"]).default("operator"),
  warehouse_ids: z.array(z.string().uuid()).optional(),
});

export const UserUpdateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  role: z.enum(["admin", "manager", "operator", "viewer"]).optional(),
  warehouse_ids: z.array(z.string().uuid()).optional(),
  is_active: z.boolean().optional(),
});

// ─── 库位 ───
export const LocationCreateSchema = z.object({
  warehouse_id: z.string().uuid(),
  zone: z.string().min(1).max(50),
  aisle: z.string().max(20).optional(),
  rack: z.string().max(20).optional(),
  shelf: z.string().max(20).optional(),
  bin: z.string().max(20).optional(),
  barcode: z.string().max(100).optional(),
  capacity: z.number().min(0).optional(),
  max_weight_lbs: z.number().min(0).optional(),
  max_volume_cuft: z.number().min(0).optional(),
});

export const LocationUpdateSchema = LocationCreateSchema.partial();

// ─── 集成连接 ───
export const IntegrationCreateSchema = z.object({
  platform_type: z.string().min(1).max(50),
  platform_name: z.string().min(1).max(50),
  connection_type: z.enum(["api", "oauth", "edi"]).default("api"),
  credentials: z.record(z.string(), z.string()).optional(),
  endpoint_url: z.string().url().optional().or(z.literal("")),
  sync_frequency: z.enum(["manual", "hourly", "daily", "realtime"]).default("manual"),
});

// ─── 自动化规则 ───
export const AutomationRuleSchema = z.object({
  name: z.string().min(1).max(200),
  trigger: z.enum([
    "order_created", "order.created",
    "order_shipped", "order.shipped",
    "inventory_low", "inventory.low",
    "shipment_delivered", "shipment.delivered",
    "return_received", "return.received",
    "qc_failed", "qc.failed",
    "dock_checkin", "dock.checkin",
  ]),
  conditions: z.array(z.object({
    field: z.string().min(1),
    operator: z.enum(["eq", "neq", "gt", "gte", "lt", "lte", "contains", "in"]),
    value: z.union([z.string(), z.number(), z.boolean()]),
  })).optional(),
  actions: z.array(z.object({
    type: z.enum([
      "send_email", "send_webhook", "update_order_status",
      "create_task", "send_slack", "notify_user",
      "hold_shipment", "generate_label", "flag_review",
      "send_notification",
    ]),
    config: z.record(z.string(), z.unknown()).optional(),
  })).min(1),
  is_active: z.boolean().default(true),
});

// ─── Dock 预约 ───
export const DockAppointmentSchema = z.object({
  warehouse_id: z.string().uuid(),
  door_number: z.string().min(1).max(20),
  dock_door: z.string().max(20).optional(),
  scheduled_start: z.string().datetime().optional(),
  scheduled_end: z.string().datetime().optional(),
  scheduled_time: z.string().optional(),
  carrier: z.string().max(100).optional(),
  vehicle_plate: z.string().max(20).optional(),
  vehicle_type: z.string().max(50).optional(),
  reference_type: z.enum(["po", "transfer", "return"]).optional(),
  reference_id: z.string().max(100).optional(),
  notes: z.string().max(500).optional(),
});

// ─── 容器 ───
export const ContainerCreateSchema = z.object({
  warehouse_id: z.string().uuid(),
  container_type: z.enum(["pallet", "tote", "cart", "cage", "trailer"]),
  barcode: z.string().min(1).max(100),
  location_id: z.string().uuid().optional(),
  items: z.array(z.object({
    product_id: z.string().uuid(),
    quantity: z.number().int().min(1).default(1),
    lot_number: z.string().max(50).optional(),
  })).max(500).optional(),
});

export const ContainerUpdateSchema = z.object({
  location_id: z.string().uuid().optional(),
  container_type: z.enum(["pallet", "tote", "cart", "cage", "trailer"]).optional(),
  is_active: z.boolean().optional(),
});

// ─── Kitting ───
export const KitCreateSchema = z.object({
  name: z.string().min(1).max(255),
  sku: z.string().min(1).max(100),
  components: z.array(z.object({
    product_id: z.string().uuid(),
    quantity: z.number().int().min(1),
  })).min(1),
  labor_cost: z.number().min(0).optional(),
  instructions: z.string().max(2000).optional(),
});

// ─── 周期盘点 ───
export const CycleCountCreateSchema = z.object({
  warehouse_id: z.string().uuid(),
  zone: z.string().max(50).optional(),
  product_ids: z.array(z.string().uuid()).optional(),
  assigned_to: z.string().uuid().optional(),
});

// ─── 库存转移 ───
export const TransferCreateSchema = z.object({
  type: z.enum(["inter_warehouse", "intra_warehouse", "location_to_location"]).optional(),
  transfer_type: z.enum(["inter_warehouse", "intra_warehouse", "location_to_location"]).optional(),
  product_id: z.string().uuid().optional(),
  quantity: z.number().int().min(1).optional(),
  from_warehouse_id: z.string().uuid().optional(),
  source_warehouse_id: z.string().uuid().optional(),
  to_warehouse_id: z.string().uuid().optional(),
  destination_warehouse_id: z.string().uuid().optional(),
  from_location_id: z.string().uuid().optional(),
  to_location_id: z.string().uuid().optional(),
  lot_number: z.string().max(50).optional(),
  serial_number: z.string().max(100).optional(),
  items: z.array(z.object({
    product_id: z.string().uuid(),
    quantity: z.number().int().min(1),
    lot_number: z.string().max(50).optional(),
    serial_numbers: z.array(z.string().max(100)).optional(),
  })).optional(),
  reason: z.string().max(500).optional(),
  notes: z.string().max(1000).optional(),
});

// ── QC ───
export const QCCheckSchema = z.object({
  order_id: z.string().uuid(),
  results: z.array(z.object({
    category: z.enum(["packing", "product", "labeling", "documentation"]).optional(),
    check_name: z.string().min(1).max(200).optional(),
    name: z.string().min(1).max(200).optional(),
    passed: z.boolean(),
    notes: z.string().max(500).optional(),
  })).optional(),
  checklist: z.array(z.object({
    category: z.enum(["packing", "product", "labeling", "documentation"]),
    check_name: z.string().min(1).max(200),
    passed: z.boolean(),
    notes: z.string().max(500).optional(),
  })).optional(),
  inspector_name: z.string().max(100).optional(),
  packer_name: z.string().max(100).optional(),
  notes: z.string().max(500).optional(),
  passed: z.boolean().optional(),
});

// ── Notifications ───
export const NotificationListSchema = PaginationSchema.extend({
  unread_only: z.coerce.boolean().optional(),
});

// ── 上报 ───
export const ReportQuerySchema = z.object({
  type: z.enum(["orders", "inventory", "picking", "revenue"]),
  range: z.enum(["7d", "30d", "90d", "12m"]).optional(),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
  warehouse_id: z.string().uuid().optional(),
  client_id: z.string().uuid().optional(),
  days: z.coerce.number().int().min(1).max(365).default(30),
});

// ── 劳动力 ───
export const LaborQuerySchema = z.object({
  days: z.coerce.number().int().min(1).max(365).default(7),
  warehouse_id: z.string().uuid().optional(),
  user_id: z.string().uuid().optional(),
});

// ── AI Summary ───
export const AISummarySchema = z.object({
  state: z.string().min(1).max(50),
  category: z.string().min(1).max(50),
  platform: z.string().min(1).max(50),
});

// ── RFQ ───
export const RFQSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email().max(255),
  company: z.string().max(200).optional(),
  state: z.string().max(50).optional(),
  category: z.string().max(50).optional(),
  platform: z.string().max(50).optional(),
  message: z.string().max(2000).optional(),
});

// ── API Key ───
export const ApiKeyCreateSchema = z.object({
  name: z.string().min(1).max(100),
  scopes: z.array(z.enum(["read", "write"])).min(1).max(2),
  expires_at: z.string().datetime().optional(),
});

// ── Billing Rate ───
export const BillingRateSchema = z.object({
  rates: z.array(z.object({
    charge_type: z.enum(["storage", "pick", "pack", "shipping", "receiving", "setup", "handling"]),
    charge_unit: z.enum(["per_pallet", "per_item", "per_order", "per_shipment", "per_hour", "per_container"]),
    rate: z.number().min(0),
    min_charge: z.string().optional(),
  })).min(1).max(200),
});

// ── Dock Appointment Update ───
export const DockAppointmentUpdateSchema = z.object({
  dock_door: z.string().max(20).optional(),
  scheduled_time: z.string().optional(),
  carrier: z.string().max(100).optional(),
  vehicle_type: z.string().max(50).optional(),
  status: z.enum(["scheduled", "checked_in", "loading", "completed", "cancelled", "no_show"]).optional(),
  notes: z.string().max(500).optional(),
  checked_in_at: z.string().optional(),
  checked_out_at: z.string().optional(),
});

// ── Document Generate ───
export const DocumentGenerateSchema = z.object({
  type: z.enum(["bol", "packing_slip", "commercial_invoice", "asn", "worksheet", "pick_list"]),
  order_id: z.string().uuid().optional(),
  receiving_id: z.string().uuid().optional(),
  format: z.enum(["pdf", "csv", "json"]).default("pdf"),
  data: z.record(z.string(), z.unknown()).optional(),
});

// ── Integration Sync ───
export const IntegrationSyncSchema = z.object({
  warehouse_id: z.string().uuid().optional(),
});

// ── Shopify Connect ───
export const ShopifyConnectSchema = z.object({
  action: z.enum(["connect", "test"]).optional(),
  shop: z.string().min(1).max(100),
  access_token: z.string().min(1).max(255),
});

// ── Kitting Operation ───
export const KittingOperationSchema = z.object({
  define: z.literal(true).optional(),
  kit_product_id: z.string().uuid().optional(),
  kit_sku: z.string().max(100).optional(),
  kit_name: z.string().max(255).optional(),
  components: z.array(z.object({
    product_id: z.string().uuid(),
    quantity: z.number().int().min(1),
  })).optional(),
  labor_cost: z.number().min(0).optional(),
  packaging_cost: z.number().min(0).optional(),
  disassemble: z.literal(true).optional(),
  warehouse_id: z.string().uuid().optional(),
  quantity: z.number().int().min(1).optional(),
  location_id: z.string().uuid().optional(),
});

// ── Notification Mark Read ───
export const NotificationMarkReadSchema = z.object({
  ids: z.array(z.string().uuid()).optional(),
  mark_all_read: z.boolean().optional(),
});

// ── OMS Route ───
export const OmsRouteSchema = z.object({
  order_id: z.string().uuid(),
  warehouse_id: z.string().uuid().optional(),
});

// ── Order Create ───
export const OrderCreateSchema = z.object({
  order_number: z.string().max(100).optional(),
  external_order_id: z.string().max(100).optional(),
  source: z.string().max(50).optional(),
  customer_name: z.string().max(200).optional(),
  customer_email: z.string().email().max(255).optional(),
  shipping_address_line1: z.string().max(255).optional(),
  shipping_address_line2: z.string().max(255).optional(),
  shipping_city: z.string().max(100).optional(),
  shipping_state: z.string().max(100).optional(),
  shipping_zip: z.string().max(20).optional(),
  shipping_country: z.string().max(2).optional(),
  priority: z.enum(["low", "normal", "high", "urgent"]).optional(),
  notes: z.string().max(2000).optional(),
  tracking_number: z.string().max(100).optional(),
  client_id: z.string().uuid().optional(),
  shipping_method: z.string().max(100).optional(),
  warehouse_id: z.string().uuid().optional(),
  created_at: z.string().optional(),
  order_items: z.array(z.object({
    product_id: z.string().uuid(),
    quantity_ordered: z.number().int().min(1),
    unit_price: z.number().min(0).optional(),
    notes: z.string().max(500).optional(),
  })).max(500).optional(),
});

// ── Scanner Lookup ───
export const ScannerLookupSchema = z.object({
  barcode: z.string().min(1).max(200),
  warehouseId: z.string().uuid().optional(),
});

// ── Scanner Pick Confirm ───
export const ScannerPickConfirmSchema = z.object({
  pickItemId: z.string().uuid(),
  quantityPicked: z.number().int().min(1),
});

// ── Scanner Receive ───
export const ScannerReceiveSchema = z.object({
  receivingId: z.string().uuid(),
  warehouseId: z.string().uuid(),
  items: z.array(z.object({
    product_id: z.string().uuid(),
    quantity_received: z.number().int().min(1),
    location_id: z.string().uuid().optional(),
    lot_number: z.string().max(50).optional(),
    expiration_date: z.string().optional(),
  })).min(1).max(500),
});

// ── Shipping Create Shipment ───
export const ShippingCreateShipmentSchema = z.object({
  orderId: z.string().uuid(),
  carrier: z.string().min(1).max(100),
  serviceLevel: z.string().max(100).optional(),
  trackingNumber: z.string().max(100).optional(),
  shippingCost: z.number().min(0).optional(),
  labelUrl: z.string().url().optional().or(z.literal("")),
  packageId: z.string().uuid().optional(),
  rateId: z.string().max(100).optional(),
});

// ── Shipping Rates ───
export const ShippingRatesSchema = z.object({
  orderId: z.string().uuid().optional(),
  originZip: z.string().max(10).optional(),
  destinationZip: z.string().max(10).optional(),
  weightLbs: z.number().min(0.1).optional(),
  lengthIn: z.number().min(0).optional(),
  widthIn: z.number().min(0).optional(),
  heightIn: z.number().min(0).optional(),
  isResidential: z.boolean().optional(),
  isHazmat: z.boolean().optional(),
  declaredValue: z.number().min(0).optional(),
  carrier: z.string().max(50).optional(),
  serviceLevel: z.string().max(50).optional(),
});

// ── Webhook Create ───
export const WebhookCreateSchema = z.object({
  name: z.string().min(1).max(200),
  url: z.string().url().max(1000),
  events: z.array(z.string().min(1).max(100)).min(1).max(50),
});

// ── Automation Trigger ───
export const AutomationTriggerSchema = z.object({
  trigger: z.string().min(1).max(100).optional(),
  data: z.record(z.string(), z.unknown()).optional(),
  test: z.boolean().optional(),
  rule: AutomationRuleSchema.optional(),
  sampleData: z.record(z.string(), z.unknown()).optional(),
});

// ── Auth ───
export const AuthSchema = z.object({
  action: z.enum(["register", "login"]),
  email: z.string().email().max(255),
  password: z.string().min(1).max(128),
  name: z.string().max(100).optional(),
  tenant_id: z.string().uuid().optional(),
});

export const PortalAuthSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(1).max(128),
});

export const OAuthCallbackSchema = z.object({
  platform: z.string().min(1).max(50),
  code: z.string().min(1).max(2000),
  state: z.string().max(500).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
