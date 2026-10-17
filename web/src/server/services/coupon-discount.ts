export const MIN_PAYABLE_PAISE = 100;

export const couponDiscountPaise = (discountAmount: number, payablePaise: number): number =>
  Math.max(0, Math.min(discountAmount, payablePaise - MIN_PAYABLE_PAISE));
