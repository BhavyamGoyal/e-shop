import { request } from "@/lib/api-request";
import { toRequestLines } from "@/lib/cart-request";
import type { CartItem } from "@/stores/cart/Cart.types";
import type { DeliveryEstimate, DeliveryPartnerOption } from "@/server/types/delivery.types";

export const fetchDeliveryPartners = async (): Promise<DeliveryPartnerOption[]> =>
  (await request<{ data: DeliveryPartnerOption[] }>("GET", "/api/delivery/partners")).data;

export const fetchDeliveryEstimate = async (
  partnerId: string,
  pincode: string,
  items: CartItem[],
): Promise<DeliveryEstimate> =>
  (
    await request<{ data: DeliveryEstimate }>("POST", "/api/delivery/estimate", {
      deliveryPartner: partnerId,
      pincode,
      items: toRequestLines(items),
    })
  ).data;
