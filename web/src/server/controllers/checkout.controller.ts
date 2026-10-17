import { randomBytes } from "node:crypto";
import { requireCustomer } from "../auth/guard";
import { QueryError } from "../http/errors";
import { orderRepository, type StoredOrder } from "../repositories/order.repository";
import { paymentRepository, type StoredPayment } from "../repositories/payment.repository";
import type { StoredUser } from "../repositories/user.repository";
import { resolveBuyer, type CheckoutBuyer } from "../services/checkout-buyer.service";
import { priceCart, type PricedCart } from "../services/checkout-pricing.service";
import { applyCoupon } from "../services/coupon-pricing.service";
import { settlePayment } from "../services/payment-settlement.service";
import { earnedPoints, maxRedeemablePoints, pointsValuePaise } from "../services/tingle-points.service";
import {
  createGatewayOrder,
  fetchGatewayPayment,
  isValidSignature,
  MIN_AMOUNT_PAISE,
  razorpayKeyId,
  type GatewayPayment,
} from "../services/razorpay.service";
import type { AppliedCoupon } from "../types/coupon.types";
import type { CheckoutOrder, PaymentProof, VerifiedPayment } from "../types/order.types";

type Raw = Record<string, unknown>;

const CURRENCY = "INR";
const FAILED = "Payment verification failed";
const SETTLED_STATUSES: string[] = ["captured", "authorized"];

const newOrderNumber = (): string =>
  `ORD-${Date.now().toString(36).toUpperCase()}-${randomBytes(3).toString("hex").toUpperCase()}`;

function redeemedPoints(user: StoredUser, subtotal: number, payload: unknown): number {
  const requested: unknown = ((payload ?? {}) as Raw).tinglePoints ?? 0;
  if (typeof requested !== "number" || !Number.isInteger(requested) || requested < 0) {
    throw new QueryError("Invalid Tingle Points amount");
  }
  if (requested > maxRedeemablePoints(subtotal, user.tinglePoints ?? 0)) {
    throw new QueryError("You can't use that many Tingle Points on this order");
  }
  return requested;
}

function couponCode(payload: unknown): string | null {
  const code: unknown = ((payload ?? {}) as Raw).couponCode;
  return typeof code === "string" && code.trim() ? code : null;
}

function parseProof(payload: unknown): PaymentProof {
  const raw: Raw = (payload ?? {}) as Raw;
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = raw;
  if (
    typeof razorpay_order_id !== "string" ||
    typeof razorpay_payment_id !== "string" ||
    typeof razorpay_signature !== "string" ||
    !razorpay_order_id ||
    !razorpay_payment_id ||
    !razorpay_signature
  ) {
    throw new QueryError("Missing payment details");
  }
  return { razorpay_order_id, razorpay_payment_id, razorpay_signature };
}

export const checkoutController = {
  async createOrder(payload: unknown): Promise<CheckoutOrder> {
    const buyer: CheckoutBuyer = await resolveBuyer(payload);
    const user: StoredUser = buyer.user;
    const userId: string = String(user._id);
    const cart: PricedCart = await priceCart(payload);
    const pointsUsed: number = buyer.loggedOut ? 0 : redeemedPoints(user, cart.total, payload);
    const afterPoints: number = cart.total - pointsValuePaise(pointsUsed);
    if (afterPoints < MIN_AMOUNT_PAISE) throw new QueryError("Order total is below the minimum amount");
    const coupon: AppliedCoupon | null = buyer.loggedOut
      ? null
      : await applyCoupon(userId, couponCode(payload), afterPoints);
    const discount: number = coupon?.discount ?? 0;
    const payable: number = afterPoints - discount;
    const orderNumber: string = newOrderNumber();
    const razorpayOrderId: string = await createGatewayOrder(payable, CURRENCY, orderNumber);
    const orderId: string = await orderRepository.create({
      orderNumber,
      userId,
      email: buyer.email,
      isLoggedOutOrder: buyer.loggedOut,
      items: cart.items,
      shippingAddress: buyer.shipping,
      subtotal: cart.total,
      discount,
      couponId: coupon?.couponId ?? null,
      couponCode: coupon?.code ?? null,
      total: payable,
      tinglePointsUsed: pointsUsed,
      tinglePointsEarned: buyer.loggedOut ? 0 : earnedPoints(payable),
      currency: CURRENCY,
    });
    await paymentRepository.create({
      orderId,
      orderNumber,
      userId,
      providerOrderId: razorpayOrderId,
      amount: payable,
      currency: CURRENCY,
    });
    return {
      orderNumber,
      razorpayOrderId,
      amount: payable,
      currency: CURRENCY,
      keyId: razorpayKeyId(),
      email: buyer.email,
      name: user.name || buyer.shipping.fullName,
    };
  },

  async verifyPayment(payload: unknown): Promise<VerifiedPayment> {
    const proof: PaymentProof = parseProof(payload);
    if (!isValidSignature(proof)) throw new QueryError(FAILED);
    const payment: StoredPayment | null = await paymentRepository.findByProviderOrderId(proof.razorpay_order_id);
    if (!payment) throw new QueryError(FAILED);
    const order: StoredOrder | null = await orderRepository.findByNumber(payment.orderNumber);
    if (!order) throw new QueryError(FAILED);
    if (!order.isLoggedOutOrder) {
      const user: StoredUser = await requireCustomer();
      if (payment.userId !== String(user._id)) throw new QueryError(FAILED);
    }
    if (payment.status === "captured") return { orderNumber: payment.orderNumber };
    const gateway: GatewayPayment = await fetchGatewayPayment(proof.razorpay_payment_id);
    if (
      gateway.orderId !== payment.providerOrderId ||
      gateway.amount !== payment.amount ||
      !SETTLED_STATUSES.includes(gateway.status)
    ) {
      throw new QueryError(FAILED);
    }
    await settlePayment(payment, { providerPaymentId: proof.razorpay_payment_id, method: gateway.method });
    return { orderNumber: payment.orderNumber };
  },
};
