import mongoose, { Schema, Document } from "mongoose";

export type OpeningMethod = "same-tab" | "new-tab" | "iframe";
export interface BookmarkDocument extends Document {
  userId: mongoose.Types.ObjectId;
  spaceId: mongoose.Types.ObjectId;
  categoryId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  iconPath?: string;
  iconUrl?: string;
  iconIsUploaded?: boolean; 
  serviceUrl: string;
  openingMethod: OpeningMethod;
  order: number;
  createdAt: Date;
}

const bookmarkSchema = new Schema<BookmarkDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    spaceId: { type: Schema.Types.ObjectId, ref: "Space", required: true },
    categoryId: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    iconPath: { type: String },
    iconUrl: { type: String },
    iconIsUploaded: { type: Boolean, default: false }, 
    serviceUrl: { type: String, required: true },
    openingMethod: { type: String, default: "same-tab" },
    order: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
  },
  { versionKey: false }

);

bookmarkSchema.index({ userId: 1, categoryId: 1, order: 1 });

export const BookmarkModel = mongoose.model<BookmarkDocument>("Bookmark", bookmarkSchema);
