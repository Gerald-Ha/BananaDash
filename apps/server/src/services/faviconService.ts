import axios from "axios";
import fs from "fs/promises";
import path from "path";
import { nanoid } from "nanoid";
import { env } from "../env";
import { FaviconCacheModel } from "../models/FaviconCache";

const ensureDir = async () => {
  const dir = path.join(env.uploadDir, "icons");

  await fs.mkdir(dir, { recursive: true });

  return dir;
};

const saveIcon = async (buffer: Buffer, ext: string) => {
  const dir = await ensureDir();

  const filename = `${nanoid()}.${ext}`;
  const filepath = path.join(dir, filename);

  await fs.writeFile(filepath, buffer);

  return { filepath, publicUrl: `/uploads/icons/${filename}` };
};

const fetchUrl = async (url: string) => {
  return axios.get<ArrayBuffer>(url, { responseType: "arraybuffer", timeout: 5000 });
};

const discoverFromHtml = (html: string, origin: string) => {
  const match = html.match(/<link[^>]+rel=["'](?:apple-touch-icon|icon)["'][^>]+>/i);

  if (!match) {
    return null;
  }

  const hrefMatch = match[0].match(/href=["']([^"']+)["']/i);

  if (!hrefMatch) {
    return null;
  }

  const href = hrefMatch[1];
  if (href.startsWith("http")) {
    return href;
  }

  if (href.startsWith("//")) {
    return `https:${href}`;
  }

  if (href.startsWith("/")) {
    return `${origin}${href}`;
  }

  return `${origin}/${href}`;
};

export const resolveFavicon = async (serviceUrl: string) => {
  const cached = await FaviconCacheModel.findOne({ targetUrl: serviceUrl });

  if (cached) {
    const derivedUrl = cached.iconPath ? `/uploads/icons/${path.basename(cached.iconPath)}` : undefined;
    return { iconPath: cached.iconPath, iconUrl: cached.iconUrl || derivedUrl };
  }

  try {
    const urlObj = new URL(serviceUrl);

    const origin = urlObj.origin;
    const icoRes = await fetchUrl(`${origin}/favicon.ico`);

    if (icoRes.status < 400 && icoRes.data.byteLength > 0) {
      const buffer = Buffer.from(icoRes.data);

      const saved = await saveIcon(buffer, "ico");

      await FaviconCacheModel.create({ targetUrl: serviceUrl, iconPath: saved.filepath, iconUrl: saved.publicUrl });

      return { iconPath: saved.filepath, iconUrl: saved.publicUrl };
    }
  } catch {}

  try {
    const urlObj = new URL(serviceUrl);

    const origin = urlObj.origin;
    const pageRes = await axios.get<string>(serviceUrl, { timeout: 5000 });

    if (pageRes.status < 400 && pageRes.data) {
      const found = discoverFromHtml(pageRes.data, origin);

      if (found) {
        const iconRes = await fetchUrl(found);

        if (iconRes.status < 400 && iconRes.data.byteLength > 0) {
          const ext = found.split(".").pop() || "png";
          const buffer = Buffer.from(iconRes.data);

          const saved = await saveIcon(buffer, ext);

          await FaviconCacheModel.create({ targetUrl: serviceUrl, iconPath: saved.filepath, iconUrl: saved.publicUrl });

          return { iconPath: saved.filepath, iconUrl: saved.publicUrl };
        }
      }
    }
  } catch {}

  await FaviconCacheModel.create({ targetUrl: serviceUrl });

  return {};
};
