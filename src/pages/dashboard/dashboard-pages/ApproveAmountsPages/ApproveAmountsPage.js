import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchPaidBookings } from "../../../../utility/Super-Admin-Api";
import { AppButton, AppCard, AppEmptyState, AppSectionHeader } from "../../../../components/ui";
import SearchBar from "./SearchBar";
import errorIcon from "../../../../assets/error.svg";
import SuperAdminModuleShell from "../../components/SuperAdminModuleShell";
import SuperAdminPagination from "../../components/SuperAdminPagination";
import SuperAdminMetricCard from "../../components/SuperAdminMetricCard";
import SuperAdminInfoTile from "../../components/SuperAdminInfoTile";
import Loader from "../../../../components/loader";
import { formatCurrencyPKR, formatDateTime } from "../../components/superAdminFormatters";
import {
  getReviewQueueKey,
  getReviewStageLabel,
  PAYMENT_REVIEW_TABS,
} from "./bookingReviewUtils";
import { buildAdminBookingDetailsPathWithSearch } from "../adminDetailRouteUtils";

const ITEMS_PER_PAGE = 6;

const formatDateForApi = (value) => {
  if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
    return "";
  }

  const year = value.getFullYear();
  const month = `${value.getMonth() + 1}`.padStart(2, "0");
  const day = `${value.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const ApproveAmountsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [activeQueue, setActiveQueue] = useState(PAYMENT_REVIEW_TABS[0].value);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [queueCounts, setQueueCounts] = useState({});
  const [totalRequests, setTotalRequests] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const selectedDateParam = useMemo(() => formatDateForApi(selectedDate), [selectedDate]);

  const loadBookings = useCallback(async () => {
    setLoading(true);
    setError("");

    const { status, data, error: requestError } = await fetchPaidBookings({
      page: currentPage,
      pageSize: ITEMS_PER_PAGE,
      paymentQueue: activeQueue,
      orderDate: selectedDateParam,
    });

    if (status === 200 && data) {
      const paginatedResults = Array.isArray(data.results) ? data.results : [];
      const meta = data.meta || {};
      const normalizedBookings = paginatedResults.map((booking) => ({
        ...booking,
        reviewQueueKey: getReviewQueueKey(booking) || activeQueue,
      }));
      const fallbackQueueCounts = PAYMENT_REVIEW_TABS.reduce((accumulator, tab) => {
        accumulator[tab.value] = normalizedBookings.filter(
          (booking) => booking.reviewQueueKey === tab.value
        ).length;
        return accumulator;
      }, {});
      const fallbackTotalAmount = normalizedBookings.reduce(
        (sum, booking) => sum + Number(booking.total_price || 0),
        0
      );

      setBookings(normalizedBookings);
      setTotalCount(Number(data.count) || 0);
      setQueueCounts(meta.queue_counts || fallbackQueueCounts);
      setTotalRequests(Number(meta.total_requests) || Number(data.count) || 0);
      setTotalAmount(Number(meta.total_amount) || fallbackTotalAmount);
    } else if (status === 404) {
      setBookings([]);
      setTotalCount(0);
      setQueueCounts({});
      setTotalRequests(0);
      setTotalAmount(0);
    } else {
      setBookings([]);
      setTotalCount(0);
      setQueueCounts({});
      setTotalRequests(0);
      setTotalAmount(0);
      setError(requestError || "An error occurred while fetching data.");
    }

    setLoading(false);
  }, [activeQueue, currentPage, selectedDateParam]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(totalCount / ITEMS_PER_PAGE));
  }, [totalCount]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const clearFilters = useCallback(() => {
    setSelectedDate(null);
    setCurrentPage(1);
  }, []);

  const handleDateChange = useCallback((date) => {
    setSelectedDate(date);
    setCurrentPage(1);
  }, []);

  const selectedDateLabel = useMemo(() => {
    if (!selectedDate) {
      return "All dates";
    }
    return selectedDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }, [selectedDate]);

  const hasActiveFilter = Boolean(selectedDate);

  return (
    <SuperAdminModuleShell
      title="Approve Amounts"
      subtitle="Review minimum/full payment submissions, rejected corrections, and approval history."
      showBackButton={false}
      toolbar={
        <div className="flex flex-wrap items-end gap-2 sm:gap-3">
          <SearchBar selectedDate={selectedDate} onDateChange={handleDateChange} />
          <AppButton
            variant="outline"
            size="sm"
            onClick={clearFilters}
            disabled={!hasActiveFilter}
            className="min-w-[120px]"
          >
            Clear Filter
          </AppButton>
        </div>
      }
    >
      {loading ? (
        <AppCard className="min-h-[320px] flex items-center justify-center">
          <Loader />
        </AppCard>
      ) : error ? (
        <AppCard>
          <AppEmptyState
            icon={<img src={errorIcon} alt="" className="h-6 w-6" />}
            title="Unable to load bookings"
            message={error}
            action={
              <AppButton size="sm" onClick={loadBookings}>
                Retry
              </AppButton>
            }
          />
        </AppCard>
      ) : totalRequests > 0 ? (
        <>
          <div className="app-grid-3">
            <SuperAdminMetricCard
              title="Total Requests"
              value={totalRequests.toLocaleString()}
              hint="Bookings with payment workflow activity"
            />
            <SuperAdminMetricCard
              title="Matching Results"
              value={totalCount.toLocaleString()}
              hint={`Filter: ${selectedDateLabel}`}
            />
            <SuperAdminMetricCard
              title="Total Amount"
              value={formatCurrencyPKR(totalAmount)}
              hint={`${bookings.length} records on current page`}
            />
          </div>

          <AppCard className="border-slate-200">
            <AppSectionHeader
              title="Payment Review Queue"
              subtitle={`Showing ${bookings.length} of ${totalCount} records`}
            />
            <div className="mt-4 flex flex-wrap gap-2">
              {PAYMENT_REVIEW_TABS.map((tab) => {
                const isActive = tab.value === activeQueue;
                return (
                  <button
                    key={tab.value}
                    type="button"
                    onClick={() => {
                      setActiveQueue(tab.value);
                      setCurrentPage(1);
                    }}
                    className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${
                      isActive
                        ? "border-brand-500 bg-brand-500 text-white"
                        : "border-slate-200 bg-slate-50 text-ink-700 hover:border-brand-200 hover:bg-brand-50"
                    }`}
                  >
                    {tab.label} ({queueCounts[tab.value] || 0})
                  </button>
                );
              })}
            </div>
          </AppCard>

          {totalCount > 0 ? (
            <>
              <div className="app-content-stack">
                {bookings.map((booking) => (
                  <AppCard key={booking.booking_number} className="border-slate-200">
                    <article className="app-content-stack">
                      <header className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-xs uppercase tracking-wide text-ink-300">
                            Booking {booking.booking_number}
                          </p>
                          <h3 className="mt-1 text-base font-semibold text-ink-900">
                            {booking.user_fullName || "Name not provided"}
                          </h3>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <span className="app-status-pill">
                            {PAYMENT_REVIEW_TABS.find((tab) => tab.value === booking.reviewQueueKey)?.label ||
                              "Payment Review"}
                          </span>
                          <AppButton
                            size="sm"
                            onClick={() =>
                              navigate(
                                buildAdminBookingDetailsPathWithSearch("/booking-details", {
                                  bookingNumber: booking.booking_number,
                                }),
                                { state: { booking } }
                              )
                            }
                          >
                            Review
                          </AppButton>
                        </div>
                      </header>

                      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                        <SuperAdminInfoTile label="Raised On" value={formatDateTime(booking.order_time)} />
                        <SuperAdminInfoTile
                          label="Total Amount"
                          value={formatCurrencyPKR(booking.total_price)}
                        />
                        <SuperAdminInfoTile
                          label="Review Stage"
                          value={getReviewStageLabel(booking)}
                        />
                        <SuperAdminInfoTile
                          label="Workflow State"
                          value={booking.booking_status || "Not available"}
                        />
                      </div>
                    </article>
                  </AppCard>
                ))}
              </div>

              <SuperAdminPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </>
          ) : (
            <AppCard>
              <AppEmptyState
                icon={<img src={errorIcon} alt="" className="h-6 w-6" />}
                title="No records in this queue"
                message="Select another payment review tab or adjust the date filter."
              />
            </AppCard>
          )}
        </>
      ) : (
        <AppCard>
          <AppEmptyState
            icon={<img src={errorIcon} alt="" className="h-6 w-6" />}
            title={
              hasActiveFilter ? "No results for selected date" : "No payment requests"
            }
            message={
              hasActiveFilter
                ? "Try another date or clear the filter to view all requests."
                : "Payment workflow bookings will appear here."
            }
            action={
              hasActiveFilter ? (
                <AppButton size="sm" variant="outline" onClick={clearFilters}>
                  Clear Filter
                </AppButton>
              ) : null
            }
          />
        </AppCard>
      )}
    </SuperAdminModuleShell>
  );
};

export default ApproveAmountsPage;
