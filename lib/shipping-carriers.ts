// Flowrid Shipping Carrier Adapter Interface
// Pluggable architecture: simulator now, real APIs later

import type { ShipmentRequest, RateQuote } from "@/types/saas";

export interface CarrierAdapter {
  carrier: string;
  carrierName: string;
  isAvailable: boolean;
  validateCredentials?(): Promise<boolean>;
  getRates(request: ShipmentRequest): Promise<RateQuote[]>;
}


// Simulated rate tables — reasonable approximations of 2025 commercial rates
const RATE_TABLE: Record<string, Record<string, { basePerLb: number; minCharge: number; maxWeight: number; deliveryDays: Record<string, number> }>> = {
  usps: {
    ground_advantage: { basePerLb: 0.55, minCharge: 5.25, maxWeight: 70, deliveryDays: { "1": 2, "2": 2, "3": 3, "4": 3, "5": 4, "6": 4, "7": 5, "8": 5, "9": 6 } },
    priority_mail:    { basePerLb: 0.85, minCharge: 9.35, maxWeight: 70, deliveryDays: { "1": 1, "2": 1, "3": 2, "4": 2, "5": 2, "6": 3, "7": 3, "8": 3, "9": 4 } },
    priority_express: { basePerLb: 1.40, minCharge: 28.75, maxWeight: 70, deliveryDays: { "1": 1, "2": 1, "3": 1, "4": 1, "5": 2, "6": 2, "7": 2, "8": 2, "9": 2 } },
  },
  ups: {
    ground:       { basePerLb: 0.72, minCharge: 10.10, maxWeight: 150, deliveryDays: { "1": 1, "2": 1, "3": 2, "4": 2, "5": 3, "6": 3, "7": 4, "8": 4, "9": 5 } },
    three_day:    { basePerLb: 0.95, minCharge: 15.40, maxWeight: 150, deliveryDays: { "1": 1, "2": 1, "3": 2, "4": 2, "5": 2, "6": 2, "7": 2, "8": 2, "9": 3 } },
    second_day:   { basePerLb: 1.30, minCharge: 23.20, maxWeight: 150, deliveryDays: { "1": 1, "2": 1, "3": 1, "4": 1, "5": 2, "6": 2, "7": 2, "8": 2, "9": 2 } },
    next_day:     { basePerLb: 2.10, minCharge: 35.00, maxWeight: 150, deliveryDays: { "1": 1, "2": 1, "3": 1, "4": 1, "5": 1, "6": 1, "7": 1, "8": 1, "9": 1 } },
  },
  fedex: {
    ground:       { basePerLb: 0.68, minCharge: 9.85, maxWeight: 150, deliveryDays: { "1": 1, "2": 1, "3": 2, "4": 2, "5": 3, "6": 3, "7": 4, "8": 5, "9": 5 } },
    express_saver:{ basePerLb: 1.05, minCharge: 16.80, maxWeight: 150, deliveryDays: { "1": 1, "2": 1, "3": 2, "4": 2, "5": 2, "6": 3, "7": 3, "8": 3, "9": 3 } },
    two_day:      { basePerLb: 1.45, minCharge: 24.90, maxWeight: 150, deliveryDays: { "1": 1, "2": 1, "3": 1, "4": 1, "5": 2, "6": 2, "7": 2, "8": 2, "9": 2 } },
    overnight:    { basePerLb: 2.30, minCharge: 36.50, maxWeight: 150, deliveryDays: { "1": 1, "2": 1, "3": 1, "4": 1, "5": 1, "6": 1, "7": 1, "8": 1, "9": 1 } },
  },
};

const CARRIER_NAMES: Record<string, string> = {
  usps: "USPS",
  ups: "UPS",
  fedex: "FedEx",
};

const SERVICE_NAMES: Record<string, string> = {
  ground_advantage: "Ground Advantage",
  priority_mail: "Priority Mail",
  priority_express: "Priority Express",
  ground: "Ground",
  three_day: "3-Day Select",
  second_day: "2nd Day Air",
  next_day: "Next Day Air",
  express_saver: "Express Saver",
  two_day: "2Day",
  overnight: "Overnight",
};

function getDistanceZone(originZip: string, destZip: string): number {
  const o3 = parseInt(originZip.substring(0, 3), 10) || 0;
  const d3 = parseInt(destZip.substring(0, 3), 10) || 0;
  const diff = Math.abs(o3 - d3);
  if (diff <= 50) return 1;
  if (diff <= 150) return 3;
  if (diff <= 300) return 5;
  if (diff <= 500) return 7;
  return 9;
}

function calculateDimensionalWeight(l: number, w: number, h: number, divisor = 139): number {
  return Math.ceil((l * w * h) / divisor);
}

class SimulatedCarrier implements CarrierAdapter {
  carrier: string;
  carrierName: string;
  isAvailable = true;

  constructor(carrier: string) {
    this.carrier = carrier;
    this.carrierName = CARRIER_NAMES[carrier] || carrier;
  }

  async getRates(request: ShipmentRequest): Promise<RateQuote[]> {
    const table = RATE_TABLE[this.carrier];
    if (!table) return [];

    const dimWeight = calculateDimensionalWeight(request.lengthIn, request.widthIn, request.heightIn);
    const billableWeight = Math.max(request.weightLbs, dimWeight);
    const zone = getDistanceZone(request.originZip, request.destinationZip);
    const zoneKey = zone.toString();

    const quotes: RateQuote[] = [];

    for (const [serviceLevel, config] of Object.entries(table)) {
      if (billableWeight > config.maxWeight) continue;

      const baseRate = Math.max(config.minCharge, billableWeight * config.basePerLb);
      const fuelSurcharge = Math.round(baseRate * 0.125 * 100) / 100;
      const residentialSurcharge = request.isResidential ? 4.95 : 0;
      const hazmatSurcharge = request.isHazmat ? 35.00 : 0;
      const totalCost = Math.round((baseRate + fuelSurcharge + residentialSurcharge + hazmatSurcharge) * 100) / 100;
      const days = config.deliveryDays[zoneKey] || 5;

      const deliveryDate = new Date();
      deliveryDate.setDate(deliveryDate.getDate() + days);

      quotes.push({
        carrier: this.carrier,
        carrierName: this.carrierName,
        serviceLevel,
        serviceName: SERVICE_NAMES[serviceLevel] || serviceLevel,
        totalCost,
        baseRate: Math.round(baseRate * 100) / 100,
        fuelSurcharge,
        residentialSurcharge,
        dimensionalWeight: dimWeight,
        billableWeight,
        estimatedDays: days,
        deliveryDate: deliveryDate.toISOString().split("T")[0],
        isSimulated: true,
      });
    }

    return quotes.sort((a, b) => a.totalCost - b.totalCost);
  }
}

export function getCarrierAdapter(carrier: string): CarrierAdapter {
  return new SimulatedCarrier(carrier);
}

export function getAllCarrierAdapters(): CarrierAdapter[] {
  return Object.keys(RATE_TABLE).map((c) => new SimulatedCarrier(c));
}
