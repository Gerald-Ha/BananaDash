import express from "express";
import path from "path";
import { authenticate } from "../middleware/auth";
import { AuthRequest } from "../types";
import { spaceSchema } from "../validation/schemas";
import { SpaceModel } from "../models/Space";
import { CategoryModel } from "../models/Category";
import { BookmarkModel } from "../models/Bookmark";

const router = express.Router();

router.use(authenticate);

router.get("/", async (req: AuthRequest, res) => {
  const spaces = await SpaceModel.find({ userId: req.user?.id }).sort({ order: 1 });

  const mapped = spaces.map((s) => {
    const obj = s.toObject();

    if (obj.iconPath && !obj.iconUrl) {
      const uploadsIndex = obj.iconPath.indexOf("uploads");

      if (uploadsIndex !== -1) {
        obj.iconUrl = `/${obj.iconPath.substring(uploadsIndex)}`;
      } else {
        obj.iconUrl = obj.iconPath;
      }
    }

    return obj;
  });

  res.json({ spaces: mapped });
});

router.post("/", async (req: AuthRequest, res) => {
  const parsed = spaceSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const count = await SpaceModel.countDocuments({ userId: req.user?.id });

  const space = await SpaceModel.create({ ...parsed.data, userId: req.user?.id, order: count });

  res.json({ space });
});

router.put("/:id", async (req: AuthRequest, res) => {
  const parsed = spaceSchema.partial().safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const updateData: any = { ...parsed.data };

  const shouldRemoveIcon = updateData.iconUrl === null || updateData.iconPath === null;
  if (shouldRemoveIcon) {
    console.log("[Space PUT] Icon removal detected - using $unset to remove iconUrl/iconPath");

    delete updateData.iconUrl;
    delete updateData.iconPath;
    updateData.$unset = { iconUrl: "", iconPath: "" };
  }

  const space = await SpaceModel.findOneAndUpdate({ _id: req.params.id, userId: req.user?.id }, updateData, { new: true });

  if (!space) {
    return res.status(404).json({ error: "Not found" });
  }

  const result = space.toObject();

  if (result.iconPath && !result.iconUrl) {
    const uploadsIndex = result.iconPath.indexOf("uploads");

    if (uploadsIndex !== -1) {
      result.iconUrl = `/${result.iconPath.substring(uploadsIndex)}`;
    } else {
      result.iconUrl = result.iconPath;
    }
  }

  res.json({ space: result });
});

router.delete("/:id", async (req: AuthRequest, res) => {
  const space = await SpaceModel.findOneAndDelete({ _id: req.params.id, userId: req.user?.id });

  if (!space) {
    return res.status(404).json({ error: "Not found" });
  }

  await CategoryModel.deleteMany({ spaceId: space.id, userId: req.user?.id });

  await BookmarkModel.deleteMany({ spaceId: space.id, userId: req.user?.id });

  res.json({ ok: true });
});

export default router;
