const PAISE_PER_POINT = 100;
const PAISE_PER_EARNED_POINT = 10000;
const MAX_REDEEM_PERCENT = 15;

export const earnedPoints = (paidPaise: number): number => Math.floor(paidPaise / PAISE_PER_EARNED_POINT);

export const pointsValuePaise = (points: number): number => points * PAISE_PER_POINT;

export const maxRedeemablePoints = (subtotalPaise: number, balance: number): number =>
  Math.min(balance, Math.floor((subtotalPaise * MAX_REDEEM_PERCENT) / (100 * PAISE_PER_POINT)));
