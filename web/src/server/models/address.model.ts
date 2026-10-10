import { model, models, Schema, type InferSchemaType, type Model } from "mongoose";

export const pointSchema = new Schema(
  {
    type: { type: String, enum: ["Point"], default: "Point", required: true },
    coordinates: { type: [Number], required: true },
  },
  { _id: false },
);

const addressSchema = new Schema(
  {
    userId: { type: String, required: true },
    label: { type: String, default: "Home", trim: true, maxlength: 30 },
    fullName: { type: String, required: true, trim: true, maxlength: 80 },
    phone: { type: String, required: true },
    line1: { type: String, required: true, trim: true, maxlength: 120 },
    line2: { type: String, default: "", trim: true, maxlength: 120 },
    landmark: { type: String, default: "", trim: true, maxlength: 80 },
    city: { type: String, required: true, trim: true, maxlength: 60 },
    state: { type: String, required: true, trim: true, maxlength: 60 },
    postalCode: { type: String, required: true },
    country: { type: String, default: "IN" },
    location: { type: pointSchema, default: undefined },
    isDefault: { type: Boolean, default: false },
  },
  { collection: "addresses", versionKey: false, timestamps: true },
);

addressSchema.index({ userId: 1, createdAt: -1 });
addressSchema.index({ userId: 1 }, { unique: true, partialFilterExpression: { isDefault: true } });
addressSchema.index({ location: "2dsphere" });

export type AddressDocument = InferSchemaType<typeof addressSchema>;

export const AddressModel: Model<AddressDocument> =
  (models.Address as Model<AddressDocument> | undefined) ?? model<AddressDocument>("Address", addressSchema);
