import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchPendingCompanies } from "../../../../utility/Super-Admin-Api";
import { AppButton, AppCard, AppEmptyState, AppSectionHeader } from "../../../../components/ui";
import errorIcon from "../../../../assets/error.svg";
import SuperAdminModuleShell from "../../components/SuperAdminModuleShell";
import SuperAdminPagination from "../../components/SuperAdminPagination";
import SuperAdminMetricCard from "../../components/SuperAdminMetricCard";
import SuperAdminInfoTile from "../../components/SuperAdminInfoTile";
import usePaginatedRecords from "../../components/usePaginatedRecords";
import Loader from "../../../../components/loader";
import {
  formatDateTime,
  getInitial,
  withFallback,
} from "../../components/superAdminFormatters";
import { buildAdminProfileApprovalPath } from "../adminDetailRouteUtils";

const ITEMS_PER_PAGE = 6;

const PendingProfilePage = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const { currentPage, totalPages, currentItems, onPageChange } = usePaginatedRecords(
    companies,
    ITEMS_PER_PAGE
  );

  const loadPendingProfiles = useCallback(async () => {
    setLoading(true);
    setError("");

    const { status, data, error: requestError } = await fetchPendingCompanies();

    if (status === 200 && Array.isArray(data)) {
      const validCompanies = data.filter((company) => company.partner_type_and_detail);
      setCompanies(validCompanies);
    } else if (status === 404) {
      setCompanies([]);
    } else {
      setCompanies([]);
      setError(requestError || "An error occurred while fetching data.");
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    loadPendingProfiles();
  }, [loadPendingProfiles]);

  const uniqueCitiesCount = useMemo(() => {
    const citySet = new Set();
    companies.forEach((company) => {
      if (company?.mailing_detail?.city) {
        citySet.add(company.mailing_detail.city);
      }
    });
    return citySet.size;
  }, [companies]);

  const recentSubmissions = useMemo(() => {
    const now = Date.now();
    const ONE_DAY_MS = 24 * 60 * 60 * 1000;
    return companies.filter((company) => {
      const createdTime = new Date(company.created_time).getTime();
      return !Number.isNaN(createdTime) && now - createdTime <= ONE_DAY_MS;
    }).length;
  }, [companies]);

  return (
    <SuperAdminModuleShell
      title="Pending Profiles"
      subtitle="Review company profiles and route them to approval detail."
      showBackButton={false}
    >
      {loading ? (
        <AppCard className="min-h-[320px] flex items-center justify-center">
          <Loader />
        </AppCard>
      ) : error ? (
        <AppCard>
          <AppEmptyState
            icon={<img src={errorIcon} alt="" className="h-6 w-6" />}
            title="Unable to load pending profiles"
            message={error}
            action={
              <AppButton size="sm" onClick={loadPendingProfiles}>
                Retry
              </AppButton>
            }
          />
        </AppCard>
      ) : companies.length > 0 ? (
        <>
          <div className="app-grid-3">
            <SuperAdminMetricCard
              title="Pending Profiles"
              value={companies.length.toLocaleString()}
              hint="Companies waiting for review"
            />
            <SuperAdminMetricCard
              title="Recent (24h)"
              value={recentSubmissions.toLocaleString()}
              hint="New submissions in the last day"
            />
            <SuperAdminMetricCard
              title="Coverage"
              value={`${uniqueCitiesCount.toLocaleString()} cities`}
              hint={`${currentItems.length} records on current page`}
            />
          </div>

          <AppCard className="border-slate-200">
            <AppSectionHeader
              title="Approve Partner Profiles"
              subtitle={`Showing ${currentItems.length} of ${companies.length} pending records`}
            />
          </AppCard>

          <div className="app-content-stack">
            {currentItems.map((company) => (
              <AppCard
                key={
                  company.partner_type_and_detail?.company_id ||
                  company.email ||
                  company.phone_number ||
                  company.name
                }
                className="border-slate-200"
              >
                <article className="app-content-stack">
                  <header className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 font-semibold text-brand-700">
                        {getInitial(company.name)}
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-ink-300">
                          Company
                        </p>
                        <h3 className="text-base font-semibold text-ink-900">
                          {withFallback(company.partner_type_and_detail?.company_name, "Company")}
                        </h3>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <span className="app-status-pill">{company.account_status || "Pending"}</span>
                      <AppButton
                        size="sm"
                        onClick={() =>
                          navigate(
                            buildAdminProfileApprovalPath(
                              company.partner_type_and_detail?.company_id
                            ),
                            {
                              state: { company },
                            }
                          )
                        }
                      >
                        Review
                      </AppButton>
                    </div>
                  </header>

                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <SuperAdminInfoTile
                      label="Contact"
                      value={withFallback(company.name, "Name not provided")}
                    />
                    <SuperAdminInfoTile
                      label="Location"
                      value={withFallback(
                        company.mailing_detail?.city || company.mailing_detail?.country,
                        "Location not provided"
                      )}
                    />
                    <SuperAdminInfoTile
                      label="Created"
                      value={formatDateTime(company.created_time)}
                    />
                    <SuperAdminInfoTile
                      label="License Number"
                      value={withFallback(company.partner_type_and_detail?.license_number, "N/A")}
                    />
                  </div>
                </article>
              </AppCard>
            ))}
          </div>

          <SuperAdminPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        </>
      ) : (
        <AppCard>
          <AppEmptyState
            icon={<img src={errorIcon} alt="" className="h-6 w-6" />}
            title="No pending profiles"
            message="New partner profiles will appear here when submitted for review."
          />
        </AppCard>
      )}
    </SuperAdminModuleShell>
  );
};

export default PendingProfilePage;
