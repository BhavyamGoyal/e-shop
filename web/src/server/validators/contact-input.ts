import { ValidationError } from "../http/errors";

const PHONE = /^[6-9]\d{9}$/;

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function parsePhone(value: unknown): string {
  const raw: string = typeof value === "string" ? value.trim() : "";
  const digits: string = raw.replace(/[\s-]/g, "").replace(/^(\+91|91|0)(?=\d{10}$)/, "");
  if (!PHONE.test(digits)) throw new ValidationError("Enter a valid 10-digit mobile number");
  return digits;
}

export function parseEmail(value: unknown): string {
  const email: string = typeof value === "string" ? value.trim().toLowerCase() : "";
  if (!EMAIL_PATTERN.test(email)) throw new ValidationError("Enter a valid email address");
  return email;
}
