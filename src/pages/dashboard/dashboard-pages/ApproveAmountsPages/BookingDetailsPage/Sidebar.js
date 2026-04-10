import React from "react";
import mail from "../../../../../assets/booking/mail.svg";
import location from "../../../../../assets/booking/location.svg";
import phone from "../../../../../assets/booking/phone.svg";
import user from "../../../../../assets/booking/user.svg";
import { AppCard, AppSectionHeader } from "../../../../../components/ui";
import {
  getStatusPillClassName,
  formatDateTime,
  withFallback,
} from "./bookingDetailsUtils";
import {
  getPaymentStatusLabel,
  getWorkflowSummaryLabel,
} from "../bookingReviewUtils";
import { resolveInitialPaymentStatus } from "../../../../../shared/bookingWorkflowContract.js";

const Sidebar = ({ booking }) => {
  if (!booking) {
    return null;
  }

  const {
    partner_name,
    partner_email,
    company_detail = {},
    partner_address_detail = {},
    booking_status,
  } = booking;

  const { REACT_APP_API_BASE_URL } = process.env;
  const companyLogo = company_detail?.company_logo
    ? `${REACT_APP_API_BASE_URL}${company_detail.company_logo}`
    : "";
  const formattedAddress = [
    partner_address_detail?.street_address,
    partner_address_detail?.address_line2,
    partner_address_detail?.city,
    partner_address_detail?.state,
    partner_address_detail?.postal_code,
    partner_address_detail?.country,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <AppCard className="h-fit border-slate-200">
      <div className="space-y-5">
        <div className="flex flex-col items-center gap-3">
          <div
            className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusPillClassName(
              booking?.issue_status && booking.issue_status !== "NONE"
                ? booking.issue_status
                : booking_status
            )}`}
          >
            {withFallback(getWorkflowSummaryLabel(booking), "Pending")}
          </div>
          <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-100">
            {companyLogo ? (
              <img src={companyLogo} alt="Company logo" className="h-full w-full object-cover" />
            ) : (
              <span className="text-xs text-ink-500">No logo</span>
            )}
          </div>
        </div>

        <section className="space-y-3">
          <AppSectionHeader
            title="Contact Details"
            subtitle="Booking and company contact information"
            className="!items-start"
          />
          <DetailRow icon={user} text={withFallback(company_detail?.company_name)} />
          <DetailRow icon={phone} text={withFallback(company_detail?.contact_number)} />
          <DetailRow icon={user} text={withFallback(partner_name)} />
          <DetailRow icon={mail} text={withFallback(partner_email)} />
        </section>

        <section className="space-y-3">
          <AppSectionHeader
            title="Address"
            subtitle="Partner address details"
            className="!items-start"
          />
          <DetailRow icon={location} text={withFallback(formattedAddress)} />
        </section>

        <section className="space-y-3">
          <AppSectionHeader
            title="Workflow"
            subtitle="Lifecycle, payment stage, and operator readiness"
            className="!items-start"
          />
          <DetailRow icon={user} text={`Initial: ${getPaymentStatusLabel(resolveInitialPaymentStatus(booking))}`} />
          <DetailRow icon={user} text={`Full: ${getPaymentStatusLabel(booking?.full_payment_status)}`} />
          <DetailRow icon={user} text={`Operator visible: ${booking?.operator_visible ? "Yes" : "No"}`} />
          <DetailRow icon={user} text={`Operator can act: ${booking?.operator_can_act ? "Yes" : "No"}`} />
          <DetailRow
            icon={user}
            text={`Correction deadline: ${withFallback(formatDateTime(booking?.payment_correction_expires_at), "Not active")}`}
          />
          <DetailRow
            icon={user}
            text={`Hold expires: ${withFallback(formatDateTime(booking?.hold_expires_at), "Not active")}`}
          />
        </section>
      </div>
    </AppCard>
  );
};

const DetailRow = ({ icon, text }) => {
  return (
    <div className="flex items-start gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
      <img src={icon} alt="" className="mt-0.5 h-4 w-4 shrink-0" />
      <p className="break-words text-xs text-ink-700">{text}</p>
    </div>
  );
};

export default Sidebar;
