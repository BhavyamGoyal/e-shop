import { request } from "@/lib/api-request";
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
      items: items.map((item: CartItem) => ({ key: item.key, quantity: item.quantity })),
    })
  ).data;
