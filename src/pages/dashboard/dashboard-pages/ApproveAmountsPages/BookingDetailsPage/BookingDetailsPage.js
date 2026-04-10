import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import PackageDetails from "./PackageDetails";
import BookingInfo from "./BookingInfo";
import Action from "./Action/Action";
import TransactionDetails from "./TransactionDetails";
import CompanyDetail from "./CompanyDetail";
import { AppButton, AppCard, AppEmptyState } from "../../../../../components/ui";
import errorIcon from "../../../../../assets/error.svg";
import SuperAdminModuleShell from "../../../components/SuperAdminModuleShell";
import Loader from "../../../../../components/loader";
import { fetchSettlementReviewBookingDetails } from "../../../../../utility/Super-Admin-Api";
import {
  ADMIN_DETAIL_QUERY_KEYS,
  getAdminDetailSearchParam,
} from "../../adminDetailRouteUtils";

const BookingDetailsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const locationBooking = location.state?.booking || null;
  const bookingNumber = useMemo(
    () =>
      locationBooking?.booking_number ||
      getAdminDetailSearchParam(location.search, ADMIN_DETAIL_QUERY_KEYS.bookingNumber),
    [location.search, locationBooking?.booking_number]
  );

  const [booking, setBooking] = useState(locationBooking);
  const [loading, setLoading] = useState(!locationBooking && Boolean(bookingNumber));
  const [error, setError] = useState("");

  useEffect(() => {
    if (locationBooking) {
      setBooking(locationBooking);
      setLoading(false);
      setError("");
      return;
    }

    if (!bookingNumber) {
      setBooking(null);
      setLoading(false);
      setError("Booking link is missing the booking number.");
      return;
    }

    let isMounted = true;

    const loadBooking = async () => {
      setLoading(true);
      setError("");

      const { status, data, error: requestError } = await fetchSettlementReviewBookingDetails(
        bookingNumber
      );

      if (!isMounted) {
        return;
      }

      if (status === 200 && data) {
        setBooking(data);
      } else {
        setBooking(null);
        setError(requestError || "Unable to load booking details.");
      }

      setLoading(false);
    };

    loadBooking();

    return () => {
      isMounted = false;
    };
  }, [bookingNumber, locationBooking]);

  if (loading) {
    return (
      <SuperAdminModuleShell
        title="Booking Details"
        subtitle="Review payment evidence and booking detail records."
      >
        <AppCard className="min-h-[320px] flex items-center justify-center">
          <Loader />
        </AppCard>
      </SuperAdminModuleShell>
    );
  }

  if (!booking || error) {
    return (
      <SuperAdminModuleShell
        title="Booking Details"
        subtitle="Review payment evidence and booking detail records."
      >
        <AppCard>
          <AppEmptyState
            icon={<img src={errorIcon} alt="" className="h-6 w-6" />}
            title="Booking record not loaded"
            message={error || "Open a booking from the approve amounts list to continue."}
            action={
              <AppButton size="sm" onClick={() => navigate("/approve-amounts")}>
                Go to Approve Amounts
              </AppButton>
            }
          />
        </AppCard>
      </SuperAdminModuleShell>
    );
  }

  return (
    <SuperAdminModuleShell
      title="Booking Details"
      subtitle="Validate booking information, company details, and transaction proofs."
    >
      <div className="grid gap-4 lg:grid-cols-[340px_minmax(0,1fr)]">
        <Sidebar booking={booking} />
        <div className="app-content-stack">
          <PackageDetails booking={booking} />
          <BookingInfo booking={booking} />
          <CompanyDetail booking={booking} />
          <TransactionDetails booking={booking} />
          <Action booking={booking} />
        </div>
      </div>
    </SuperAdminModuleShell>
  );
};

export default BookingDetailsPage;
