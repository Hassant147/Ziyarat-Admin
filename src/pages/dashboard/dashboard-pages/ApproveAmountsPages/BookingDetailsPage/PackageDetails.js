import React, { useContext, useMemo } from "react";
import { NumericFormat } from "react-number-format";
import { useNavigate } from "react-router-dom";
import { CurrencyContext } from "../../../../../utility/CurrencyContext";
import { AppButton, AppCard, AppSectionHeader } from "../../../../../components/ui";
import { withFallback } from "./bookingDetailsUtils";

const FEATURE_MAP = [
  { key: "is_visa_included", label: "Visa" },
  { key: "is_insurance_included", label: "Insurance" },
  { key: "is_airport_reception_included", label: "Airport Reception" },
  { key: "is_breakfast_included", label: "Breakfast" },
  { key: "is_lunch_included", label: "Lunch" },
  { key: "is_dinner_included", label: "Dinner" },
];

const formatCityStaySummary = (cityStays = []) =>
  (Array.isArray(cityStays) ? cityStays : [])
    .map((stay) => {
      const city = `${stay?.city || ""}`.trim();
      const nights = Number(stay?.nights || 0);
      if (!city) {
        return "";
      }
      return `${city} ${nights} night${nights === 1 ? "" : "s"}`;
    })
    .filter(Boolean)
    .join(" · ");

const PackageDetails = ({ booking }) => {
  const navigate = useNavigate();
  const { selectedCurrency, exchangeRates } = useContext(CurrencyContext);

  const convertedCost = useMemo(() => {
    const baseCost = Number(booking?.base_cost ?? booking?.package_cost ?? 0);
    if (!exchangeRates?.[selectedCurrency] || !exchangeRates?.PKR) {
      return baseCost;
    }
    return (baseCost / exchangeRates.PKR) * exchangeRates[selectedCurrency];
  }, [booking, exchangeRates, selectedCurrency]);

  const includedFeatures = useMemo(() => {
    return FEATURE_MAP.filter((feature) => booking?.[feature.key]).map((feature) => feature.label);
  }, [booking]);

  const cityStaySummary = useMemo(
    () => formatCityStaySummary(booking?.city_stays),
    [booking?.city_stays]
  );
  const totalCityNights = useMemo(() => {
    if (Array.isArray(booking?.city_stays) && booking.city_stays.length) {
      return booking.city_stays.reduce(
        (sum, stay) => sum + Number(stay?.nights || 0),
        0
      );
    }
    return Number(booking?.duration_nights || booking?.nights || 0);
  }, [booking]);

  if (!booking) {
    return null;
  }

  return (
    <AppCard className="border-slate-200">
      <div className="app-content-stack">
        <AppSectionHeader
          title={withFallback(booking.package_name, "Package")}
          subtitle={
            cityStaySummary ||
            `${withFallback(totalCityNights, 0)} nights across ${withFallback(
              booking.package_type,
              "Ziyarat"
            )}`
          }
          action={
            <AppButton
              variant="outline"
              size="sm"
              onClick={() =>
                navigate(`/detailpage/?packageId=${booking.ziyarat_token}`, {
                  state: { ziyarat_token: booking.ziyarat_token },
                })
              }
            >
              View Package
            </AppButton>
          }
        />

        <div className="grid gap-3 sm:grid-cols-2">
          <InfoTile
            label="Base Cost"
            value={
              <NumericFormat
                value={convertedCost}
                displayType="text"
                thousandSeparator
                prefix={`${selectedCurrency} `}
                decimalScale={2}
                fixedDecimalScale
                className="text-base font-semibold text-brand-600"
              />
            }
          />
          <InfoTile
            label="Included Features"
            value={
              includedFeatures.length ? (
                <div className="flex flex-wrap gap-1">
                  {includedFeatures.map((feature) => (
                    <span
                      key={feature}
                      className="rounded-full bg-brand-50 px-2 py-1 text-[11px] font-semibold text-brand-700"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-sm text-ink-500">No inclusions listed</span>
              )
            }
          />
        </div>
      </div>
    </AppCard>
  );
};

const InfoTile = ({ label, value }) => {
  return (
    <article className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-300">{label}</p>
      <div className="mt-1 text-sm text-ink-700">{value}</div>
    </article>
  );
};

export default PackageDetails;
