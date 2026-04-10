import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { createApiClient, setAdminCsrfToken } from "./apiConfig";

const ADMIN_USER_DATA_KEY = "user-data";
const LEGACY_ADMIN_FLAG_KEY = "isSuperAdmin";

const ADMIN_AUTH_STATUS = {
  loading: "loading",
  authenticated: "authenticated",
  unauthenticated: "unauthenticated",
};

const ADMIN_AUTH_ROUTES = {
  login: "/management/auth/login/",
  logout: "/management/auth/logout/",
  me: "/management/auth/me/",
};

const AdminAuthContext = createContext(null);
const adminAuthClient = createApiClient();

let currentAdminSessionState = {
  status: ADMIN_AUTH_STATUS.loading,
  user: null,
  message: "",
};
let unauthorizedHandler = null;
const ADMIN_AUTH_FORBIDDEN_MESSAGES = new Set([
  "admin access required.",
  "authentication credentials were not provided.",
  "not authenticated.",
]);

const syncSessionSnapshot = (nextState) => {
  currentAdminSessionState = nextState;
  return nextState;
};

const buildLoadingState = () =>
  syncSessionSnapshot({
    status: ADMIN_AUTH_STATUS.loading,
    user: null,
    message: "",
  });

const buildAuthenticatedState = (payload = {}) =>
  syncSessionSnapshot({
    status: ADMIN_AUTH_STATUS.authenticated,
    user: payload?.user || null,
    message: payload?.message || "",
  });

const buildUnauthenticatedState = (message = "") =>
  syncSessionSnapshot({
    status: ADMIN_AUTH_STATUS.unauthenticated,
    user: null,
    message,
  });

const normalizeAuthMessage = (payload, fallbackMessage) => {
  const message = `${payload?.message || ""}`.trim();
  if (message) {
    return message;
  }

  return fallbackMessage;
};

const syncAdminCsrfToken = (payload = {}) => {
  setAdminCsrfToken(payload?.csrf_token || "");
};

const extractAdminErrorMessage = (payload) => {
  const message = `${payload?.message || payload?.detail || ""}`.trim();
  return message;
};

const shouldResetAdminSession = (status, payload) => {
  if (status === 401) {
    return true;
  }

  if (status !== 403) {
    return false;
  }

  const normalizedMessage = extractAdminErrorMessage(payload).toLowerCase();
  if (!normalizedMessage) {
    return false;
  }

  if (normalizedMessage.startsWith("csrf failed:")) {
    return false;
  }

  return ADMIN_AUTH_FORBIDDEN_MESSAGES.has(normalizedMessage);
};

export const clearAdminSession = () => {
  setAdminCsrfToken("");

  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(ADMIN_USER_DATA_KEY);
  window.localStorage.removeItem(LEGACY_ADMIN_FLAG_KEY);
};

export const getAdminSessionProfile = () => currentAdminSessionState.user;

export const isAdminSessionActive = () =>
  currentAdminSessionState.status === ADMIN_AUTH_STATUS.authenticated;

export const setAdminUnauthorizedHandler = (handler) => {
  unauthorizedHandler = handler;
};

export const handleAdminUnauthorizedResponse = (error) => {
  const status = error?.response?.status;
  const requestUrl = `${error?.config?.url || ""}`;
  const payload = error?.response?.data;

  if (!shouldResetAdminSession(status, payload) || !requestUrl.startsWith("/management/")) {
    return Promise.reject(error);
  }

  if (requestUrl.startsWith("/management/auth/")) {
    return Promise.reject(error);
  }

  clearAdminSession();
  if (typeof unauthorizedHandler === "function") {
    unauthorizedHandler({
      status,
      requestUrl,
      error,
    });
  }

  return Promise.reject(error);
};

export const loginAdmin = async ({ username, password }) => {
  try {
    const response = await adminAuthClient.post(ADMIN_AUTH_ROUTES.login, {
      username,
      password,
    });

    return {
      ok: true,
      status: response.status,
      payload: response.data,
    };
  } catch (error) {
    if (error?.response) {
      return {
        ok: false,
        status: error.response.status,
        payload: error.response.data,
      };
    }

    throw error;
  }
};

export const logoutAdmin = async () => {
  try {
    const response = await adminAuthClient.post(ADMIN_AUTH_ROUTES.logout);
    return {
      ok: true,
      status: response.status,
      payload: response.data,
    };
  } catch (error) {
    if (error?.response) {
      return {
        ok: false,
        status: error.response.status,
        payload: error.response.data,
      };
    }

    throw error;
  }
};

export const fetchAdminSession = async () => {
  try {
    const response = await adminAuthClient.get(ADMIN_AUTH_ROUTES.me);
    return {
      ok: true,
      status: response.status,
      payload: response.data,
    };
  } catch (error) {
    if (error?.response) {
      return {
        ok: false,
        status: error.response.status,
        payload: error.response.data,
      };
    }

    throw error;
  }
};

export const AdminAuthProvider = ({ children }) => {
  const [sessionState, setSessionState] = useState(() => buildLoadingState());

  const refreshSession = async () => {
    const result = await fetchAdminSession();

    if (result.ok && result.payload?.authenticated && result.payload?.user) {
      syncAdminCsrfToken(result.payload);
      const nextState = buildAuthenticatedState(result.payload);
      setSessionState(nextState);
      return {
        ok: true,
        user: nextState.user,
      };
    }

    clearAdminSession();
    const nextState = buildUnauthenticatedState(
      normalizeAuthMessage(result.payload, "Not authenticated.")
    );
    setSessionState(nextState);

    return {
      ok: false,
      message: nextState.message,
      status: result.status,
    };
  };

  useEffect(() => {
    setAdminUnauthorizedHandler(({ error }) => {
      const message = normalizeAuthMessage(
        error?.response?.data,
        "Your admin session is no longer valid."
      );
      setSessionState(buildUnauthenticatedState(message));
    });

    return () => {
      setAdminUnauthorizedHandler(null);
    };
  }, []);

  useEffect(() => {
    let isActive = true;

    const bootstrapSession = async () => {
      try {
        const result = await fetchAdminSession();

        if (!isActive) {
          return;
        }

        clearAdminSession();

        if (result.ok && result.payload?.authenticated && result.payload?.user) {
          syncAdminCsrfToken(result.payload);
          setSessionState(buildAuthenticatedState(result.payload));
          return;
        }

        setSessionState(
          buildUnauthenticatedState(
            normalizeAuthMessage(result.payload, "Not authenticated.")
          )
        );
      } catch (error) {
        if (!isActive) {
          return;
        }

        console.error("Unable to bootstrap admin session:", error);
        clearAdminSession();
        setSessionState(
          buildUnauthenticatedState("Unable to reach the admin session service.")
        );
      }
    };

    bootstrapSession();

    return () => {
      isActive = false;
    };
  }, []);

  const login = async ({ username, password }) => {
    const normalizedUsername = `${username || ""}`.trim();

    if (!normalizedUsername || !password) {
      const message = "Username and password are required.";
      setSessionState(buildUnauthenticatedState(message));
      return {
        ok: false,
        message,
        status: 400,
      };
    }

    const result = await loginAdmin({
      username: normalizedUsername,
      password,
    });

    if (result.ok && result.payload?.authenticated && result.payload?.user) {
      syncAdminCsrfToken(result.payload);
      const nextState = buildAuthenticatedState(result.payload);
      setSessionState(nextState);
      return {
        ok: true,
        user: nextState.user,
      };
    }

    const message = normalizeAuthMessage(result.payload, "Unable to sign in.");
    clearAdminSession();
    setSessionState(buildUnauthenticatedState(message));

    return {
      ok: false,
      message,
      status: result.status,
    };
  };

  const logout = async () => {
    try {
      await logoutAdmin();
    } catch (error) {
      console.error("Unable to clear admin session:", error);
    } finally {
      clearAdminSession();
      setSessionState(buildUnauthenticatedState(""));
    }
  };

  const value = useMemo(
    () => ({
      ...sessionState,
      isAuthenticated: sessionState.status === ADMIN_AUTH_STATUS.authenticated,
      isLoading: sessionState.status === ADMIN_AUTH_STATUS.loading,
      login,
      logout,
      refreshSession,
    }),
    [sessionState]
  );

  return (
    <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);

  if (!context) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider.");
  }

  return context;
};
