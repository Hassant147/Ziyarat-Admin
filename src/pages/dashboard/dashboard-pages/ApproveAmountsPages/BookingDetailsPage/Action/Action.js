import React, { useMemo, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import { confirmBookingPayment } from "../../../../../../utility/Super-Admin-Api";
import { AppButton, AppCard, AppSectionHeader } from "../../../../../../components/ui";
import {
  getPaymentStatusLabel,
  getReviewQueueKey,
  getReviewStageLabel,
  getStagePayment,
  getStagePaymentStatus,
} from "../../bookingReviewUtils";

const RESPONSE_MESSAGE_MAP = {
  400: "Bad request: missing or invalid input data.",
  401: "Unauthorized: admin permissions required.",
  404: "Booking details not found.",
  409: "This payment cannot be reviewed in its current state.",
};

const getReviewablePayment = (booking = {}) => {
  const queueKey = getReviewQueueKey(booking);
  if (queueKey === "minimum_under_review") {
    return getStagePayment(booking, "minimum");
  }
  if (queueKey === "full_under_review") {
    return getStagePayment(booking, "full");
  }

  return null;
};

const Action = ({ booking }) => {
  const [decision, setDecision] = useState("approve");
  const [reviewMessage, setReviewMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const reviewablePayment = useMemo(() => getReviewablePayment(booking), [booking]);
  const paymentStageLabel = useMemo(() => getReviewStageLabel(booking), [booking]);
  const canReview = useMemo(
    () => ["minimum_under_review", "full_under_review"].includes(getReviewQueueKey(booking)),
    [booking]
  );

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!booking) {
      toast.error("Booking data is not available.");
      return;
    }
    if (!reviewablePayment?.payment_id) {
      toast.error("No reviewable payment submission was found for this booking.");
      return;
    }
    if (decision === "reject" && !reviewMessage.trim()) {
      toast.error("Enter a rejection reason before submitting.");
      return;
    }

    const { user_session_token, booking_number } = booking;
    setIsSubmitting(true);

    const response = await confirmBookingPayment(user_session_token, booking_number, {
      decision,
      paymentId: reviewablePayment.payment_id,
      reviewMessage: reviewMessage.trim(),
    });

    if (response.status === 200) {
      toast.success(
        decision === "approve"
          ? `${paymentStageLabel} approved successfully.`
          : `${paymentStageLabel} rejected and user notified.`
      );
      setTimeout(() => {
        navigate(-1);
      }, 900);
    } else {
      toast.error(
        response.error ||
          RESPONSE_MESSAGE_MAP[response.status] ||
          "Failed to update booking status."
      );
    }

    setIsSubmitting(false);
  };

  return (
    <AppCard className="border-slate-200">
      <form onSubmit={handleSubmit} className="app-content-stack">
        <AppSectionHeader
          title="Review Decision"
          subtitle="Approve or reject the current payment proof under Ziyarat admin review."
        />

        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-ink-700">
          <p className="font-semibold text-ink-900">{paymentStageLabel}</p>
          <p className="mt-1">
            Reviewing reference{" "}
            <span className="font-semibold">
              {reviewablePayment?.transaction_number || "Not provided"}
            </span>
          </p>
          <p className="mt-1 text-xs text-ink-500">
            Current status: {getPaymentStatusLabel(getStagePaymentStatus(booking, paymentStageLabel))}
          </p>
        </div>

        {!canReview ? (
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-ink-700">
            This booking is not in an admin-review queue right now. Open it from an under-review tab to take action.
          </div>
        ) : null}

        <div className="grid gap-2 sm:grid-cols-2">
          <DecisionTile
            label="Approve booking payment"
            checked={decision === "approve"}
            onSelect={() => setDecision("approve")}
          />
          <DecisionTile
            label="Reject this request"
            checked={decision === "reject"}
            onSelect={() => setDecision("reject")}
          />
        </div>

        {decision === "reject" ? (
          <div className="space-y-2">
            <label
              htmlFor="payment-review-message"
              className="text-sm font-semibold text-ink-900"
            >
              Rejection reason
            </label>
            <textarea
              id="payment-review-message"
              value={reviewMessage}
              onChange={(event) => setReviewMessage(event.target.value)}
              rows={4}
              placeholder="Explain why the payment proof was rejected."
              className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm text-ink-800 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
            />
          </div>
        ) : null}

        <div className="flex justify-end">
          <AppButton
            type="submit"
            className="min-w-[190px]"
            disabled={!canReview}
            loading={isSubmitting}
            loadingLabel="Applying..."
          >
            Submit Decision
          </AppButton>
        </div>
      </form>
    </AppCard>
  );
};

const DecisionTile = ({ label, checked, onSelect }) => {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`rounded-xl border px-3 py-3 text-left text-sm font-semibold transition ${
        checked
          ? "border-brand-500 bg-brand-50 text-brand-700"
          : "border-slate-200 bg-white text-ink-700 hover:border-brand-200 hover:bg-slate-50"
      }`}
    >
      <span className="flex items-center gap-2">
        <span
          className={`h-4 w-4 rounded-full border ${
            checked ? "border-brand-600 bg-brand-500" : "border-slate-400"
          }`}
          aria-hidden="true"
        />
        {label}
      </span>
    </button>
  );
};

export default Action;
