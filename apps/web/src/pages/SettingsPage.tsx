import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/client";
import { Settings } from "../types";

export type ThemeMode = "light" | "dark" | "custom";
const SettingsPage = () => {
  const queryClient = useQueryClient();

  const settingsQuery = useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const res = await api.get<{ settings: Settings }>("/api/settings");

      return res.data.settings;
    }
  });

  const [mode, setMode] = useState<ThemeMode>("dark");

  const [customCss, setCustomCss] = useState("");

  useEffect(() => {
    if (settingsQuery.data) {
      const m = settingsQuery.data.theme.mode;
      const css = settingsQuery.data.customCss || "";
      setMode(m === "custom" && !css ? "dark" : m === "light" || m === "dark" || m === "custom" ? m : "dark");

      setCustomCss(css);
    }
  }, [settingsQuery.data]);

  const saveMutation = useMutation({
    mutationFn: async () =>
      api.put("/api/settings", {
        theme: {
          mode: mode === "custom" && !customCss.trim() ? "dark" : mode,
          primary: settingsQuery.data?.theme.primary || "#16a34a",
          accent: settingsQuery.data?.theme.accent || "#facc15",
          font: settingsQuery.data?.theme.font || "Inter"
        },
        layout: settingsQuery.data?.layout || { layoutMode: "auto", itemSize: "medium", fitBoxMode: "auto" },
        customCss
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["settings"] })
  });

  return (
    <div className="min-h-screen bg-bd-bg text-bd-text">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-bd-text">Settings</h1>
          <Link to="/" className="text-bd-accent hover:text-bd-accent-hover transition-colors">
            Back to dashboard
          </Link>
        </div>
        <div className="bg-bd-surface border border-bd-border rounded-xl p-6 space-y-4 shadow-bd">
          <div className="space-y-2">
            <label className="block">
              <span className="block text-sm text-bd-text-muted mb-2">Theme mode</span>
              <select className="w-full bg-bd-surface-2 border border-bd-border text-bd-text px-3 py-2 rounded focus:ring-2 focus:ring-bd-focus outline-none" value={mode} onChange={(e) => setMode(e.target.value as ThemeMode)}>
                <option value="dark">Dark</option>
                <option value="light">Light</option>
                {customCss.trim() && <option value="custom">Custom</option>}

              </select>
            </label>
          </div>
          <div className="space-y-2">
            <label className="block">
              <span className="block text-sm text-bd-text-muted mb-2">Custom CSS</span>
              <p className="text-xs text-bd-text-faint mb-2">Use CSS variables (--bd-*) or data attributes ([data-bd="..."]) to customize the theme. See Custom-CSS-Lemon.md for examples.</p>
              <textarea
                className="w-full bg-bd-surface-2 border border-bd-border text-bd-text placeholder:text-bd-text-faint px-3 py-2 rounded h-40 focus:ring-2 focus:ring-bd-focus outline-none font-mono text-sm"
                value={customCss}

                onChange={(e) => setCustomCss(e.target.value)}

                placeholder="/* Example: Change header background color */&#10;[data-bd=&quot;p1&quot;] {&#10;  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);&#10;}"
              />
            </label>
          </div>
          <button className="px-4 py-2 bg-bd-accent text-[#001018] rounded-lg hover:bg-bd-accent-hover transition-colors" onClick={() => saveMutation.mutate()}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
