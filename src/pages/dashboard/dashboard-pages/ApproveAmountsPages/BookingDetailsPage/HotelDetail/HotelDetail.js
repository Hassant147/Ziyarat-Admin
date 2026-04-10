import React from "react";
import {
  AppCard,
  AppEmptyState,
  AppSectionHeader,
} from "../../../../../../components/ui";
import errorIcon from "../../../../../../assets/error.svg";
import { withFallback } from "../bookingDetailsUtils";

const HotelDetails = ({ booking: bookingProp }) => {
  const booking = bookingProp || null;
  const hotelCards = Array.isArray(booking?.hotel_cards) ? booking.hotel_cards : [];

  return (
    <AppCard className="border-slate-200">
      <div className="app-content-stack">
        <AppSectionHeader
          title="Hotel Details"
          subtitle="Package defaults and booking-confirmed hotel details are shown together."
        />

        {hotelCards.length ? (
          <div className="space-y-3">
            {hotelCards.map((card) => (
              <div key={card.id} className="grid gap-3 md:grid-cols-2">
                <HotelCard
                  title={`${card.cityLabel || "Hotel"} package default`}
                  rows={[
                    `Hotel: ${withFallback(card.packageHotel?.hotelName)}`,
                    `Rating: ${withFallback(card.packageHotel?.rating)}`,
                    `Distance: ${withFallback(card.packageHotel?.distance)}`,
                  ]}
                />
                <HotelCard
                  title={`${card.cityLabel || "Hotel"} booking confirmation`}
                  rows={[
                    `Hotel: ${withFallback(card.confirmed?.hotelName, card.packageHotel?.hotelName)}`,
                    `Contact: ${withFallback(card.confirmed?.contactName)}`,
                    `Phone: ${withFallback(card.confirmed?.contactPhone)}`,
                    `Note: ${withFallback(card.confirmed?.note, "No traveler-facing note shared.")}`,
                  ]}
                />
              </div>
            ))}
          </div>
        ) : (
          <AppEmptyState
            icon={<img src={errorIcon} alt="" className="h-6 w-6" />}
            title="No hotel details"
            message="No hotel arrangement records were uploaded for this booking."
          />
        )}
      </div>
    </AppCard>
  );
};

const HotelCard = ({ title, rows = [] }) => {
  return (
    <article className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-300">{title}</p>

      <div className="mt-2 space-y-2">
        {rows.map((row) => (
          <p key={row} className="text-sm text-ink-700">{row}</p>
        ))}
      </div>
    </article>
  );
};

export default HotelDetails;
