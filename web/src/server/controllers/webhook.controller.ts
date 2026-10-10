import { QueryError } from "../http/errors";
import { paymentRepository, type StoredPayment } from "../repositories/payment.repository";
import { settlePayment } from "../services/payment-settlement.service";
import { isValidWebhookSignature } from "../services/razorpay.service";

interface WebhookPayment {
  id?: string;
  order_id?: string;
  amount?: number;
  method?: string;
  error_description?: string;
}

interface WebhookEvent {
  event?: string;
  payload?: { payment?: { entity?: WebhookPayment } };
}

const SETTLE_EVENTS: string[] = ["payment.captured", "order.paid"];

function parseEvent(rawBody: string): WebhookEvent {
  try {
    return JSON.parse(rawBody) as WebhookEvent;
  } catch {
    throw new QueryError("Invalid payload");
  }
}

async function settle(payment: StoredPayment, entity: WebhookPayment): Promise<void> {
  if (!entity.id || entity.amount !== payment.amount) {
    console.error("Razorpay webhook amount mismatch", entity.order_id);
    return;
  }
  await settlePayment(payment, { providerPaymentId: entity.id, method: entity.method ?? null });
}

export const webhookController = {
  async handle(rawBody: string, signature: string | null): Promise<void> {
    if (!signature || !isValidWebhookSignature(rawBody, signature)) throw new QueryError("Invalid signature");
    const event: WebhookEvent = parseEvent(rawBody);
    const entity: WebhookPayment | undefined = event.payload?.payment?.entity;
    if (!entity?.order_id || !event.event) return;
    const payment: StoredPayment | null = await paymentRepository.findByProviderOrderId(entity.order_id);
    if (!payment) return;
    if (SETTLE_EVENTS.includes(event.event)) await settle(payment, entity);
    if (event.event === "payment.failed") {
      await paymentRepository.markFailed(entity.order_id, entity.error_description ?? "Payment failed");
    }
  },
};
