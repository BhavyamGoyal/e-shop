import type { CartCustomization } from "@/customizers/core";

export interface OrderLineRecord {
  key: string;
  handle: string;
  variantId: number | null;
  title: string;
  variantTitle: string | null;
  image: string | null;
  unitAmount: number;
  quantity: number;
  customization?: CartCustomization | null;
}

export const INVOICE_ENTRY_TYPES = ["charge", "discount"] as const;
export type InvoiceEntryType = (typeof INVOICE_ENTRY_TYPES)[number];

export interface InvoiceEntry {
  type: InvoiceEntryType;
  code: string;
  label: string;
  amount: number;
}

export const ORDER_STATUSES = ["pending", "paid", "shipped", "delivered", "cancelled"] as const;
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

export interface GuestAddress {
  fullName: string;
  line1: string;
  line2: string;
  landmark: string;
  city: string;
  state: string;
  postalCode: string;
}

export interface GuestCheckout {
  email: string;
  phone: string;
  address: GuestAddress;
}

export interface PaymentProof {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface VerifiedPayment {
  orderNumber: string;
}
