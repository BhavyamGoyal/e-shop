import { randomBytes } from "node:crypto";
import { requireCustomer } from "../auth/guard";
import { QueryError } from "../http/errors";
import { toAddressSnapshot } from "../mappers/address.mapper";
import { addressRepository, type StoredAddress } from "../repositories/address.repository";
import { orderRepository } from "../repositories/order.repository";
import { paymentRepository, type StoredPayment } from "../repositories/payment.repository";
import type { StoredUser } from "../repositories/user.repository";
import { priceCart, type PricedCart } from "../services/checkout-pricing.service";
import { settlePayment } from "../services/payment-settlement.service";
import {
  createGatewayOrder,
  fetchGatewayPayment,
  isValidSignature,
  MIN_AMOUNT_PAISE,
  razorpayKeyId,
  type GatewayPayment,
} from "../services/razorpay.service";
import type { CheckoutOrder, PaymentProof, VerifiedPayment } from "../types/order.types";

type Raw = Record<string, unknown>;

const CURRENCY = "INR";
const FAILED = "Payment verification failed";
const SETTLED_STATUSES: string[] = ["captured", "authorized"];

const newOrderNumber = (): string =>
  `ORD-${Date.now().toString(36).toUpperCase()}-${randomBytes(3).toString("hex").toUpperCase()}`;

async function deliveryAddress(userId: string, payload: unknown): Promise<StoredAddress> {
  const addressId: unknown = ((payload ?? {}) as Raw).addressId;
  const address: StoredAddress | null =
    typeof addressId === "string" ? await addressRepository.findOwned(userId, addressId) : null;
  if (!address) throw new QueryError("Select a delivery address");
  return address;
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
    const user: StoredUser = await requireCustomer();
    const userId: string = String(user._id);
    const address: StoredAddress = await deliveryAddress(userId, payload);
    const cart: PricedCart = await priceCart(payload);
    if (cart.total < MIN_AMOUNT_PAISE) throw new QueryError("Order total is below the minimum amount");
    const orderNumber: string = newOrderNumber();
    const razorpayOrderId: string = await createGatewayOrder(cart.total, CURRENCY, orderNumber);
    const orderId: string = await orderRepository.create({
      orderNumber,
      userId,
      email: user.email,
      items: cart.items,
      shippingAddress: toAddressSnapshot(address),
      total: cart.total,
      currency: CURRENCY,
    });
    await paymentRepository.create({
      orderId,
      orderNumber,
      userId,
      providerOrderId: razorpayOrderId,
      amount: cart.total,
      currency: CURRENCY,
    });
    return {
      orderNumber,
      razorpayOrderId,
      amount: cart.total,
      currency: CURRENCY,
      keyId: razorpayKeyId(),
      email: user.email,
      name: user.name ?? "",
    };
  },

  async verifyPayment(payload: unknown): Promise<VerifiedPayment> {
    const user: StoredUser = await requireCustomer();
    const proof: PaymentProof = parseProof(payload);
    if (!isValidSignature(proof)) throw new QueryError(FAILED);
    const payment: StoredPayment | null = await paymentRepository.findByProviderOrderId(proof.razorpay_order_id);
    if (!payment || payment.userId !== String(user._id)) throw new QueryError(FAILED);
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
