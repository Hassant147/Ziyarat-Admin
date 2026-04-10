import React, { useEffect, useState } from "react";
import { fetchSettlementReviewBookingDetails } from "../../../../../utility/Super-Admin-Api";
import Loader from "../../../../../components/loader";
import PackageDetails from "../../ApproveAmountsPages/BookingDetailsPage/PackageDetails";
import BookingInfo from "../../ApproveAmountsPages/BookingDetailsPage/BookingInfo";
import VisaDetails from "../../ApproveAmountsPages/BookingDetailsPage/VisaDetail/VisaDetail";
import AirlineDetails from "../../ApproveAmountsPages/BookingDetailsPage/AirlineDetail/AirlineDetail";
import TransportDetails from "../../ApproveAmountsPages/BookingDetailsPage/TransportDetail/TransportDetail";
import HotelDetails from "../../ApproveAmountsPages/BookingDetailsPage/HotelDetail/HotelDetail";
import TransactionDetails from "../../ApproveAmountsPages/BookingDetailsPage/TransactionDetails";
import { AppCard, AppEmptyState } from "../../../../../components/ui";
import errorIcon from "../../../../../assets/error.svg";

const BookingDetailsComponent = ({ booking }) => {
  const [bookingDetails, setBookingDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadBookingDetails = async () => {
      if (!booking) {
        setError("No booking record was provided.");
        setLoading(false);
        return;
      }

      const { status, data, error: requestError } =
        await fetchSettlementReviewBookingDetails(booking.booking_number);

      if (status === 200 && data) {
        setBookingDetails(data);
      } else {
        setError(requestError || "Unable to fetch booking details.");
      }

      setLoading(false);
    };

    loadBookingDetails();
  }, [booking]);

  if (loading) {
    return (
      <AppCard className="min-h-[240px] flex items-center justify-center">
        <Loader />
      </AppCard>
    );
  }

  if (error) {
    return (
      <AppCard>
        <AppEmptyState
          icon={<img src={errorIcon} alt="" className="h-6 w-6" />}
          title="Unable to load booking details"
          message={error}
        />
      </AppCard>
    );
  }

  if (!bookingDetails) {
    return (
      <AppCard>
        <AppEmptyState
          icon={<img src={errorIcon} alt="" className="h-6 w-6" />}
          title="No booking details found"
          message="No details were returned for this booking request."
        />
      </AppCard>
    );
  }

  return (
    <div className="app-content-stack">
      <PackageDetails booking={bookingDetails} />
      <BookingInfo booking={bookingDetails} />
      <VisaDetails booking={bookingDetails} />
      <AirlineDetails booking={bookingDetails} />
      <TransportDetails booking={bookingDetails} />
      <HotelDetails booking={bookingDetails} />
      <TransactionDetails booking={bookingDetails} />
    </div>
  );
};

export default BookingDetailsComponent;
