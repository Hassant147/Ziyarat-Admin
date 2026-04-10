import React, { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaStar } from "react-icons/fa";
import { TbCheckbox } from "react-icons/tb";
import { RiCheckboxIndeterminateLine } from "react-icons/ri";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "./swiper.css";
import { NumericFormat } from "react-number-format";
import Loader from "../../../../../components/loader";
import { CurrencyContext } from "../../../../../utility/CurrencyContext";
import { getPublicPackageDetail } from "../../../../../utility/publicPackagesApi";
import {
  AppButton,
  AppCard,
  AppContainer,
  AppEmptyState,
  AppSectionHeader,
} from "../../../../../components/ui";
import errorIcon from "../../../../../assets/error.svg";
import { formatDate, parseCommaSeparated, withFallback } from "./bookingDetailsUtils";

const OFFERING_FLAGS = [
  { key: "is_visa_included", label: "Visa" },
  { key: "is_insurance_included", label: "Insurance" },
  { key: "is_airport_reception_included", label: "Airport Reception" },
  { key: "is_tour_guide_included", label: "Tour Guide" },
  { key: "is_breakfast_included", label: "Breakfast" },
  { key: "is_lunch_included", label: "Lunch" },
  { key: "is_dinner_included", label: "Dinner" },
];

const HOTEL_AMENITY_FLAGS = [
  { key: "is_shuttle_services_included", label: "Shuttle Service" },
  { key: "is_air_condition", label: "Air Condition" },
  { key: "is_Television", label: "Television" },
  { key: "is_wifi", label: "WiFi" },
  { key: "is_elevator", label: "Elevator" },
  { key: "is_attach_bathroom", label: "Attach Bathroom" },
  { key: "is_washroom_amenities", label: "Washroom Amenities" },
  { key: "is_english_toilet", label: "English Toilet" },
  { key: "is_indian_toilet", label: "Indian Toilet" },
  { key: "is_laundry", label: "Laundry" },
];

const ADDITIONAL_PERSON_COSTS = [
  { key: "cost_for_infants", label: "Infants" },
  { key: "cost_for_child", label: "Child" },
  { key: "package_base_cost", label: "Adult" },
];

const ROOM_ADDITIONAL_COSTS = [
  { key: "cost_for_single", label: "Single Room" },
  { key: "cost_for_double", label: "Double Room" },
  { key: "cost_for_triple", label: "Triple Room" },
  { key: "cost_for_quad", label: "Quad Room" },
  { key: "cost_for_sharing", label: "Sharing Room" },
];

const formatCityStaySummary = (cityStays = []) =>
  (Array.isArray(cityStays) ? cityStays : [])
    .map((stay) => {
      const city = `${stay?.city || ""}`.trim();
      const nights = Number(stay?.nights || 0);
      return city ? `${city} ${nights} night${nights === 1 ? "" : "s"}` : "";
    })
    .filter(Boolean)
    .join(" · ");

const formatHolySiteSummary = (holySites = []) =>
  (Array.isArray(holySites) ? holySites : []).map((site) => `${site || ""}`.trim()).filter(Boolean).join(", ");

const formatHolySiteItems = (holySites = []) =>
  (Array.isArray(holySites) ? holySites : [])
    .map((site, index) => {
      const label = `${site || ""}`.trim();
      if (!label) {
        return null;
      }

      return {
        title: `Site ${index + 1}`,
        list: [label],
      };
    })
    .filter(Boolean);

const fetchHotelImages = (hotel = {}) =>
  [
    ...(Array.isArray(hotel?.image_urls) ? hotel.image_urls : []),
    ...(Array.isArray(hotel?.images) ? hotel.images : []),
    ...(Array.isArray(hotel?.hotel_images) ? hotel.hotel_images : []),
    hotel?.image1,
    hotel?.image2,
    hotel?.image3,
    hotel?.image4,
  ].filter(Boolean);

const convertAmount = (amount, selectedCurrency, exchangeRates) => {
  const numericValue = Number(amount || 0);
  if (!exchangeRates?.[selectedCurrency] || !exchangeRates?.PKR) {
    return numericValue;
  }
  return (numericValue / exchangeRates.PKR) * exchangeRates[selectedCurrency];
};

const DetailPage = () => {
  const navigate = useNavigate();
  const { selectedCurrency, exchangeRates } = useContext(CurrencyContext);
  const [packageDetail, setPackageDetail] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const searchParams = new URLSearchParams(window.location.search);
  const packageId = searchParams.get("packageId");

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  useEffect(() => {
    const loadPackageDetails = async () => {
      if (!packageId) {
        setError("Package reference is missing from URL.");
        setIsLoading(false);
        return;
      }

      const result = await getPublicPackageDetail(packageId);
      if (result?.error) {
        setError(result.error);
      } else if (Array.isArray(result?.data) && result.data[0]) {
        setPackageDetail(result.data[0]);
      } else {
        setError("Package details were not found.");
      }
      setIsLoading(false);
    };

    loadPackageDetails();
  }, [packageId]);

  const convertedCosts = useMemo(() => {
    if (!packageDetail) {
      return {};
    }
    return {
      package_base_cost: convertAmount(
        packageDetail.package_base_cost,
        selectedCurrency,
        exchangeRates
      ),
      cost_for_infants: convertAmount(
        packageDetail.cost_for_infants,
        selectedCurrency,
        exchangeRates
      ),
      cost_for_child: convertAmount(packageDetail.cost_for_child, selectedCurrency, exchangeRates),
      cost_for_single: convertAmount(packageDetail.cost_for_single, selectedCurrency, exchangeRates),
      cost_for_double: convertAmount(packageDetail.cost_for_double, selectedCurrency, exchangeRates),
      cost_for_triple: convertAmount(packageDetail.cost_for_triple, selectedCurrency, exchangeRates),
      cost_for_quad: convertAmount(packageDetail.cost_for_quad, selectedCurrency, exchangeRates),
      cost_for_sharing: convertAmount(
        packageDetail.cost_for_sharing,
        selectedCurrency,
        exchangeRates
      ),
    };
  }, [exchangeRates, packageDetail, selectedCurrency]);

  const includedItems = useMemo(() => {
    if (!packageDetail) {
      return [];
    }
    return OFFERING_FLAGS.filter((item) => packageDetail[item.key]).map((item) => item.label);
  }, [packageDetail]);

  const excludedItems = useMemo(() => {
    if (!packageDetail) {
      return [];
    }
    return OFFERING_FLAGS.filter((item) => !packageDetail[item.key]).map((item) => item.label);
  }, [packageDetail]);

  const cityStaySummary = useMemo(
    () => formatCityStaySummary(packageDetail?.city_stays),
    [packageDetail?.city_stays]
  );
  const holySiteSummary = useMemo(
    () => formatHolySiteSummary(packageDetail?.holy_sites),
    [packageDetail?.holy_sites]
  );
  const totalNights = useMemo(() => {
    if (Array.isArray(packageDetail?.city_stays) && packageDetail.city_stays.length) {
      return packageDetail.city_stays.reduce((sum, stay) => sum + Number(stay?.nights || 0), 0);
    }
    return Number(packageDetail?.duration_nights || 0);
  }, [packageDetail]);

  return (
    <section className="app-main-shell py-6">
      <AppContainer className="app-content-stack pb-10">
        <AppCard className="border-slate-200">
          <AppSectionHeader
            title="Package Details"
            subtitle="Review complete package itinerary and costing."
            action={
              <AppButton variant="outline" size="sm" onClick={() => navigate(-1)}>
                Back
              </AppButton>
            }
          />
        </AppCard>

        {isLoading ? (
          <AppCard className="min-h-[320px] flex items-center justify-center">
            <Loader />
          </AppCard>
        ) : error ? (
          <AppCard>
            <AppEmptyState
              icon={<img src={errorIcon} alt="" className="h-6 w-6" />}
              title="Unable to load package details"
              message={error}
            />
          </AppCard>
        ) : !packageDetail ? (
          <AppCard>
            <AppEmptyState
              icon={<img src={errorIcon} alt="" className="h-6 w-6" />}
              title="No package details found"
              message="This package record is unavailable."
            />
          </AppCard>
        ) : (
          <div className="grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
            <aside className="app-content-stack">
              <CompanyCard company={packageDetail.company_details} />

              <AppCard className="border-slate-200">
                <AppSectionHeader title="Pricing Snapshot" subtitle="Per person base pricing" />
                <div className="space-y-2">
                  <CostRow
                    label="Base Cost"
                    value={convertedCosts.package_base_cost}
                    selectedCurrency={selectedCurrency}
                  />
                  <CostRow
                    label="Infant Cost"
                    value={convertedCosts.cost_for_infants}
                    selectedCurrency={selectedCurrency}
                  />
                  <CostRow
                    label="Child Cost"
                    value={convertedCosts.cost_for_child}
                    selectedCurrency={selectedCurrency}
                  />
                </div>
              </AppCard>
            </aside>

            <div className="app-content-stack">
              <AppCard className="border-slate-200">
                <AppSectionHeader
                  title={withFallback(packageDetail.package_name, "Package")}
                  subtitle={`${formatDate(packageDetail.start_date)} to ${formatDate(
                    packageDetail.end_date
                  )}`}
                />

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  <InfoTile label="Trip Duration" value={`${totalNights} days`} />
                  <InfoTile label="Package Type" value={withFallback(packageDetail.package_type)} />
                  <InfoTile label="Travel Mode" value={withFallback(packageDetail.travel_mode)} />
                </div>

                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <InfoTile
                    label="City Stays"
                    value={cityStaySummary || "No city stay data available."}
                  />
                  <InfoTile
                    label="Holy Sites"
                    value={holySiteSummary || "No holy-site selections available."}
                  />
                </div>

                <div className="mt-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-ink-300">
                    Description
                  </p>
                  <p className="mt-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-ink-700">
                    {withFallback(packageDetail.description, "No description available.")}
                  </p>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
                    <CurrencyText value={convertedCosts.package_base_cost} currency={selectedCurrency} />
                    {" "}per person
                  </span>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      packageDetail.is_package_open_for_other_date
                        ? "bg-brand-50 text-brand-700"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {packageDetail.is_package_open_for_other_date ? "Flexible Dates" : "Fixed Dates"}
                  </span>
                </div>
              </AppCard>

              <AppCard className="border-slate-200">
                <AppSectionHeader title="Included / Excluded" subtitle="Service coverage in this package" />
                <div className="grid gap-3 md:grid-cols-2">
                  <InclusionBlock
                    title="Included"
                    icon={<TbCheckbox className="text-brand-600" />}
                    items={includedItems}
                    isPositive
                  />
                  <InclusionBlock
                    title="Excluded"
                    icon={<RiCheckboxIndeterminateLine className="text-red-500" />}
                    items={excludedItems}
                  />
                </div>
              </AppCard>

              <AppCard className="border-slate-200">
                <AppSectionHeader title="Hotel Details" subtitle="Accommodation and amenities by city" />
                {Array.isArray(packageDetail.hotel_detail) && packageDetail.hotel_detail.length ? (
                  <div className="space-y-4">
                    {packageDetail.hotel_detail.map((hotel, index) => (
                      <HotelCard key={`hotel-${index}`} hotel={hotel} />
                    ))}
                  </div>
                ) : (
                  <AppEmptyState
                    icon={<img src={errorIcon} alt="" className="h-6 w-6" />}
                    title="No hotel details"
                    message="No hotel data is available for this package."
                    className="min-h-[160px]"
                  />
                )}
              </AppCard>

              <AppCard className="border-slate-200">
                <AppSectionHeader
                  title="Travel Components"
                  subtitle="Airline, transport, and holy-site details"
                />

                <div className="space-y-4">
                  <TravelSection
                    title="Airline"
                    items={(packageDetail.airline_detail || []).map((airline) => ({
                      title: withFallback(airline.airline_name),
                      list: [
                        withFallback(airline.ticket_type),
                        airline.is_return_flight_included ? "Return Flight Included" : "One Way",
                      ],
                    }))}
                  />

                  <TravelSection
                    title="Transport"
                    items={(packageDetail.transport_detail || []).map((transport) => ({
                      title: `${withFallback(transport.transport_type)} ${withFallback(
                        transport.transport_name
                      )}`.trim(),
                      list: parseCommaSeparated(transport.routes),
                    }))}
                  />

                  <TravelSection
                    title="Holy Sites"
                    items={
                      formatHolySiteItems(packageDetail.holy_sites).length
                        ? formatHolySiteItems(packageDetail.holy_sites)
                        : (packageDetail.ziyarah_detail || []).map((ziyarah, index) => ({
                            title: `Stop ${index + 1}`,
                            list: parseCommaSeparated(ziyarah.ziyarah_list),
                          }))
                    }
                  />
                </div>
              </AppCard>

              <AppCard className="border-slate-200">
                <AppSectionHeader title="Additional Costs" subtitle="Person-wise and room-wise add-ons" />

                <div className="space-y-3">
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-300">
                      Additional Person Cost
                    </p>
                    <div className="grid gap-2 sm:grid-cols-3">
                      {ADDITIONAL_PERSON_COSTS.map((item) => (
                        <InfoTile
                          key={item.key}
                          label={item.label}
                          value={
                            <CurrencyText
                              value={convertedCosts[item.key]}
                              currency={selectedCurrency}
                              className="font-semibold text-brand-600"
                            />
                          }
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-300">
                      Hotel Additional Cost
                    </p>
                    <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
                      {ROOM_ADDITIONAL_COSTS.map((item) => (
                        <InfoTile
                          key={item.key}
                          label={item.label}
                          value={
                            <CurrencyText
                              value={convertedCosts[item.key]}
                              currency={selectedCurrency}
                              className="font-semibold text-brand-600"
                            />
                          }
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </AppCard>
            </div>
          </div>
        )}
      </AppContainer>
    </section>
  );
};

const CompanyCard = ({ company }) => {
  const { REACT_APP_API_BASE_URL } = process.env;
  const logoUrl = company?.company_logo ? `${REACT_APP_API_BASE_URL}${company.company_logo}` : "";

  return (
    <AppCard className="border-slate-200">
      <AppSectionHeader title="Company" subtitle="Package publisher" />
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-100">
            {logoUrl ? (
              <img src={logoUrl} alt="Company logo" className="h-full w-full object-cover" />
            ) : (
              <span className="text-xs text-ink-500">No logo</span>
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-ink-900">
              {withFallback(company?.company_name, "Company not available")}
            </p>
            <p className="text-xs text-ink-500">
              {withFallback(
                company?.total_experience ? `${company.total_experience} years experience` : ""
              )}
            </p>
          </div>
        </div>
        <p className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-ink-700">
          {withFallback(company?.company_bio, "No company overview available.")}
        </p>
      </div>
    </AppCard>
  );
};

const CostRow = ({ label, value, selectedCurrency }) => {
  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
      <p className="text-sm text-ink-700">{label}</p>
      <CurrencyText value={value} currency={selectedCurrency} className="text-sm font-semibold text-brand-600" />
    </div>
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

const InclusionBlock = ({ title, icon, items, isPositive = false }) => {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-300">{title}</p>
      {items.length ? (
        <div className="flex flex-wrap gap-2">
          {items.map((item) => (
            <span
              key={`${title}-${item}`}
              className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${
                isPositive ? "bg-brand-50 text-brand-700" : "bg-red-50 text-red-600"
              }`}
            >
              {icon}
              {item}
            </span>
          ))}
        </div>
      ) : (
        <p className="text-sm text-ink-500">No entries.</p>
      )}
    </div>
  );
};

const HotelCard = ({ hotel }) => {
  const hotelImages = useMemo(() => fetchHotelImages(hotel), [hotel]);
  const amenities = useMemo(() => {
    return HOTEL_AMENITY_FLAGS.filter((item) => hotel[item.key]).map((item) => item.label);
  }, [hotel]);
  const rating = Number(hotel.hotel_rating || 0);

  return (
    <article className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-ink-900">
            {withFallback(hotel.hotel_name, "Hotel")} ({withFallback(hotel.hotel_city)})
          </p>
          <p className="text-xs text-ink-500">
            {withFallback(hotel.room_sharing_type, "Standard")} room - {withFallback(hotel.hotel_distance)}{" "}
            {withFallback(hotel.distance_type)}
          </p>
        </div>
        <div className="flex items-center gap-1 text-amber-500">
          {Array.from({ length: 5 }, (_, index) => (
            <FaStar key={index} className={index < rating ? "fill-amber-400" : "fill-slate-300"} />
          ))}
        </div>
      </div>

      {amenities.length ? (
        <div className="mt-3 flex flex-wrap gap-1">
          {amenities.map((amenity) => (
            <span
              key={amenity}
              className="rounded-full border border-brand-200 bg-brand-50 px-2 py-1 text-[11px] font-semibold text-brand-700"
            >
              {amenity}
            </span>
          ))}
        </div>
      ) : null}

      {hotelImages.length ? (
        <div className="mt-3">
          <Swiper
            slidesPerView={1}
            spaceBetween={12}
            breakpoints={{
              768: { slidesPerView: 2, spaceBetween: 12 },
              1280: { slidesPerView: 3, spaceBetween: 12 },
            }}
          >
            {hotelImages.map((photo, index) => (
              <SwiperSlide key={`${hotel.hotel_name}-photo-${index}`}>
                <img
                  src={photo}
                  alt={`${hotel.hotel_name}-${index + 1}`}
                  className="h-44 w-full rounded-lg border border-slate-200 object-cover"
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      ) : (
        <p className="mt-3 text-sm text-ink-500">No hotel images available.</p>
      )}
    </article>
  );
};

const TravelSection = ({ title, items }) => {
  return (
    <section>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-300">{title}</p>
      {items.length ? (
        <div className="space-y-2">
          {items.map((item, index) => (
            <article
              key={`${title}-${index}`}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3"
            >
              <p className="text-sm font-semibold text-ink-900">{withFallback(item.title)}</p>
              {item.list?.length ? (
                <div className="mt-2 flex flex-wrap gap-1">
                  {item.list.map((value, valueIndex) => (
                    <span
                      key={`${title}-${index}-${valueIndex}`}
                      className="rounded-full bg-white px-2 py-1 text-xs text-ink-700"
                    >
                      {withFallback(value)}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="mt-1 text-sm text-ink-500">No additional details.</p>
              )}
            </article>
          ))}
        </div>
      ) : (
        <p className="text-sm text-ink-500">No details shared.</p>
      )}
    </section>
  );
};

const CurrencyText = ({ value, currency, className = "" }) => {
  return (
    <NumericFormat
      value={Number(value || 0)}
      displayType="text"
      thousandSeparator
      prefix={`${currency} `}
      decimalScale={2}
      fixedDecimalScale
      className={className}
    />
  );
};

export default DetailPage;
