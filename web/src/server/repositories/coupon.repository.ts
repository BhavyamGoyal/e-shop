import { isValidObjectId } from "mongoose";
import { connectDb } from "../db/connect";
import { CouponModel, type CouponDocument } from "../models/coupon.model";
import type { CouponInput } from "../types/coupon.types";

export type StoredCoupon = CouponDocument & { _id: { toString(): string } };

export const couponRepository = {
  async list(): Promise<StoredCoupon[]> {
    await connectDb();
    return CouponModel.find().sort({ createdAt: -1 }).lean<StoredCoupon[]>();
  },

  async findById(id: string): Promise<StoredCoupon | null> {
    await connectDb();
    return isValidObjectId(id) ? CouponModel.findById(id).lean<StoredCoupon>() : null;
  },

  async findByCode(code: string): Promise<StoredCoupon | null> {
    await connectDb();
    return CouponModel.findOne({ code: code.trim().toUpperCase() }).lean<StoredCoupon>();
  },

  async findByIds(ids: string[]): Promise<StoredCoupon[]> {
    await connectDb();
    return CouponModel.find({ _id: { $in: ids.filter((id: string): boolean => isValidObjectId(id)) } }).lean<
      StoredCoupon[]
    >();
  },

  async create(input: CouponInput): Promise<void> {
    await connectDb();
    await CouponModel.create(input);
  },

  async update(id: string, input: CouponInput): Promise<void> {
    await connectDb();
    await CouponModel.updateOne({ _id: id }, { $set: input });
  },

  async remove(id: string): Promise<void> {
    await connectDb();
    await CouponModel.deleteOne({ _id: id });
  },
};
