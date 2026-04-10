import React from "react";
import {
  AppCard,
  AppEmptyState,
  AppSectionHeader,
} from "../../../../../../components/ui";
import errorIcon from "../../../../../../assets/error.svg";
import { withFallback } from "../bookingDetailsUtils";

const TransportDetails = ({ booking: bookingProp }) => {
  const booking = bookingProp || null;
  const transport = booking?.transport_fulfillment_view || null;
  const packageTransport = booking?.package_transport_view || null;
  const packageHasTransport =
    Boolean(packageTransport?.transportName) || Boolean(packageTransport?.routeLabels?.length);

  return (
    <AppCard className="border-slate-200">
      <div className="app-content-stack">
        <AppSectionHeader
          title="Transport Details"
          subtitle="Package transport defaults are shown beside whatever the operator actually shared."
        />

        {transport?.hasAnyContent || packageTransport ? (
          <article className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4">
            <div className="grid gap-3 md:grid-cols-2">
              <DetailTile
                label="Package default"
                values={[
                  `Transport: ${withFallback(packageTransport?.transportName)}`,
                  `Type: ${withFallback(packageTransport?.transportType)}`,
                  `Routes: ${withFallback(packageTransport?.routeLabels?.join(" • "))}`,
                ]}
              />
              <DetailTile
                label="Booking confirmation"
                values={[
                  `Share: ${withFallback(
                    transport?.hasDetailsContent && transport?.hasTicketContent
                      ? "Details and ticket"
                      : transport?.hasTicketContent
                      ? "Ticket shared"
                      : transport?.hasDetailsContent
                      ? "Details shared"
                      : packageHasTransport
                      ? "Pending share"
                      : "Not included"
                  )}`,
                  `Transport: ${withFallback(
                    transport?.transportName,
                    transport?.hasTicketContent ? "Ticket file shared" : null
                  )}`,
                  `Type: ${withFallback(transport?.transportType)}`,
                  `Routes: ${withFallback(transport?.routeLabels?.join(" • ") || transport?.routeSummary)}`,
                  `Contact: ${withFallback(transport?.contactName)}`,
                  `Phone: ${withFallback(transport?.contactPhone)}`,
                  `Ticket ref: ${withFallback(transport?.ticketReference)}`,
                ]}
              />
            </div>

            <div className="mt-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-300">
                Customer Note
              </p>
              <p className="mt-1 text-sm text-ink-700">
                {withFallback(transport?.note, "No comments available.")}
              </p>
            </div>
          </article>
        ) : (
          <AppEmptyState
            icon={<img src={errorIcon} alt="" className="h-6 w-6" />}
            title="No transport details"
            message="No transport arrangement records were uploaded for this booking."
          />
        )}
      </div>
    </AppCard>
  );
};

const DetailTile = ({ label, values = [] }) => {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-300">{label}</p>
      <div className="mt-2 space-y-2">
        {values.map((value) => (
          <p key={value} className="text-sm text-ink-700">{value}</p>
        ))}
      </div>
    </div>
  );
};

export default TransportDetails;
