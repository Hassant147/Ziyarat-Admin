export const EMPTY_VALUE = "Not available";

const toValidDate = (value) => {
  if (!value) {
    return null;
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

export const formatDate = (value) => {
  const date = toValidDate(value);
  if (!date) {
    return EMPTY_VALUE;
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export const formatDateTime = (value) => {
  const date = toValidDate(value);
  if (!date) {
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

export const formatCurrencyPKR = (value) => {
  return `PKR ${Number(value || 0).toLocaleString()}`;
};

export const getInitial = (value, fallback = "N") => {
  if (!value || typeof value !== "string") {
    return fallback;
  }
  const trimmed = value.trim();
  return trimmed ? trimmed[0].toUpperCase() : fallback;
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

