import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/client";

const RegisterPage = () => {
  const [username, setUsername] = useState("");

  const [password, setPassword] = useState("");

  const [error, setError] = useState("");

  const navigate = useNavigate();

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await api.post("/api/auth/register", { username, password });

      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["session"] });

      navigate("/", { replace: true });
    },
    onError: (err: any) => {
      setError(err?.response?.data?.error || "Registration failed");
    }
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-bd-bg">
      <div className="w-full max-w-md bg-bd-surface border border-bd-border rounded-xl p-8 space-y-6 shadow-bd">
        <div className="text-center">
          <h1 className="text-3xl font-semibold text-bd-text">BananaDash</h1>
          <p className="text-bd-text-muted mt-2">Create a new account</p>
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
            {mutation.isPending ? "Creating account..." : "Sign up"}

          </button>
          <div className="text-center">
            <p className="text-bd-text-muted text-sm">
              Already have an account?{" "}

              <Link to="/login" className="text-bd-accent hover:text-bd-accent-hover font-semibold underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
