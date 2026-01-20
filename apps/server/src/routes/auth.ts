import express from "express";
import bcrypt from "bcrypt";
import { UserModel } from "../models/User";
import { signToken } from "../utils/jwt";
import { bootstrapSchema, loginSchema, changeUsernameSchema, changePasswordSchema } from "../validation/schemas";
import { AuthRequest } from "../types";
import { authenticate } from "../middleware/auth";
import { SettingsModel } from "../models/Settings";
import { env } from "../env";

const router = express.Router();

const setAuthCookie = (res: express.Response, token: string) => {
  res.cookie("token", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    maxAge: 1000 * 60 * 60 * 24
  });
};

router.post("/bootstrap", async (req, res, next) => {
  try {
    const userCount = await UserModel.countDocuments();

    if (userCount > 0) {
      return res.status(400).json({ error: "Already initialized" });
    }

    const parsed = bootstrapSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }

    const { username, password } = parsed.data;
    const passwordHash = await bcrypt.hash(password, 10);

    const user = await UserModel.create({ username, passwordHash, role: "admin" });

    await SettingsModel.create({
      userId: user._id,
      allowRegistration: env.allowRegistrationDefault,
      theme: { mode: "dark", primary: "#16a34a", accent: "#facc15", font: "Inter" },
      layout: { layoutMode: "auto", itemSize: "medium" },
      customCss: ""
    });

    const token = signToken(user.id);

    setAuthCookie(res, token);

    res.json({ user: { id: user.id, username: user.username, role: user.role, onboardingCompleted: user.onboardingCompleted } });
  } catch (err) {
    next(err);
  }
});

router.get("/bootstrap-status", async (_req, res) => {
  const userCount = await UserModel.countDocuments();

  res.json({ allowed: userCount === 0 });
});

router.get("/registration-status", async (_req, res) => {
  const settings = await SettingsModel.findOne();

  res.json({ allowed: settings?.allowRegistration || false });
});

router.post("/register", async (req, res) => {
  const settings = await SettingsModel.findOne();

  if (!settings || !settings.allowRegistration) {
    return res.status(403).json({ error: "Registration disabled" });
  }

  const parsed = bootstrapSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const { username, password } = parsed.data;
  const existing = await UserModel.findOne({ username });

  if (existing) {
    return res.status(400).json({ error: "Username taken" });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await UserModel.create({ username, passwordHash, role: "user" });

  await SettingsModel.create({
    userId: user._id,
    allowRegistration: settings.allowRegistration,
    theme: settings.theme,
    layout: settings.layout,
    customCss: settings.customCss
  });

  const token = signToken(user.id);

  setAuthCookie(res, token);

  const savedUser = await UserModel.findById(user._id);

  res.json({ user: { id: savedUser!.id, username: savedUser!.username, role: savedUser!.role, onboardingCompleted: savedUser!.onboardingCompleted } });
});

router.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const { username, password } = parsed.data;
  const user = await UserModel.findOne({ username });

  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const match = await bcrypt.compare(password, user.passwordHash);

  if (!match) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const token = signToken(user.id);

  setAuthCookie(res, token);

  res.json({ user: { id: user.id, username: user.username, role: user.role } });
});

router.post("/logout", authenticate, async (_req, res) => {
  res.clearCookie("token");

  res.json({ ok: true });
});

router.get("/me", authenticate, async (req: AuthRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  res.json({ user: { id: req.user.id, username: req.user.username, role: req.user.role, onboardingCompleted: req.user.onboardingCompleted } });
});

router.post("/change-username", authenticate, async (req: AuthRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const parsed = changeUsernameSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const { username } = parsed.data;
  const existing = await UserModel.findOne({ username });

  if (existing && existing.id !== req.user.id) {
    return res.status(400).json({ error: "Username taken" });
  }

  req.user.username = username;
  await req.user.save();

  res.json({ user: { id: req.user.id, username: req.user.username, role: req.user.role } });
});

router.post("/change-password", authenticate, async (req: AuthRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const parsed = changePasswordSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const { currentPassword, newPassword } = parsed.data;
  const match = await bcrypt.compare(currentPassword, req.user.passwordHash);

  if (!match) {
    return res.status(400).json({ error: "Invalid current password" });
  }

  req.user.passwordHash = await bcrypt.hash(newPassword, 10);

  await req.user.save();

  res.json({ ok: true });
});

router.post("/onboarding-complete", authenticate, async (req: AuthRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    req.user.onboardingCompleted = true;
    await req.user.save();

    res.json({ ok: true, onboardingCompleted: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to update onboarding status" });
  }
});

export default router;
