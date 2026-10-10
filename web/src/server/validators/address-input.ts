import { ValidationError } from "../http/errors";
import type { AddressInput, GeoPoint } from "../types/address.types";

type Raw = Record<string, unknown>;

const PHONE = /^[6-9]\d{9}$/;
const POSTAL_CODE = /^[1-9]\d{5}$/;

const text = (value: unknown): string => (typeof value === "string" ? value.trim() : "");

function bounded(value: unknown, label: string, min: number, max: number): string {
  const result: string = text(value);
  if (result.length < min || result.length > max) {
    throw new ValidationError(min === 0 ? `${label} is too long` : `${label} must be ${min}-${max} characters`);
  }
  return result;
}

function parsePhone(value: unknown): string {
  const digits: string = text(value).replace(/[\s-]/g, "").replace(/^(\+91|91|0)(?=\d{10}$)/, "");
  if (!PHONE.test(digits)) throw new ValidationError("Enter a valid 10-digit mobile number");
  return digits;
}

function parseLocation(value: unknown): GeoPoint | null {
  if (value === null || value === undefined) return null;
  const raw: Raw = value as Raw;
  const lat: number = Number(raw.lat);
  const lng: number = Number(raw.lng);
  const valid: boolean =
    typeof value === "object" && Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180;
  if (!valid) throw new ValidationError("GPS location is invalid");
  return { lat, lng };
}

export function parseAddressInput(payload: unknown): AddressInput {
  const raw: Raw = payload && typeof payload === "object" ? (payload as Raw) : {};
  const postalCode: string = text(raw.postalCode);
  if (!POSTAL_CODE.test(postalCode)) throw new ValidationError("Enter a valid 6-digit PIN code");
  return {
    label: bounded(raw.label || "Home", "Label", 1, 30),
    fullName: bounded(raw.fullName, "Full name", 2, 80),
    phone: parsePhone(raw.phone),
    line1: bounded(raw.line1, "Address line 1", 3, 120),
    line2: bounded(raw.line2, "Address line 2", 0, 120),
    landmark: bounded(raw.landmark, "Landmark", 0, 80),
    city: bounded(raw.city, "City", 2, 60),
    state: bounded(raw.state, "State", 2, 60),
    postalCode,
    location: parseLocation(raw.location),
    isDefault: raw.isDefault === true,
  };
}
