import mongoose, { Schema, Document } from "mongoose";

export interface SpaceDocument extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  icon: string;
  iconPath?: string; 
  iconUrl?: string;  
  order: number;
}

const spaceSchema = new Schema<SpaceDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    icon: { type: String, default: "🌐" },
    iconPath: { type: String },
    iconUrl: { type: String },
    order: { type: Number, default: 0 }
  },
  { versionKey: false }

);

spaceSchema.index({ userId: 1, order: 1 });

export const SpaceModel = mongoose.model<SpaceDocument>("Space", spaceSchema);
