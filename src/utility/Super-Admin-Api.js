import axios from "axios";
import {
  buildSharedRequestKey,
  invalidateSharedRequest,
  runSharedRequest,
} from "./requestCache";
import {
  createApiClient,
  DEFAULT_API_BASE_URL,
  DEFAULT_AXIOS_CONFIG,
  isManagementRequest,
  resolveApiBaseURL,
} from "./apiConfig";
import { handleAdminUnauthorizedResponse } from "./adminSession";

const baseURL = resolveApiBaseURL();
const defaultFallbackBaseURL = DEFAULT_API_BASE_URL.replace(/\/+$/, "");

const apiClient = createApiClient({
  baseURL,
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (isManagementRequest(error?.config?.url)) {
      return handleAdminUnauthorizedResponse(error);
    }

    return Promise.reject(error);
  }
);

const shouldRetryWithLocalFallback = (error) => {
  if (baseURL === defaultFallbackBaseURL) {
    return false;
  }
  if (error?.response) {
    return false;
  }

  const errorCode = error?.code || "";
  return (
    errorCode === "ERR_NETWORK" ||
    errorCode === "ECONNABORTED" ||
    error?.message === "Network Error"
  );
};

const requestWithFallback = async (requestConfig) => {
  try {
    return await apiClient.request(requestConfig);
  } catch (error) {
    if (!shouldRetryWithLocalFallback(error)) {
      throw error;
    }

    try {
      return await axios.request({
        ...DEFAULT_AXIOS_CONFIG,
        ...requestConfig,
        baseURL: defaultFallbackBaseURL,
        headers: {
          ...DEFAULT_AXIOS_CONFIG.headers,
          ...(requestConfig?.headers || {}),
        },
      });
    } catch (fallbackError) {
      if (isManagementRequest(fallbackError?.config?.url)) {
        return handleAdminUnauthorizedResponse(fallbackError);
      }

      throw fallbackError;
    }
  }
};

const normalizePendingAccountStatus = (accountStatus) => {
  const normalizedStatus = `${accountStatus || ""}`.trim().toLowerCase();
  if (normalizedStatus === "underreview" || normalizedStatus === "pending") {
    return "Pending";
  }
  return accountStatus;
};

const normalizePendingCompany = (company = {}) => ({
  ...company,
  account_status: normalizePendingAccountStatus(company.account_status),
  partner_type_and_detail: company.partner_type_and_detail || {},
  partner_service_detail: company.partner_service_detail || {},
  mailing_detail: company.mailing_detail || {},
});

const EMPTY_PAGINATED_RESPONSE = {
  count: 0,
  next: null,
  previous: null,
  results: [],
  meta: {},
};

const normalizePaginatedResponse = (payload) => {
  if (Array.isArray(payload)) {
    return {
      ...EMPTY_PAGINATED_RESPONSE,
      count: payload.length,
      results: payload,
    };
  }

  if (payload && typeof payload === "object") {
    const results = Array.isArray(payload.results) ? payload.results : [];
    return {
      count: Number(payload.count) || results.length,
      next: payload.next || null,
      previous: payload.previous || null,
      results,
      meta: payload.meta && typeof payload.meta === "object" ? payload.meta : {},
    };
  }

  return EMPTY_PAGINATED_RESPONSE;
};

const REQUEST_CACHE_TTL_MS = 1500;
const PAID_BOOKINGS_REQUEST_PREFIX = buildSharedRequestKey(
  "super-admin",
  "paid-bookings"
);
const PARTNER_RECEIVABLES_REQUEST_PREFIX = buildSharedRequestKey(
  "super-admin",
  "partner-receivables"
);
const ADMIN_API_ROUTES = {
  pendingCompanies: "/api/v1/admin/companies/pending/",
  salesDirectors: "/api/v1/admin/sales-directors/",
  companyStatus: "/api/v1/admin/companies/status/",
  paidBookings: "/api/v1/admin/bookings/paid/",
  bookingPaymentApproval: "/api/v1/admin/bookings/payments/approve/",
  receivables: "/api/v1/admin/receivables/",
  receivablesTransfer: "/api/v1/admin/receivables/transfer/",
  operatorBookingDetail: "/api/v1/admin/operators/bookings/detail/",
};

const getPaidBookingsRequestKey = ({
  page = 1,
  pageSize = 10,
  paymentQueue = "",
  orderDate = "",
  bookingNumber = "",
} = {}) =>
  buildSharedRequestKey(
    PAID_BOOKINGS_REQUEST_PREFIX,
    page,
    pageSize,
    paymentQueue,
    orderDate,
    bookingNumber
  );

const getPartnerReceivablesRequestKey = ({
  page = 1,
  pageSize = 10,
} = {}) =>
  buildSharedRequestKey(PARTNER_RECEIVABLES_REQUEST_PREFIX, page, pageSize);

const invalidateManagementListRequests = () => {
  invalidateSharedRequest([
    PAID_BOOKINGS_REQUEST_PREFIX,
    PARTNER_RECEIVABLES_REQUEST_PREFIX,
  ]);
};

const mergeSettlementReviewBookingDetail = (detailBooking = {}, paymentSource = {}) => {
  if (!detailBooking || typeof detailBooking !== "object") {
    return paymentSource;
  }

  if (!paymentSource || typeof paymentSource !== "object") {
    return detailBooking;
  }

  return {
    ...detailBooking,
    payment_detail: Array.isArray(paymentSource.payment_detail)
      ? paymentSource.payment_detail
      : [],
    initial_payment_status:
      paymentSource.initial_payment_status || detailBooking.initial_payment_status,
    minimum_payment_status:
      paymentSource.minimum_payment_status || detailBooking.minimum_payment_status,
    full_payment_status:
      paymentSource.full_payment_status || detailBooking.full_payment_status,
    remaining_amount_due:
      paymentSource.remaining_amount_due ?? detailBooking.remaining_amount_due,
    payment_correction_expires_at:
      paymentSource.payment_correction_expires_at ||
      detailBooking.payment_correction_expires_at,
    hold_expires_at: paymentSource.hold_expires_at || detailBooking.hold_expires_at,
    operator_visible: paymentSource.operator_visible ?? detailBooking.operator_visible,
    operator_can_act: paymentSource.operator_can_act ?? detailBooking.operator_can_act,
    workflow_bucket: paymentSource.workflow_bucket || detailBooking.workflow_bucket,
  };
};

export const fetchPendingCompanies = async () => {
  try {
    const response = await requestWithFallback({
      method: "get",
      url: ADMIN_API_ROUTES.pendingCompanies,
    });

    const pendingCompanies = Array.isArray(response.data)
      ? response.data.map(normalizePendingCompany)
      : [];

    return {
      status: response.status,
      data: pendingCompanies,
    };
  } catch (error) {
    if (error.response) {
      return {
        status: error.response.status,
        error: error.response.data,
      };
    } else {
      console.error("Error fetching pending companies:", error);
      throw error;
    }
  }
};

export const fetchSalesDirectors = async () => {
  try {
    const response = await requestWithFallback({
      method: "get",
      url: ADMIN_API_ROUTES.salesDirectors,
    });
    return {
      status: response.status,
      data: response.data,
    };
  } catch (error) {
    if (error.response) {
      return {
        status: error.response.status,
        error: error.response.data.message,
      };
    } else {
      console.error("Error fetching sales directors:", error);
      throw error;
    }
  }
};

export const updateCompanyStatus = async (
  company_id,
  account_status,
  session_token = ""
) => {
  try {
    const response = await requestWithFallback({
      method: "put",
      url: ADMIN_API_ROUTES.companyStatus,
      data: {
        company_id,
        account_status,
        session_token, // Send the sales director session token if provided
      },
    });
    return {
      status: response.status,
      message: response.data.message,
      account_status: response.data.account_status,
    };
  } catch (error) {
    if (error.response) {
      return {
        status: error.response.status,
        error:
          error.response.data?.message ||
          error.response.data?.detail ||
          "Failed to update company profile status.",
      };
    } else {
      console.error("Error updating company status:", error);
      throw error;
    }
  }
};

export const fetchPaidBookings = async (
  {
    page = 1,
    pageSize = 10,
    paymentQueue = "",
    orderDate = "",
    bookingNumber = "",
  } = {},
  options = {}
) => {
  return runSharedRequest({
    key: getPaidBookingsRequestKey({
      page,
      pageSize,
      paymentQueue,
      orderDate,
      bookingNumber,
    }),
    cacheTtlMs: REQUEST_CACHE_TTL_MS,
    skipCache: Boolean(options.forceRefresh),
    request: async () => {
      try {
        const response = await requestWithFallback({
          method: "get",
          url: ADMIN_API_ROUTES.paidBookings,
          params: {
            page,
            page_size: pageSize,
            ...(paymentQueue ? { payment_queue: paymentQueue } : {}),
            ...(orderDate ? { order_date: orderDate } : {}),
            ...(bookingNumber ? { booking_number: bookingNumber } : {}),
          },
        });
        return {
          status: response.status,
          data: normalizePaginatedResponse(response.data),
        };
      } catch (error) {
        if (error.response) {
          return {
            status: error.response.status,
            error:
              error.response.data?.message ||
              error.response.data?.detail ||
              "Failed to fetch paid bookings.",
          };
        }

        console.error("Error fetching paid bookings:", error);
        return {
          status: 0,
          error: `Unable to connect to API (${baseURL}). Check backend server, ngrok tunnel, and CORS.`,
        };
      }
    },
  });
};

// API to confirm payment and update booking status
export const confirmBookingPayment = async (
  user_session_token,
  bookingNumber,
  {
    decision = "approve",
    paymentId = "",
    reviewMessage = "",
  } = {}
) => {
  try {
    const response = await requestWithFallback({
      method: "put",
      url: ADMIN_API_ROUTES.bookingPaymentApproval,
      data: {
        session_token: user_session_token,
        booking_number: bookingNumber,
        decision,
        ...(paymentId ? { payment_id: paymentId } : {}),
        ...(reviewMessage ? { review_message: reviewMessage } : {}),
      },
    });

    return {
      status: response.status,
      data: response.data,
    };
  } catch (error) {
    if (error.response) {
      // Server responded with a status other than 200 range
      return {
        status: error.response.status,
        error: error.response.data.message || "An error occurred.",
      };
    } else if (error.request) {
      // The request was made, but no response was received
      return {
        status: 500,
        error: "No response received from the server.",
      };
    } else {
      // Something happened in setting up the request that triggered an error
      return {
        status: 500,
        error: "An error occurred while making the request.",
      };
    }
  } finally {
    invalidateManagementListRequests();
  }
};

// Define the function to fetch all pending partner payments
export const fetchPendingPartnerPayments = async (
  {
    page = 1,
    pageSize = 10,
  } = {},
  options = {}
) => {
  return runSharedRequest({
    key: getPartnerReceivablesRequestKey({ page, pageSize }),
    cacheTtlMs: REQUEST_CACHE_TTL_MS,
    skipCache: Boolean(options.forceRefresh),
    request: async () => {
      try {
        const response = await requestWithFallback({
          method: "get",
          url: ADMIN_API_ROUTES.receivables,
          params: {
            page,
            page_size: pageSize,
          },
        });
        return {
          status: response.status,
          data: normalizePaginatedResponse(response.data),
        };
      } catch (error) {
        return { status: error.response?.status, error: error.message };
      }
    },
  });
};

// Define the function to fetch booking details
export const fetchBookingDetails = async (booking_number) => {
  try {
    const response = await requestWithFallback({
      method: "get",
      url: ADMIN_API_ROUTES.operatorBookingDetail,
      params: {
        booking_number,
      },
    });
    return { status: response.status, data: response.data };
  } catch (error) {
    console.error('Error fetching booking details:', error);
    return { status: error.response?.status, error: error.message };
  }
};

export const fetchSettlementReviewBookingDetails = async (booking_number) => {
  try {
    const detailResponse = await requestWithFallback({
      method: "get",
      url: ADMIN_API_ROUTES.operatorBookingDetail,
      params: {
        booking_number,
      },
    });

    let paidBookingMatches = [];
    try {
      const paidBookingsResponse = await fetchPaidBookings({
        bookingNumber: booking_number,
        page: 1,
        pageSize: 1,
      });
      paidBookingMatches = paidBookingsResponse.data?.results || [];
    } catch (paymentSourceError) {
      console.error(
        "Error fetching payment proof source for settlement review:",
        paymentSourceError
      );
    }

    const paymentSource =
      paidBookingMatches.find((booking) => booking.booking_number === booking_number) || {};

    return {
      status: detailResponse.status,
      data: mergeSettlementReviewBookingDetail(detailResponse.data, paymentSource),
    };
  } catch (error) {
    console.error("Error fetching settlement review booking details:", error);
    return { status: error.response?.status, error: error.message };
  }
};

//API for approving partner's payments
export const updatePartnerPaymentStatus = async (booking_number) => {
  try {
    const response = await requestWithFallback({
      method: "put",
      url: ADMIN_API_ROUTES.receivablesTransfer,
      data: {
        booking_number,
      },
    });
    return { status: response.status, data: response.data };
  } catch (error) {
    console.error('Error updating payment status:', error);
    return { status: error.response?.status, error: error.message };
  } finally {
    invalidateManagementListRequests();
  }
};

export default apiClient; // Export apiClient as default
