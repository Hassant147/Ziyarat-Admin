import React, { useMemo } from "react";
import { FaFilePdf, FaFileWord, FaFileImage } from "react-icons/fa";
import { AppButton, AppCard, AppEmptyState, AppSectionHeader } from "../../../../../../components/ui";
import errorIcon from "../../../../../../assets/error.svg";
import { withFallback } from "../bookingDetailsUtils";

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

const VisaDetails = ({ booking }) => {
  const { REACT_APP_API_BASE_URL } = process.env;

  const documents = useMemo(() => {
    const visaCompleted = Boolean(booking?.booking_fulfillment?.summary?.visa_completed);
    if (!visaCompleted) {
      return [];
    }

    return (booking?.booking_documents || []).filter(
      (doc) => `${doc.document_for || ""}`.toLowerCase() === "evisa"
    );
  }, [booking]);

  return (
    <AppCard className="border-slate-200">
      <div className="app-content-stack">
        <AppSectionHeader
          title="Visa Details"
          subtitle="Uploaded eVisa files for this booking"
        />

        {documents.length ? (
          <div className="grid gap-3 md:grid-cols-2">
            {documents.map((doc) => {
              const fileName = `${doc.document_link || ""}`.split("/").pop();
              const documentUrl = `${REACT_APP_API_BASE_URL}${doc.document_link}`;

              return (
                <article
                  key={doc.document_id || doc.document_link}
                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-3"
                >
                  <div className="flex items-center gap-2 text-sm text-ink-700">
                    {getFileIcon(doc.document_link)}
                    <span className="max-w-[180px] truncate">{withFallback(fileName)}</span>
                  </div>
                  <AppButton
                    as="a"
                    href={documentUrl}
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
          <AppEmptyState
            icon={<img src={errorIcon} alt="" className="h-6 w-6" />}
            title="No visa files uploaded"
            message="Visa documents will appear here after they are shared."
          />
        )}
      </div>
    </AppCard>
  );
};

export default VisaDetails;
