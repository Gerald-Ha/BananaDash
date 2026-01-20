import express from "express";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import cors from "cors";
import path from "path";
import fs from "fs/promises";
import rateLimit from "express-rate-limit";
import { connectDb } from "./db";
import { env } from "./env";
import authRoutes from "./routes/auth";
import adminRoutes from "./routes/admin";
import spacesRoutes from "./routes/spaces";
import categoriesRoutes from "./routes/categories";
import bookmarksRoutes from "./routes/bookmarks";
import reorderRoutes from "./routes/reorder";
import settingsRoutes from "./routes/settings";
import backupRoutes from "./routes/backup";
import versionRoutes from "./routes/version";
import uploadRoutes from "./routes/upload";
import { errorHandler } from "./middleware/error";
import { startAutoUpdateCheck } from "./services/autoUpdateCheck";

const app = express();

process.on("unhandledRejection", (err) => {
  console.error("UnhandledRejection", err);

  process.exit(1);
});

process.on("uncaughtException", (err) => {
  console.error("UncaughtException", err);

  process.exit(1);
});

const start = async () => {
  await fs.mkdir(env.uploadDir, { recursive: true });

  await connectDb();

  const authLimiter = rateLimit({
    windowMs: env.rateLimitWindowMs,
    max: env.rateLimitMax
  });

  const disableCSP = process.env.DISABLE_CSP === "true";
  app.use(
    helmet({
      contentSecurityPolicy: disableCSP ? false : {
        directives: {
          defaultSrc: ["'self'", "http:", "https:"],
          scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "http:", "https:"],
          styleSrc: ["'self'", "http:", "https:", "'unsafe-inline'"],
          imgSrc: ["'self'", "data:", "http:", "https:", "blob:"],
          connectSrc: ["'self'", "http:", "https:", ...env.allowedOrigins],
          fontSrc: ["'self'", "http:", "https:", "data:"],
          frameAncestors: ["'self'"],
          objectSrc: ["'none'"]
        },
        useDefaults: false
      },
      hsts: false,
      crossOriginEmbedderPolicy: false,
      crossOriginOpenerPolicy: false,
      crossOriginResourcePolicy: false
    })

  );

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin) {
          return callback(null, true);
        }

        if (env.allowedOrigins.includes(origin)) {
          return callback(null, true);
        }

        try {
          const url = new URL(origin);

          const isLocalhost = url.hostname === "localhost" || url.hostname === "127.0.0.1" || url.hostname === "0.0.0.0";
          const isIP = /^\d+\.\d+\.\d+\.\d+$/.test(url.hostname);

          const isLocalNetwork = isIP && (url.hostname.startsWith("192.168.") || url.hostname.startsWith("10.") || url.hostname.startsWith("172."));

          if (isLocalhost || isLocalNetwork) {
            return callback(null, true);
          }
        } catch {
        }

        callback(null, false);
      },
      credentials: true
    })

  );

  app.use(express.json({ limit: "5mb" }));

  app.use(cookieParser());

  app.use("/uploads", express.static(env.uploadDir));

  app.use("/api/auth", authLimiter, authRoutes);

  app.use("/api/admin", adminRoutes);

  app.use("/api/spaces", spacesRoutes);

  app.use("/api/categories", categoriesRoutes);

  app.use("/api/bookmarks", bookmarksRoutes);

  app.use("/api/reorder", reorderRoutes);

  app.use("/api/settings", settingsRoutes);

  app.use("/api/backup", backupRoutes);

  app.use("/api/version", versionRoutes);

  app.use("/api/upload", uploadRoutes);

  const webBuild = path.join(process.cwd(), "apps/web/dist");

  app.use((req, res, next) => {
    res.removeHeader("Origin-Agent-Cluster");

    res.removeHeader("Strict-Transport-Security");

    res.removeHeader("Upgrade-Insecure-Requests");

    next();
  });

  app.use(express.static(webBuild, {
    setHeaders: (res) => {
      res.removeHeader("Origin-Agent-Cluster");

      res.removeHeader("Strict-Transport-Security");
    }
  }));

  app.use("*", (req, res) => {
    res.removeHeader("Origin-Agent-Cluster");

    res.removeHeader("Strict-Transport-Security");

    res.removeHeader("Upgrade-Insecure-Requests");

    res.sendFile(path.join(webBuild, "index.html"));
  });

  app.use(errorHandler);

  app.listen(env.port, () => {
    process.stdout.write(`BananaDash server on ${env.port}\n`);

    const updateCheckInterval = process.env.UPDATE_CHECK_INTERVAL_MS 
      ? parseInt(process.env.UPDATE_CHECK_INTERVAL_MS, 10) 

      : 1000 * 60 * 60 * 12; 
    startAutoUpdateCheck(updateCheckInterval);
  });
};

start();
