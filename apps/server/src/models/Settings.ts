import mongoose, { Schema, Document } from "mongoose";

export interface SettingsDocument extends Document {
  userId: mongoose.Types.ObjectId;
  allowRegistration: boolean;
  theme: {
    mode: "light" | "dark" | "custom";
    primary: string;
    accent: string;
    font: string;
  };

  layout: {
    layoutMode: "auto" | "vertical" | "horizontal";
    itemSize: "small" | "medium" | "large";
    fitBoxMode: "auto" | "fit";
  };

  customCss: string;
}

const settingsSchema = new Schema<SettingsDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    allowRegistration: { type: Boolean, default: false },
    theme: {
      mode: { type: String, default: "dark" },
      primary: { type: String, default: "#16a34a" },
      accent: { type: String, default: "#facc15" },
      font: { type: String, default: "Inter" }
    },
    layout: {
      layoutMode: { type: String, default: "auto" },
      itemSize: { type: String, default: "medium" },
      fitBoxMode: { type: String, default: "auto" }
    },
    customCss: { type: String, default: "" }
  },
  { versionKey: false }

);

settingsSchema.index({ userId: 1 }, { unique: true });

export const SettingsModel = mongoose.model<SettingsDocument>("Settings", settingsSchema);
