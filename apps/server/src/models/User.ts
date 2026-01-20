import mongoose, { Schema, Document } from "mongoose";

export type UserRole = "admin" | "user";
export interface UserDocument extends Document {
  username: string;
  passwordHash: string;
  role: UserRole;
  onboardingCompleted: boolean;
  createdAt: Date;
}

const userSchema = new Schema<UserDocument>(
  {
    username: { type: String, unique: true, required: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["admin", "user"], default: "user" },
    onboardingCompleted: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
  },
  { versionKey: false }

);

export const UserModel = mongoose.model<UserDocument>("User", userSchema);
