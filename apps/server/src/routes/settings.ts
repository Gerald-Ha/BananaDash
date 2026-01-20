import express from "express";
import { authenticate } from "../middleware/auth";
import { AuthRequest } from "../types";
import { settingsSchema } from "../validation/schemas";
import { SettingsModel } from "../models/Settings";
import { env } from "../env";

const router = express.Router();

router.use(authenticate);

router.get("/", async (req: AuthRequest, res) => {
  let settings = await SettingsModel.findOne({ userId: req.user?.id });

  if (!settings && req.user) {
    settings = await SettingsModel.create({
      userId: req.user.id,
      allowRegistration: env.allowRegistrationDefault,
      theme: { mode: "dark", primary: "#16a34a", accent: "#facc15", font: "Inter" },
      layout: { layoutMode: "auto", itemSize: "medium", fitBoxMode: "auto" },
      customCss: ""
    });
  }

  res.json({ settings });
});

router.put("/", async (req: AuthRequest, res) => {
  const parsed = settingsSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const existing = await SettingsModel.findOne({ userId: req.user?.id });

  if (existing) {
    existing.theme = parsed.data.theme;
    existing.layout = {
      layoutMode: parsed.data.layout.layoutMode,
      itemSize: parsed.data.layout.itemSize,
      fitBoxMode: parsed.data.layout.fitBoxMode || "auto"
    };

    existing.customCss = parsed.data.customCss || "";
    await existing.save();

    return res.json({ settings: existing });
  }

  const created = await SettingsModel.create({
    userId: req.user?.id,
    ...parsed.data,
    layout: {
      layoutMode: parsed.data.layout.layoutMode,
      itemSize: parsed.data.layout.itemSize,
      fitBoxMode: parsed.data.layout.fitBoxMode || "auto"
    }
  });

  res.json({ settings: created });
});

export default router;
