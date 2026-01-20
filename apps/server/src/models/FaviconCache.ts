import mongoose, { Schema, Document } from "mongoose";

export interface FaviconCacheDocument extends Document {
  targetUrl: string;
  iconPath?: string;
  iconUrl?: string;
  updatedAt: Date;
}

const faviconCacheSchema = new Schema<FaviconCacheDocument>(
  {
    targetUrl: { type: String, unique: true, required: true },
    iconPath: { type: String },
    iconUrl: { type: String },
    updatedAt: { type: Date, default: Date.now }
  },
  { versionKey: false }

);

export const FaviconCacheModel = mongoose.model<FaviconCacheDocument>("FaviconCache", faviconCacheSchema);
