import { useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "./hooks/useSession";
import { api } from "./api/client";
import { Settings } from "./types";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import BootstrapPage from "./pages/BootstrapPage";
import AccountPage from "./pages/AccountPage";
import SettingsPage from "./pages/SettingsPage";
import OptionsPage from "./pages/OptionsPage";
import BackupRestorePage from "./pages/BackupRestorePage";
import AppInfoPage from "./pages/AppInfoPage";

const Protected = ({ children }: { children: JSX.Element }) => {
  const { data, isLoading, error } = useSession();

  const location = useLocation();

  if (isLoading) return <div className="p-6 text-center">Loading...</div>;
  if (error || !data) return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
};

const App = () => {
  const { data: sessionData } = useSession();

  const settingsQuery = useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const res = await api.get<{ settings: Settings }>("/api/settings");

      return res.data.settings;
    },
    enabled: !!sessionData
  });

  useEffect(() => {
    if (!settingsQuery.data) {
      document.documentElement.setAttribute("data-theme", "dark");

      return;
    }

    const { theme, customCss } = settingsQuery.data;
    document.documentElement.style.setProperty("--color-primary", theme.primary);

    document.documentElement.style.setProperty("--color-accent", theme.accent);

    document.documentElement.style.setProperty("--font-family", theme.font);

    if (theme.mode === "light") document.documentElement.setAttribute("data-theme", "light");

    else if (theme.mode === "dark") document.documentElement.setAttribute("data-theme", "dark");

    else if (theme.mode === "custom") document.documentElement.setAttribute("data-theme", "dark");

    const css = customCss || "";
    const styleTag = document.getElementById("custom-css");

    if (styleTag) styleTag.innerHTML = css;
    else if (css) {
      const tag = document.createElement("style");

      tag.id = "custom-css";
      tag.innerHTML = css;
      document.head.appendChild(tag);
    }
  }, [settingsQuery.data]);

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/bootstrap" element={<BootstrapPage />} />
      <Route
        path="/"
        element={
          <Protected>
            <DashboardPage />
          </Protected>
        }

      />
      <Route
        path="/account"
        element={
          <Protected>
            <AccountPage />
          </Protected>
        }

      />
      <Route
        path="/settings"
        element={
          <Protected>
            <SettingsPage />
          </Protected>
        }

      />
      <Route
        path="/options"
        element={
          <Protected>
            <OptionsPage />
          </Protected>
        }

      />
      <Route
        path="/backup-restore"
        element={
          <Protected>
            <BackupRestorePage />
          </Protected>
        }

      />
      <Route
        path="/app-info"
        element={
          <Protected>
            <AppInfoPage />
          </Protected>
        }

      />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default App;
