import { afterEach, describe, expect, it } from "vitest";

import {
  createApiClient,
  DEFAULT_AXIOS_CONFIG,
  getAdminCsrfToken,
  setAdminCsrfToken,
} from "./apiConfig";

describe("apiConfig", () => {
  afterEach(() => {
    setAdminCsrfToken("");
    window.localStorage.clear();
  });

  it("enables XSRF header forwarding for credentialed cross-origin requests", () => {
    expect(DEFAULT_AXIOS_CONFIG.withCredentials).toBe(true);
    expect(DEFAULT_AXIOS_CONFIG.withXSRFToken).toBe(true);
    expect(DEFAULT_AXIOS_CONFIG.xsrfCookieName).toBe("csrftoken");
    expect(DEFAULT_AXIOS_CONFIG.xsrfHeaderName).toBe("X-CSRFToken");
  });

  it("propagates the XSRF setting to created clients", () => {
    const client = createApiClient();

    expect(client.defaults.withCredentials).toBe(true);
    expect(client.defaults.withXSRFToken).toBe(true);
    expect(client.defaults.xsrfCookieName).toBe("csrftoken");
    expect(client.defaults.xsrfHeaderName).toBe("X-CSRFToken");
  });

  it("persists the admin csrf token for later unsafe requests", () => {
    setAdminCsrfToken("csrf-login-token");

    expect(getAdminCsrfToken()).toBe("csrf-login-token");
    expect(window.localStorage.getItem("admin-csrf-token")).toBe("csrf-login-token");
  });

  it("injects the stored csrf token into unsafe management requests", async () => {
    setAdminCsrfToken("csrf-login-token");
    const client = createApiClient({
      adapter: async (config) => ({
        data: config,
        status: 200,
        statusText: "OK",
        headers: {},
        config,
      }),
    });

    const response = await client.put("/management/approved_or_reject_company/", {
      partner_session_token: "abc",
    });

    expect(response.data.headers["X-CSRFToken"]).toBe("csrf-login-token");
  });
});
