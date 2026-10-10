import { orderRepository } from "../repositories/order.repository";
import { paymentRepository, type CapturedDetails, type StoredPayment } from "../repositories/payment.repository";

export async function settlePayment(payment: StoredPayment, details: CapturedDetails): Promise<void> {
  await paymentRepository.markCaptured(payment.providerOrderId, details);
  await orderRepository.markPaid(String(payment.orderId));
}
