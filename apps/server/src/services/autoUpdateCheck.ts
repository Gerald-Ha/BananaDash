import { getVersionStatus } from "./versionService";

let updateCheckInterval: NodeJS.Timeout | null = null;
export const startAutoUpdateCheck = (intervalMs: number = 1000 * 60 * 5) => {
  if (updateCheckInterval) {
    clearInterval(updateCheckInterval);
  }

  console.log(`[Auto Update Check] Starting automatic update check every ${intervalMs / 1000}s`);

  performUpdateCheck();

  updateCheckInterval = setInterval(() => {
    performUpdateCheck();
  }, intervalMs);
};

export const stopAutoUpdateCheck = () => {
  if (updateCheckInterval) {
    clearInterval(updateCheckInterval);

    updateCheckInterval = null;
    console.log("[Auto Update Check] Stopped automatic update check");
  }
};

const performUpdateCheck = async () => {
  const timestamp = new Date().toISOString();

  console.log(`[Auto Update Check] Performing background update check at ${timestamp}`);

  try {
    const result = await getVersionStatus(true);

    console.log(`[Auto Update Check] Update check completed:`, {
      installed: result.installed,
      latest: result.latest,
      status: result.status,
      hasUpdateInfo: !!result.updateInfo,
    });
  } catch (error) {
    console.error(`[Auto Update Check] Update check failed:`, error);
  }
};
