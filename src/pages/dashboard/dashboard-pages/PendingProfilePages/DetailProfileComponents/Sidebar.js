import React from "react";
import mail from "../../../../../assets/booking/mail.svg";
import location from "../../../../../assets/booking/location.svg";
import phone from "../../../../../assets/booking/phone.svg";
import user from "../../../../../assets/booking/user.svg";
import { AppCard, AppSectionHeader } from "../../../../../components/ui";

const Sidebar = ({ company }) => {
  if (!company) {
    return null;
  }

  const { partner_type_and_detail = {}, email, mailing_detail = {} } = company;
  const { contact_name, contact_number, company_logo } = partner_type_and_detail;
  const { street_address, address_line2, city, state, country, postal_code } = mailing_detail;

  const formattedAddress = [street_address, address_line2, city, state, postal_code, country]
    .filter(Boolean)
    .join(", ");
  const { REACT_APP_API_BASE_URL } = process.env;

  return (
    <AppCard className="h-fit border-slate-200">
      <div className="space-y-5">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-100">
            {company_logo ? (
              <img
                src={`${REACT_APP_API_BASE_URL}${company_logo}`}
                alt="Company logo"
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-xs text-ink-500">No logo</span>
            )}
          </div>
          <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
            {company.account_status || "Pending"}
          </span>
        </div>

        <section className="space-y-3">
          <AppSectionHeader
            title="Contact Details"
            subtitle="Primary representative"
            className="!items-start"
          />
          <DetailRow icon={user} text={contact_name || "Name not available"} />
          <DetailRow icon={phone} text={contact_number || "Phone number not available"} />
          <DetailRow icon={mail} text={email || "Email not available"} />
        </section>

        <section className="space-y-3">
          <AppSectionHeader
            title="Address"
            subtitle="Registered mailing details"
            className="!items-start"
          />
          <DetailRow icon={location} text={formattedAddress || "Address not available"} />
        </section>
      </div>
    </AppCard>
  );
};

const DetailRow = ({ icon, text }) => {
  return (
    <div className="flex items-start gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
      <img src={icon} alt="" className="mt-0.5 h-4 w-4 shrink-0" />
      <p className="text-xs text-ink-700 break-words">{text}</p>
    </div>
  );
};

export default Sidebar;
