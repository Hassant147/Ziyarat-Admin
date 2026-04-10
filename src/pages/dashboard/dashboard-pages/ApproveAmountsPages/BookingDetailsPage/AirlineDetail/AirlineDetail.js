import React, { useMemo } from "react";
import { FaFilePdf, FaFileWord, FaFileImage } from "react-icons/fa";
import {
  AppButton,
  AppCard,
  AppEmptyState,
  AppSectionHeader,
} from "../../../../../../components/ui";
import errorIcon from "../../../../../../assets/error.svg";
import { formatDateTime, withFallback } from "../bookingDetailsUtils";

const getFileIcon = (filename) => {
  const extension = `${filename || ""}`.split(".").pop().toLowerCase();
  switch (extension) {
    case "pdf":
      return <FaFilePdf className="text-red-500" />;
    case "doc":
    case "docx":
      return <FaFileWord className="text-blue-500" />;
    case "png":
    case "jpg":
    case "jpeg":
      return <FaFileImage className="text-green-500" />;
    default:
      return <FaFileImage className="text-gray-500" />;
  }
};

const AirlineDetails = ({ booking }) => {
  const airlineDetails = booking?.airline_cards || [];
  const airlineDocuments = useMemo(() => {
    return booking?.documents_by_category?.airline || [];
  }, [booking]);

  return (
    <AppCard className="border-slate-200">
      <div className="app-content-stack">
        <AppSectionHeader
          title="Airline Details"
          subtitle="Flights and uploaded airline tickets"
        />

        {airlineDetails.length ? (
          <div className="space-y-3">
            {airlineDetails.map((detail, index) => (
              <article
                key={`${detail.id || "flight"}-${index}`}
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4"
              >
                <div className="grid gap-3 sm:grid-cols-2">
                  <InfoTile
                    label="Segment"
                    value={withFallback(detail.label)}
                  />
                  <InfoTile
                    label="Flight Date"
                    value={formatDateTime(detail.confirmed?.flightDate)}
                  />
                  <InfoTile
                    label="Flight Time"
                    value={withFallback(detail.confirmed?.flightTime)}
                  />
                  <InfoTile
                    label="Route"
                    value={withFallback(
                      [detail.confirmed?.flightFrom || detail.packageDefault?.flightFrom,
                        detail.confirmed?.flightTo || detail.packageDefault?.flightTo]
                        .filter(Boolean)
                        .join(" -> ")
                    )}
                  />
                </div>
              </article>
            ))}
          </div>
        ) : (
          <AppEmptyState
            icon={<img src={errorIcon} alt="" className="h-6 w-6" />}
            title="No airline records"
            message="Airline ticket details are not available for this booking."
          />
        )}

        {airlineDocuments.length ? (
          <div className="grid gap-3 md:grid-cols-2">
            {airlineDocuments.map((doc) => {
              return (
                <article
                  key={doc.id || doc.href}
                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-3"
                >
                  <div className="flex items-center gap-2 text-sm text-ink-700">
                    {getFileIcon(doc.title)}
                    <span className="max-w-[180px] truncate">{withFallback(doc.title)}</span>
                  </div>
                  <AppButton
                    as="a"
                    href={doc.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    size="sm"
                    variant="outline"
                  >
                    Open
                  </AppButton>
                </article>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-ink-500">No airline documents uploaded.</p>
        )}
      </div>
    </AppCard>
  );
};

const InfoTile = ({ label, value }) => {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-300">{label}</p>
      <p className="mt-1 text-sm text-ink-700">{value}</p>
    </div>
  );
};

export default AirlineDetails;
