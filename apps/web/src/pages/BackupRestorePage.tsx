import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/client";

const BackupRestorePage = () => {
  const fileRef = useRef<HTMLInputElement | null>(null);

  const [selectedFileName, setSelectedFileName] = useState<string>("");

  const [error, setError] = useState<string>("");

  const queryClient = useQueryClient();

  const backupMutation = useMutation({
    mutationFn: async () => {
      const res = await api.get("/api/backup", { responseType: "blob" });

      const url = URL.createObjectURL(res.data);

      const a = document.createElement("a");

      a.href = url;
      a.download = "bananadash-backup.zip";
      a.click();

      URL.revokeObjectURL(url);
    }
  });

  const restoreMutation = useMutation({
    mutationFn: async () => {
      const file = fileRef.current?.files?.[0];
      if (!file) {
        throw new Error("Please select a file first");
      }

      const formData = new FormData();

      formData.append("file", file);

      await api.post("/api/backup", formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["spaces"] });

      queryClient.invalidateQueries({ queryKey: ["categories"] });

      queryClient.invalidateQueries({ queryKey: ["bookmarks"] });

      queryClient.invalidateQueries({ queryKey: ["settings"] });

      setError("");

      setSelectedFileName("");

      if (fileRef.current) {
        fileRef.current.value = "";
      }
    },
    onError: (err: any) => {
      setError(err.response?.data?.error || err.message || "Failed to restore backup");
    }
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFileName(file.name);

      setError("");
    } else {
      setSelectedFileName("");
    }
  };

  return (
    <div className="min-h-screen bg-bd-bg text-bd-text">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-bd-text">Backup & Restore</h1>
          <Link to="/" className="text-bd-accent hover:text-bd-accent-hover transition-colors">
            Back to dashboard
          </Link>
        </div>
        <div className="space-y-6">
          <div className="bg-bd-surface border border-bd-border rounded-xl p-6 shadow-bd">
            <h2 className="text-lg font-semibold text-bd-text mb-4">Backup</h2>
            <button 
              className="w-full px-4 py-2 bg-bd-accent text-[#001018] rounded-lg hover:bg-bd-accent-hover transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed" 
              onClick={() => backupMutation.mutate()}

              disabled={backupMutation.isPending}

            >
              {backupMutation.isPending ? "Creating backup..." : "Download backup"}

            </button>
          </div>
          <div className="bg-bd-surface border border-bd-border rounded-xl p-6 space-y-4 shadow-bd">
            <h2 className="text-lg font-semibold text-bd-text">Restore</h2>
            <div className="space-y-3">
              <div className="space-y-2">
                <label className="block cursor-pointer">
                  <input 
                    ref={fileRef} 

                    type="file" 
                    accept="application/zip,.zip,application/x-zip-compressed"
                    onChange={handleFileChange}

                    className="hidden"
                    id="file-input"
                  />
                  <span 
                    className="block w-full px-4 py-2 bg-bd-surface-2 border border-bd-border text-bd-text rounded-lg hover:bg-bd-surface transition-colors text-center font-semibold"
                    onClick={(e) => {
                      e.preventDefault();

                      e.stopPropagation();

                      fileRef.current?.click();
                    }}

                  >
                    {selectedFileName || "Select file"}

                  </span>
                </label>
                {!selectedFileName && (
                  <p className="text-sm text-bd-text-muted text-center">No file selected</p>
                )}

              </div>
              <button 
                className="w-full px-4 py-2 bg-bd-surface-2 border border-bd-border text-bd-text rounded-lg hover:bg-bd-surface transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed" 
                onClick={() => restoreMutation.mutate()}

                disabled={restoreMutation.isPending}

              >
                {restoreMutation.isPending ? "Restoring..." : "Restore from zip"}

              </button>
              {error && (
                <div className="text-bd-danger text-sm text-center p-2 bg-bd-surface-2 border border-bd-danger rounded">
                  {error}

                </div>
              )}

              {restoreMutation.isSuccess && (
                <div className="text-bd-success text-sm text-center p-2 bg-bd-surface-2 border border-bd-success rounded">
                  Backup restored successfully! Please refresh the page to see your data.
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BackupRestorePage;
