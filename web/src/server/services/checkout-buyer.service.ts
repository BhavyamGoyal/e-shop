import { optionalCustomer } from "../auth/guard";
import { QueryError } from "../http/errors";
import { toAddressFields, toAddressSnapshot } from "../mappers/address.mapper";
import { addressRepository, type StoredAddress } from "../repositories/address.repository";
import { userRepository, type StoredUser } from "../repositories/user.repository";
import type { AddressInput, AddressSnapshot } from "../types/address.types";
import { parseAddressInput } from "../validators/address-input";
import { parseEmail, parsePhone } from "../validators/contact-input";

type Raw = Record<string, unknown>;

export interface CheckoutBuyer {
  user: StoredUser;
  email: string;
  shipping: AddressSnapshot;
  loggedOut: boolean;
}

async function savedAddress(userId: string, payload: unknown): Promise<AddressSnapshot> {
  const addressId: unknown = ((payload ?? {}) as Raw).addressId;
  const address: StoredAddress | null =
    typeof addressId === "string" ? await addressRepository.findOwned(userId, addressId) : null;
  if (!address) throw new QueryError("Select a delivery address");
  return toAddressSnapshot(address);
}

async function userForContact(email: string, phone: string, name: string): Promise<StoredUser> {
  const byEmail: StoredUser | null = await userRepository.findByEmail(email);
  const byPhone: StoredUser | null = await userRepository.findByPhone(phone);
  if (byEmail) {
    if (!byEmail.phone && !byPhone) await userRepository.setPhone(String(byEmail._id), phone);
    return byEmail;
  }
  if (byPhone) return byPhone;
  return userRepository.create({ name, email, phone, passwordHash: "", role: "customer" });
}

async function guestBuyer(payload: unknown): Promise<CheckoutBuyer> {
  const guest: Raw = (((payload ?? {}) as Raw).guest ?? {}) as Raw;
  const email: string = parseEmail(guest.email);
  const phone: string = parsePhone(guest.phone);
  const address: AddressInput = parseAddressInput({ ...(guest.address as Raw | undefined), phone, label: "Home" });
  const user: StoredUser = await userForContact(email, phone, address.fullName);
  const shipping: AddressSnapshot = { ...toAddressFields(address), country: "IN", location: address.location };
  return { user, email, shipping, loggedOut: true };
}

export async function resolveBuyer(payload: unknown): Promise<CheckoutBuyer> {
  const user: StoredUser | null = await optionalCustomer();
  if (!user) return guestBuyer(payload);
  return { user, email: user.email, shipping: await savedAddress(String(user._id), payload), loggedOut: false };
}
