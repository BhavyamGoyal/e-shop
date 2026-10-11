import type { AddressSnapshot } from "./address.types";
import type { OrderLineRecord, OrderStatus, PaymentStatus } from "./order.types";

export interface PaymentView {
  status: PaymentStatus;
  method: string | null;
  providerOrderId: string;
  providerPaymentId: string | null;
  failureReason: string | null;
  signatureVerified: boolean;
  capturedAt: string | null;
}

export interface OrderSummary {
  orderNumber: string;
  email: string;
  itemCount: number;
  total: number;
  currency: string;
  status: OrderStatus;
  payment: PaymentView | null;
  createdAt: string;
  paidAt: string | null;
}

export interface OrderDetail extends OrderSummary {
  items: OrderLineRecord[];
  shippingAddress: AddressSnapshot;
}
