import { handleAdminUnauthorizedResponse } from "./adminSession";
import { createApiClient, isManagementRequest } from "./apiConfig";

const adminApiClient = createApiClient();

adminApiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (isManagementRequest(error?.config?.url)) {
      return handleAdminUnauthorizedResponse(error);
    }

    return Promise.reject(error);
  }
);

export default adminApiClient;
