import express from "express";
import { getVersionStatus } from "../services/versionService";

const router = express.Router();

router.get("/", async (req, res) => {
  const timestamp = new Date().toISOString();

  console.log(`[Version API] GET /api/version called at ${timestamp}`);

  console.log(`[Version API] Query params:`, req.query);

  console.log(`[Version API] Headers:`, {
    "user-agent": req.headers["user-agent"],
    "referer": req.headers["referer"],
    "origin": req.headers["origin"],
  });

  const forceRefresh = req.query.force === "true" || req.query.refresh === "true";
  console.log(`[Version API] Force refresh: ${forceRefresh}`);

  try {
    const data = await getVersionStatus(forceRefresh);

    console.log(`[Version API] Version status retrieved:`, {
      installed: data.installed,
      latest: data.latest,
      status: data.status,
      hasUpdateInfo: !!data.updateInfo,
    });

    res.json({
      installed: data.installed,
      latest: data.latest,
      status: data.status,
      updateInfo: data.updateInfo || undefined, 
    });
  } catch (error) {
    console.error(`[Version API] Error getting version status:`, error);

    throw error;
  }
});

export default router;
