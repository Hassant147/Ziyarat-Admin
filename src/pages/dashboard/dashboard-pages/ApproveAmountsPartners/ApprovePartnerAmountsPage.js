import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchPendingPartnerPayments } from "../../../../utility/Super-Admin-Api";
import { AppButton, AppCard, AppEmptyState, AppSectionHeader } from "../../../../components/ui";
import errorIcon from "../../../../assets/error.svg";
import SuperAdminModuleShell from "../../components/SuperAdminModuleShell";
import SuperAdminPagination from "../../components/SuperAdminPagination";
import SuperAdminMetricCard from "../../components/SuperAdminMetricCard";
import SuperAdminInfoTile from "../../components/SuperAdminInfoTile";
import Loader from "../../../../components/loader";
import {
  formatCurrencyPKR,
  formatDate,
  withFallback,
} from "../../components/superAdminFormatters";
import { buildAdminBookingDetailsPathWithSearch } from "../adminDetailRouteUtils";

const ITEMS_PER_PAGE = 6;

const ApprovePartnerAmountsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalReceivable, setTotalReceivable] = useState(0);
  const [totalPending, setTotalPending] = useState(0);
  const [totalProcessed, setTotalProcessed] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const loadPartnerPayments = useCallback(async () => {
    setLoading(true);
    setError("");

    const { status, data, error: requestError } = await fetchPendingPartnerPayments({
      page: currentPage,
      pageSize: ITEMS_PER_PAGE,
    });

    if (status === 200 && data) {
      const paginatedResults = Array.isArray(data.results) ? data.results : [];
      const meta = data.meta || {};
      const fallbackTotals = paginatedResults.reduce(
        (accumulator, booking) => ({
          totalReceivable:
            accumulator.totalReceivable + Number(booking.receivable_amount || 0),
          totalPending: accumulator.totalPending + Number(booking.pending_amount || 0),
          totalProcessed: accumulator.totalProcessed + Number(booking.processed_amount || 0),
        }),
        {
          totalReceivable: 0,
          totalPending: 0,
          totalProcessed: 0,
        }
      );
      setBookings(paginatedResults);
      setTotalCount(Number(data.count) || 0);
      setTotalReceivable(Number(meta.total_receivable) || fallbackTotals.totalReceivable);
      setTotalPending(Number(meta.total_pending) || fallbackTotals.totalPending);
      setTotalProcessed(Number(meta.total_processed) || fallbackTotals.totalProcessed);
    } else if (status === 404) {
      setBookings([]);
      setTotalCount(0);
      setTotalReceivable(0);
      setTotalPending(0);
      setTotalProcessed(0);
    } else {
      setBookings([]);
      setTotalCount(0);
      setTotalReceivable(0);
      setTotalPending(0);
      setTotalProcessed(0);
      setError(requestError || "An error occurred while fetching data.");
    }

    setLoading(false);
  }, [currentPage]);

  useEffect(() => {
    loadPartnerPayments();
  }, [loadPartnerPayments]);

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(totalCount / ITEMS_PER_PAGE));
  }, [totalCount]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  return (
    <SuperAdminModuleShell
      title="Partner Amounts"
      subtitle="Review partner receivable and transfer settlement requests."
      showBackButton={false}
    >
      {loading ? (
        <AppCard className="min-h-[320px] flex items-center justify-center">
          <Loader />
        </AppCard>
      ) : error ? (
        <AppCard>
          <AppEmptyState
            icon={<img src={errorIcon} alt="" className="h-6 w-6" />}
            title="Unable to load partner payments"
            message={error}
            action={
              <AppButton size="sm" onClick={loadPartnerPayments}>
                Retry
              </AppButton>
            }
          />
        </AppCard>
      ) : totalCount > 0 ? (
        <>
          <div className="app-grid-3">
            <SuperAdminMetricCard
              title="Requests"
              value={totalCount.toLocaleString()}
              hint="Partner transfer records"
            />
            <SuperAdminMetricCard
              title="Total Receivable"
              value={formatCurrencyPKR(totalReceivable)}
              hint={`Pending ${formatCurrencyPKR(totalPending)}`}
            />
            <SuperAdminMetricCard
              title="Processed Amount"
              value={formatCurrencyPKR(totalProcessed)}
              hint={`${bookings.length} records on current page`}
            />
          </div>

          <AppCard className="border-slate-200">
            <AppSectionHeader
              title="Partner Receivable Requests"
              subtitle={`Showing ${bookings.length} of ${totalCount} records`}
            />
          </AppCard>

          <div className="app-content-stack">
            {bookings.map((booking) => (
              <AppCard
                key={booking.booking_number}
                className="border-slate-200"
              >
                <article className="app-content-stack">
                  <header className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-ink-300">
                        Booking {booking.booking_number}
                      </p>
                      <h3 className="mt-1 text-base font-semibold text-ink-900">
                        {withFallback(booking.partner_name, "Partner")}
                      </h3>
                    </div>

                    <AppButton
                      size="sm"
                      onClick={() =>
                        navigate(
                          buildAdminBookingDetailsPathWithSearch("/booking-details-for-partners", {
                            bookingNumber: booking.booking_number,
                          }),
                          { state: { booking } }
                        )
                      }
                    >
                      Review
                    </AppButton>
                  </header>

                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <SuperAdminInfoTile label="Created On" value={formatDate(booking.create_date)} />
                    <SuperAdminInfoTile
                      label="Receivable"
                      value={formatCurrencyPKR(booking.receivable_amount)}
                    />
                    <SuperAdminInfoTile
                      label="Pending"
                      value={formatCurrencyPKR(booking.pending_amount)}
                    />
                    <SuperAdminInfoTile
                      label="Processed"
                      value={formatCurrencyPKR(booking.processed_amount)}
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
            title="No partner payment records"
            message="Pending partner payment requests will appear here."
          />
        </AppCard>
      )}
    </SuperAdminModuleShell>
  );
};

export default ApprovePartnerAmountsPage;
