import archiver from "archiver";
import AdmZip from "adm-zip";
import fs from "fs/promises";
import path from "path";
import { PassThrough } from "stream";
import { finished } from "stream/promises";
import mongoose from "mongoose";
import { SpaceModel } from "../models/Space";
import { CategoryModel } from "../models/Category";
import { BookmarkModel } from "../models/Bookmark";
import { SettingsModel } from "../models/Settings";
import { env } from "../env";
import { resolveFavicon } from "./faviconService";

export const createBackup = async (userId: string) => {
  const archive = archiver("zip", { zlib: { level: 9 } });

  const buffers: Buffer[] = [];
  const stream = new PassThrough();

  archive.pipe(stream);

  stream.on("data", (data: Buffer) => buffers.push(data));

  const spaces = await SpaceModel.find({ userId });

  const categories = await CategoryModel.find({ userId });

  const bookmarks = await BookmarkModel.find({ userId });

  const settings = await SettingsModel.findOne({ userId });

  const payload = JSON.stringify({ spaces, categories, bookmarks, settings });

  archive.append(payload, { name: "data.json" });

  const spacesDir = path.join(env.uploadDir, "spaces");

  try {
    const spaceDirs = await fs.readdir(spacesDir);

    for (const spaceDirName of spaceDirs) {
      const spaceDirPath = path.join(spacesDir, spaceDirName);

      const stat = await fs.stat(spaceDirPath);

      if (stat.isDirectory()) {
        const categoryDirs = await fs.readdir(spaceDirPath);

        for (const categoryDirName of categoryDirs) {
          const categoryDirPath = path.join(spaceDirPath, categoryDirName);

          const catStat = await fs.stat(categoryDirPath);

          if (catStat.isDirectory()) {
            const files = await fs.readdir(categoryDirPath);

            for (const file of files) {
              const full = path.join(categoryDirPath, file);

              const fileStat = await fs.stat(full);

              if (fileStat.isFile()) {
                archive.file(full, { name: `spaces/${spaceDirName}/${categoryDirName}/${file}` });
              }
            }
          }
        }
      }
    }
  } catch (err) {
    console.log("[Backup] No spaces directory or error reading:", err);
  }

  await archive.finalize();

  await finished(stream);

  return Buffer.concat(buffers);
};

export const restoreBackup = async (userId: string, zipPath: string) => {
  console.log(`[Backup] Starting restore for user ${userId}`);

  const zip = new AdmZip(zipPath);

  const dataEntry = zip.getEntry("data.json");

  if (!dataEntry) {
    console.error("[Backup] Invalid backup: data.json not found");

    throw new Error("Invalid backup: data.json not found");
  }

  const content = dataEntry.getData().toString("utf-8");

  let parsed: {
    spaces: any[];
    categories: any[];
    bookmarks: any[];
    settings: any;
  };

  try {
    parsed = JSON.parse(content);
  } catch (err) {
    console.error("[Backup] Failed to parse data.json:", err);

    throw new Error("Invalid backup: failed to parse data.json");
  }

  console.log(`[Backup] Parsed data: ${parsed.spaces?.length || 0} spaces, ${parsed.categories?.length || 0} categories, ${parsed.bookmarks?.length || 0} bookmarks`);

  const deletedSpaces = await SpaceModel.deleteMany({ userId });

  const deletedCategories = await CategoryModel.deleteMany({ userId });

  const deletedBookmarks = await BookmarkModel.deleteMany({ userId });

  const deletedSettings = await SettingsModel.deleteMany({ userId });

  console.log(`[Backup] Deleted existing data: ${deletedSpaces.deletedCount} spaces, ${deletedCategories.deletedCount} categories, ${deletedBookmarks.deletedCount} bookmarks, ${deletedSettings.deletedCount} settings`);

  const spaceIdMap = new Map<string, string>();

  const categoryIdMap = new Map<string, string>();

  if (parsed.spaces?.length) {
    const spacesToInsert = parsed.spaces.map(({ _id, ...s }) => ({ ...s, userId }));

    const insertedSpaces = await SpaceModel.insertMany(spacesToInsert);

    parsed.spaces.forEach((space, index) => {
      if (space._id && insertedSpaces[index]?._id) {
        spaceIdMap.set(space._id.toString(), insertedSpaces[index]._id.toString());
      }
    });

    console.log(`[Backup] Restored ${insertedSpaces.length} spaces, ID mapping:`, Array.from(spaceIdMap.entries()));
  }

  if (parsed.categories?.length) {
    const categoriesToInsert = parsed.categories.map(({ _id, ...c }) => {
      const newCategory: any = { ...c, userId };

      if (c.spaceId && spaceIdMap.has(c.spaceId.toString())) {
        const newSpaceId = spaceIdMap.get(c.spaceId.toString());

        if (newSpaceId) {
          newCategory.spaceId = new mongoose.Types.ObjectId(newSpaceId);
        }
      } else if (c.spaceId) {
        newCategory.spaceId = new mongoose.Types.ObjectId(c.spaceId);
      }

      return newCategory;
    });

    const insertedCategories = await CategoryModel.insertMany(categoriesToInsert);

    parsed.categories.forEach((category, index) => {
      if (category._id && insertedCategories[index]?._id) {
        categoryIdMap.set(category._id.toString(), insertedCategories[index]._id.toString());
      }
    });

    console.log(`[Backup] Restored ${insertedCategories.length} categories, ID mapping:`, Array.from(categoryIdMap.entries()));
  }

  if (parsed.bookmarks?.length) {
    const bookmarksToInsert = parsed.bookmarks.map(({ _id, ...b }) => {
      const newBookmark: any = { ...b, userId };

      if (b.spaceId && spaceIdMap.has(b.spaceId.toString())) {
        const newSpaceId = spaceIdMap.get(b.spaceId.toString());

        if (newSpaceId) {
          newBookmark.spaceId = new mongoose.Types.ObjectId(newSpaceId);
        }
      } else if (b.spaceId) {
        newBookmark.spaceId = new mongoose.Types.ObjectId(b.spaceId);
      }

      if (b.categoryId && categoryIdMap.has(b.categoryId.toString())) {
        const newCategoryId = categoryIdMap.get(b.categoryId.toString());

        if (newCategoryId) {
          newBookmark.categoryId = new mongoose.Types.ObjectId(newCategoryId);
        }
      } else if (b.categoryId) {
        newBookmark.categoryId = new mongoose.Types.ObjectId(b.categoryId);
      }

      return newBookmark;
    });

    const insertedBookmarks = await BookmarkModel.insertMany(bookmarksToInsert);

    console.log(`[Backup] Restored ${insertedBookmarks.length} bookmarks`);
  }

  if (parsed.settings) {
    const { _id, ...rest } = parsed.settings;
    await SettingsModel.create({ ...rest, userId });

    console.log("[Backup] Restored settings");
  }

  const iconsDir = path.join(env.uploadDir, "icons");

  await fs.mkdir(iconsDir, { recursive: true });

  const iconEntries = zip.getEntries().filter((e) => e.entryName.startsWith("icons/"));

  let iconCount = 0;
  for (const entry of iconEntries) {
    const fileName = entry.entryName.replace("icons/", "");

    const target = path.join(iconsDir, fileName);

    const data = entry.getData();

    await fs.writeFile(target, data);

    iconCount++;
  }

  console.log(`[Backup] Restored ${iconCount} icons (old format)`);

  const spacesDir = path.join(env.uploadDir, "spaces");

  await fs.mkdir(spacesDir, { recursive: true });

  const spaceEntries = zip.getEntries().filter((e) => e.entryName.startsWith("spaces/"));

  let spaceIconCount = 0;
  for (const entry of spaceEntries) {
    const relativePath = entry.entryName.replace("spaces/", "");

    const target = path.join(spacesDir, relativePath);

    const targetDir = path.dirname(target);

    await fs.mkdir(targetDir, { recursive: true });

    const data = entry.getData();

    await fs.writeFile(target, data);

    spaceIconCount++;
  }

  console.log(`[Backup] Restored ${spaceIconCount} icons (new format: spaces/)`);

  console.log("[Backup] Refetching favicons for bookmarks with auto-fetched icons...");

  const bookmarksToRefetch = await BookmarkModel.find({
    userId,
    iconIsUploaded: false,
    serviceUrl: { $exists: true, $ne: "" }
  });

  let refetchedCount = 0;
  let skippedCount = 0;
  for (const bookmark of bookmarksToRefetch) {
    try {
      let needsRefetch = false;
      if (!bookmark.iconPath || bookmark.iconPath.trim() === "") {
        needsRefetch = true;
      } else {
        try {
          await fs.access(bookmark.iconPath);

          const stats = await fs.stat(bookmark.iconPath);

          if (stats.size === 0) {
            needsRefetch = true;
          }
        } catch {
          needsRefetch = true;
        }
      }

      if (needsRefetch && bookmark.serviceUrl) {
        console.log(`[Backup] Refetching favicon for bookmark: ${bookmark.title} (${bookmark.serviceUrl})`);

        const favicon = await resolveFavicon(bookmark.serviceUrl);

        if (favicon.iconPath && favicon.iconUrl) {
          await BookmarkModel.updateOne(
            { _id: bookmark._id },
            { 
              $set: { 
                iconPath: favicon.iconPath, 
                iconUrl: favicon.iconUrl, 
                iconIsUploaded: false 
              } 
            }

          );

          refetchedCount++;
        } else {
          skippedCount++;
          console.log(`[Backup] Could not fetch favicon for bookmark: ${bookmark.title} (${bookmark.serviceUrl})`);
        }
      } else {
        skippedCount++;
      }
    } catch (error) {
      console.error(`[Backup] Error refetching favicon for bookmark ${bookmark._id}:`, error);

      skippedCount++;
    }
  }

  console.log(`[Backup] Refetched ${refetchedCount} favicons, skipped ${skippedCount} out of ${bookmarksToRefetch.length} bookmarks checked`);

  console.log("[Backup] Restore completed successfully");
};
