import type { AddressSnapshot } from "./address.types";
import type { OrderDelivery } from "./delivery.types";
import type { InvoiceEntry, OrderLineRecord, OrderStatus, PaymentStatus } from "./order.types";

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
  isLoggedOutOrder: boolean;
  itemCount: number;
  discount: number;
  couponCode: string | null;
  deliveryCharge: number;
  invoiceData: InvoiceEntry[];
  delivery: OrderDelivery | null;
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
