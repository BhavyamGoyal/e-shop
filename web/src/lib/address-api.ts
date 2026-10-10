import { request } from "@/lib/api-request";
import type { AddressInput, AddressRecord } from "@/server/types/address.types";

export const fetchAddresses = async (): Promise<AddressRecord[]> =>
  (await request<{ data: AddressRecord[] }>("GET", "/api/addresses")).data;

export const saveAddress = async (id: string | null, input: AddressInput): Promise<AddressRecord> =>
  (await request<{ data: AddressRecord }>(id ? "PUT" : "POST", id ? `/api/addresses/${id}` : "/api/addresses", input)).data;

export const deleteAddress = async (id: string): Promise<void> => {
  await request<{ ok: boolean }>("DELETE", `/api/addresses/${id}`);
};
