import { QueryError } from "../../http/errors";
import type { DeliveryEstimate, DeliveryQuote } from "../../types/delivery.types";
import type { PricedCart } from "../checkout-pricing.service";
import type { BaseDeliveryPartner } from "./base-delivery-partner";

const DAY_MS = 24 * 60 * 60 * 1000;
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
const CUTOFF_HOUR_IST = 18;

export function estimatedDeliveryDate(manufacturingDays: number, transitDays: number, now: Date = new Date()): string {
  const ist: Date = new Date(now.getTime() + IST_OFFSET_MS);
  const lateOrderDays: number = ist.getUTCHours() >= CUTOFF_HOUR_IST ? 1 : 0;
  const total: number = manufacturingDays + transitDays + lateOrderDays;
  return new Date(ist.getTime() + total * DAY_MS).toISOString().slice(0, 10);
}

export async function estimateDelivery(
  partner: BaseDeliveryPartner,
  destinationPincode: string,
  cart: PricedCart,
): Promise<DeliveryEstimate> {
  const origin: string | undefined = process.env.WAREHOUSE_PINCODE;
  if (!origin) throw new Error("WAREHOUSE_PINCODE is not set");
  const quote: DeliveryQuote = await partner.quote(origin, destinationPincode, cart.weightGrams);
  const estimatedDate: string | null =
    quote.transitDays === null ? null : estimatedDeliveryDate(cart.manufacturingDays, quote.transitDays);
  return { ...quote, manufacturingDays: cart.manufacturingDays, estimatedDate };
}

export function requireServiceable(estimate: DeliveryEstimate): asserts estimate is DeliveryEstimate & {
  transitDays: number;
  estimatedDate: string;
} {
  if (!estimate.serviceable || estimate.transitDays === null || estimate.estimatedDate === null) {
    throw new QueryError("The selected delivery partner does not deliver to your PIN code");
  }
}
