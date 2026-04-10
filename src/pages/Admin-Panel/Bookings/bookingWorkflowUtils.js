import {
  getWorkflowBucketLabel as getSharedWorkflowBucketLabel,
  normalizeBookingStatusUpper,
  normalizeIssueStatusUpper,
  normalizeWorkflowBucket as normalizeSharedWorkflowBucket,
  resolveBackendActionFlags,
  resolveBookingDetailScreen,
  resolveWorkflowBucket,
} from "../../../shared/bookingWorkflowContract.js";

export const WORKFLOW_OPTIONS = [
  { value: "VIEW_ONLY", label: "View Only" },
  { value: "READY", label: "Ready" },
  { value: "FULFILLMENT", label: "In Fulfillment" },
  { value: "READY_FOR_TRAVEL", label: "Ready for Travel" },
  { value: "ISSUES", label: "Issues" },
  { value: "COMPLETED", label: "Completed" },
  { value: "HISTORY", label: "History" },
];

const WORKFLOW_META = {
  VIEW_ONLY: {
    label: "View Only",
    badgeTone: "bg-slate-100 text-slate-700 font-semibold",
  },
  READY: {
    label: "Ready",
    badgeTone: "bg-amber-100 text-amber-700 font-semibold",
  },
  FULFILLMENT: {
    label: "In Fulfillment",
    badgeTone: "bg-emerald-100 text-emerald-700 font-semibold",
  },
  READY_FOR_TRAVEL: {
    label: "Ready for Travel",
    badgeTone: "bg-cyan-100 text-cyan-700 font-semibold",
  },
  ISSUES: {
    label: "Issues",
    badgeTone: "bg-rose-100 text-rose-700 font-semibold",
  },
  COMPLETED: {
    label: "Completed",
    badgeTone: "bg-slate-200 text-slate-700 font-semibold",
  },
  HISTORY: {
    label: "History",
    badgeTone: "bg-zinc-200 text-zinc-700 font-semibold",
  },
};

const REPORTED_DISPLAY_META = {
  label: "Reported",
  badgeTone: "bg-amber-100 text-amber-800 font-semibold",
};

export const normalizeBookingStatus = (value) => {
  return normalizeBookingStatusUpper(value);
};

export const normalizeIssueStatus = (value) => {
  return normalizeIssueStatusUpper(value);
};

export const normalizeWorkflowBucket = (value) => {
  const normalizedValue = `${value || ""}`.trim().toUpperCase();
  if (normalizedValue === "REPORTED") {
    return "ISSUES";
  }

  return normalizeSharedWorkflowBucket(value);
};

export const hasReportedIssueState = (booking) => {
  const issueStatus = normalizeIssueStatus(booking?.issue_status);
  return (
    issueStatus === "REPORTED" ||
    (Array.isArray(booking?.reported_travelers) && booking.reported_travelers.length > 0) ||
    (Array.isArray(booking?.open_traveler_issues) && booking.open_traveler_issues.length > 0)
  );
};

export const canManageFulfillmentDetails = (bookingOrStatus) =>
  bookingOrStatus && typeof bookingOrStatus === "object"
    ? resolveBackendActionFlags(bookingOrStatus).canEditFulfillment
    : ["IN_FULFILLMENT", "READY_FOR_TRAVEL"].includes(normalizeBookingStatus(bookingOrStatus));

export const getWorkflowBucketLabel = (value) =>
  WORKFLOW_META[normalizeWorkflowBucket(value)]?.label ||
  getSharedWorkflowBucketLabel(value);

export const getBookingWorkflowBucket = (booking) =>
  normalizeWorkflowBucket(booking?.workflow_bucket) ||
  resolveWorkflowBucket(booking) ||
  (hasReportedIssueState(booking) ? "ISSUES" : "");

export const getBookingDisplayMeta = (booking) => {
  const workflowBucket = getBookingWorkflowBucket(booking);
  const issueStatus = normalizeIssueStatus(booking?.issue_status);

  if (workflowBucket === "ISSUES" && issueStatus === "OPERATOR_OBJECTION") {
    return {
      label: "Operator Objection",
      badgeTone: WORKFLOW_META.ISSUES.badgeTone,
    };
  }

  if (workflowBucket === "ISSUES" && hasReportedIssueState(booking)) {
    return {
      label: REPORTED_DISPLAY_META.label,
      badgeTone: REPORTED_DISPLAY_META.badgeTone,
    };
  }

  if (workflowBucket === "ISSUES" && issueStatus && issueStatus !== "NONE") {
    return {
      label: issueStatus.replace(/_/g, " "),
      badgeTone: WORKFLOW_META.ISSUES.badgeTone,
    };
  }

  return WORKFLOW_META[workflowBucket] || {
    label: normalizeBookingStatus(booking?.booking_status) || "Booking",
    badgeTone: "bg-gray-200 text-gray-800 font-semibold",
  };
};

export const getBookingWorkflowScreen = (booking) => {
  const workflowBucket = getBookingWorkflowBucket(booking);
  if (workflowBucket === "ISSUES") {
    return "ISSUE";
  }

  return resolveBookingDetailScreen({
    ...booking,
    workflow_bucket: workflowBucket,
  });
};
