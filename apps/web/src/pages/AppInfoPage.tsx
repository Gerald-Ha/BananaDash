import { Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/client";
import { VersionStatus } from "../types";

const AppInfoPage = () => {
  const queryClient = useQueryClient();

  const versionQuery = useQuery({
    queryKey: ["version"],
    queryFn: async () => {
      const res = await api.get<VersionStatus>("/api/version");

      return res.data;
    },
    refetchInterval: 1000 * 60 * 60 * 12, 
    refetchOnWindowFocus: false, 
    refetchOnMount: true, 
    refetchOnReconnect: true, 
    staleTime: 1000 * 60 * 60 * 12, 
    enabled: true, 
    gcTime: Infinity, 
  });

  const handleCheckUpdate = async () => {
    try {
      const res = await api.get<VersionStatus>("/api/version?force=true");

      queryClient.setQueryData(["version"], res.data);

      await queryClient.refetchQueries({ queryKey: ["version"] });
    } catch (error) {
      console.error("Update check failed:", error);
    }
  };

  const updateInfo = versionQuery.data?.updateInfo;
  const isOutdated = versionQuery.data?.status === "outdated";
  const isBlocked = updateInfo?.status === "blocked";
  const isCritical = updateInfo?.critical;
  return (
    <div className="min-h-screen bg-bd-bg text-bd-text">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-bd-text">App Info</h1>
          <Link to="/" className="text-bd-accent hover:text-bd-accent-hover transition-colors">
            Back to dashboard
          </Link>
        </div>
        <div className="bg-bd-surface border border-bd-border rounded-xl p-6 space-y-3 shadow-bd">
          <div className="text-lg font-semibold text-bd-text">BananaDash</div>
          <div className="text-bd-text-muted">A customizable dashboard with spaces, categories, and bookmarks.</div>
          <div className="text-bd-text-muted">Built with React, Express, MongoDB, Tailwind, and dnd-kit.</div>
          <div className="text-bd-text-muted">Authentication uses JWT httpOnly cookies.</div>
          <div className="text-bd-text-muted">Backups include data and icons.</div>
        </div>
        <div className="bg-bd-surface border border-bd-border rounded-xl p-6 space-y-4 shadow-bd">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-bd-text">Version Status</h2>
            <button
              onClick={handleCheckUpdate}

              disabled={versionQuery.isFetching}

              className="px-4 py-2 bg-bd-accent text-white rounded-lg hover:bg-bd-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {versionQuery.isFetching ? "Checking..." : "Check-Update"}

            </button>
          </div>
          {versionQuery.isLoading ? (
            <div className="text-bd-text-muted">Checking version...</div>
          ) : versionQuery.error ? (
            <div className="text-red-400">Error checking version. Please try again.</div>
          ) : versionQuery.data ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-bd-text-muted">Installed Version:</span>
                <span className="font-semibold text-bd-text">{versionQuery.data.installed}</span>
              </div>
              {versionQuery.data.latest && (
                <div className="flex items-center gap-2">
                  <span className="text-bd-text-muted">Latest Version:</span>
                  <span className="font-semibold text-bd-text">{versionQuery.data.latest}</span>
                </div>
              )}

              <div className="flex items-center gap-2">
                <span className="text-bd-text-muted">Status:</span>
                {isBlocked ? (
                  <span className="px-2 py-1 bg-red-900/50 text-red-300 rounded text-sm font-semibold">
                    ⚠️ Blocked (Version zu alt)

                  </span>
                ) : isOutdated ? (
                  <span className="px-2 py-1 bg-yellow-900/50 text-yellow-300 rounded text-sm font-semibold flex items-center gap-1">
                    <img src="/icons/update.svg" alt="Update" className="w-4 h-4" onError={(e) => { (e.target as HTMLImageElement).src = "/uploads/icons/update.svg"; }} />
                    Outdated
                  </span>
                ) : versionQuery.data.status === "up-to-date" ? (
                  <span className="px-2 py-1 bg-green-900/50 text-green-300 rounded text-sm font-semibold">
                    ✅ Up to date
                  </span>
                ) : (
                  <span className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-sm font-semibold">
                    ❓ Unknown
                  </span>
                )}

              </div>
              {updateInfo && (isOutdated || isBlocked) && (
                <div className="mt-4 pt-4 border-t border-bd-border space-y-2">
                  {isCritical && (
                    <div className="px-3 py-2 bg-red-900/30 border border-red-700 rounded text-red-300 text-sm font-semibold">
                      ⚠️ Kritisches Update verfügbar!
                    </div>
                  )}

                  {updateInfo.minimumSupported && (
                    <div className="text-sm">
                      <span className="text-bd-text-muted">Mindestversion:</span>{" "}

                      <span className="text-bd-text">{updateInfo.minimumSupported}</span>
                    </div>
                  )}

                  {updateInfo.releasedAt && (
                    <div className="text-sm">
                      <span className="text-bd-text-muted">Veröffentlicht am:</span>{" "}

                      <span className="text-bd-text">
                        {new Date(updateInfo.releasedAt).toLocaleDateString("de-DE")}

                      </span>
                    </div>
                  )}

                  {updateInfo.updateLink && (
                    <div className="text-sm">
                      <span className="text-bd-text-muted">Update Link:</span>{" "}

                      <a
                        href={updateInfo.updateLink}

                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-bd-accent hover:text-bd-accent-hover underline"
                      >
                        {updateInfo.updateLink}

                      </a>
                    </div>
                  )}

                  {updateInfo.notesUrl && (
                    <div className="text-sm">
                      <span className="text-bd-text-muted">Release Notes:</span>{" "}

                      <a
                        href={updateInfo.notesUrl}

                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-bd-accent hover:text-bd-accent-hover underline"
                      >
                        {updateInfo.notesUrl}

                      </a>
                    </div>
                  )}

                  {updateInfo.dockerImage && (
                    <div className="text-sm">
                      <span className="text-bd-text-muted">Docker Image:</span>{" "}

                      <span className="text-bd-text font-mono text-xs">
                        {updateInfo.dockerImage}

                        {updateInfo.dockerTag && `:${updateInfo.dockerTag}`}

                      </span>
                    </div>
                  )}

                  {updateInfo.message && (
                    <div className="text-sm text-bd-text-muted italic">{updateInfo.message}</div>
                  )}

                </div>
              )}

              {updateInfo?.status === "error" && updateInfo.message && (
                <div className="mt-4 pt-4 border-t border-bd-border">
                  <div className="text-sm text-red-400">Fehler: {updateInfo.message}</div>
                </div>
              )}

            </div>
          ) : null}

        </div>
      </div>
    </div>
  );
};

export default AppInfoPage;
