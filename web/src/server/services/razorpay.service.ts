import { createHmac, timingSafeEqual } from "node:crypto";
import Razorpay from "razorpay";
import { ApiError } from "../http/errors";
import type { PaymentProof } from "../types/order.types";

export const MIN_AMOUNT_PAISE = 100;

interface Credentials {
  keyId: string;
  keySecret: string;
}

export interface GatewayPayment {
  orderId: string;
  amount: number;
  status: string;
  method: string | null;
}

function credentials(): Credentials {
  const keyId: string | undefined = process.env.RAZORPAY_KEY_ID;
  const keySecret: string | undefined = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) throw new Error("Razorpay credentials are not set");
  return { keyId, keySecret };
}

const client = (): Razorpay => {
  const { keyId, keySecret }: Credentials = credentials();
  return new Razorpay({ key_id: keyId, key_secret: keySecret });
};

const statusOf = (error: unknown): number => (error as { statusCode?: number }).statusCode ?? 500;

export const razorpayKeyId = (): string => credentials().keyId;

export async function createGatewayOrder(amount: number, currency: string, receipt: string): Promise<string> {
  try {
    return (await client().orders.create({ amount, currency, receipt })).id;
  } catch (error) {
    if (statusOf(error) === 401) throw new ApiError(401, "Payment gateway authentication failed");
    console.error(error);
    throw new ApiError(500, "Could not create payment order");
  }
}

export async function fetchGatewayPayment(paymentId: string): Promise<GatewayPayment> {
  try {
    const payment = await client().payments.fetch(paymentId);
    return {
      orderId: String(payment.order_id ?? ""),
      amount: Number(payment.amount),
      status: String(payment.status),
      method: payment.method ? String(payment.method) : null,
    };
  } catch (error) {
    if (statusOf(error) === 401) throw new ApiError(401, "Payment gateway authentication failed");
    console.error(error);
    throw new ApiError(500, "Could not confirm payment with gateway");
  }
}

function signatureMatches(secret: string, message: string, signature: string): boolean {
  const expected: Buffer = Buffer.from(createHmac("sha256", secret).update(message).digest("hex"));
  const actual: Buffer = Buffer.from(signature);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

export const isValidSignature = (proof: PaymentProof): boolean =>
  signatureMatches(
    credentials().keySecret,
    `${proof.razorpay_order_id}|${proof.razorpay_payment_id}`,
    proof.razorpay_signature,
  );

export function isValidWebhookSignature(rawBody: string, signature: string): boolean {
  const secret: string | undefined = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) throw new Error("RAZORPAY_WEBHOOK_SECRET is not set");
  return signatureMatches(secret, rawBody, signature);
}
