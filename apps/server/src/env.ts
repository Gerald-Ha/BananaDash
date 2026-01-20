import dotenv from "dotenv";

dotenv.config();

const buildAllowedOrigins = (): string[] => {
  const base = process.env.CLIENT_URL || "http://localhost:1337";
  const list = base.split(",").map((s) => s.trim()).filter(Boolean);

  const set = new Set(list);

  list.forEach((o) => {
    try {
      const u = new URL(o);

      if (u.hostname === "localhost") {
        const portSuffix = u.port ? `:${u.port}` : "";
        set.add(`${u.protocol}//127.0.0.1${portSuffix}`);

        set.add(`${u.protocol}//0.0.0.0${portSuffix}`);
      }

      if (/^\d+\.\d+\.\d+\.\d+$/.test(u.hostname)) {
        if (u.protocol === "https:") {
          set.add(`http://${u.hostname}${u.port ? `:${u.port}` : ""}`);
        }
      }
    } catch {
    }
  });

  return Array.from(set);
};

import { updateConfig } from "./config/updateConfig";

export const env = {
  port: parseInt(process.env.PORT || "1337", 10),
  mongoUri: process.env.MONGO_URI || "mongodb://localhost:27017/bananadash",
  jwtSecret: process.env.JWT_SECRET || "secret",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "1d",
  appVersion: updateConfig.appVersion, 
  allowedOrigins: buildAllowedOrigins(),
  uploadDir: process.env.UPLOAD_DIR || "uploads",
  allowRegistrationDefault: (process.env.ALLOW_REGISTRATION_DEFAULT || "false") === "true",
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000", 10),
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || "200", 10)
};
