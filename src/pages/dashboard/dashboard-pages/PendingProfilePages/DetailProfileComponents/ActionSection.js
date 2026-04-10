import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import {
  fetchSalesDirectors,
  updateCompanyStatus,
} from "../../../../../utility/Super-Admin-Api";
import { AppButton, AppCard, AppSectionHeader } from "../../../../../components/ui";

const ActionSection = ({ company, onSubmit = () => {} }) => {
  const [action, setAction] = useState("");
  const [saleDirector, setSaleDirector] = useState("");
  const [directors, setDirectors] = useState([]);
  const [loadingDirectors, setLoadingDirectors] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const companyName = company?.partner_type_and_detail?.company_name || "this company";

  useEffect(() => {
    const loadDirectors = async () => {
      const { status, data, error } = await fetchSalesDirectors();
      if (status === 200) {
        setDirectors(Array.isArray(data) ? data : []);
      } else {
        toast.error(error || "Failed to fetch sales directors.");
      }
      setLoadingDirectors(false);
    };

    loadDirectors();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!action || !company) {
      toast.error("Please select a decision first.");
      return;
    }

    setIsSubmitting(true);

    const companyId = company?.partner_type_and_detail?.company_id;
    if (!companyId) {
      setIsSubmitting(false);
      toast.error("Company reference is missing from this review record.");
      return;
    }

    const { status, message, error } = await updateCompanyStatus(
      companyId,
      action === "approve" ? "Active" : "Rejected",
      action === "approve" ? saleDirector : ""
    );

    setIsSubmitting(false);

    if (status === 200) {
      toast.success(message || "Company profile decision submitted.");
      onSubmit({ action, saleDirector });
      navigate(-1);
      return;
    }

    toast.error(error || "Failed to update company profile status.");
  };

  return (
    <AppCard className="border-slate-200">
      <form onSubmit={handleSubmit} className="app-content-stack">
        <AppSectionHeader
          title="Review Decision"
          subtitle={`Current company: ${companyName}`}
        />

        <p className="text-sm text-ink-600">
          Approve to activate this company profile, or reject to stop onboarding.
        </p>

        <div className="grid gap-2 sm:grid-cols-2">
          <DecisionTile
            label="Approve and activate profile"
            isSelected={action === "approve"}
            onClick={() => setAction("approve")}
          />
          <DecisionTile
            label="Reject profile"
            isSelected={action === "reject"}
            onClick={() => {
              setAction("reject");
              setSaleDirector("");
            }}
          />
        </div>

        <div>
          <label
            htmlFor="sales-director"
            className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink-300"
          >
            Sales Director (optional)
          </label>
          <select
            id="sales-director"
            value={saleDirector}
            onChange={(event) => setSaleDirector(event.target.value)}
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:bg-slate-100"
            disabled={loadingDirectors || action !== "approve"}
          >
            <option value="">Select Sales Director</option>
            {directors.map((director) => (
              <option key={director.session_token} value={director.session_token}>
                {director.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-end">
          <AppButton
            type="submit"
            size="sm"
            className="min-w-[180px]"
            loading={isSubmitting}
            loadingLabel="Applying..."
            disabled={!action}
          >
            Apply Decision
          </AppButton>
        </div>
      </form>
    </AppCard>
  );
};

const DecisionTile = ({ label, isSelected, onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border px-3 py-3 text-left text-sm font-semibold transition ${
        isSelected
          ? "border-brand-500 bg-brand-50 text-brand-700"
          : "border-slate-200 bg-white text-ink-700 hover:border-brand-200 hover:bg-slate-50"
      }`}
    >
      <span className="flex items-center gap-2">
        <span
          className={`h-4 w-4 rounded-full border ${
            isSelected ? "border-brand-600 bg-brand-500" : "border-slate-400"
          }`}
          aria-hidden="true"
        />
        {label}
      </span>
    </button>
  );
};

export default ActionSection;
