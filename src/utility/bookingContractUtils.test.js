import { describe, expect, it } from "vitest";

import { adaptAdminBooking } from "./bookingContractUtils";

describe("adaptAdminBooking", () => {
  it("sanitizes legacy REPORTED workflow buckets into ISSUES", () => {
    expect(
      adaptAdminBooking({
        booking_number: "HB-001",
        workflow_bucket: "REPORTED",
      }).workflow_bucket
    ).toBe("ISSUES");
  });

  it("preserves canonical workflow buckets when shared resolution is unavailable", () => {
    expect(
      adaptAdminBooking({
        booking_number: "HB-002",
        workflow_bucket: "READY",
      }).workflow_bucket
    ).toBe("READY");
  });
});
