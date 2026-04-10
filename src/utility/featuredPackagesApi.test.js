import { describe, expect, it, vi } from "vitest";

const { get, put } = vi.hoisted(() => ({
  get: vi.fn(),
  put: vi.fn(),
}));

vi.mock("./adminApiClient", () => ({
  default: { get, put },
}));

import { getFeaturedPackagesForAdmin, updateFeaturedPackageStatus } from "./featuredPackagesApi";

describe("featuredPackagesApi", () => {
  it("fetches featured packages", async () => {
    get.mockResolvedValue({ data: { results: [] } });

    const result = await getFeaturedPackagesForAdmin({ page: 1 });

    expect(get).toHaveBeenCalledWith("/api/v1/admin/packages/featured/", {
      params: { page: 1 },
    });
    expect(result).toEqual({ results: [] });
  });

  it("sends ziyarat_token when toggling featured status", async () => {
    put.mockResolvedValue({ data: { ok: true } });

    const result = await updateFeaturedPackageStatus({
      ziyarat_token: "ZIY-123",
      is_featured: true,
      partner_session_token: "session-token",
    });

    expect(put).toHaveBeenCalledWith("/api/v1/admin/packages/featured/", {
      ziyarat_token: "ZIY-123",
      is_featured: true,
      partner_session_token: "session-token",
    });
    expect(result).toEqual({ ok: true });
  });
});
