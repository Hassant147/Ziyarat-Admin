import { describe, expect, it } from "vitest";
import {
  WORKFLOW_OPTIONS,
  getBookingDisplayMeta,
  getBookingWorkflowBucket,
  getBookingWorkflowScreen,
  getWorkflowBucketLabel,
  normalizeWorkflowBucket,
} from "./bookingWorkflowUtils";
import { adaptAdminBooking } from "../../../utility/bookingContractUtils";

const createBooking = (overrides = {}) => ({
  booking_status: "IN_FULFILLMENT",
  issue_status: "NONE",
  workflow_bucket: "",
  traveler_issues: [],
  reported_travelers: [],
  open_traveler_issues: [],
  ...overrides,
});

describe("bookingWorkflowUtils", () => {
  it("keeps REPORTED out of the admin queue selector", () => {
    const values = WORKFLOW_OPTIONS.map((option) => option.value);

    expect(values).not.toContain("REPORTED");
    expect(values.filter((value) => value === "ISSUES")).toHaveLength(1);
  });

  it("normalizes the legacy REPORTED bucket alias to ISSUES", () => {
    const booking = createBooking({ workflow_bucket: "REPORTED" });

    expect(normalizeWorkflowBucket("REPORTED")).toBe("ISSUES");
    expect(getWorkflowBucketLabel("REPORTED")).toBe("Issues");
    expect(getBookingWorkflowBucket(booking)).toBe("ISSUES");
    expect(getBookingWorkflowScreen(booking)).toBe("ISSUE");
    expect(adaptAdminBooking(booking).workflow_bucket).toBe("ISSUES");
  });

  it("keeps reported traveler issue copy while routing through the ISSUES workflow", () => {
    const booking = adaptAdminBooking(
      createBooking({
        traveler_issues: [
          {
            traveler_issue_id: "issue-1",
            traveler_id: "traveler-1",
            status: "open",
            issue_type: "reported",
          },
        ],
        traveler_groups: [
          {
            group_id: "group-1",
            travelers: [
              {
                passport_id: "traveler-1",
                first_name: "Amina",
                last_name: "Khan",
              },
            ],
          },
        ],
      })
    );

    expect(booking.workflow_bucket).toBe("ISSUES");
    expect(getBookingWorkflowBucket(booking)).toBe("ISSUES");
    expect(getBookingWorkflowScreen(booking)).toBe("ISSUE");
    expect(getBookingDisplayMeta(booking)).toMatchObject({
      label: "Reported",
    });
  });

  it("preserves operator objection labels inside the shared ISSUES workflow", () => {
    const booking = createBooking({
      issue_status: "OPERATOR_OBJECTION",
      open_traveler_issues: [{ id: "issue-1", status: "open" }],
    });

    expect(getBookingWorkflowBucket(booking)).toBe("ISSUES");
    expect(getBookingWorkflowScreen(booking)).toBe("ISSUE");
    expect(getBookingDisplayMeta(booking)).toMatchObject({
      label: "Operator Objection",
    });
  });
});
