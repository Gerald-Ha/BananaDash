import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/client";
import { Settings } from "../types";
import { useSession } from "../hooks/useSession";

const OptionsPage = () => {
  const session = useSession();

  const queryClient = useQueryClient();

  const settingsQuery = useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const res = await api.get<{ settings: Settings }>("/api/settings");

      return res.data.settings;
    }
  });

  const [allowRegistration, setAllowRegistration] = useState(false);

  const [newUserName, setNewUserName] = useState("");

  const [newUserPassword, setNewUserPassword] = useState("");

  const [newUserRole, setNewUserRole] = useState<"admin" | "user">("user");

  const [userCreateSuccess, setUserCreateSuccess] = useState(false);

  const [updateSuccess, setUpdateSuccess] = useState(false);

  const usersQuery = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const res = await api.get<{ users: Array<{ id: string; username: string; role: string; createdAt: string }> }>("/api/admin/users");

      return res.data.users;
    },
    enabled: session.data?.role === "admin"
  });

  useEffect(() => {
    if (settingsQuery.data) {
      setAllowRegistration(settingsQuery.data.allowRegistration);
    }
  }, [settingsQuery.data]);

  const adminMutation = useMutation({
    mutationFn: async () => api.patch("/api/admin/settings", { allowRegistration }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });

      setUpdateSuccess(true);

      setTimeout(() => setUpdateSuccess(false), 3000);
    }
  });

  const createUserMutation = useMutation({
    mutationFn: async () =>
      api.post("/api/admin/users", {
        username: newUserName,
        password: newUserPassword,
        role: newUserRole
      }),
    onSuccess: () => {
      setNewUserName("");

      setNewUserPassword("");

      setNewUserRole("user");

      setUserCreateSuccess(true);

      setTimeout(() => setUserCreateSuccess(false), 5000);

      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    }
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => api.delete(`/api/admin/users/${userId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    }
  });

  return (
    <div className="min-h-screen bg-bd-bg text-bd-text">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-bd-text">Account Management</h1>
          <Link to="/" className="text-bd-accent hover:text-bd-accent-hover transition-colors">
            Back to dashboard
          </Link>
        </div>
        {session.data?.role === "admin" ? (
          <div className="bg-bd-surface border border-bd-border rounded-xl p-6 space-y-4 shadow-bd">
            <h2 className="text-xl font-semibold text-bd-text">Registration</h2>
            <label className="flex items-center space-x-2 text-bd-text">
              <input
                type="checkbox"
                checked={allowRegistration}

                onChange={(e) => setAllowRegistration(e.target.checked)}

                className="w-4 h-4 text-bd-accent bg-bd-surface-2 border-bd-border rounded focus:ring-bd-focus"
              />
              <span>Allow public registration</span>
            </label>
            <button
              className={`px-4 py-2 rounded-lg transition-colors ${
                updateSuccess
                  ? "bg-green-600 text-white"
                  : "bg-bd-accent text-[#001018] hover:bg-bd-accent-hover"
              }`}

              onClick={() => adminMutation.mutate()}

              disabled={adminMutation.isPending}

            >
              {adminMutation.isPending ? "Updating..." : updateSuccess ? "✓ Updated" : "Update"}

            </button>
            {updateSuccess && (
              <div className="text-green-400 text-sm">Registration settings updated successfully!</div>
            )}

            <div className="h-px bg-bd-border" />
            <h2 className="text-xl font-semibold text-bd-text">Create user</h2>
            <input
              className="w-full bg-bd-surface-2 border border-bd-border text-bd-text placeholder:text-bd-text-faint px-3 py-2 rounded focus:ring-2 focus:ring-bd-focus outline-none"
              placeholder="Username"
              value={newUserName}

              onChange={(e) => setNewUserName(e.target.value)}

            />
            <input
              className="w-full bg-bd-surface-2 border border-bd-border text-bd-text placeholder:text-bd-text-faint px-3 py-2 rounded focus:ring-2 focus:ring-bd-focus outline-none"
              placeholder="Password"
              type="password"
              value={newUserPassword}

              onChange={(e) => setNewUserPassword(e.target.value)}

            />
            <select
              className="w-full bg-bd-surface-2 border border-bd-border text-bd-text px-3 py-2 rounded focus:ring-2 focus:ring-bd-focus outline-none"
              value={newUserRole}

              onChange={(e) => setNewUserRole(e.target.value as "admin" | "user")}

            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
            <button
              className="px-4 py-2 bg-bd-accent text-[#001018] rounded-lg hover:bg-bd-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => createUserMutation.mutate()}

              disabled={createUserMutation.isPending}

            >
              {createUserMutation.isPending ? "Creating..." : "Create user"}

            </button>
            {userCreateSuccess && (
              <div className="text-bd-success text-sm p-2 bg-bd-surface-2 border border-bd-success rounded">
                User created successfully!
              </div>
            )}

            {createUserMutation.isError && (
              <div className="text-bd-danger text-sm p-2 bg-bd-surface-2 border border-bd-danger rounded">
                {(() => {
                  const error = createUserMutation.error as any;
                  const errorData = error?.response?.data?.error;
                  if (typeof errorData === 'string') {
                    return errorData;
                  } else if (errorData && typeof errorData === 'object') {
                    if (errorData.formErrors && Array.isArray(errorData.formErrors)) {
                      return errorData.formErrors.join(", ");
                    }

                    if (errorData.fieldErrors && typeof errorData.fieldErrors === 'object') {
                      const fieldMessages = Object.entries(errorData.fieldErrors)

                        .map(([field, messages]: [string, any]) => {
                          const msg = Array.isArray(messages) ? messages.join(", ") : String(messages);

                          return `${field}: ${msg}`;
                        })

                        .join("; ");

                      return fieldMessages || "Validation failed";
                    }

                    return "Validation failed. Please check your input.";
                  }

                  return error?.message || "Failed to create user";
                })()}

              </div>
            )}

            <div className="h-px bg-bd-border" />
            <h2 className="text-xl font-semibold text-bd-text">Registered Users</h2>
            {usersQuery.isLoading ? (
              <div className="text-bd-text-muted">Loading users...</div>
            ) : usersQuery.data && usersQuery.data.length > 0 ? (
              <div className="space-y-2">
                {usersQuery.data.map((user) => (
                  <div
                    key={user.id}

                    className="flex items-center justify-between bg-bd-surface-2 border border-bd-border rounded-lg p-3"
                  >
                    <div className="flex-1">
                      <div className="font-semibold text-bd-text">{user.username}</div>
                      <div className="text-sm text-bd-text-muted">
                        {user.role === "admin" ? "Admin" : "User"} • Created: {new Date(user.createdAt).toLocaleDateString()}

                      </div>
                    </div>
                    <button
                      className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete user "${user.username}"? This action cannot be undone.`)) {
                          deleteUserMutation.mutate(user.id);
                        }
                      }}

                      disabled={deleteUserMutation.isPending || (session.data && user.id === session.data.id)}

                    >
                      {deleteUserMutation.isPending ? "Deleting..." : "Delete"}

                    </button>
                  </div>
                ))}

              </div>
            ) : (
              <div className="text-bd-text-muted">No users found.</div>
            )}

          </div>
        ) : (
          <div className="bg-bd-surface border border-bd-border rounded-xl p-6 text-bd-text-muted shadow-bd">
            Only administrators can access these options.
          </div>
        )}

      </div>
    </div>
  );
};

export default OptionsPage;
