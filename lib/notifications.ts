/**
 * Flowrid SaaS — 订单通知引擎
 *
 * 订单状态变更 → 自动邮件通知客户
 * 支持 Resend（默认）和 SMTP
 */

import { Resend } from "resend";

const RESEND_API_KEY = process.env.RESEND_API_KEY || "";
const FROM_EMAIL = "Flowrid WMS <notifications@flowrid.com>";

// ==========================================
// 邮件发送
// ==========================================

async function sendEmail(to: string, subject: string, html: string) {
  // 如果有 Resend key，走 Resend
  if (RESEND_API_KEY) {
    const resend = new Resend(RESEND_API_KEY);
    const { data, error } = await resend.emails.send({ from: FROM_EMAIL, to, subject, html });
    if (error) { console.error("Resend error:", error); return false; }
    return true;
  }

  // 无 key 时打印到控制台
  console.log(`[EMAIL DEMO] To: ${to} | Subject: ${subject}`);
  console.log(html.substring(0, 200));
  return true;
}

// ==========================================
// 状态变更通知模板
// ==========================================

const STATUS_EMAILS: Record<string, { subject: string; body: (order: any, client: any) => string }> = {
  pending: {
    subject: "Your order {order_number} has been received",
    body: (o, c) => `
      <div style="font-family: -apple-system, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #1D1D1F;">Order Received</h2>
        <p>Hi ${o.customer_name || c?.name || "there"},</p>
        <p>Your order <strong>${o.order_number}</strong> has been received and is being processed.</p>
        <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 20px 0;">
        <p style="font-size: 12px; color: #86868B;">Powered by Flowrid WMS</p>
      </div>`,
  },
  shipped: {
    subject: "Your order {order_number} has shipped!",
    body: (o, c) => `
      <div style="font-family: -apple-system, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #1D1D1F;">Order Shipped</h2>
        <p>Hi ${o.customer_name || c?.name || "there"},</p>
        <p>Great news! Your order <strong>${o.order_number}</strong> has been shipped.</p>
        ${o.tracking_number ? `<p>Tracking: <strong>${o.tracking_number}</strong></p>` : ""}
        <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 20px 0;">
        <p style="font-size: 12px; color: #86868B;">Powered by Flowrid WMS</p>
      </div>`,
  },
  delivered: {
    subject: "Your order {order_number} has been delivered",
    body: (o, c) => `
      <div style="font-family: -apple-system, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #1D1D1F;">Order Delivered</h2>
        <p>Hi ${o.customer_name || c?.name || "there"},</p>
        <p>Your order <strong>${o.order_number}</strong> has been delivered.</p>
        <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 20px 0;">
        <p style="font-size: 12px; color: #86868B;">Powered by Flowrid WMS</p>
      </div>`,
  },
  cancelled: {
    subject: "Your order {order_number} has been cancelled",
    body: (o, c) => `
      <div style="font-family: -apple-system, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #1D1D1F;">Order Cancelled</h2>
        <p>Hi ${o.customer_name || c?.name || "there"},</p>
        <p>Your order <strong>${o.order_number}</strong> has been cancelled. Contact us with any questions.</p>
        <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 20px 0;">
        <p style="font-size: 12px; color: #86868B;">Powered by Flowrid WMS</p>
      </div>`,
  },
};

// ==========================================
// 核心：订单状态变更 → 发通知
// ==========================================

export async function notifyOrderStatusChange(
  order: { order_number: string; customer_name?: string; customer_email?: string; status: string; tracking_number?: string },
  client?: { name: string; email: string } | null
) {
  const email = order.customer_email || client?.email;
  if (!email) return;

  const template = STATUS_EMAILS[order.status];
  if (!template) return;

  const subject = template.subject.replace("{order_number}", order.order_number);
  const html = template.body(order, client);

  await sendEmail(email, subject, html);
}

// ==========================================
// 手动发送自定义通知
// ==========================================

export async function sendCustomNotification(
  to: string,
  subject: string,
  message: string
) {
  const html = `
    <div style="font-family: -apple-system, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
      <p>${message}</p>
      <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 20px 0;">
      <p style="font-size: 12px; color: #86868B;">Powered by Flowrid WMS</p>
    </div>`;
  return sendEmail(to, subject, html);
}

// ==========================================
// 批量通知（如每日汇总）
// ==========================================

export async function sendDailyDigest(
  to: string,
  stats: { totalOrders: number; shipped: number; pending: number }
) {
  const html = `
    <div style="font-family: -apple-system, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
      <h2 style="color: #1D1D1F;">Daily Fulfillment Summary</h2>
      <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
        <tr><td style="padding: 8px 0;">Total Orders</td><td style="text-align: right; font-weight: bold;">${stats.totalOrders}</td></tr>
        <tr><td style="padding: 8px 0;">Shipped</td><td style="text-align: right; font-weight: bold; color: #34C759;">${stats.shipped}</td></tr>
        <tr><td style="padding: 8px 0;">Pending</td><td style="text-align: right; font-weight: bold; color: #FF9500;">${stats.pending}</td></tr>
      </table>
      <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 20px 0;">
      <p style="font-size: 12px; color: #86868B;">Powered by Flowrid WMS</p>
    </div>`;
  return sendEmail(to, "Daily Fulfillment Summary", html);
}
