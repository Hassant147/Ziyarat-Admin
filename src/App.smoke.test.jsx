import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const authState = {
  isAuthenticated: false,
  isLoading: false,
  user: null,
};

vi.mock("react-toastify", () => ({
  ToastContainer: () => null,
}));

vi.mock("./pages/login/login", () => ({
  default: () => <div>Admin Login</div>,
}));

vi.mock("./pages/Admin-Panel/ProfilePage/Profile", () => ({
  default: () => <div>Admin Profile</div>,
}));

vi.mock("./pages/Admin-Panel/ExtraPages/FrequentlyAskedQuestions/FQA", () => ({
  default: () => <div>Frequently Asked Questions</div>,
}));

vi.mock("./components/HeaderNavbarComponent", () => ({
  default: ({ title, subtitle, children }) => (
    <div>
      {title ? <h1>{title}</h1> : null}
      {subtitle ? <p>{subtitle}</p> : null}
      {children}
    </div>
  ),
}));

vi.mock("./components/ScrollToTopButton", () => ({
  default: () => null,
}));

vi.mock("./utility/CurrencyContext", () => ({
  CurrencyProvider: ({ children }) => children,
}));

vi.mock("./utility/adminSession", () => ({
  AdminAuthProvider: ({ children }) => children,
  useAdminAuth: () => authState,
}));

import App from "./App";

describe("admin app smoke coverage", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  beforeEach(() => {
    authState.isAuthenticated = false;
    authState.isLoading = false;
    authState.user = null;
    window.localStorage.clear();
    window.history.pushState({}, "", "/");
  });

  it("redirects unauthenticated super-admin routes back to login", async () => {
    window.history.pushState({}, "", "/super-admin-dashboard");

    render(<App />);

    expect(await screen.findByText("Admin Login")).toBeTruthy();
    await waitFor(() => {
      expect(window.location.pathname).toBe("/");
    });
  });

  it("redirects authenticated login visits into the dashboard and renders it", async () => {
    authState.isAuthenticated = true;
    authState.user = { name: "Amina Admin" };

    render(<App />);

    expect(await screen.findByText("Welcome back, Amina Admin")).toBeTruthy();
    expect(screen.getByText("Operational Modules")).toBeTruthy();
    expect(screen.getByText("Pending Profiles")).toBeTruthy();
    await waitFor(() => {
      expect(window.location.pathname).toBe("/super-admin-dashboard");
    });
  });

  it("keeps partner storage from unlocking super-admin routes", async () => {
    window.localStorage.setItem(
      "SignedUp-User-Profile",
      JSON.stringify({
        is_email_verified: true,
        partner_type: "Company",
        account_status: "Active",
      })
    );
    window.history.pushState({}, "", "/super-admin-dashboard");

    render(<App />);

    expect(await screen.findByText("Admin Login")).toBeTruthy();
    await waitFor(() => {
      expect(window.location.pathname).toBe("/");
    });
  });

  it("allows authenticated admins into the profile route without consulting partner storage", async () => {
    authState.isAuthenticated = true;
    authState.user = { name: "Amina Admin" };
    window.history.pushState({}, "", "/profile");
    const getItemSpy = vi.spyOn(Storage.prototype, "getItem");

    render(<App />);

    expect(await screen.findByText("Admin Profile")).toBeTruthy();
    expect(window.location.pathname).toBe("/profile");
    expect(getItemSpy).not.toHaveBeenCalledWith("SignedUp-User-Profile");
  });

  it("allows authenticated admins into shared content routes without consulting partner storage", async () => {
    authState.isAuthenticated = true;
    authState.user = { name: "Amina Admin" };
    window.history.pushState({}, "", "/faq");
    const getItemSpy = vi.spyOn(Storage.prototype, "getItem");

    render(<App />);

    expect(await screen.findByText("Frequently Asked Questions")).toBeTruthy();
    expect(getItemSpy).not.toHaveBeenCalledWith("SignedUp-User-Profile");
  });

  it("redirects authenticated admins away from partner routes without consulting partner storage", async () => {
    authState.isAuthenticated = true;
    authState.user = { name: "Amina Admin" };
    window.history.pushState({}, "", "/packages");
    const getItemSpy = vi.spyOn(Storage.prototype, "getItem");

    render(<App />);

    expect(await screen.findByText("Welcome back, Amina Admin")).toBeTruthy();
    await waitFor(() => {
      expect(window.location.pathname).toBe("/super-admin-dashboard");
    });
    expect(getItemSpy).not.toHaveBeenCalledWith("SignedUp-User-Profile");
  });
});
