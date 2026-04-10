import axios from "axios";

export const DEFAULT_API_BASE_URL = "https://api.ziyarat.example";
const ADMIN_CSRF_TOKEN_KEY = "admin-csrf-token";
const UNSAFE_HTTP_METHODS = new Set(["post", "put", "patch", "delete"]);

let currentAdminCsrfToken = "";

export const resolveApiBaseURL = () => {
  const configuredURL = `${process.env.REACT_APP_API_BASE_URL || ""}`.trim();
  return (configuredURL || DEFAULT_API_BASE_URL).replace(/\/+$/, "");
};

export const API_BASE_URL = resolveApiBaseURL();

export const DEFAULT_AXIOS_CONFIG = {
  baseURL: API_BASE_URL,
  withCredentials: true,
  // Axios 1.7+ no longer forwards the XSRF header for cross-origin requests
  // unless withXSRFToken is enabled explicitly.
  withXSRFToken: true,
  xsrfCookieName: "csrftoken",
  xsrfHeaderName: "X-CSRFToken",
  headers: {
    "Content-Type": "application/json",
  },
};

const normalizeCsrfToken = (token) => `${token || ""}`.trim();

export const setAdminCsrfToken = (token) => {
  currentAdminCsrfToken = normalizeCsrfToken(token);

  if (typeof window === "undefined") {
    return currentAdminCsrfToken;
  }

  if (currentAdminCsrfToken) {
    window.localStorage.setItem(ADMIN_CSRF_TOKEN_KEY, currentAdminCsrfToken);
  } else {
    window.localStorage.removeItem(ADMIN_CSRF_TOKEN_KEY);
  }

  return currentAdminCsrfToken;
};

export const getAdminCsrfToken = () => {
  if (currentAdminCsrfToken) {
    return currentAdminCsrfToken;
  }

  if (typeof window === "undefined") {
    return "";
  }

  currentAdminCsrfToken = normalizeCsrfToken(
    window.localStorage.getItem(ADMIN_CSRF_TOKEN_KEY)
  );
  return currentAdminCsrfToken;
};

const shouldAttachAdminCsrfToken = (method = "get") =>
  UNSAFE_HTTP_METHODS.has(`${method || "get"}`.toLowerCase());

export const createApiClient = (overrides = {}) => {
  const client = axios.create({
    ...DEFAULT_AXIOS_CONFIG,
    ...overrides,
    headers: {
      ...DEFAULT_AXIOS_CONFIG.headers,
      ...(overrides.headers || {}),
    },
  });

  client.interceptors.request.use((config) => {
    if (!shouldAttachAdminCsrfToken(config?.method)) {
      return config;
    }

    const csrfToken = getAdminCsrfToken();
    if (!csrfToken) {
      return config;
    }

    config.headers = {
      ...(config.headers || {}),
      "X-CSRFToken": csrfToken,
    };

    return config;
  });

  return client;
};

export const isManagementRequest = (url = "") => {
  const normalizedUrl = `${url || ""}`;
  return (
    normalizedUrl.startsWith("/management/") ||
    normalizedUrl.startsWith("/api/v1/admin/")
  );
};
