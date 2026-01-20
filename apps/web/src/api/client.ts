import axios from "axios";

const getBaseURL = (): string => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  if (typeof window !== "undefined") {
    const isDevServer = window.location.hostname === "localhost" && window.location.port === "5173";
    if (!isDevServer) {
      return "";
    }
  }

  return "http://localhost:1337";
};

export const api = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true
});
