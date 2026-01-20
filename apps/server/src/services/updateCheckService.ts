import axios, { AxiosError } from "axios";
import { v4 as uuidv4 } from "uuid";
import { env } from "../env";
import { updateConfig } from "../config/updateConfig";

export type UpdateStatus = "up_to_date" | "update_available" | "blocked" | "unknown" | "error";
export interface UpdateCheckResult {
  status: UpdateStatus;
  currentVersion: string;
  latestVersion?: string;
  minimumSupported?: string;
  critical?: boolean;
  releasedAt?: string;
  updateLink?: string;
  notesUrl?: string;
  dockerImage?: string;
  dockerTag?: string;
  dockerDigest?: string;
  migrations?: string[];
  message?: string;
  requestId?: string;
  serverTime?: string;
}

export interface UpdateCheckRequest {
  project: {
    id: string;
    instance_id: string;
  };

  current: {
    version: string;
    build?: string;
    commit?: string;
    image_digest?: string;
  };

  channel?: "stable" | "beta";
  platform?: {
    os?: string;
    distro?: string;
    arch?: string;
    container?: string;
  };

  capabilities?: {
    accept_prerelease?: boolean;
    supports_delta?: boolean;
  };
}

let instanceId: string | null = null;
const getInstanceId = (): string => {
  if (!instanceId) {
    instanceId = uuidv4();
  }

  return instanceId;
};

export const checkForUpdates = async (
  apiKey: string,
  projectId: string,
  currentVersion: string,
  options?: {
    build?: string;
    commit?: string;
    imageDigest?: string;
    channel?: "stable" | "beta";
    platform?: {
      os?: string;
      distro?: string;
      arch?: string;
      container?: string;
    };

    capabilities?: {
      accept_prerelease?: boolean;
      supports_delta?: boolean;
    };
  }

): Promise<UpdateCheckResult> => {
  const updateServerUrl = updateConfig.updateServerUrl;
  const endpoint = `${updateServerUrl}/api/updates/v1/updates/check`;
  const requestPayload: UpdateCheckRequest = {
    project: {
      id: projectId,
      instance_id: getInstanceId(),
    },
    current: {
      version: currentVersion,
      build: options?.build,
      commit: options?.commit,
      image_digest: options?.imageDigest,
    },
    channel: options?.channel || "stable",
    platform: options?.platform,
    capabilities: options?.capabilities,
  };

  try {
    const response = await axios.post(endpoint, requestPayload, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "X-Request-ID": uuidv4(),
      },
      timeout: 5000, 
    });

    const data = response.data;
    return {
      status: data.status as UpdateStatus,
      currentVersion: data.current?.version || currentVersion,
      latestVersion: data.update?.latest_version,
      minimumSupported: data.update?.minimum_supported,
      critical: data.update?.critical,
      releasedAt: data.update?.released_at,
      updateLink: data.update?.update_link,
      notesUrl: data.update?.notes_url,
      dockerImage: data.update?.docker_image,
      dockerTag: data.update?.docker_tag,
      dockerDigest: data.update?.docker_digest,
      migrations: data.update?.migrations,
      message: data.message,
      requestId: data.request_id,
      serverTime: data.server_time,
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<{
        status?: string;
        message?: string;
        request_id?: string;
        server_time?: string;
      }>;
      if (axiosError.response) {
        const status = axiosError.response.status;
        const data = axiosError.response.data;
        if (status === 401) {
          return {
            status: "error",
            currentVersion,
            message: "Ungültiger API-Key. Bitte prüfen Sie UPDATE_API_KEY in den Umgebungsvariablen.",
            requestId: data?.request_id,
            serverTime: data?.server_time,
          };
        }

        if (status === 403) {
          const expectedProjectId = (data as any)?.expected_project_id;
          return {
            status: "error",
            currentVersion,
            message: expectedProjectId
              ? `API-Key gehört nicht zu Projekt "${projectId}". Erwartete Projekt-ID: "${expectedProjectId}". Bitte setzen Sie UPDATE_PROJECT_ID="${expectedProjectId}"`
              : data?.message || "API-Key gehört nicht zu diesem Projekt",
            requestId: data?.request_id,
            serverTime: data?.server_time,
          };
        }

        if (status === 404 && data?.status === "unknown_project") {
          return {
            status: "unknown",
            currentVersion,
            message: data?.message || "Projekt nicht gefunden",
            requestId: data?.request_id,
            serverTime: data?.server_time,
          };
        }

        if (status === 400) {
          return {
            status: "error",
            currentVersion,
            message: data?.message || "Ungültige Anfrage",
            requestId: data?.request_id,
            serverTime: data?.server_time,
          };
        }

        return {
          status: "error",
          currentVersion,
          message: data?.message || `Server-Fehler: ${status}`,
          requestId: data?.request_id,
          serverTime: data?.server_time,
        };
      }

      if (axiosError.code === "ECONNABORTED" || axiosError.code === "ETIMEDOUT") {
        return {
          status: "error",
          currentVersion,
          message: "Timeout: Update-Server nicht erreichbar",
        };
      }

      if (axiosError.code === "ENOTFOUND" || axiosError.code === "ECONNREFUSED") {
        return {
          status: "error",
          currentVersion,
          message: "Update-Server nicht erreichbar",
        };
      }
    }

    return {
      status: "error",
      currentVersion,
      message: error instanceof Error ? error.message : "Unbekannter Fehler",
    };
  }
};

export const checkBananaDashUpdates = async (): Promise<UpdateCheckResult> => {
  const apiKey = updateConfig.updateApiKey;
  const projectId = updateConfig.updateProjectId;
  const currentVersion = updateConfig.appVersion;
  if (!apiKey) {
    return {
      status: "error",
      currentVersion,
      message: "UPDATE_API_KEY nicht konfiguriert. Bitte in apps/server/src/config/updateConfig.ts konfigurieren.",
    };
  }

  const build = process.env.BUILD_NUMBER;
  const commit = process.env.GIT_COMMIT;
  const imageDigest = process.env.DOCKER_IMAGE_DIGEST;
  const channel = updateConfig.updateChannel;
  const platform = {
    os: process.platform,
    arch: process.arch,
    container: process.env.DOCKER_CONTAINER || undefined,
  };

  return checkForUpdates(apiKey, projectId, currentVersion, {
    build,
    commit,
    imageDigest,
    channel,
    platform,
  });
};
