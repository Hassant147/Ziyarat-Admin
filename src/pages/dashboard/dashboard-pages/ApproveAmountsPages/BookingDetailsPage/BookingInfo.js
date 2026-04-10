import React, { useContext, useMemo } from "react";
import { NumericFormat } from "react-number-format";
import { CurrencyContext } from "../../../../../utility/CurrencyContext";
import { AppCard, AppSectionHeader } from "../../../../../components/ui";
import { formatDate, withFallback } from "./bookingDetailsUtils";

const BookingInfo = ({ booking }) => {
  const { selectedCurrency, exchangeRates } = useContext(CurrencyContext);

  const convertedCost = useMemo(() => {
    const totalPrice = Number(booking?.total_price || 0);
    if (!exchangeRates?.[selectedCurrency] || !exchangeRates?.PKR) {
      return totalPrice;
    }
    return (totalPrice / exchangeRates.PKR) * exchangeRates[selectedCurrency];
  }, [booking, exchangeRates, selectedCurrency]);

  if (!booking) {
    return null;
  }

  return (
    <AppCard className="border-slate-200">
      <div className="app-content-stack">
        <AppSectionHeader
          title="Booking Information"
          subtitle="Passenger, schedule, and pricing overview"
        />

        <div className="grid gap-3 md:grid-cols-3">
          <InfoTile label="Adults / Children" value={`${booking.adults || 0} / ${booking.child || 0}`} />
          <InfoTile
            label="Total Cost"
            value={
              <NumericFormat
                value={convertedCost}
                displayType="text"
                thousandSeparator
                prefix={`${selectedCurrency} `}
                decimalScale={2}
                fixedDecimalScale
                className="font-semibold text-brand-600"
              />
            }
          />
          <InfoTile
            label="Travel Window"
            value={`${formatDate(booking.start_date)} to ${formatDate(booking.end_date)}`}
          />
          <InfoTile
            label="Remaining Due"
            value={
              <NumericFormat
                value={Number(booking?.remaining_amount_due || 0)}
                displayType="text"
                thousandSeparator
                prefix={`${selectedCurrency} `}
                decimalScale={2}
                fixedDecimalScale
                className="font-semibold text-brand-600"
              />
            }
          />
          <InfoTile
            label="Client Can Edit Travellers"
            value={booking?.client_can_edit_travellers ? "Yes" : "No"}
          />
          <InfoTile
            label="Operator Visibility"
            value={booking?.operator_visible ? "Visible" : "Hidden"}
          />
        </div>

        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-300">
            Special Request
          </p>
          <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-ink-700">
            {withFallback(booking.special_request, "No special request shared.")}
          </p>
        </div>
      </div>
    </AppCard>
  );
};

const InfoTile = ({ label, value }) => {
  return (
    <article className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-300">{label}</p>
      <div className="mt-1 text-sm text-ink-700">{value}</div>
    </article>
  );
};

export default BookingInfo;
