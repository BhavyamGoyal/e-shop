import type { GuestAddress, GuestCheckout } from "@/server/types/order.types";

export const EMPTY_GUEST: GuestCheckout = {
  email: "",
  phone: "",
  address: { fullName: "", line1: "", line2: "", landmark: "", city: "", state: "", postalCode: "" },
};

const REQUIRED: (keyof GuestAddress)[] = ["fullName", "line1", "city", "state", "postalCode"];

export const isGuestReady = (guest: GuestCheckout): boolean =>
  guest.email.trim() !== "" &&
  guest.phone.trim() !== "" &&
  REQUIRED.every((key: keyof GuestAddress): boolean => guest.address[key].trim() !== "");
