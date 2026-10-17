import { orderRepository, type StoredOrder } from "../repositories/order.repository";
import { paymentRepository, type CapturedDetails, type StoredPayment } from "../repositories/payment.repository";
import { userCouponRepository } from "../repositories/user-coupon.repository";
import { userRepository } from "../repositories/user.repository";

export async function settlePayment(payment: StoredPayment, details: CapturedDetails): Promise<void> {
  await paymentRepository.markCaptured(payment.providerOrderId, details);
  const order: StoredOrder | null = await orderRepository.markPaid(String(payment.orderId));
  if (!order) return;
  if (order.couponId) await userCouponRepository.consume(order.userId, order.couponId);
  const delta: number = (order.tinglePointsEarned ?? 0) - (order.tinglePointsUsed ?? 0);
  if (delta !== 0) await userRepository.adjustTinglePoints(order.userId, delta);
}
