import { QueryError } from "../http/errors";
import type { BaseDeliveryPartner } from "../services/delivery/base-delivery-partner";
import { deliveryPartners, findDeliveryPartner } from "../services/delivery/delivery-partners";
import type { DeliveryEstimate, DeliveryPartnerOption } from "../types/delivery.types";

const PINCODE = /^\d{6}$/;

export const deliveryController = {
  partners(): DeliveryPartnerOption[] {
    return deliveryPartners().map((partner: BaseDeliveryPartner): DeliveryPartnerOption => partner.option());
  },

  async estimate(params: URLSearchParams): Promise<DeliveryEstimate> {
    const partner: BaseDeliveryPartner | undefined = findDeliveryPartner(params.get("partner") ?? "");
    if (!partner) throw new QueryError("Unknown delivery partner");
    const pincode: string = (params.get("pincode") ?? "").trim();
    if (!PINCODE.test(pincode)) throw new QueryError("Enter a valid 6-digit PIN code");
    const origin: string | undefined = process.env.WAREHOUSE_PINCODE;
    if (!origin) throw new Error("WAREHOUSE_PINCODE is not set");
    return partner.estimate(origin, pincode);
  },
};
