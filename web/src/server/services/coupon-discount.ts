export const MIN_PAYABLE_PAISE = 100;

export interface DiscountRule {
  discountPercent: number;
  maxDiscountAmount: number;
}

export const couponDiscountPaise = (rule: DiscountRule, payablePaise: number): number => {
  const percentPaise: number = Math.floor((payablePaise * rule.discountPercent) / 100);
  return Math.max(0, Math.min(percentPaise, rule.maxDiscountAmount, payablePaise - MIN_PAYABLE_PAISE));
};
