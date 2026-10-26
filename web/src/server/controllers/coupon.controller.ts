import { requireAdmin, requireCustomer, requireStaff } from "../auth/guard";
import { NotFoundError, ValidationError } from "../http/errors";
import { couponRepository, type StoredCoupon } from "../repositories/coupon.repository";
import { userCouponRepository, type StoredUserCoupon } from "../repositories/user-coupon.repository";
import { userRepository, type StoredUser } from "../repositories/user.repository";
import type { CouponInput, CouponListData, CouponRecord, UserCouponView, UserOption } from "../types/coupon.types";
import { parseCouponInput } from "../validators/coupon-input";

const DUPLICATE_KEY = 11000;

const toRecord = (coupon: StoredCoupon, counts: Record<string, number>): CouponRecord => ({
  id: coupon._id.toString(),
  code: coupon.code,
  description: coupon.description,
  discountPercent: coupon.discountPercent,
  maxDiscountAmount: coupon.maxDiscountAmount,
  usageLimit: coupon.usageLimit,
  assignedCount: counts[coupon._id.toString()] ?? 0,
});

const toUserOption = (user: StoredUser): UserOption => ({
  id: user._id.toString(),
  label: user.name ? `${user.name} (${user.email})` : user.email,
});

const toUserCouponView = (coupon: StoredCoupon, assignment: StoredUserCoupon): UserCouponView => ({
  code: coupon.code,
  description: coupon.description,
  discountPercent: coupon.discountPercent,
  maxDiscountAmount: coupon.maxDiscountAmount,
  usesRemaining: assignment.usesRemaining,
});

async function existing(id: string): Promise<StoredCoupon> {
  const coupon: StoredCoupon | null = await couponRepository.findById(id);
  if (!coupon) throw new NotFoundError("Coupon not found");
  return coupon;
}

async function persist(action: () => Promise<void>): Promise<void> {
  try {
    await action();
  } catch (error) {
    if ((error as { code?: number }).code === DUPLICATE_KEY) throw new ValidationError("Coupon code already exists");
    throw error;
  }
}

export const couponController = {
  async list(): Promise<CouponListData> {
    await requireStaff();
    const [coupons, users, counts] = await Promise.all([
      couponRepository.list(),
      userRepository.list(),
      userCouponRepository.countByCoupon(),
    ]);
    return {
      coupons: coupons.map((coupon: StoredCoupon): CouponRecord => toRecord(coupon, counts)),
      users: users.map(toUserOption),
    };
  },

  async create(payload: unknown): Promise<void> {
    await requireAdmin();
    const input: CouponInput = parseCouponInput(payload);
    await persist(() => couponRepository.create(input));
  },

  async update(id: string, payload: unknown): Promise<void> {
    await requireAdmin();
    await existing(id);
    const input: CouponInput = parseCouponInput(payload);
    await persist(() => couponRepository.update(id, input));
  },

  async remove(id: string): Promise<void> {
    await requireAdmin();
    await existing(id);
    await couponRepository.remove(id);
    await userCouponRepository.removeByCoupon(id);
  },

  async assign(id: string, payload: unknown): Promise<void> {
    await requireAdmin();
    const coupon: StoredCoupon = await existing(id);
    const userId: unknown = ((payload ?? {}) as Record<string, unknown>).userId;
    const user: StoredUser | null = typeof userId === "string" ? await userRepository.findById(userId) : null;
    if (!user) throw new NotFoundError("User not found");
    await userCouponRepository.assign(user._id.toString(), id, coupon.usageLimit);
  },

  async mine(): Promise<UserCouponView[]> {
    const user: StoredUser = await requireCustomer();
    const assignments: StoredUserCoupon[] = await userCouponRepository.listUsable(user._id.toString());
    const coupons: StoredCoupon[] = await couponRepository.findByIds(
      assignments.map((assignment: StoredUserCoupon): string => assignment.couponId),
    );
    const byId: Map<string, StoredCoupon> = new Map(
      coupons.map((coupon: StoredCoupon): [string, StoredCoupon] => [coupon._id.toString(), coupon]),
    );
    return assignments.flatMap((assignment: StoredUserCoupon): UserCouponView[] => {
      const coupon: StoredCoupon | undefined = byId.get(assignment.couponId);
      return coupon ? [toUserCouponView(coupon, assignment)] : [];
    });
  },
};
