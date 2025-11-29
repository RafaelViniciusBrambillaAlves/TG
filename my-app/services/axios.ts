import axios from "axios";

export function getAPIClient(ctx?: any) {
  const api = axios.create({
    baseURL: process.env.EXPO_PUBLIC_API_URL,
    // baseURL: "http://localhost:3001/",
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

  return api;
}
