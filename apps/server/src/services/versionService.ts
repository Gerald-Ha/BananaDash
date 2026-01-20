import { env } from "../env";
import { checkBananaDashUpdates, UpdateCheckResult } from "./updateCheckService";

let cachedResult: UpdateCheckResult | null = null;
let cachedAt = 0;
const cacheTtl = 1000 * 60 * 5; 
export const getVersionStatus = async (forceRefresh: boolean = false) => {
  const timestamp = new Date().toISOString();

  console.log(`[Version Service] getVersionStatus called at ${timestamp}, forceRefresh: ${forceRefresh}`);

  const installed = env.appVersion;
  const now = Date.now();

  const cacheAge = cachedResult ? now - cachedAt : null;
  const cacheAgeSeconds = cacheAge ? Math.floor(cacheAge / 1000) : null;
  console.log(`[Version Service] Cache status:`, {
    hasCache: !!cachedResult,
    cacheAge: cacheAgeSeconds ? `${cacheAgeSeconds}s` : "N/A",
    cacheTtl: `${Math.floor(cacheTtl / 1000)}s`,
    willUseCache: !forceRefresh && cachedResult && now - cachedAt < cacheTtl,
  });

  if (!forceRefresh && cachedResult && now - cachedAt < cacheTtl) {
    console.log(`[Version Service] Using cached result`);

    return {
      installed,
      latest: cachedResult.latestVersion || installed,
      status: mapUpdateStatus(cachedResult.status),
      updateInfo: cachedResult,
    };
  }

  console.log(`[Version Service] Cache expired or force refresh - checking for updates...`);

  try {
    const result = await checkBananaDashUpdates();

    cachedResult = result;
    cachedAt = now;
    console.log(`[Version Service] Update check completed:`, {
      installed,
      latest: result.latestVersion || installed,
      status: mapUpdateStatus(result.status),
      hasUpdateInfo: !!result,
    });

    return {
      installed,
      latest: result.latestVersion || installed,
      status: mapUpdateStatus(result.status),
      updateInfo: result,
    };
  } catch (error) {
    console.error(`[Version Service] Update check error:`, error);

    return {
      installed,
      latest: installed,
      status: "unknown",
      updateInfo: null,
    };
  }
};

const mapUpdateStatus = (status: string): "outdated" | "up-to-date" | "unknown" => {
  switch (status) {
    case "update_available":
      return "outdated";
    case "up_to_date":
      return "up-to-date";
    case "blocked":
      return "outdated"; 
    default:
      return "unknown";
  }
};
