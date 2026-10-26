import { QueryError } from "../http/errors";
import { priceCart, type PricedCart } from "../services/checkout-pricing.service";
import type { BaseDeliveryPartner } from "../services/delivery/base-delivery-partner";
import { estimateDelivery } from "../services/delivery/delivery-estimate.service";
import { deliveryPartners, findDeliveryPartner } from "../services/delivery/delivery-partners";
import type { DeliveryEstimate, DeliveryPartnerOption } from "../types/delivery.types";

type Raw = Record<string, unknown>;

const PINCODE = /^[1-9]\d{5}$/;

export function partnerFrom(payload: unknown): BaseDeliveryPartner {
  const id: unknown = ((payload ?? {}) as Raw).deliveryPartner;
  const partner: BaseDeliveryPartner | undefined = typeof id === "string" ? findDeliveryPartner(id) : undefined;
  if (!partner) throw new QueryError("Choose a delivery partner");
  return partner;
}

export const deliveryController = {
  partners(): DeliveryPartnerOption[] {
    return deliveryPartners().map((partner: BaseDeliveryPartner): DeliveryPartnerOption => partner.option());
  },

  async estimate(payload: unknown): Promise<DeliveryEstimate> {
    const partner: BaseDeliveryPartner = partnerFrom(payload);
    const pincode: unknown = ((payload ?? {}) as Raw).pincode;
    if (typeof pincode !== "string" || !PINCODE.test(pincode.trim())) throw new QueryError("Enter a valid 6-digit PIN code");
    const cart: PricedCart = await priceCart(payload);
    return estimateDelivery(partner, pincode.trim(), cart);
  },
};
