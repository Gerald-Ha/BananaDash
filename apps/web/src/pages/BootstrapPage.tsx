import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/client";

const BootstrapPage = () => {
  const [username, setUsername] = useState("");

  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const queryClient = useQueryClient();

  const statusQuery = useQuery({
    queryKey: ["bootstrap-status"],
    queryFn: async () => {
      const res = await api.get<{ allowed: boolean }>("/api/auth/bootstrap-status");

      return res.data.allowed;
    }
  });

  useEffect(() => {
    if (statusQuery.data === false) {
      navigate("/login", { replace: true });
    }
  }, [statusQuery.data, navigate]);

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await api.post("/api/auth/bootstrap", { username, password });

      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["session"] });

      navigate("/", { replace: true });
    }
  });

  if (statusQuery.isLoading) {
    return <div className="p-6 text-center bg-bd-bg text-bd-text">Loading...</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bd-bg">
      <div className="w-full max-w-md bg-bd-surface border border-bd-border rounded-xl p-8 space-y-6 shadow-bd">
        <div className="text-center">
          <h1 className="text-3xl font-semibold text-bd-text">Bootstrap Admin</h1>
          <p className="text-bd-text-muted mt-2">Create the first administrator</p>
        </div>
        <div className="space-y-4">
          <input
            className="w-full rounded-lg bg-bd-surface-2 border border-bd-border text-bd-text placeholder:text-bd-text-faint px-4 py-3 outline-none focus:ring-2 focus:ring-bd-focus"
            placeholder="Username"
            value={username}

            onChange={(e) => setUsername(e.target.value)}

          />
          <input
            className="w-full rounded-lg bg-bd-surface-2 border border-bd-border text-bd-text placeholder:text-bd-text-faint px-4 py-3 outline-none focus:ring-2 focus:ring-bd-focus"
            placeholder="Password"
            type="password"
            value={password}

            onChange={(e) => setPassword(e.target.value)}

          />
          <button
            className="w-full bg-bd-accent hover:bg-bd-accent-hover text-[#001018] font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => mutation.mutate()}

            disabled={mutation.isPending}

          >
            {mutation.isPending ? "Creating..." : "Create admin"}

          </button>
        </div>
      </div>
    </div>
  );
};

export default BootstrapPage;
