const BOOKING_STATUS_SET = new Set([
  "HOLD",
  "TRAVELER_DETAILS_PENDING",
  "AWAITING_FINAL_PAYMENT",
  "READY_FOR_OPERATOR",
  "IN_FULFILLMENT",
  "READY_FOR_TRAVEL",
  "COMPLETED",
  "CANCELLED",
  "EXPIRED",
]);

const ISSUE_STATUS_SET = new Set([
  "NONE",
  "OPERATOR_OBJECTION",
  "REPORTED",
]);

const WORKFLOW_BUCKET_SET = new Set([
  "VIEW_ONLY",
  "READY",
  "FULFILLMENT",
  "READY_FOR_TRAVEL",
  "ISSUES",
  "COMPLETED",
  "HISTORY",
]);

export const PRE_BOOKING_STAGE = "pre_booking";
export const INITIAL_PAYMENT_STAGE = "initial_payment";
export const INITIAL_PAYMENT_REVIEW_STAGE = "initial_payment_review";

const CLIENT_WORKFLOW_STAGE_SET = new Set([
  PRE_BOOKING_STAGE,
  INITIAL_PAYMENT_STAGE,
  INITIAL_PAYMENT_REVIEW_STAGE,
  "traveler_details",
  "remaining_payment",
  "full_payment_review",
  "booking_status",
]);

const WORKFLOW_BUCKET_LABELS = {
  VIEW_ONLY: "View Only",
  READY: "Ready",
  FULFILLMENT: "In Fulfillment",
  READY_FOR_TRAVEL: "Ready for Travel",
  ISSUES: "Issues",
  COMPLETED: "Completed",
  HISTORY: "History",
};

const PAYMENT_STATUS_SET = new Set([
  "approved",
  "under_review",
  "rejected",
  "not_submitted",
]);

const toString = (value) => String(value || "").trim();

const toBoolean = (value) => {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    return normalized === "true" || normalized === "1" || normalized === "yes";
  }

  return Boolean(value);
};

const hasOwn = (value, key) =>
  Boolean(value) && Object.prototype.hasOwnProperty.call(value, key);

const normalizeUpper = (value, allowedValues) => {
  const normalized = toString(value).toUpperCase();
  if (!normalized) {
    return "";
  }

  return allowedValues.has(normalized) ? normalized : "";
};

const normalizeLowerFromUpper = (value, allowedValues, fallback = "") => {
  const normalized = normalizeUpper(value, allowedValues);
  return normalized ? normalized.toLowerCase() : fallback;
};

export const normalizeBookingStatusUpper = (value) =>
  normalizeUpper(value, BOOKING_STATUS_SET);

export const normalizeBookingStatusLower = (value) =>
  normalizeLowerFromUpper(value, BOOKING_STATUS_SET);

export const normalizeIssueStatusUpper = (value) =>
  normalizeUpper(value, ISSUE_STATUS_SET) || toString(value).toUpperCase();

export const normalizeIssueStatusLower = (value) =>
  normalizeLowerFromUpper(value, ISSUE_STATUS_SET, "") ||
  toString(value).toLowerCase() ||
  "none";

export const normalizeWorkflowBucket = (value) =>
  normalizeUpper(value, WORKFLOW_BUCKET_SET);

export const getWorkflowBucketLabel = (value) =>
  WORKFLOW_BUCKET_LABELS[normalizeWorkflowBucket(value)] || value || "Booking";

export const normalizeClientWorkflowStage = (value) => {
  const normalized = toString(value).toLowerCase();
  if (!normalized) {
    return "";
  }

  if (normalized === "booking_setup" || normalized === PRE_BOOKING_STAGE) {
    return PRE_BOOKING_STAGE;
  }

  if (normalized === "minimum_payment") {
    return INITIAL_PAYMENT_STAGE;
  }

  if (normalized === "minimum_payment_review") {
    return INITIAL_PAYMENT_REVIEW_STAGE;
  }

  return CLIENT_WORKFLOW_STAGE_SET.has(normalized) ? normalized : "";
};

export const resolveOpenTravelerIssues = (booking = {}) =>
  (Array.isArray(booking?.traveler_issues) ? booking.traveler_issues : []).filter(
    (issue) => toString(issue?.status).toLowerCase() === "open"
  );

export const resolveHasOpenTravelerIssues = (booking = {}) =>
  resolveOpenTravelerIssues(booking).length > 0;

export const resolveWorkflowBucket = (booking = {}) => {
  const backendBucket = normalizeWorkflowBucket(booking?.workflow_bucket);
  if (backendBucket) {
    return backendBucket;
  }

  const bookingStatus = normalizeBookingStatusUpper(booking?.booking_status);
  const issueStatus = normalizeIssueStatusUpper(booking?.issue_status);
  if (
    (issueStatus && issueStatus !== "NONE") ||
    resolveHasOpenTravelerIssues(booking)
  ) {
    return "ISSUES";
  }

  switch (bookingStatus) {
    case "TRAVELER_DETAILS_PENDING":
    case "AWAITING_FINAL_PAYMENT":
      return "VIEW_ONLY";
    case "READY_FOR_OPERATOR":
      return "READY";
    case "IN_FULFILLMENT":
      return "FULFILLMENT";
    case "READY_FOR_TRAVEL":
      return "READY_FOR_TRAVEL";
    case "COMPLETED":
      return "COMPLETED";
    case "CANCELLED":
    case "EXPIRED":
      return "HISTORY";
    default:
      return "";
  }
};

export const resolveBookingDetailScreen = (booking = {}) => {
  const issueStatus = normalizeIssueStatusUpper(booking?.issue_status);
  if (issueStatus === "OPERATOR_OBJECTION") {
    return "ISSUE";
  }

  switch (resolveWorkflowBucket(booking)) {
    case "VIEW_ONLY":
      return "VIEW_ONLY";
    case "READY":
      return "READY";
    case "FULFILLMENT":
      return "FULFILLMENT";
    case "READY_FOR_TRAVEL":
      return "READY_FOR_TRAVEL";
    case "COMPLETED":
      return "COMPLETED";
    case "HISTORY":
      return "HISTORY";
    case "ISSUES":
      return "ISSUE";
    default:
      return "VIEW_ONLY";
  }
};

export const resolveBackendActionFlags = (booking = {}) => {
  const bookingStatus = normalizeBookingStatusUpper(booking?.booking_status);
  const issueStatus = normalizeIssueStatusUpper(booking?.issue_status);
  const hasOpenTravelerIssues = resolveHasOpenTravelerIssues(booking);

  const readFlag = (fieldName, fallback) =>
    hasOwn(booking, fieldName) ? toBoolean(booking[fieldName]) : fallback;

  return {
    canTakeDecision: readFlag(
      "can_take_decision",
      toBoolean(booking?.operator_can_act) || bookingStatus === "READY_FOR_OPERATOR"
    ),
    canEditFulfillment: readFlag(
      "can_edit_fulfillment",
      bookingStatus === "IN_FULFILLMENT" || bookingStatus === "READY_FOR_TRAVEL"
    ),
    canManageTravelerIssues: readFlag(
      "can_manage_traveler_issues",
      ["IN_FULFILLMENT", "READY_FOR_TRAVEL", "COMPLETED"].includes(bookingStatus) &&
        issueStatus !== "OPERATOR_OBJECTION"
    ),
    canCompleteBooking: readFlag(
      "can_complete_booking",
      bookingStatus === "READY_FOR_TRAVEL" && !hasOpenTravelerIssues
    ),
    hasOpenTravelerIssues,
  };
};

export const resolveFulfillmentSummary = (booking = {}) => {
  const summary = booking?.booking_fulfillment?.summary || {};
  return {
    visaCompleted: toBoolean(summary?.visa_completed),
    airlineDocumentsCompleted: toBoolean(summary?.airline_documents_completed),
    airlineDetailsCompleted: toBoolean(summary?.airline_details_completed),
    hotelCompleted: toBoolean(summary?.hotel_completed),
    transportCompleted: toBoolean(summary?.transport_completed),
  };
};

const normalizePaymentStatus = (value) => toString(value).toLowerCase();

export const resolveInitialPaymentStatus = (booking = {}) => {
  const backendStatus = normalizePaymentStatus(booking?.initial_payment_status);
  if (PAYMENT_STATUS_SET.has(backendStatus)) {
    return backendStatus;
  }

  const minimumPaymentStatus = normalizePaymentStatus(booking?.minimum_payment_status);
  const fullPaymentStatus = normalizePaymentStatus(booking?.full_payment_status);

  if (minimumPaymentStatus === "approved" || fullPaymentStatus === "approved") {
    return "approved";
  }

  if (
    minimumPaymentStatus === "under_review" ||
    fullPaymentStatus === "under_review"
  ) {
    return "under_review";
  }

  if (minimumPaymentStatus === "rejected" || fullPaymentStatus === "rejected") {
    return "rejected";
  }

  return "not_submitted";
};

export const resolveClientWorkflowStageFromBooking = (booking = {}) => {
  const backendStage = normalizeClientWorkflowStage(booking?.client_workflow_stage);
  if (backendStage && backendStage !== PRE_BOOKING_STAGE) {
    return backendStage;
  }

  const bookingStatus = normalizeBookingStatusLower(booking?.booking_status);
  const initialPaymentStatus = resolveInitialPaymentStatus(booking);
  const fullPaymentStatus = normalizePaymentStatus(booking?.full_payment_status);
  const hasApprovedPayment = initialPaymentStatus === "approved";

  if (!hasApprovedPayment) {
    if (initialPaymentStatus === "under_review") {
      return INITIAL_PAYMENT_REVIEW_STAGE;
    }

    return INITIAL_PAYMENT_STAGE;
  }

  if (
    bookingStatus === "traveler_details_pending" ||
    toBoolean(booking?.client_can_edit_travellers)
  ) {
    return "traveler_details";
  }

  if (fullPaymentStatus === "under_review") {
    return "full_payment_review";
  }

  if (
    bookingStatus === "awaiting_final_payment" ||
    toBoolean(booking?.client_can_submit_full_payment)
  ) {
    return "remaining_payment";
  }

  if (
    toBoolean(booking?.operator_visible) ||
    toBoolean(booking?.operator_can_act) ||
    [
      "ready_for_operator",
      "in_fulfillment",
      "ready_for_travel",
      "completed",
      "cancelled",
      "expired",
    ].includes(bookingStatus)
  ) {
    return "booking_status";
  }

  return INITIAL_PAYMENT_STAGE;
};
