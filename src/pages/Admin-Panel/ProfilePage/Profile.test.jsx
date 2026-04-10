import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const refreshSession = vi.fn();
const authState = {
  isAuthenticated: true,
  isLoading: false,
  user: null,
  refreshSession,
};

vi.mock("react-js-loader", () => ({
  default: () => <div>Loading...</div>,
}));

vi.mock("../../../components/layout/AdminPanelLayout", () => ({
  default: ({ title, subtitle, children }) => (
    <div>
      {title ? <h1>{title}</h1> : null}
      {subtitle ? <p>{subtitle}</p> : null}
      {children}
    </div>
  ),
}));

vi.mock("../../../components/ui", () => ({
  AppButton: ({ children, onClick }) => (
    <button type="button" onClick={onClick}>
      {children}
    </button>
  ),
  AppCard: ({ children }) => <section>{children}</section>,
}));

vi.mock("../../../utility/adminSession", () => ({
  useAdminAuth: () => authState,
}));

import Profile from "./Profile";

describe("profile smoke coverage", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  beforeEach(() => {
    refreshSession.mockReset();
    authState.isAuthenticated = true;
    authState.isLoading = false;
    authState.user = {
      name: "Session Admin",
      username: "session-admin",
      email: "session.admin@example.com",
      role: "super_admin",
    };
    authState.refreshSession = refreshSession;
    window.localStorage.clear();
  });

  it("renders backend-backed admin session details instead of partner local storage", () => {
    const getItemSpy = vi.spyOn(Storage.prototype, "getItem");

    window.localStorage.setItem(
      "SignedUp-User-Profile",
      JSON.stringify({
        name: "Stored Partner",
        partner_type: "Company",
      })
    );

    render(<Profile />);

    expect(screen.getByText("My Profile")).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Session Admin" })).toBeTruthy();
    expect(screen.getByText("session-admin")).toBeTruthy();
    expect(screen.getByText("session.admin@example.com")).toBeTruthy();
    expect(screen.queryByText("Stored Partner")).toBeNull();
    expect(getItemSpy).not.toHaveBeenCalledWith("SignedUp-User-Profile");
  });

  it("allows the admin profile screen to refresh the backend session snapshot", () => {
    render(<Profile />);

    fireEvent.click(screen.getByRole("button", { name: "Refresh Session" }));

    expect(refreshSession).toHaveBeenCalledTimes(1);
  });
});
