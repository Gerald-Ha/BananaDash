import express from "express";
import multer from "multer";
import fs from "fs/promises";
import { authenticate } from "../middleware/auth";
import { AuthRequest } from "../types";
import { createBackup, restoreBackup } from "../services/backupService";

const router = express.Router();

const upload = multer({ dest: "tmp" });

router.use(authenticate);

router.get("/", async (req: AuthRequest, res) => {
  const buffer = await createBackup(req.user?.id as string);

  res.setHeader("Content-Type", "application/zip");

  res.setHeader("Content-Disposition", "attachment; filename=bananadash-backup.zip");

  res.send(buffer);
});

router.post("/", upload.single("file"), async (req: AuthRequest, res) => {
  if (!req.file) {
    console.error("[Backup] No file provided");

    return res.status(400).json({ error: "File required" });
  }

  console.log(`[Backup] Received file: ${req.file.originalname}, size: ${req.file.size}, path: ${req.file.path}`);

  try {
    await restoreBackup(req.user?.id as string, req.file.path);

    await fs.unlink(req.file.path);

    console.log("[Backup] Restore completed, temporary file deleted");

    res.json({ ok: true });
  } catch (error: any) {
    console.error("[Backup] Restore failed:", error);

    try {
      await fs.unlink(req.file.path);
    } catch {}

    res.status(500).json({ error: error.message || "Failed to restore backup" });
  }
});

export default router;
