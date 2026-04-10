import { describe, expect, it } from "vitest";

import {
  ADMIN_DETAIL_QUERY_KEYS,
  buildAdminBookingDetailsPathWithSearch,
  buildAdminProfileApprovalPath,
  getAdminDetailSearchParam,
} from "./adminDetailRouteUtils";

describe("adminDetailRouteUtils", () => {
  it("builds profile approval links with company_id selectors", () => {
    expect(buildAdminProfileApprovalPath("42")).toBe("/profile-approval?company_id=42");
  });

  it("builds booking detail links with booking_number only", () => {
    expect(
      buildAdminBookingDetailsPathWithSearch("/booking-details", {
        bookingNumber: "BK-123",
      })
    ).toBe("/booking-details?booking_number=BK-123");
  });

  it("reads company_id selectors back from the URL", () => {
    expect(
      getAdminDetailSearchParam("?company_id=84", ADMIN_DETAIL_QUERY_KEYS.companyId)
    ).toBe("84");
  });
});
