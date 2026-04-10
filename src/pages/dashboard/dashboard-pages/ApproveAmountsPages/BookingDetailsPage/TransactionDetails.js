import React from "react";
import { AppButton, AppCard, AppEmptyState, AppSectionHeader } from "../../../../../components/ui";
import errorIcon from "../../../../../assets/error.svg";
import { formatDateTime, withFallback } from "./bookingDetailsUtils";
import { getPaymentStatusLabel } from "../bookingReviewUtils";

const TransactionDetails = ({ booking }) => {
  const paymentDetails = booking?.payment_detail || [];
  const { REACT_APP_API_BASE_URL } = process.env;

  return (
    <AppCard className="border-slate-200">
      <div className="app-content-stack">
        <AppSectionHeader
          title="Transaction Details"
          subtitle="Proofs and references submitted for this booking"
        />

        {paymentDetails.length ? (
          <div className="space-y-3">
            {paymentDetails.map((payment, index) => {
              const photoUrl = payment.transaction_photo
                ? `${REACT_APP_API_BASE_URL}${payment.transaction_photo}`
                : "";

              return (
                <article
                  key={`${payment.transaction_number || "transaction"}-${index}`}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4"
                >
                  <div className="grid gap-3 sm:grid-cols-2">
                    <InfoTile
                      label="Transaction Time"
                      value={formatDateTime(payment.transaction_time)}
                    />
                    <InfoTile
                      label="Transaction Amount"
                      value={`PKR ${Number(payment.transaction_amount || 0).toLocaleString()}`}
                    />
                    <InfoTile
                      label="Transaction Number"
                      value={withFallback(payment.transaction_number)}
                    />
                    <InfoTile
                      label="Stage"
                      value={withFallback(
                        payment.full_or_minimum || payment.transaction_type,
                        "Payment"
                      )}
                    />
                    <InfoTile
                      label="Review Status"
                      value={getPaymentStatusLabel(payment.payment_status)}
                    />
                  </div>

                  {photoUrl ? (
                    <div className="mt-3">
                      <img
                        src={photoUrl}
                        alt="Transaction proof"
                        className="max-h-48 rounded-lg border border-slate-200 object-cover"
                      />
                      <div className="mt-2">
                        <AppButton
                          as="a"
                          href={photoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          size="sm"
                          variant="outline"
                        >
                          Open Photo
                        </AppButton>
                      </div>
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>
        ) : (
          <AppEmptyState
            icon={<img src={errorIcon} alt="" className="h-6 w-6" />}
            title="No transaction records"
            message="No payment proofs were provided for this booking."
          />
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

export default TransactionDetails;
