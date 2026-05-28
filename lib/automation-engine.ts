// 自动化规则引擎 — Automation Rules Engine
// Event → Condition → Action 模式

import { createServiceClient } from "@/lib/supabase";

export type TriggerEvent =
  | "order.created"
  | "order.status_changed"
  | "order.shipped"
  | "inventory.low_stock"
  | "inventory.out_of_stock"
  | "shipment.delivered"
  | "return.created"
  | "pick_task.completed";

export type RuleAction =
  | "send_notification"
  | "send_email"
  | "create_task"
  | "update_order_status"
  | "assign_picker"
  | "create_shipment"
  | "webhook";

export interface AutomationRule {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  trigger: TriggerEvent;
  conditions: RuleCondition[];
  actions: RuleActionConfig[];
  isActive: boolean;
  priority: number;
  cooldownMinutes?: number;
}

export interface RuleCondition {
  field: string;
  operator: "equals" | "not_equals" | "contains" | "gt" | "lt" | "gte" | "lte" | "in";
  value: any;
}

export interface RuleActionConfig {
  type: RuleAction;
  config: Record<string, any>;
}

interface EventPayload {
  event: TriggerEvent;
  tenantId: string;
  entityId: string;
  data: Record<string, any>;
  timestamp: string;
}

/**
 * 评估并执行匹配的自动化规则
 */
export async function evaluateRules(payload: EventPayload): Promise<{ triggered: string[]; errors: string[] }> {
  const supabase = createServiceClient();
  if (!supabase) return { triggered: [], errors: ["Database unavailable"] };

  const { data: rules } = await supabase
    .from("automation_rules")
    .select("*")
    .eq("tenant_id", payload.tenantId)
    .eq("is_active", true)
    .eq("trigger_event", payload.event)
    .order("priority", { ascending: true });

  if (!rules?.length) return { triggered: [], errors: [] };

  const triggered: string[] = [];
  const errors: string[] = [];

  for (const rule of rules) {
    try {
      if (!evaluateConditions(rule.conditions || [], payload.data)) continue;

      for (const action of (rule.actions || [])) {
        await executeAction(action, payload, supabase);
      }

      // 更新最后触发时间
      await supabase
        .from("automation_rules")
        .update({ last_triggered_at: new Date().toISOString() })
        .eq("id", rule.id);

      triggered.push(rule.id);

      // 插入执行日志
      await supabase.from("automation_logs").insert({
        rule_id: rule.id,
        tenant_id: payload.tenantId,
        event: payload.event,
        entity_id: payload.entityId,
        success: true,
      });
    } catch (err: any) {
      errors.push(`Rule ${rule.name}: ${err.message}`);
      await supabase.from("automation_logs").insert({
        rule_id: rule.id,
        tenant_id: payload.tenantId,
        event: payload.event,
        entity_id: payload.entityId,
        success: false,
        error: err.message,
      });
    }
  }

  return { triggered, errors };
}

function evaluateConditions(conditions: RuleCondition[], data: Record<string, any>): boolean {
  if (!conditions?.length) return true;

  return conditions.every((cond) => {
    const val = cond.field.split(".").reduce((obj, key) => obj?.[key], data);
    switch (cond.operator) {
      case "equals": return val === cond.value;
      case "not_equals": return val !== cond.value;
      case "contains": return String(val || "").includes(String(cond.value));
      case "gt": return Number(val) > Number(cond.value);
      case "lt": return Number(val) < Number(cond.value);
      case "gte": return Number(val) >= Number(cond.value);
      case "lte": return Number(val) <= Number(cond.value);
      case "in": return Array.isArray(cond.value) && cond.value.includes(val);
      default: return false;
    }
  });
}

async function executeAction(action: RuleActionConfig, payload: EventPayload, supabase: any) {
  switch (action.type) {
    case "send_notification": {
      await supabase.from("notifications").insert({
        tenant_id: payload.tenantId,
        user_id: action.config.user_id,
        title: action.config.title || `Automation: ${payload.event}`,
        body: action.config.body || JSON.stringify(payload.data),
        type: action.config.notification_type || "info",
      });
      break;
    }
    case "update_order_status": {
      await supabase
        .from("orders")
        .update({ status: action.config.status, updated_at: new Date().toISOString() })
        .eq("id", payload.entityId);
      break;
    }
    case "create_task": {
      await supabase.from("pick_tasks").insert({
        tenant_id: payload.tenantId,
        warehouse_id: action.config.warehouse_id,
        assigned_to: action.config.assignee_id,
        status: "pending",
        priority: action.config.priority || "normal",
      });
      break;
    }
    case "webhook": {
      if (action.config.url) {
        await fetch(action.config.url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ event: payload.event, data: payload.data, timestamp: payload.timestamp }),
        });
      }
      break;
    }
    case "send_email":
    case "assign_picker":
    case "create_shipment":
      // 预留扩展
      break;
  }
}

/**
 * 便捷函数 — 在业务关键点触发规则
 */
export async function triggerEvent(
  tenantId: string,
  event: TriggerEvent,
  entityId: string,
  data: Record<string, any> = {}
) {
  // 异步执行，不阻塞主流程
  evaluateRules({
    event,
    tenantId,
    entityId,
    data,
    timestamp: new Date().toISOString(),
  }).catch(() => {});
}
