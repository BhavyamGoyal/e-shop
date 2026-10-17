import { model, models, Schema, type InferSchemaType, type Model } from "mongoose";

export const USER_ROLES = ["admin", "manager", "customer"] as const;
export type UserRole = (typeof USER_ROLES)[number];

const userSchema = new Schema(
  {
    name: { type: String, default: "" },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, default: null },
    image: { type: String, default: "" },
    passwordHash: { type: String, default: "" },
    role: { type: String, enum: USER_ROLES, default: "customer" },
    tinglePoints: { type: Number, default: 0, min: 0, validate: Number.isInteger },
    createdAt: { type: Date, default: Date.now },
  },
  { collection: "users", versionKey: false },
);

userSchema.index({ phone: 1 }, { unique: true, partialFilterExpression: { phone: { $type: "string" } } });

export type UserDocument = InferSchemaType<typeof userSchema>;

export const UserModel: Model<UserDocument> =
  (models.User as Model<UserDocument> | undefined) ?? model<UserDocument>("User", userSchema);
