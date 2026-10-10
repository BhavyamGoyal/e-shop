import { requireCustomer } from "../auth/guard";
import { NotFoundError, QueryError } from "../http/errors";
import { toAddressRecord } from "../mappers/address.mapper";
import { addressRepository, type StoredAddress } from "../repositories/address.repository";
import type { AddressInput, AddressRecord } from "../types/address.types";
import { parseAddressInput } from "../validators/address-input";

const MAX_ADDRESSES = 10;

const userIdOf = async (): Promise<string> => String((await requireCustomer())._id);

async function owned(userId: string, id: string): Promise<StoredAddress> {
  const address: StoredAddress | null = await addressRepository.findOwned(userId, id);
  if (!address) throw new NotFoundError("Address not found");
  return address;
}

export const addressController = {
  async list(): Promise<AddressRecord[]> {
    const userId: string = await userIdOf();
    return (await addressRepository.listByUser(userId)).map(toAddressRecord);
  },

  async create(payload: unknown): Promise<AddressRecord> {
    const userId: string = await userIdOf();
    const input: AddressInput = parseAddressInput(payload);
    const count: number = await addressRepository.countByUser(userId);
    if (count >= MAX_ADDRESSES) throw new QueryError(`You can save up to ${MAX_ADDRESSES} addresses`);
    const makeDefault: boolean = input.isDefault || count === 0;
    if (makeDefault) await addressRepository.clearDefault(userId);
    const id: string = await addressRepository.create(userId, input, makeDefault);
    return toAddressRecord(await owned(userId, id));
  },

  async update(id: string, payload: unknown): Promise<AddressRecord> {
    const userId: string = await userIdOf();
    const existing: StoredAddress = await owned(userId, id);
    const input: AddressInput = parseAddressInput(payload);
    await addressRepository.update(userId, id, input);
    if (input.isDefault && !existing.isDefault) await addressRepository.setDefault(userId, id);
    return toAddressRecord(await owned(userId, id));
  },

  async remove(id: string): Promise<void> {
    const userId: string = await userIdOf();
    const existing: StoredAddress = await owned(userId, id);
    await addressRepository.remove(userId, id);
    if (!existing.isDefault) return;
    const next: StoredAddress | null = await addressRepository.newest(userId);
    if (next) await addressRepository.setDefault(userId, String(next._id));
  },
};
