import React, { StrictMode } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const { apiClient, setAdminCsrfToken } = vi.hoisted(() => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
  setAdminCsrfToken: vi.fn(),
}));

vi.mock("./apiConfig", () => ({
  createApiClient: () => apiClient,
  setAdminCsrfToken,
}));

import {
  AdminAuthProvider,
  clearAdminSession,
  handleAdminUnauthorizedResponse,
  setAdminUnauthorizedHandler,
  useAdminAuth,
} from "./adminSession";

const SessionProbe = () => {
  const { isLoading, isAuthenticated, message } = useAdminAuth();

  return (
    <div>
      <span data-testid="loading-state">{isLoading ? "loading" : "settled"}</span>
      <span data-testid="auth-state">{isAuthenticated ? "authenticated" : "unauthenticated"}</span>
      <span data-testid="auth-message">{message}</span>
    </div>
  );
};

describe("AdminAuthProvider", () => {
  afterEach(() => {
    apiClient.get.mockReset();
    apiClient.post.mockReset();
    setAdminCsrfToken.mockReset();
    window.localStorage.clear();
    setAdminUnauthorizedHandler(null);
    vi.restoreAllMocks();
  });

  it("settles out of loading when bootstrap fails under StrictMode", async () => {
    const pendingRejectors = [];

    apiClient.get.mockImplementation(
      () =>
        new Promise((resolve, reject) => {
          pendingRejectors.push(reject);
        })
    );

    render(
      <StrictMode>
        <AdminAuthProvider>
          <SessionProbe />
        </AdminAuthProvider>
      </StrictMode>
    );

    await waitFor(() => {
      expect(pendingRejectors.length).toBeGreaterThan(0);
    });

    pendingRejectors.forEach((reject) => reject(new Error("Network Error")));

    await waitFor(() => {
      expect(screen.getByTestId("loading-state").textContent).toBe("settled");
    });

    expect(screen.getByTestId("auth-state").textContent).toBe("unauthenticated");
    expect(screen.getByTestId("auth-message").textContent).toBe(
      "Unable to reach the admin session service."
    );
  });

  it("bootstraps authenticated admin state without consulting partner storage", async () => {
    const getItemSpy = vi.spyOn(Storage.prototype, "getItem");

    apiClient.get.mockResolvedValue({
      status: 200,
      data: {
        authenticated: true,
        csrf_token: "bootstrap-csrf-token",
        user: {
          username: "session-admin",
          email: "session.admin@example.com",
        },
      },
    });

    render(
      <AdminAuthProvider>
        <SessionProbe />
      </AdminAuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("loading-state").textContent).toBe("settled");
    });

    expect(screen.getByTestId("auth-state").textContent).toBe("authenticated");
    expect(screen.getByTestId("auth-message").textContent).toBe("");
    expect(getItemSpy).not.toHaveBeenCalledWith("SignedUp-User-Profile");
    expect(setAdminCsrfToken).toHaveBeenCalledWith("bootstrap-csrf-token");
  });

  it("does not clear the admin session for csrf-specific 403 responses", async () => {
    const unauthorizedSpy = vi.fn();
    const error = {
      response: {
        status: 403,
        data: {
          detail: "CSRF Failed: CSRF token missing.",
        },
      },
      config: {
        url: "/management/approved_or_reject_company/",
      },
    };

    window.localStorage.setItem("user-data", JSON.stringify({ username: "admin" }));
    setAdminUnauthorizedHandler(unauthorizedSpy);

    await expect(handleAdminUnauthorizedResponse(error)).rejects.toBe(error);

    expect(window.localStorage.getItem("user-data")).toBeTruthy();
    expect(unauthorizedSpy).not.toHaveBeenCalled();
  });

  it("clears the admin session for auth-related 403 responses", async () => {
    const unauthorizedSpy = vi.fn();
    const error = {
      response: {
        status: 403,
        data: {
          message: "Admin access required.",
        },
      },
      config: {
        url: "/management/fetch_all_pending_companies/",
      },
    };

    window.localStorage.setItem("user-data", JSON.stringify({ username: "admin" }));
    setAdminUnauthorizedHandler(unauthorizedSpy);

    await expect(handleAdminUnauthorizedResponse(error)).rejects.toBe(error);

    expect(window.localStorage.getItem("user-data")).toBeNull();
    expect(unauthorizedSpy).toHaveBeenCalledTimes(1);
  });

  it("clears the stored csrf token when the admin session is cleared", () => {
    window.localStorage.setItem("user-data", JSON.stringify({ username: "admin" }));

    clearAdminSession();

    expect(setAdminCsrfToken).toHaveBeenCalledWith("");
    expect(window.localStorage.getItem("user-data")).toBeNull();
  });
});
