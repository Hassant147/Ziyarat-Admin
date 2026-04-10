const normalizeToken = (value = "") => `${value || ""}`.trim();

export const ADMIN_DETAIL_QUERY_KEYS = {
  bookingNumber: "booking_number",
  companyId: "company_id",
};

export const getAdminDetailSearchParam = (search = "", key = "") => {
  if (!key) {
    return "";
  }

  return normalizeToken(new URLSearchParams(search || "").get(key));
};

export const buildAdminDetailSearch = (params = {}) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    const normalizedValue = normalizeToken(value);
    if (normalizedValue) {
      searchParams.set(key, normalizedValue);
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : "";
};

export const buildAdminProfileApprovalPath = (companyId = "") =>
  `/profile-approval${buildAdminDetailSearch({
    [ADMIN_DETAIL_QUERY_KEYS.companyId]: companyId,
  })}`;

export const buildAdminBookingDetailsPathWithSearch = (
  pathname = "/booking-details",
  { bookingNumber = "" } = {}
) =>
  `${pathname}${buildAdminDetailSearch({
    [ADMIN_DETAIL_QUERY_KEYS.bookingNumber]: bookingNumber,
  })}`;
