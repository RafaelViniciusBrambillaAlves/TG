import axios from "axios";
import { parseCookies } from "nookies";

export function getAPIClient(ctx?: any) {
  const { ["app.token"]: token } = parseCookies(ctx);
  const api = axios.create({
    baseURL: process.env.API_URL,
    // baseURL: "http://localhost:3001",
    // baseURL: "http://168.138.135.43",
    headers: {
      Accept: "application/json",
      "X-User-Agent-Time-Zone":
        Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
    withCredentials: true,
  });
  api.interceptors.request.use((config) => {
    return config;
  });
  if (token) {
    api.defaults.headers["Authorization"] = `Bearer ${token}`;
  }

  return api;
}
