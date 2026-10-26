import type { InvoiceEntry } from "../types/order.types";

interface InvoiceInput {
  subtotal: number;
  tinglePointsValue: number;
  tinglePointsUsed: number;
  couponDiscount: number;
  couponCode: string | null;
  deliveryCharge: number;
  deliveryPartnerName: string;
}

export function buildInvoiceData(input: InvoiceInput): InvoiceEntry[] {
  const entries: InvoiceEntry[] = [{ type: "charge", code: "items", label: "Items subtotal", amount: input.subtotal }];
  if (input.tinglePointsValue > 0) {
    entries.push({
      type: "discount",
      code: "tingle_points",
      label: `Tingle Points (${input.tinglePointsUsed})`,
      amount: input.tinglePointsValue,
    });
  }
  if (input.couponDiscount > 0) {
    entries.push({
      type: "discount",
      code: "coupon",
      label: input.couponCode ? `Coupon (${input.couponCode})` : "Coupon",
      amount: input.couponDiscount,
    });
  }
  if (input.deliveryCharge > 0) {
    entries.push({
      type: "charge",
      code: "delivery",
      label: `Delivery (${input.deliveryPartnerName})`,
      amount: input.deliveryCharge,
    });
  }
  return entries;
}

export const invoiceTotal = (entries: InvoiceEntry[]): number =>
  entries.reduce((sum: number, entry: InvoiceEntry): number => sum + (entry.type === "charge" ? entry.amount : -entry.amount), 0);
