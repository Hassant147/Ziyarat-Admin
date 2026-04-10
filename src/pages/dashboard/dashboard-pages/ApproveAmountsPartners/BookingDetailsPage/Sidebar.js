import React from "react";
import mail from "../../../../../assets/booking/mail.svg";
import phone from "../../../../../assets/booking/phone.svg";
import user from "../../../../../assets/booking/user.svg";
import { AppCard, AppSectionHeader } from "../../../../../components/ui";
import {
  getStatusPillClassName,
  withFallback,
} from "../../ApproveAmountsPages/BookingDetailsPage/bookingDetailsUtils";

const Sidebar = ({ booking }) => {
  if (!booking) {
    return null;
  }

  const {
    partner_name,
    partner_email,
    payment_status,
    partner_contact_detail = {},
  } = booking;

  const { REACT_APP_API_BASE_URL } = process.env;
  const companyLogo = partner_contact_detail.company_logo
    ? `${REACT_APP_API_BASE_URL}${partner_contact_detail.company_logo}`
    : "";

  return (
    <AppCard className="h-fit border-slate-200">
      <div className="space-y-5">
        <div className="flex flex-col items-center gap-3">
          <div
            className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusPillClassName(
              payment_status
            )}`}
          >
            {withFallback(payment_status, "Pending")}
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
            subtitle="Partner and company references"
            className="!items-start"
          />
          <DetailRow icon={user} text={withFallback(partner_name, "Partner name not available")} />
          <DetailRow
            icon={phone}
            text={withFallback(partner_contact_detail.contact_number, "Phone number not available")}
          />
          <DetailRow
            icon={user}
            text={withFallback(partner_contact_detail.company_name, "Company name not available")}
          />
          <DetailRow icon={mail} text={withFallback(partner_email, "Email not available")} />
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
