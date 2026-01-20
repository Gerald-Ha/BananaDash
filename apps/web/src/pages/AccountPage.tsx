import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/client";

const AccountPage = () => {
  const [username, setUsername] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");

  const [newPassword, setNewPassword] = useState("");

  const navigate = useNavigate();

  const queryClient = useQueryClient();

  const [usernameSuccess, setUsernameSuccess] = useState(false);

  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const usernameMutation = useMutation({
    mutationFn: async () => api.post("/api/auth/change-username", { username }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["session"] });

      setUsernameSuccess(true);

      setTimeout(() => setUsernameSuccess(false), 3000);
    }
  });

  const passwordMutation = useMutation({
    mutationFn: async () => api.post("/api/auth/change-password", { currentPassword, newPassword }),
    onSuccess: () => {
      setCurrentPassword("");

      setNewPassword("");

      setPasswordSuccess(true);

      setTimeout(() => setPasswordSuccess(false), 3000);
    }
  });

  const logoutMutation = useMutation({
    mutationFn: async () => api.post("/api/auth/logout"),
    onSuccess: () => {
      queryClient.clear();

      navigate("/login", { replace: true });
    }
  });

  return (
    <div className="min-h-screen bg-bd-bg text-bd-text">
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-bd-text">Account</h1>
          <Link to="/" className="text-bd-accent hover:text-bd-accent-hover transition-colors">
            Back to dashboard
          </Link>
        </div>
        <div className="bg-bd-surface border border-bd-border rounded-xl p-6 space-y-4 shadow-bd">
          <h2 className="text-xl font-semibold text-bd-text">Change username</h2>
          <input className="w-full bg-bd-surface-2 border border-bd-border text-bd-text placeholder:text-bd-text-faint px-3 py-2 rounded focus:ring-2 focus:ring-bd-focus outline-none" placeholder="New username" value={username} onChange={(e) => setUsername(e.target.value)} />
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 bg-bd-accent text-[#001018] rounded-lg hover:bg-bd-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed" onClick={() => usernameMutation.mutate()} disabled={usernameMutation.isPending}>
              Save
            </button>
            {usernameSuccess && <span className="text-green-400 text-sm">✓ Username updated successfully!</span>}

            {usernameMutation.isError && <span className="text-red-400 text-sm">{usernameMutation.error?.response?.data?.error || "Failed to update username"}</span>}

          </div>
        </div>
        <div className="bg-bd-surface border border-bd-border rounded-xl p-6 space-y-4 shadow-bd">
          <h2 className="text-xl font-semibold text-bd-text">Change password</h2>
          <input
            className="w-full bg-bd-surface-2 border border-bd-border text-bd-text placeholder:text-bd-text-faint px-3 py-2 rounded focus:ring-2 focus:ring-bd-focus outline-none"
            placeholder="Current password"
            type="password"
            value={currentPassword}

            onChange={(e) => setCurrentPassword(e.target.value)}

          />
          <input
            className="w-full bg-bd-surface-2 border border-bd-border text-bd-text placeholder:text-bd-text-faint px-3 py-2 rounded focus:ring-2 focus:ring-bd-focus outline-none"
            placeholder="New password"
            type="password"
            value={newPassword}

            onChange={(e) => setNewPassword(e.target.value)}

          />
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 bg-bd-accent text-[#001018] rounded-lg hover:bg-bd-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed" onClick={() => passwordMutation.mutate()} disabled={passwordMutation.isPending}>
              Save
            </button>
            {passwordSuccess && <span className="text-green-400 text-sm">✓ Password updated successfully!</span>}

            {passwordMutation.isError && <span className="text-red-400 text-sm">{passwordMutation.error?.response?.data?.error || "Failed to update password"}</span>}

          </div>
        </div>
        <div className="bg-bd-surface border border-bd-border rounded-xl p-6 shadow-bd">
          <button className="px-4 py-2 bg-bd-danger text-white rounded-lg hover:opacity-90 transition-opacity" onClick={() => logoutMutation.mutate()}>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;
