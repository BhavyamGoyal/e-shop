import { request } from "@/lib/api-request";
import type { CheckoutOrder, GuestCheckout, PaymentProof, VerifiedPayment } from "@/server/types/order.types";
import type { CartItem } from "@/stores/cart/Cart.types";

export const createCheckoutOrder = (
  items: CartItem[],
  addressId: string,
  tinglePoints: number,
  couponCode: string,
  deliveryPartner: string,
  guest: GuestCheckout | null,
): Promise<CheckoutOrder> =>
  request<CheckoutOrder>("POST", "/api/checkout/order", {
    addressId,
    tinglePoints,
    couponCode,
    deliveryPartner,
    guest,
    items: items.map((item: CartItem) => ({ key: item.key, quantity: item.quantity })),
  });

export const verifyCheckoutPayment = (proof: PaymentProof): Promise<VerifiedPayment> =>
  request<VerifiedPayment>("POST", "/api/checkout/verify", proof);
