import express from "express";
import path from "path";
import { authenticate } from "../middleware/auth";
import { AuthRequest } from "../types";
import { categorySchema } from "../validation/schemas";
import { CategoryModel } from "../models/Category";
import { BookmarkModel } from "../models/Bookmark";

const router = express.Router();

router.use(authenticate);

router.get("/", async (req: AuthRequest, res) => {
  const categories = await CategoryModel.find({ userId: req.user?.id }).sort({ order: 1 });

  const mapped = categories.map((c) => {
    const obj = c.toObject();

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

  res.json({ categories: mapped });
});

router.post("/", async (req: AuthRequest, res) => {
  const parsed = categorySchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const count = await CategoryModel.countDocuments({ userId: req.user?.id, spaceId: parsed.data.spaceId });

  const category = await CategoryModel.create({ ...parsed.data, userId: req.user?.id, order: count });

  res.json({ category });
});

router.put("/:id", async (req: AuthRequest, res) => {
  console.log(`[Category PUT] Updating category ${req.params.id} for user ${req.user?.id}`);

  console.log("[Category PUT] Request body:", JSON.stringify(req.body, null, 2));

  const parsed = categorySchema.partial().safeParse(req.body);

  if (!parsed.success) {
    console.error("[Category PUT] Validation failed:", parsed.error.flatten());

    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const updateData: any = { ...parsed.data };

  console.log("[Category PUT] Parsed data:", JSON.stringify(updateData, null, 2));

  const shouldRemoveIcon = updateData.iconUrl === null || updateData.iconPath === null;
  if (shouldRemoveIcon) {
    console.log("[Category PUT] Icon removal detected - using $unset to remove iconUrl/iconPath");

    delete updateData.iconUrl;
    delete updateData.iconPath;
    updateData.$unset = { iconUrl: "", iconPath: "" };
  }

  console.log("[Category PUT] Final updateData:", JSON.stringify(updateData, null, 2));

  const category = await CategoryModel.findOneAndUpdate({ _id: req.params.id, userId: req.user?.id }, updateData, { new: true });

  if (!category) {
    console.error("[Category PUT] Category not found");

    return res.status(404).json({ error: "Not found" });
  }

  const result = category.toObject();

  console.log("[Category PUT] Category after update:", JSON.stringify(result, null, 2));

  if (result.iconPath && !result.iconUrl) {
    const uploadsIndex = result.iconPath.indexOf("uploads");

    if (uploadsIndex !== -1) {
      result.iconUrl = `/${result.iconPath.substring(uploadsIndex)}`;
    } else {
      result.iconUrl = result.iconPath;
    }

    console.log("[Category PUT] Converted iconPath to iconUrl:", result.iconUrl);
  }

  console.log("[Category PUT] Final response:", JSON.stringify(result, null, 2));

  res.json({ category: result });
});

router.delete("/:id", async (req: AuthRequest, res) => {
  const category = await CategoryModel.findOneAndDelete({ _id: req.params.id, userId: req.user?.id });

  if (!category) {
    return res.status(404).json({ error: "Not found" });
  }

  await BookmarkModel.deleteMany({ categoryId: category.id, userId: req.user?.id });

  res.json({ ok: true });
});

export default router;
