// Flowrid Shipping Rate Calculation Engine
// Aggregates quotes from all carriers and sorts by total cost

import type { ShipmentRequest, RateQuote } from "@/types/saas";
import { getAllCarrierAdapters } from "@/lib/shipping-carriers";

export async function getRateQuotes(request: ShipmentRequest): Promise<RateQuote[]> {
  const adapters = getAllCarrierAdapters();
  const allQuotes: RateQuote[] = [];

  for (const adapter of adapters) {
    try {
      const quotes = await adapter.getRates(request);
      allQuotes.push(...quotes);
    } catch {
      // Carrier unavailable — skip
    }
  }

  return allQuotes.sort((a, b) => a.totalCost - b.totalCost);
}

export function calculateDimensionalWeight(l: number, w: number, h: number, divisor = 139): number {
  return Math.ceil((l * w * h) / divisor);
}

export function calculateBillableWeight(actual: number, dim: number): number {
  return Math.max(actual, dim);
}
