export const PAYMENT_REVIEW_TABS = [
  { value: "minimum_under_review", label: "Minimum Under Review" },
  { value: "full_under_review", label: "Full Under Review" },
  { value: "rejected_corrections", label: "Rejected Corrections" },
  { value: "approved_history", label: "Approved History" },
];

export const normalizePaymentStatus = (value = "") =>
  `${value || ""}`.trim().toUpperCase();

const getPaymentTimestamp = (payment = {}) => {
  const rawValue =
    payment?.transaction_time ||
    payment?.updated_at ||
    payment?.created_at;
  const timestamp = rawValue ? new Date(rawValue).getTime() : Number.NaN;
  return Number.isFinite(timestamp) ? timestamp : 0;
};

export const getSortedPayments = (booking = {}) =>
  (Array.isArray(booking?.payment_detail) ? [...booking.payment_detail] : []).sort(
    (left, right) => getPaymentTimestamp(right) - getPaymentTimestamp(left)
  );

export const getStagePayment = (booking = {}, stage = "") => {
  const normalizedStage = `${stage || ""}`.trim().toLowerCase();
  return (
    getSortedPayments(booking).find(
      (payment) =>
        `${payment?.full_or_minimum || payment?.transaction_type || ""}`
          .trim()
          .toLowerCase() === normalizedStage
    ) || null
  );
};

export const getStagePaymentStatus = (booking = {}, stage = "") => {
  const bookingField =
    `${stage || ""}`.trim().toLowerCase() === "full"
      ? booking?.full_payment_status
      : booking?.minimum_payment_status;

  if (bookingField) {
    return normalizePaymentStatus(bookingField);
  }

  return normalizePaymentStatus(getStagePayment(booking, stage)?.payment_status);
};

export const getReviewQueueKey = (booking = {}) => {
  const minimumStatus = getStagePaymentStatus(booking, "minimum");
  const fullStatus = getStagePaymentStatus(booking, "full");
  const correctionDeadline = booking?.payment_correction_expires_at
    ? new Date(booking.payment_correction_expires_at).getTime()
    : Number.NaN;
  const hasActiveCorrectionWindow =
    Number.isFinite(correctionDeadline) && correctionDeadline > Date.now();

  if (minimumStatus === "UNDER_REVIEW") {
    return "minimum_under_review";
  }

  if (fullStatus === "UNDER_REVIEW") {
    return "full_under_review";
  }

  if (
    hasActiveCorrectionWindow &&
    (minimumStatus === "REJECTED" || fullStatus === "REJECTED")
  ) {
    return "rejected_corrections";
  }

  if (minimumStatus === "APPROVED" || fullStatus === "APPROVED") {
    return "approved_history";
  }

  return "";
};

export const getReviewStageLabel = (booking = {}) => {
  const queueKey = getReviewQueueKey(booking);

  if (queueKey === "minimum_under_review") {
    return "Minimum";
  }
  if (queueKey === "full_under_review") {
    return "Full";
  }
  if (queueKey === "rejected_corrections") {
    return getStagePaymentStatus(booking, "full") === "REJECTED" ? "Full" : "Minimum";
  }
  if (queueKey === "approved_history") {
    return getStagePaymentStatus(booking, "full") === "APPROVED" ? "Full" : "Minimum";
  }

  return "Payment";
};

export const getWorkflowSummaryLabel = (booking = {}) => {
  const bookingStatus = `${booking?.booking_status || ""}`
    .trim()
    .replace(/_/g, " ")
    .toLowerCase();
  const issueStatus = `${booking?.issue_status || ""}`
    .trim()
    .replace(/_/g, " ")
    .toLowerCase();

  const baseLabel = issueStatus && issueStatus !== "none" ? issueStatus : bookingStatus;
  return baseLabel
    ? baseLabel.replace(/\b\w/g, (char) => char.toUpperCase())
    : "Unknown";
};

export const getPaymentStatusLabel = (value = "") => {
  const normalized = normalizePaymentStatus(value);
  if (normalized === "UNDER_REVIEW") {
    return "Under Review";
  }
  if (normalized === "APPROVED") {
    return "Approved";
  }
  if (normalized === "REJECTED") {
    return "Rejected";
  }
  return "Not Submitted";
};
