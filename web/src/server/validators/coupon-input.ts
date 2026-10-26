import { ValidationError } from "../http/errors";
import type { CouponInput } from "../types/coupon.types";

type Raw = Record<string, unknown>;

const CODE_PATTERN = /^[A-Z0-9_-]{3,30}$/;

function positiveInteger(value: unknown, message: string): number {
  const parsed: number = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) throw new ValidationError(message);
  return parsed;
}

export function parseCouponInput(payload: unknown): CouponInput {
  const raw: Raw = (payload ?? {}) as Raw;
  const code: string = typeof raw.code === "string" ? raw.code.trim().toUpperCase() : "";
  const description: string = typeof raw.description === "string" ? raw.description.trim() : "";
  if (!CODE_PATTERN.test(code)) throw new ValidationError("Code must be 3-30 letters, numbers, - or _");
  if (!description) throw new ValidationError("Description is required");
  const discountPercent: number = positiveInteger(raw.discountPercent, "Discount must be a whole percent from 1 to 100");
  if (discountPercent > 100) throw new ValidationError("Discount must be a whole percent from 1 to 100");
  return {
    code,
    description,
    discountPercent,
    maxDiscountAmount: positiveInteger(raw.maxDiscountAmount, "Max discount must be at least 1 paisa"),
    usageLimit: positiveInteger(raw.usageLimit, "Usage limit must be a whole number of at least 1"),
  };
}
