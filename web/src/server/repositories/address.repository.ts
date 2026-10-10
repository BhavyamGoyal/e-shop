import { isValidObjectId } from "mongoose";
import { connectDb } from "../db/connect";
import { AddressModel, type AddressDocument } from "../models/address.model";
import { toAddressFields, toGeoJson } from "../mappers/address.mapper";
import type { AddressInput } from "../types/address.types";

export type StoredAddress = AddressDocument & { _id: unknown };

export const addressRepository = {
  async listByUser(userId: string): Promise<StoredAddress[]> {
    await connectDb();
    return AddressModel.find({ userId }).sort({ isDefault: -1, createdAt: -1 }).lean<StoredAddress[]>();
  },

  async countByUser(userId: string): Promise<number> {
    await connectDb();
    return AddressModel.countDocuments({ userId });
  },

  async findOwned(userId: string, id: string): Promise<StoredAddress | null> {
    await connectDb();
    return isValidObjectId(id) ? AddressModel.findOne({ _id: id, userId }).lean<StoredAddress>() : null;
  },

  async create(userId: string, input: AddressInput, isDefault: boolean): Promise<string> {
    await connectDb();
    const location = toGeoJson(input.location);
    const created = await AddressModel.create({
      ...toAddressFields(input),
      userId,
      isDefault,
      ...(location ? { location } : {}),
    });
    return String(created._id);
  },

  async update(userId: string, id: string, input: AddressInput): Promise<void> {
    await connectDb();
    const location = toGeoJson(input.location);
    await AddressModel.updateOne(
      { _id: id, userId },
      location ? { $set: { ...toAddressFields(input), location } } : { $set: toAddressFields(input), $unset: { location: "" } },
    );
  },

  async clearDefault(userId: string, exceptId?: string): Promise<void> {
    await connectDb();
    await AddressModel.updateMany(
      { userId, isDefault: true, ...(exceptId ? { _id: { $ne: exceptId } } : {}) },
      { $set: { isDefault: false } },
    );
  },

  async setDefault(userId: string, id: string): Promise<void> {
    await connectDb();
    await this.clearDefault(userId, id);
    await AddressModel.updateOne({ _id: id, userId }, { $set: { isDefault: true } });
  },

  async remove(userId: string, id: string): Promise<void> {
    await connectDb();
    await AddressModel.deleteOne({ _id: id, userId });
  },

  async newest(userId: string): Promise<StoredAddress | null> {
    await connectDb();
    return AddressModel.findOne({ userId }).sort({ createdAt: -1 }).lean<StoredAddress>();
  },
};
