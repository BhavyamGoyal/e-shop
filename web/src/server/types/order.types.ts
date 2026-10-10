export interface OrderLineRecord {
  key: string;
  handle: string;
  variantId: number | null;
  title: string;
  variantTitle: string | null;
  image: string | null;
  unitAmount: number;
  quantity: number;
}

export const ORDER_STATUSES = ["pending", "paid", "cancelled"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const PAYMENT_STATUSES = ["created", "captured", "failed"] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export interface CheckoutOrder {
  orderNumber: string;
  razorpayOrderId: string;
  amount: number;
  currency: string;
  keyId: string;
  email: string;
  name: string;
}

export interface PaymentProof {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface VerifiedPayment {
  orderNumber: string;
}
