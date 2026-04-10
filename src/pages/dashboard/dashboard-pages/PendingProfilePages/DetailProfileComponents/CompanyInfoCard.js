import React, { useMemo } from "react";
import { AppButton, AppCard, AppSectionHeader } from "../../../../../components/ui";

const OFFERED_SERVICE_KEYS = [
  { key: "is_iraq_service_offer", label: "Iraq" },
  { key: "is_iran_service_offer", label: "Iran" },
  { key: "is_ziyarah_service_offer", label: "Ziyarah" },
  { key: "is_transport_service_offer", label: "Transport" },
  { key: "is_visa_service_offer", label: "Visa" },
];

const CompanyInfoCard = ({ company }) => {
  const { partner_type_and_detail = {}, partner_service_detail = {}, created_time } = company || {};
  const { company_name, total_experience, company_bio, license_certificate } = partner_type_and_detail;
  const { REACT_APP_API_BASE_URL } = process.env;

  const services = useMemo(() => {
    return OFFERED_SERVICE_KEYS
      .filter((service) => partner_service_detail?.[service.key])
      .map((service) => service.label);
  }, [partner_service_detail]);

  const formattedServices = services.length > 0 ? services : ["N/A"];
  const canOpenLicense = Boolean(license_certificate);
  const licenseUrl = canOpenLicense
    ? `${REACT_APP_API_BASE_URL}${license_certificate}`
    : "";

  return (
    <AppCard className="border-slate-200">
      <div className="app-content-stack">
        <AppSectionHeader
          title={company_name || "Company name not available"}
          subtitle="Company profile overview"
          action={
            canOpenLicense ? (
              <AppButton
                as="a"
                href={licenseUrl}
                target="_blank"
                rel="noopener noreferrer"
                size="sm"
              >
                License Document
              </AppButton>
            ) : (
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-ink-500">
                License Not Uploaded
              </span>
            )
          }
        />

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <InfoTile
            label="Experience"
            value={`${total_experience || "N/A"} years`}
          />
          <InfoTile
            label="Application Time"
            value={created_time ? new Date(created_time).toLocaleString() : "N/A"}
          />
          <InfoTile
            label="Offered Services"
            value={
              <div className="flex flex-wrap gap-1">
                {formattedServices.map((service) => (
                  <span
                    key={service}
                    className="rounded-full bg-brand-50 px-2 py-1 text-[11px] font-semibold text-brand-700"
                  >
                    {service}
                  </span>
                ))}
              </div>
            }
          />
          <InfoTile
            label="Company Status"
            value={company?.account_status || "Pending"}
          />
        </div>

        <section>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-300">
            Company Bio
          </p>
          <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-relaxed text-ink-700">
            {company_bio || "No description available."}
          </p>
        </section>
      </div>
    </AppCard>
  );
};

const InfoTile = ({ label, value }) => {
  return (
    <article className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-300">{label}</p>
      <div className="mt-1 text-sm font-medium text-ink-700">{value}</div>
    </article>
  );
};

export default CompanyInfoCard;
