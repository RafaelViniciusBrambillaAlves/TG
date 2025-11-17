import axios from "axios";

export function getAPIClient(ctx?: any) {
  const api = axios.create({
    baseURL: "http://168.138.135.43/",
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
