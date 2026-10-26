import type { OrderDocument } from "../models/order.model";
import type { PaymentDocument } from "../models/payment.model";
import type { AddressSnapshot } from "../types/address.types";
import type { InvoiceEntry, OrderLineRecord } from "../types/order.types";
import type { OrderDetail, OrderSummary, PaymentView } from "../types/order-view.types";
import { toPoint } from "./address.mapper";

type StoredOrder = OrderDocument & { _id: unknown };
type StoredPayment = PaymentDocument & { _id: unknown };

const iso = (value: Date | null | undefined): string | null => (value ? new Date(value).toISOString() : null);

export const toPaymentView = (payment: StoredPayment | null): PaymentView | null =>
  payment
    ? {
        status: payment.status,
        method: payment.method ?? null,
        providerOrderId: payment.providerOrderId,
        providerPaymentId: payment.providerPaymentId ?? null,
        failureReason: payment.failureReason ?? null,
        signatureVerified: payment.signatureVerified ?? false,
        capturedAt: iso(payment.capturedAt),
      }
    : null;

export const toOrderSummary = (order: StoredOrder, payment: StoredPayment | null): OrderSummary => ({
  orderNumber: order.orderNumber,
  email: order.email,
  isLoggedOutOrder: order.isLoggedOutOrder ?? false,
  itemCount: order.items.reduce((sum: number, line): number => sum + line.quantity, 0),
  discount: order.discount ?? 0,
  couponCode: order.couponCode ?? null,
  tinglePointsEarned: order.tinglePointsEarned ?? 0,
  tinglePointsUsed: order.tinglePointsUsed ?? 0,
  deliveryCharge: order.deliveryCharge ?? 0,
  invoiceData: (order.invoiceData ?? []).map(
    (entry): InvoiceEntry => ({ type: entry.type, code: entry.code, label: entry.label, amount: entry.amount }),
  ),
  delivery: order.delivery
    ? {
        partnerId: order.delivery.partnerId,
        manufacturingDays: order.delivery.manufacturingDays,
        transitDays: order.delivery.transitDays,
        estimatedDate: order.delivery.estimatedDate,
      }
    : null,
  total: order.total,
  currency: order.currency,
  status: order.status,
  payment: toPaymentView(payment),
  createdAt: iso(order.createdAt) ?? "",
  paidAt: iso(order.paidAt),
});

const toLine = (line: StoredOrder["items"][number]): OrderLineRecord => ({
  key: line.key,
  handle: line.handle,
  variantId: line.variantId ?? null,
  title: line.title,
  variantTitle: line.variantTitle ?? null,
  image: line.image ?? null,
  unitAmount: line.unitAmount,
  quantity: line.quantity,
});

const toShipping = (order: StoredOrder): AddressSnapshot => {
  const address: StoredOrder["shippingAddress"] = order.shippingAddress;
  return {
    fullName: address.fullName,
    phone: address.phone,
    line1: address.line1,
    line2: address.line2 ?? "",
    landmark: address.landmark ?? "",
    city: address.city,
    state: address.state,
    postalCode: address.postalCode,
    country: address.country ?? "IN",
    location: toPoint(address.location),
  };
};

export const toOrderDetail = (order: StoredOrder, payment: StoredPayment | null): OrderDetail => ({
  ...toOrderSummary(order, payment),
  items: order.items.map(toLine),
  shippingAddress: toShipping(order),
});
