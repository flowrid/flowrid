/**
 * 公开运费计算 API — 无需登录
 * 复用 SaaS 运费引擎的费率表，计算 USPS/UPS/FedEx 三家比价
 */

import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const RATE_TABLE: Record<string, Record<string, { basePerLb: number; minCharge: number; maxWeight: number }>> = {
  usps: {
    ground_advantage: { basePerLb: 0.55, minCharge: 5.25, maxWeight: 70 },
    priority_mail:    { basePerLb: 0.85, minCharge: 9.35, maxWeight: 70 },
    priority_express: { basePerLb: 1.40, minCharge: 28.75, maxWeight: 70 },
  },
  ups: {
    ground:       { basePerLb: 0.72, minCharge: 10.10, maxWeight: 150 },
    three_day:    { basePerLb: 0.95, minCharge: 15.40, maxWeight: 150 },
    second_day:   { basePerLb: 1.30, minCharge: 23.20, maxWeight: 150 },
    next_day:     { basePerLb: 2.10, minCharge: 35.00, maxWeight: 150 },
  },
  fedex: {
    ground:        { basePerLb: 0.68, minCharge: 9.85, maxWeight: 150 },
    express_saver: { basePerLb: 1.05, minCharge: 16.80, maxWeight: 150 },
    two_day:       { basePerLb: 1.45, minCharge: 24.90, maxWeight: 150 },
    overnight:     { basePerLb: 2.30, minCharge: 36.50, maxWeight: 150 },
  },
};

const CARRIER_NAMES: Record<string, string> = { usps: "USPS", ups: "UPS", fedex: "FedEx" };
const CARRIER_LOGOS: Record<string, string> = { usps: "📮", ups: "📦", fedex: "🚚" };

const SERVICE_NAMES: Record<string, string> = {
  ground_advantage: "Ground Advantage", priority_mail: "Priority Mail", priority_express: "Priority Express",
  ground: "Ground", three_day: "3-Day Select", second_day: "2nd Day Air", next_day: "Next Day Air",
  express_saver: "Express Saver", two_day: "2Day", overnight: "Overnight",
};

const DELIVERY_DAYS: Record<string, Record<string, Record<string, number>>> = {
  usps: {
    ground_advantage: { "1": 2, "2": 2, "3": 3, "4": 3, "5": 4, "6": 4, "7": 5, "8": 5, "9": 6 },
    priority_mail:    { "1": 1, "2": 1, "3": 2, "4": 2, "5": 2, "6": 3, "7": 3, "8": 3, "9": 4 },
    priority_express: { "1": 1, "2": 1, "3": 1, "4": 1, "5": 2, "6": 2, "7": 2, "8": 2, "9": 2 },
  },
  ups: {
    ground:     { "1": 1, "2": 1, "3": 2, "4": 2, "5": 3, "6": 3, "7": 4, "8": 4, "9": 5 },
    three_day:  { "1": 1, "2": 1, "3": 2, "4": 2, "5": 2, "6": 2, "7": 2, "8": 2, "9": 3 },
    second_day: { "1": 1, "2": 1, "3": 1, "4": 1, "5": 2, "6": 2, "7": 2, "8": 2, "9": 2 },
    next_day:   { "1": 1, "2": 1, "3": 1, "4": 1, "5": 1, "6": 1, "7": 1, "8": 1, "9": 1 },
  },
  fedex: {
    ground:        { "1": 1, "2": 1, "3": 2, "4": 2, "5": 3, "6": 3, "7": 4, "8": 5, "9": 5 },
    express_saver: { "1": 1, "2": 1, "3": 2, "4": 2, "5": 2, "6": 3, "7": 3, "8": 3, "9": 3 },
    two_day:       { "1": 1, "2": 1, "3": 1, "4": 1, "5": 2, "6": 2, "7": 2, "8": 2, "9": 2 },
    overnight:     { "1": 1, "2": 1, "3": 1, "4": 1, "5": 1, "6": 1, "7": 1, "8": 1, "9": 1 },
  },
};

function getZone(originZip: string, destZip: string): number {
  const o3 = parseInt((originZip || "").substring(0, 3), 10) || 0;
  const d3 = parseInt((destZip || "").substring(0, 3), 10) || 0;
  const diff = Math.abs(o3 - d3);
  if (diff <= 50) return 1; else if (diff <= 150) return 3; else if (diff <= 300) return 5; else if (diff <= 500) return 7;
  return 9;
}

function dimWeight(l: number, w: number, h: number): number { return Math.ceil((l * w * h) / 139); }

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const originZip = String(body.originZip || "60601").slice(0, 5);
    const destZip = String(body.destZip || "90210").slice(0, 5);
    const weightLbs = Math.max(0.1, Number(body.weightLbs) || 5);
    const lengthIn = Math.max(1, Number(body.lengthIn) || 12);
    const widthIn = Math.max(1, Number(body.widthIn) || 8);
    const heightIn = Math.max(1, Number(body.heightIn) || 6);
    const isResidential = body.isResidential !== false;

    const dw = dimWeight(lengthIn, widthIn, heightIn);
    const billableWeight = Math.round(Math.max(weightLbs, dw) * 10) / 10;
    const zone = getZone(originZip, destZip);
    const zoneKey = zone.toString();

    const quotes: Array<{ carrier: string; carrierName: string; carrierLogo: string; serviceLevel: string; serviceName: string; totalCost: number; baseRate: number; fuelSurcharge: number; residentialSurcharge: number; dimensionalWeight: number; billableWeight: number; estimatedDays: number; deliveryDate: string }> = [];

    for (const [carrier, services] of Object.entries(RATE_TABLE)) {
      for (const [serviceLevel, config] of Object.entries(services)) {
        if (billableWeight > config.maxWeight) continue;
        const baseRate = Math.round(Math.max(config.minCharge, billableWeight * config.basePerLb) * 100) / 100;
        const fuelSurcharge = Math.round(baseRate * 0.125 * 100) / 100;
        const residentialSurcharge = isResidential ? 4.95 : 0;
        const totalCost = Math.round((baseRate + fuelSurcharge + residentialSurcharge) * 100) / 100;
        const carrierDays = DELIVERY_DAYS[carrier];
        const serviceDays = carrierDays?.[serviceLevel];
        const days = serviceDays?.[zoneKey] ?? 5;
        const deliveryDate = new Date(); deliveryDate.setDate(deliveryDate.getDate() + days);
        quotes.push({ carrier, carrierName: CARRIER_NAMES[carrier] || carrier, carrierLogo: CARRIER_LOGOS[carrier] || "📦", serviceLevel, serviceName: SERVICE_NAMES[serviceLevel] || serviceLevel, totalCost, baseRate, fuelSurcharge, residentialSurcharge: isResidential ? 4.95 : 0, dimensionalWeight: dw, billableWeight, estimatedDays: days, deliveryDate: deliveryDate.toISOString().split("T")[0] });
      }
    }

    quotes.sort((a, b) => a.totalCost - b.totalCost);

    // 找最优：最便宜 / 最快 / 性价比
    const cheapest = quotes[0];
    const fastest = [...quotes].sort((a, b) => a.estimatedDays - b.estimatedDays)[0];
    const bestValue = [...quotes].sort((a, b) => (a.totalCost / Math.max(a.estimatedDays, 1)) - (b.totalCost / Math.max(b.estimatedDays, 1)))[0];

    const savingsMsg = quotes.length >= 2
      ? `Comparing carriers saves up to $${Math.round((quotes[quotes.length - 1].totalCost - cheapest.totalCost) * 100) / 100} (${Math.round((1 - cheapest.totalCost / quotes[quotes.length - 1].totalCost) * 100)}%) vs the most expensive option.`
      : "";

    return NextResponse.json({ quotes, cheapest, fastest, bestValue, zone, billableWeight, savingsMsg });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Failed to calculate rates" }, { status: 500 });
  }
}
