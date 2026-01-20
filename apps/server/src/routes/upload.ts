import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs/promises";
import { nanoid } from "nanoid";
import { authenticate } from "../middleware/auth";
import { AuthRequest } from "../types";
import { env } from "../env";
import { getCategoryDir, getSpaceLogoDir, sanitizeFileName } from "../utils/fileUtils";
import { SpaceModel } from "../models/Space";
import { CategoryModel } from "../models/Category";

const router = express.Router();

router.use(authenticate);

const tempDir = path.join(env.uploadDir, "temp");

const upload = multer({
  storage: multer.diskStorage({
    destination: async (_req, _file, cb) => {
      try {
        await fs.mkdir(tempDir, { recursive: true });

        cb(null, tempDir);
      } catch (error: any) {
        cb(error, "");
      }
    },
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();

      const allowedExts = [".png", ".svg", ".jpeg", ".jpg", ".ico", ".webp"];
      if (!allowedExts.includes(ext)) {
        cb(new Error("Invalid file type. Allowed: PNG, SVG, JPEG, JPG, ICO, WEBP"), "");

        return;
      }

      const filename = `${nanoid()}${ext}`;
      cb(null, filename);
    }
  }),
  limits: { fileSize: 5 * 1024 * 1024 } 
});

router.post("/icon", upload.single("file"), async (req: AuthRequest, res) => {
  let tempFilePath: string | null = null;
  try {
    console.log("[Upload] Icon upload request:", {
      hasFile: !!req.file,
      body: req.body,
      userId: req.user?.id
    });

    if (!req.file) {
      console.error("[Upload] No file provided");

      return res.status(400).json({ error: "File required" });
    }

    tempFilePath = req.file.path;
    const { spaceId, categoryId, type, bookmarkTitle } = req.body;
    console.log("[Upload] Request params:", { spaceId, categoryId, type, bookmarkTitle });

    if (!spaceId || !type) {
      console.error("[Upload] Missing required params");

      return res.status(400).json({ error: "spaceId and type are required" });
    }

    if (type !== "space" && !categoryId) {
      console.error("[Upload] Missing categoryId for non-space type");

      return res.status(400).json({ error: "categoryId is required for this type" });
    }

    if (!req.user?.id) {
      console.error("[Upload] User not authenticated");

      return res.status(401).json({ error: "User not authenticated" });
    }

    const space = await SpaceModel.findOne({ _id: spaceId, userId: req.user.id });

    if (!space) {
      console.error("[Upload] Space not found:", spaceId);

      return res.status(404).json({ error: "Space not found" });
    }

    console.log("[Upload] Space found:", space.name);

    const ext = path.extname(req.file.originalname).toLowerCase();

    let finalFilename: string;
    let targetDir: string;
    let targetPath: string;
    if (type === "space") {
      finalFilename = `space${ext}`;
      targetDir = getSpaceLogoDir(env.uploadDir, space.name);

      targetPath = path.join(targetDir, finalFilename);
    } else {
      const category = await CategoryModel.findOne({ _id: categoryId, userId: req.user.id });

      if (!category) {
        console.error("[Upload] Category not found:", categoryId);

        return res.status(404).json({ error: "Category not found" });
      }

      console.log("[Upload] Category found:", category.name);

      if (type === "category") {
        finalFilename = `category${ext}`;
      } else if (type === "bookmark" && bookmarkTitle) {
        const sanitized = sanitizeFileName(bookmarkTitle);

        finalFilename = `${sanitized}${ext}`;
      } else {
        finalFilename = `${nanoid()}${ext}`;
      }

      targetDir = getCategoryDir(env.uploadDir, space.name, category.name);

      targetPath = path.join(targetDir, finalFilename);
    }

    await fs.mkdir(targetDir, { recursive: true });

    await fs.rename(tempFilePath, targetPath);

    tempFilePath = null; 
    const spaceName = sanitizeFileName(space.name);

    let publicUrl: string;
    if (type === "space") {
      publicUrl = `/uploads/spaces/${spaceName}/${finalFilename}`;
    } else {
      const category = await CategoryModel.findOne({ _id: categoryId, userId: req.user.id });

      if (!category) {
        throw new Error("Category not found");
      }

      const categoryName = sanitizeFileName(category.name);

      publicUrl = `/uploads/spaces/${spaceName}/${categoryName}/${finalFilename}`;
    }

    const iconPath = targetPath;
    console.log("[Upload] Upload successful:", { publicUrl, iconPath });

    res.json({ iconUrl: publicUrl, iconPath });
  } catch (error: any) {
    console.error("[Upload] Error during upload:", error);

    if (tempFilePath) {
      try {
        await fs.unlink(tempFilePath);
      } catch (unlinkError) {
        console.error("[Upload] Failed to delete temp file:", unlinkError);
      }
    }

    res.status(500).json({ error: error.message || "Failed to upload icon" });
  }
});

router.delete("/icon/:filename", async (req: AuthRequest, res) => {
  const filename = req.params.filename;
  if (filename.includes("..") || filename.includes("/") || filename.includes("\\")) {
    return res.status(400).json({ error: "Invalid filename" });
  }

  const filepath = path.join(env.uploadDir, "icons", filename);

  try {
    await fs.unlink(filepath);

    res.json({ ok: true });
  } catch (error: any) {
    if (error.code === "ENOENT") {
      return res.status(404).json({ error: "File not found" });
    }

    return res.status(500).json({ error: "Failed to delete file" });
  }
});

export default router;
