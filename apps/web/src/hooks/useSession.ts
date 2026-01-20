import { useQuery } from "@tanstack/react-query";
import { api } from "../api/client";
import { User } from "../types";

export const useSession = () => {
  return useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const res = await api.get<{ user: User }>("/api/auth/me");

      return res.data.user;
    },
    retry: false
  });
};
