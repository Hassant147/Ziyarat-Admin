import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Sidebar from "./DetailProfileComponents/Sidebar";
import CompanyInfoCard from "./DetailProfileComponents/CompanyInfoCard";
import ActionSection from "./DetailProfileComponents/ActionSection";
import { AppButton, AppCard, AppEmptyState } from "../../../../components/ui";
import errorIcon from "../../../../assets/error.svg";
import SuperAdminModuleShell from "../../components/SuperAdminModuleShell";
import Loader from "../../../../components/loader";
import { fetchPendingCompanies } from "../../../../utility/Super-Admin-Api";
import {
  ADMIN_DETAIL_QUERY_KEYS,
  getAdminDetailSearchParam,
} from "../adminDetailRouteUtils";

const ProfileApprovalPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const locationCompany = location.state?.company || null;
  const companyId = useMemo(
    () =>
      `${locationCompany?.partner_type_and_detail?.company_id || ""}` ||
      getAdminDetailSearchParam(location.search, ADMIN_DETAIL_QUERY_KEYS.companyId),
    [location.search, locationCompany?.partner_type_and_detail?.company_id]
  );

  const [company, setCompany] = useState(locationCompany);
  const [loading, setLoading] = useState(!locationCompany && Boolean(companyId));
  const [error, setError] = useState("");

  useEffect(() => {
    if (locationCompany) {
      setCompany(locationCompany);
      setLoading(false);
      setError("");
      return;
    }

    if (!companyId) {
      setCompany(null);
      setLoading(false);
      setError("");
      return;
    }

    let isMounted = true;

    const loadCompany = async () => {
      setLoading(true);
      setError("");

      const { status, data, error: requestError } = await fetchPendingCompanies();

      if (!isMounted) {
        return;
      }

      if (status === 200 && Array.isArray(data)) {
        const matchedCompany = data.find(
          (item) =>
            `${item.partner_type_and_detail?.company_id || ""}` === `${companyId || ""}`
        );

        setCompany(matchedCompany || null);
        if (!matchedCompany) {
          setError("This profile link did not resolve to a pending company.");
        }
      } else if (status === 404) {
        setCompany(null);
        setError("No pending companies were found.");
      } else {
        setCompany(null);
        setError(requestError || "An error occurred while fetching data.");
      }

      setLoading(false);
    };

    loadCompany();

    return () => {
      isMounted = false;
    };
  }, [companyId, locationCompany]);

  if (loading) {
    return (
      <SuperAdminModuleShell
        title="Profile Approval"
        subtitle="Review profile details and decide approval."
      >
        <AppCard className="min-h-[320px] flex items-center justify-center">
          <Loader />
        </AppCard>
      </SuperAdminModuleShell>
    );
  }

  if (!company || error) {
    return (
      <SuperAdminModuleShell
        title="Profile Approval"
        subtitle="Review profile details and decide approval."
      >
        <AppCard>
          <AppEmptyState
            icon={<img src={errorIcon} alt="" className="h-6 w-6" />}
            title="Profile not loaded"
            message={error || "Open a profile from the pending profiles list to continue."}
            action={
              <AppButton
                size="sm"
                onClick={() => navigate("/pending-profiles")}
              >
                Go to Pending Profiles
              </AppButton>
            }
          />
        </AppCard>
      </SuperAdminModuleShell>
    );
  }

  return (
    <SuperAdminModuleShell
      title="Profile Approval"
      subtitle="Validate company profile information and apply an approval decision."
    >
      <div className="grid gap-4 lg:grid-cols-[340px_minmax(0,1fr)]">
        <Sidebar company={company} />
        <div className="app-content-stack">
          <CompanyInfoCard company={company} />
          <ActionSection company={company} />
        </div>
      </div>
    </SuperAdminModuleShell>
  );
};

export default ProfileApprovalPage;
