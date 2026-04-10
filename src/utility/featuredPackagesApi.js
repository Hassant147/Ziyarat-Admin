import adminApiClient from "./adminApiClient";

const FEATURED_PACKAGES_ENDPOINT = "/api/v1/admin/packages/featured/";

const resolveApiErrorMessage = (error, fallbackMessage) => {
  const payload = error?.response?.data;
  if (typeof payload?.message === "string" && payload.message.trim()) {
    return payload.message.trim();
  }
  if (typeof payload?.detail === "string" && payload.detail.trim()) {
    return payload.detail.trim();
  }
  if (typeof error?.message === "string" && error.message.trim()) {
    return error.message.trim();
  }
  return fallbackMessage;
};

export const getFeaturedPackagesForAdmin = async (params = {}) => {
  try {
    const response = await adminApiClient.get(FEATURED_PACKAGES_ENDPOINT, {
      params,
    });
    return response.data;
  } catch (error) {
    throw new Error(resolveApiErrorMessage(error, "Failed to fetch packages."));
  }
};

export const updateFeaturedPackageStatus = async (payload = {}) => {
  try {
    const requestBody = {
      ziyarat_token: payload?.ziyarat_token,
      is_featured: payload?.is_featured,
      ...(payload?.partner_session_token
        ? { partner_session_token: payload.partner_session_token }
        : {}),
    };
    const response = await adminApiClient.put(FEATURED_PACKAGES_ENDPOINT, requestBody);
    return response.data;
  } catch (error) {
    throw new Error(
      resolveApiErrorMessage(error, "Failed to update package featured status.")
    );
  }
};
