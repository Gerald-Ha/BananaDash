import { useEffect, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/client";

const LoginPage = () => {
  const [username, setUsername] = useState("");

  const [password, setPassword] = useState("");

  const [error, setError] = useState("");

  const navigate = useNavigate();

  const location = useLocation();

  const queryClient = useQueryClient();

  const bootstrapStatus = useQuery({
    queryKey: ["bootstrap-status"],
    queryFn: async () => {
      const res = await api.get<{ allowed: boolean }>("/api/auth/bootstrap-status");

      return res.data.allowed;
    }
  });

  const registrationStatusQuery = useQuery({
    queryKey: ["registration-status"],
    queryFn: async () => {
      try {
        const res = await api.get<{ allowed: boolean }>("/api/auth/registration-status");

        return res.data.allowed;
      } catch {
        return false;
      }
    },
    retry: false
  });

  useEffect(() => {
    if (bootstrapStatus.data) {
      navigate("/bootstrap", { replace: true });
    }
  }, [bootstrapStatus.data, navigate]);

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await api.post("/api/auth/login", { username, password });

      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["session"] });

      const redirect = (location.state as any)?.from?.pathname || "/";
      navigate(redirect, { replace: true });
    },
    onError: () => setError("Invalid credentials")
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-bd-bg">
      <div className="w-full max-w-md bg-bd-surface border border-bd-border rounded-xl p-8 space-y-6 shadow-bd">
        <div className="text-center">
          <h1 className="text-3xl font-semibold text-bd-text">BananaDash</h1>
          <p className="text-bd-text-muted mt-2">Sign in to your dashboard</p>
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

            onKeyDown={(e) => {
              if (e.key === "Enter" && !mutation.isPending) {
                mutation.mutate();
              }
            }}

          />
          {error && <div className="text-bd-danger text-sm">{error}</div>}

          <button
            className="w-full bg-bd-accent hover:bg-bd-accent-hover text-[#001018] font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => mutation.mutate()}

            disabled={mutation.isPending}

          >
            {mutation.isPending ? "Signing in..." : "Sign in"}

          </button>
          {registrationStatusQuery.data && (
            <div className="text-center">
              <p className="text-bd-text-muted text-sm mb-2">Don't have an account?</p>
              <Link
                to="/register"
                className="text-bd-accent hover:text-bd-accent-hover text-sm font-semibold underline"
              >
                Sign up
              </Link>
            </div>
          )}

        </div>
        <footer className="text-center text-bd-text-muted text-sm mt-8">
          BananaDash | ©Gerald Hasani 2026 | Github:{" "}

          <a
            href="https://github.com/Gerald-Ha/BananaDash"
            target="_blank"
            rel="noopener noreferrer"
            className="underline text-bd-accent hover:text-bd-accent-hover"
          >
            GeraldHa
          </a>
        </footer>
      </div>
    </div>
  );
};

export default LoginPage;
