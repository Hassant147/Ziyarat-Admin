import { describe, expect, it, vi } from "vitest";

const { get } = vi.hoisted(() => ({
  get: vi.fn(),
}));

vi.mock("./adminApiClient", () => ({
  default: { get },
}));

import { getPublicPackageDetail } from "./publicPackagesApi";

describe("getPublicPackageDetail", () => {
  it("requests public package detail with ziyarat_token", async () => {
    get.mockResolvedValue({ data: [{ package_name: "Test" }] });

    const result = await getPublicPackageDetail("ZIY-001");

    expect(get).toHaveBeenCalledWith("/api/v1/packages/public/detail/", {
      params: { ziyarat_token: "ZIY-001" },
    });
    expect(result.data).toEqual([{ package_name: "Test" }]);
    expect(result.error).toBeNull();
  });
});
