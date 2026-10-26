export interface CouponInput {
  code: string;
  description: string;
  discountPercent: number;
  maxDiscountAmount: number;
  usageLimit: number;
}

export interface CouponRecord extends CouponInput {
  id: string;
  assignedCount: number;
}

export interface UserOption {
  id: string;
  label: string;
}

export interface CouponListData {
  coupons: CouponRecord[];
  users: UserOption[];
}

export interface UserCouponView {
  code: string;
  description: string;
  discountPercent: number;
  maxDiscountAmount: number;
  usesRemaining: number;
}

export interface AppliedCoupon {
  couponId: string;
  code: string;
  discount: number;
}
