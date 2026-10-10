import type { AddressDocument } from "../models/address.model";
import type { AddressInput, AddressRecord, AddressSnapshot, GeoPoint } from "../types/address.types";

type StoredAddress = AddressDocument & { _id: unknown };

const toPoint = (location: AddressDocument["location"]): GeoPoint | null => {
  const [lng, lat]: number[] = location?.coordinates ?? [];
  return lat === undefined || lng === undefined ? null : { lat, lng };
};

export const toGeoJson = (point: GeoPoint | null): { type: "Point"; coordinates: number[] } | null =>
  point ? { type: "Point", coordinates: [point.lng, point.lat] } : null;

export const toAddressRecord = (doc: StoredAddress): AddressRecord => ({
  id: String(doc._id),
  label: doc.label ?? "Home",
  fullName: doc.fullName,
  phone: doc.phone,
  line1: doc.line1,
  line2: doc.line2 ?? "",
  landmark: doc.landmark ?? "",
  city: doc.city,
  state: doc.state,
  postalCode: doc.postalCode,
  country: doc.country ?? "IN",
  location: toPoint(doc.location),
  isDefault: doc.isDefault ?? false,
});

export const toAddressFields = (input: AddressInput): Omit<AddressInput, "location" | "isDefault"> => ({
  label: input.label,
  fullName: input.fullName,
  phone: input.phone,
  line1: input.line1,
  line2: input.line2,
  landmark: input.landmark,
  city: input.city,
  state: input.state,
  postalCode: input.postalCode,
});

export const toAddressSnapshot = (doc: StoredAddress): AddressSnapshot => {
  const record: AddressRecord = toAddressRecord(doc);
  return { ...toAddressFields(record), country: record.country, location: record.location };
};
