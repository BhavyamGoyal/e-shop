import { QueryError } from "../http/errors";
import { couponRepository, type StoredCoupon } from "../repositories/coupon.repository";
import { orderRepository } from "../repositories/order.repository";
import { userCouponRepository, type StoredUserCoupon } from "../repositories/user-coupon.repository";
import type { AppliedCoupon } from "../types/coupon.types";
import { couponDiscountPaise } from "./coupon-discount";

const UNAVAILABLE = "This coupon is not available for your account";
const PENDING_WINDOW_MS = 30 * 60 * 1000;

export async function applyCoupon(userId: string, code: string | null, payable: number): Promise<AppliedCoupon | null> {
  if (!code) return null;
  const coupon: StoredCoupon | null = await couponRepository.findByCode(code);
  if (!coupon) throw new QueryError(UNAVAILABLE);
  const couponId: string = coupon._id.toString();
  const assignment: StoredUserCoupon | null = await userCouponRepository.find(userId, couponId);
  if (!assignment || assignment.usesRemaining < 1) throw new QueryError(UNAVAILABLE);
  const inFlight: number = await orderRepository.countPendingWithCoupon(
    userId,
    couponId,
    new Date(Date.now() - PENDING_WINDOW_MS),
  );
  if (inFlight >= assignment.usesRemaining) throw new QueryError("You have unpaid orders using this coupon");
  return { couponId, code: coupon.code, discount: couponDiscountPaise(coupon, payable) };
}
