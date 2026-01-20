import express from "express";
import { authenticate } from "../middleware/auth";
import { AuthRequest } from "../types";
import { reorderSchema } from "../validation/schemas";
import { SpaceModel } from "../models/Space";
import { CategoryModel } from "../models/Category";
import { BookmarkModel } from "../models/Bookmark";

const router = express.Router();

router.use(authenticate);

router.post("/", async (req: AuthRequest, res) => {
  const entity = req.body.entity as "space" | "category" | "bookmark";
  const parsed = reorderSchema.safeParse({ items: req.body.items });

  if (!entity || !parsed.success) {
    return res.status(400).json({ error: "Invalid payload" });
  }

  const updates = parsed.data.items;
  if (entity === "space") {
    for (const item of updates) {
      await SpaceModel.updateOne({ _id: item.id, userId: req.user?.id }, { order: item.order });
    }
  }

  if (entity === "category") {
    for (const item of updates) {
      await CategoryModel.updateOne({ _id: item.id, userId: req.user?.id }, { order: item.order });
    }
  }

  if (entity === "bookmark") {
    for (const item of updates) {
      await BookmarkModel.updateOne({ _id: item.id, userId: req.user?.id }, { order: item.order });
    }
  }

  res.json({ ok: true });
});

export default router;
