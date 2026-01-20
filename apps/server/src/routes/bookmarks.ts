import express from "express";
import path from "path";
import { authenticate } from "../middleware/auth";
import { AuthRequest } from "../types";
import { bookmarkSchema } from "../validation/schemas";
import { BookmarkModel } from "../models/Bookmark";
import { resolveFavicon } from "../services/faviconService";

const router = express.Router();

const toPublicIcon = (iconPath?: string, iconUrl?: string) => {
  if (iconUrl) return iconUrl;
  if (!iconPath) return undefined;
  const uploadsIndex = iconPath.indexOf("uploads");

  if (uploadsIndex !== -1) {
    return `/${iconPath.substring(uploadsIndex)}`;
  }

  return iconPath;
};

router.use(authenticate);

router.get("/", async (req: AuthRequest, res) => {
  const bookmarks = await BookmarkModel.find({ userId: req.user?.id }).sort({ order: 1 });

  const mapped = await Promise.all(bookmarks.map(async (b) => {
    const obj = b.toObject();

    let iconUrl = toPublicIcon(b.iconPath, b.iconUrl);

    if (!iconUrl && !b.iconIsUploaded && b.serviceUrl) {
      const favicon = await resolveFavicon(b.serviceUrl);

      if (favicon.iconUrl) {
        iconUrl = favicon.iconUrl;
        if (!b.iconPath && !b.iconUrl) {
          await BookmarkModel.updateOne(
            { _id: b._id },
            { $set: { iconPath: favicon.iconPath, iconUrl: favicon.iconUrl, iconIsUploaded: false } }

          );
        }
      }
    }

    return {
      ...obj,
      iconUrl
    };
  }));

  res.json({ bookmarks: mapped });
});

router.post("/", async (req: AuthRequest, res) => {
  const parsed = bookmarkSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const data = parsed.data;
  const count = await BookmarkModel.countDocuments({ userId: req.user?.id, categoryId: data.categoryId });

  let iconPath = data.iconPath;
  let iconUrl = data.iconUrl;
  let iconIsUploaded = false;
  if (!data.iconPath && !data.iconUrl) {
    const favicon = await resolveFavicon(data.serviceUrl);

    if (favicon.iconPath && favicon.iconUrl) {
      iconPath = favicon.iconPath;
      iconUrl = favicon.iconUrl;
      iconIsUploaded = false; 
    }
  } else {
    iconIsUploaded = true; 
  }

  const bookmark = await BookmarkModel.create({
    ...data,
    iconPath,
    iconUrl,
    iconIsUploaded,
    userId: req.user?.id,
    order: count
  });

  res.json({ bookmark });
});

router.put("/:id", async (req: AuthRequest, res) => {
  const parsed = bookmarkSchema.partial().safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const payload: any = { ...parsed.data };

  const shouldRemoveIcon = payload.iconUrl === null || payload.iconPath === null;
  if (shouldRemoveIcon) {
    console.log("[Bookmark PUT] Icon removal detected - resolving favicon");

    const currentBookmark = await BookmarkModel.findOne({ _id: req.params.id, userId: req.user?.id });

    if (currentBookmark && currentBookmark.serviceUrl) {
      const favicon = await resolveFavicon(currentBookmark.serviceUrl);

      if (favicon.iconPath && favicon.iconUrl) {
        payload.iconPath = favicon.iconPath;
        payload.iconUrl = favicon.iconUrl;
        payload.iconIsUploaded = false; 
      } else {
        delete payload.iconUrl;
        delete payload.iconPath;
        delete payload.iconIsUploaded;
        payload.$unset = { iconUrl: "", iconPath: "", iconIsUploaded: "" };
      }
    } else {
      delete payload.iconUrl;
      delete payload.iconPath;
      delete payload.iconIsUploaded;
      payload.$unset = { iconUrl: "", iconPath: "", iconIsUploaded: "" };
    }
  } else if (payload.iconPath || payload.iconUrl) {
    if (payload.iconUrl !== null && payload.iconPath !== null) {
      payload.iconIsUploaded = payload.iconIsUploaded !== undefined ? payload.iconIsUploaded : true;
    }
  } else if (payload.serviceUrl) {
    const favicon = await resolveFavicon(payload.serviceUrl);

    if (favicon.iconPath && favicon.iconUrl) {
      payload.iconPath = favicon.iconPath;
      payload.iconUrl = favicon.iconUrl;
      payload.iconIsUploaded = false;
    }
  }

  const bookmark = await BookmarkModel.findOneAndUpdate({ _id: req.params.id, userId: req.user?.id }, payload, { new: true });

  if (!bookmark) {
    return res.status(404).json({ error: "Not found" });
  }

  const result = bookmark.toObject();

  if (result.iconPath && !result.iconUrl) {
    const uploadsIndex = result.iconPath.indexOf("uploads");

    if (uploadsIndex !== -1) {
      result.iconUrl = `/${result.iconPath.substring(uploadsIndex)}`;
    } else {
      result.iconUrl = result.iconPath;
    }
  }

  if (!result.iconUrl && !result.iconIsUploaded && result.serviceUrl) {
    const favicon = await resolveFavicon(result.serviceUrl);

    if (favicon.iconUrl) {
      result.iconUrl = favicon.iconUrl;
      result.iconPath = favicon.iconPath;
      await BookmarkModel.updateOne(
        { _id: bookmark._id },
        { $set: { iconPath: favicon.iconPath, iconUrl: favicon.iconUrl, iconIsUploaded: false } }

      );
    }
  }

  res.json({ bookmark: result });
});

router.delete("/:id", async (req: AuthRequest, res) => {
  const bookmark = await BookmarkModel.findOneAndDelete({ _id: req.params.id, userId: req.user?.id });

  if (!bookmark) {
    return res.status(404).json({ error: "Not found" });
  }

  res.json({ ok: true });
});

export default router;
