import adminApiClient from "./adminApiClient";

const PUBLIC_PACKAGE_DETAIL_ENDPOINT = "/api/v1/packages/public/detail/";

export const getPublicPackageDetail = async (packageId) => {
  try {
    const response = await adminApiClient.get(PUBLIC_PACKAGE_DETAIL_ENDPOINT, {
      params: { ziyarat_token: packageId },
    });
    return { data: response.data, error: null };
  } catch (error) {
    if (error.response) {
      return { data: null, error: error.response.data.message };
    }

    if (error.request) {
      return {
        data: null,
        error:
          "Network Error: Unable to reach the server. Please check your internet connection or try again later.",
      };
    }

    return { data: null, error: error.message };
  }
};
