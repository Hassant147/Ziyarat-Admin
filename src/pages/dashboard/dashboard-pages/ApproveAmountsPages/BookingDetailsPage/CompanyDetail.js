import React from "react";
import { AppCard, AppSectionHeader } from "../../../../../components/ui";
import { withFallback } from "./bookingDetailsUtils";

const CompanyDetail = ({ booking }) => {
  if (!booking) {
    return null;
  }

  const companyDetails = booking?.company_detail || {};

  return (
    <AppCard className="border-slate-200">
      <div className="app-content-stack">
        <AppSectionHeader
          title={withFallback(companyDetails.company_name, "Company Details")}
          subtitle="Registered partner company information"
        />

        <div className="grid gap-3 md:grid-cols-2">
          <InfoTile label="Contact Name" value={withFallback(companyDetails.contact_name)} />
          <InfoTile label="Contact Number" value={withFallback(companyDetails.contact_number)} />
          <InfoTile
            label="Total Experience"
            value={withFallback(
              companyDetails.total_experience ? `${companyDetails.total_experience} years` : ""
            )}
          />
          <InfoTile label="Contact Address" value={withFallback(companyDetails.company_address)} />
        </div>
      </div>
    </AppCard>
  );
};

const InfoTile = ({ label, value }) => {
  return (
    <article className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-300">{label}</p>
      <p className="mt-1 text-sm text-ink-700">{value}</p>
    </article>
  );
};

export default CompanyDetail;
