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
  const o3 = parseInt(originZip.substring(0, 3), 10) || 0;
  const d3 = parseInt(destZip.substring(0, 3), 10) || 0;
  const diff = Math.abs(o3 - d3);
  if (diff <= 50) return 1;
  if (diff <= 150) return 3;
  if (diff <= 300) return 5;
  if (diff <= 500) return 7;
  return 9;
}

function dimWeight(l: number, w: number, h: number): number {
  return Math.ceil((l * w * h) / 139);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const originZip = body.originZip || "75201";
    const destZip = body.destinationZip || body.destZip || "10001";
    const weightLbs = Number(body.weightLbs || body.weight || 5);
    const lengthIn = Number(body.lengthIn || body.length || 12);
    const widthIn = Number(body.widthIn || body.width || 8);
    const heightIn = Number(body.heightIn || body.height || 6);
    const isResidential = body.isResidential ?? true;
    const isHazmat = body.isHazmat ?? false;

    const dw = dimWeight(lengthIn, widthIn, heightIn);
    const billableWeight = Math.max(weightLbs, dw);
    const zone = getZone(originZip, destZip);
    const zoneKey = zone.toString();

    const quotes: Array<{
      carrier: string; carrierName: string; serviceLevel: string; serviceName: string;
      totalCost: number; baseRate: number; fuelSurcharge: number; residentialSurcharge: number;
      dimensionalWeight: number; billableWeight: number; estimatedDays: number;
      deliveryDate: string; isSimulated: boolean;
    }> = [];

    for (const [carrier, services] of Object.entries(RATE_TABLE)) {
      for (const [serviceLevel, config] of Object.entries(services)) {
        if (billableWeight > config.maxWeight) continue;

        const baseRate = Math.round(Math.max(config.minCharge, billableWeight * config.basePerLb) * 100) / 100;
        const fuelSurcharge = Math.round(baseRate * 0.125 * 100) / 100;
        const residentialSurcharge = isResidential ? 4.95 : 0;
        const hazmatSurcharge = isHazmat ? 35.00 : 0;
        const totalCost = Math.round((baseRate + fuelSurcharge + residentialSurcharge + hazmatSurcharge) * 100) / 100;

        const carrierDays = DELIVERY_DAYS[carrier];
        const serviceDays = carrierDays?.[serviceLevel];
        const days = serviceDays?.[zoneKey] ?? 5;

        const deliveryDate = new Date();
        deliveryDate.setDate(deliveryDate.getDate() + days);

        quotes.push({
          carrier,
          carrierName: CARRIER_NAMES[carrier] || carrier,
          serviceLevel,
          serviceName: SERVICE_NAMES[serviceLevel] || serviceLevel,
          totalCost,
          baseRate,
          fuelSurcharge,
          residentialSurcharge,
          dimensionalWeight: dw,
          billableWeight,
          estimatedDays: days,
          deliveryDate: deliveryDate.toISOString().split("T")[0],
          isSimulated: true,
        });
      }
    }

    quotes.sort((a, b) => a.totalCost - b.totalCost);

    return NextResponse.json({ quotes });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Failed to calculate rates" }, { status: 500 });
  }
}
