import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import Action from "./Action";
import BookingDetailsComponent from "./BookingDetailsComponent";
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
        title="Partner Booking Details"
        subtitle="Review partner payment transfer request details."
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
        title="Partner Booking Details"
        subtitle="Review partner payment transfer request details."
      >
        <AppCard>
          <AppEmptyState
            icon={<img src={errorIcon} alt="" className="h-6 w-6" />}
            title="Booking record not loaded"
            message={error || "Open a booking from partner amounts list to continue."}
            action={
              <AppButton size="sm" onClick={() => navigate("/approve-partners-amounts")}>
                Go to Partner Amounts
              </AppButton>
            }
          />
        </AppCard>
      </SuperAdminModuleShell>
    );
  }

  return (
    <SuperAdminModuleShell
      title="Partner Booking Details"
      subtitle="Validate package details and settlement proof before transfer."
    >
      <div className="grid gap-4 lg:grid-cols-[340px_minmax(0,1fr)]">
        <Sidebar booking={booking} />
        <div className="app-content-stack">
          <BookingDetailsComponent booking={booking} />
          <Action booking={booking} />
        </div>
      </div>
    </SuperAdminModuleShell>
  );
};

export default BookingDetailsPage;
