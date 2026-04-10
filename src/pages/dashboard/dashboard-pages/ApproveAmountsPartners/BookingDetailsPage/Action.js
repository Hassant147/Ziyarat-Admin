import React, { useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import { updatePartnerPaymentStatus } from "../../../../../utility/Super-Admin-Api";
import { AppButton, AppCard, AppSectionHeader } from "../../../../../components/ui";

const RESPONSE_MESSAGE_MAP = {
  400: "Bad request: missing or invalid input data.",
  401: "Unauthorized: admin permissions required.",
  404: "Booking or user details were not found.",
  409: "The current account status does not allow this action.",
};

const Action = ({ booking }) => {
  const [decision, setDecision] = useState("accept");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!booking) {
      toast.error("Booking data is not available.");
      return;
    }
    const { booking_number } = booking;
    setIsSubmitting(true);
    if (decision === "accept") {
      const response = await updatePartnerPaymentStatus(booking_number);

      if (response.status === 200) {
        toast.success("Partner payment status updated successfully.");
        setTimeout(() => navigate(-1), 900);
      } else {
        toast.error(RESPONSE_MESSAGE_MAP[response.status] || "Failed to update payment status.");
      }
    } else {
      toast.info("Request marked as rejected. No transfer call was sent.");
      setTimeout(() => navigate(-1), 700);
    }

    setIsSubmitting(false);
  };

  return (
    <AppCard className="border-slate-200">
      <form onSubmit={handleSubmit} className="app-content-stack">
        <AppSectionHeader
          title="Review Decision"
          subtitle="Approve partner transfer settlement or reject this request."
        />

        <div className="grid gap-2 sm:grid-cols-2">
          <DecisionTile
            label="Approve partner payment"
            checked={decision === "accept"}
            onSelect={() => setDecision("accept")}
          />
          <DecisionTile
            label="Reject this request"
            checked={decision === "reject"}
            onSelect={() => setDecision("reject")}
          />
        </div>

        <div className="flex justify-end">
          <AppButton
            type="submit"
            className="min-w-[190px]"
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
