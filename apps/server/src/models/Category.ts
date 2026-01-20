import mongoose, { Schema, Document } from "mongoose";

export interface CategoryDocument extends Document {
  userId: mongoose.Types.ObjectId;
  spaceId: mongoose.Types.ObjectId;
  name: string;
  icon: string;
  iconPath?: string;
  iconUrl?: string;
  sortBy: string;
  numRows: number;
  order: number;
}

const categorySchema = new Schema<CategoryDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    spaceId: { type: Schema.Types.ObjectId, ref: "Space", required: true },
    name: { type: String, required: true },
    icon: { type: String, default: "📁" },
    iconPath: { type: String },
    iconUrl: { type: String },
    sortBy: { type: String, default: "custom" },
    numRows: { type: Number, default: 1 },
    order: { type: Number, default: 0 }
  },
  { versionKey: false }

);

categorySchema.index({ userId: 1, spaceId: 1, order: 1 });

export const CategoryModel = mongoose.model<CategoryDocument>("Category", categorySchema);
