import express from "express";
import bcrypt from "bcrypt";
import { requireAdmin, authenticate } from "../middleware/auth";
import { SettingsModel } from "../models/Settings";
import { adminSettingsSchema, createUserSchema } from "../validation/schemas";
import { UserModel } from "../models/User";
import { formatZodError } from "../utils/formatError";

const router = express.Router();

router.use(authenticate, requireAdmin);

router.get("/users", async (_req, res) => {
  const users = await UserModel.find().select("username role createdAt").lean();

  res.json({ users: users.map(u => ({ id: u._id.toString(), username: u.username, role: u.role, createdAt: u.createdAt })) });
});

router.post("/users", async (req, res) => {
  const parsed = createUserSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ error: formatZodError(parsed.error) });
  }

  const { username, password, role } = parsed.data;
  const existing = await UserModel.findOne({ username });

  if (existing) {
    return res.status(400).json({ error: "Username taken" });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await UserModel.create({ username, passwordHash, role });

  const referenceSettings = await SettingsModel.findOne();

  const baseTheme = referenceSettings?.theme || { mode: "dark", primary: "#16a34a", accent: "#facc15", font: "Inter" };

  const baseLayout = referenceSettings?.layout || { layoutMode: "auto", itemSize: "medium" };

  const customCss = referenceSettings?.customCss || "";
  await SettingsModel.create({
    userId: user._id,
    allowRegistration: referenceSettings?.allowRegistration ?? false,
    theme: baseTheme,
    layout: baseLayout,
    customCss
  });

  res.json({ user: { id: user.id, username: user.username, role: user.role } });
});

router.patch("/settings", async (req, res) => {
  const parsed = adminSettingsSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ error: formatZodError(parsed.error) });
  }

  const { allowRegistration } = parsed.data;
  await SettingsModel.updateMany({}, { allowRegistration });

  res.json({ allowRegistration });
});

router.delete("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const user = await UserModel.findById(id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    await SettingsModel.deleteMany({ userId: user._id });

    await UserModel.findByIdAndDelete(id);

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete user error:", error);

    res.status(500).json({ error: "Failed to delete user" });
  }
});

export default router;
