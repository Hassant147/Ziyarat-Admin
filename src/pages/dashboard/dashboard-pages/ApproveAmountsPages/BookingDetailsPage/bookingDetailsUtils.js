export const EMPTY_VALUE = "Not available";

const STATUS_STYLE_MAP = {
  rejected: "bg-red-50 text-red-600",
  active: "bg-brand-50 text-brand-700",
  ready_for_operator: "bg-brand-50 text-brand-700",
  in_fulfillment: "bg-brand-50 text-brand-700",
  traveler_details_pending: "bg-blue-50 text-blue-700",
  awaiting_final_payment: "bg-amber-50 text-amber-700",
  ready_for_travel: "bg-slate-100 text-slate-600",
  pending: "bg-amber-50 text-amber-700",
  completed: "bg-slate-100 text-slate-600",
  close: "bg-emerald-50 text-emerald-700",
  paid: "bg-brand-50 text-brand-700",
  hold: "bg-amber-50 text-amber-700",
  cancelled: "bg-red-50 text-red-600",
  expired: "bg-red-50 text-red-600",
  operator_objection: "bg-red-50 text-red-600",
  reported: "bg-orange-50 text-orange-700",
};

export const getStatusPillClassName = (status) => {
  const key = `${status || ""}`.trim().toLowerCase();
  return STATUS_STYLE_MAP[key] || "bg-slate-100 text-slate-600";
};

export const withFallback = (value, fallback = EMPTY_VALUE) => {
  if (value === null || value === undefined) {
    return fallback;
  }

  if (typeof value === "string" && !value.trim()) {
    return fallback;
  }

  return value;
};

export const formatDate = (dateString, options = {}) => {
  if (!dateString) {
    return EMPTY_VALUE;
  }

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    return EMPTY_VALUE;
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    ...options,
  });
};

export const formatDateTime = (dateString) => {
  if (!dateString) {
    return EMPTY_VALUE;
  }

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    return EMPTY_VALUE;
  }

  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const parseCommaSeparated = (value) => {
  if (!value || typeof value !== "string") {
    return [];
  }

  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};
