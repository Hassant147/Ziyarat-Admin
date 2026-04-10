import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiRefreshCw, FiSearch, FiStar } from "react-icons/fi";
import { toast } from "react-toastify";
import Loader from "../../../components/loader";
import {
  AppButton,
  AppCard,
  AppEmptyState,
  AppSectionHeader,
} from "../../../components/ui";
import SuperAdminModuleShell from "../../dashboard/components/SuperAdminModuleShell";
import {
  getFeaturedPackagesForAdmin,
  updateFeaturedPackageStatus,
} from "../../../utility/featuredPackagesApi";

const PACKAGE_TYPE_FILTERS = [
  { value: "all", label: "All Types" },
  { value: "Iraq", label: "Iraq" },
  { value: "Iran", label: "Iran" },
  { value: "Iran-Iraq", label: "Iran-Iraq" },
];

const FEATURED_STATUS_FILTERS = [
  { value: "all", label: "All Packages" },
  { value: "featured", label: "Featured Only" },
  { value: "not_featured", label: "Not Featured" },
];

const formatDate = (value) => {
  if (!value) {
    return "Not set";
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "Not set";
  }
  return parsed.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatAmount = (value) => {
  const numericValue = Number(value || 0);
  if (!Number.isFinite(numericValue)) {
    return "PKR 0";
  }
  return `PKR ${numericValue.toLocaleString()}`;
};

const FeaturedPackages = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [packageType, setPackageType] = useState("all");
  const [featuredFilter, setFeaturedFilter] = useState("all");
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingToken, setUpdatingToken] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    count: 0,
    next: null,
    previous: null,
  });

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 250);
    return () => clearTimeout(timeoutId);
  }, [search]);

  useEffect(() => {
    setPagination((prev) => ({
      ...prev,
      page: 1,
    }));
  }, [debouncedSearch, featuredFilter, packageType]);

  const loadPackages = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        page_size: pagination.pageSize,
      };
      if (packageType !== "all") {
        params.package_type = packageType;
      }
      if (featuredFilter === "featured") {
        params.is_featured = true;
      } else if (featuredFilter === "not_featured") {
        params.is_featured = false;
      }
      if (debouncedSearch) {
        params.search = debouncedSearch;
      }

      const payload = await getFeaturedPackagesForAdmin(params);
      setPackages(Array.isArray(payload?.results) ? payload.results : []);
      setPagination((prev) => ({
        ...prev,
        count: Number(payload?.count || 0),
        next: payload?.next || null,
        previous: payload?.previous || null,
      }));
    } catch (error) {
      setPackages([]);
      toast.error(error?.message || "Unable to fetch packages.");
    } finally {
      setLoading(false);
    }
  }, [
    debouncedSearch,
    featuredFilter,
    packageType,
    pagination.page,
    pagination.pageSize,
  ]);

  useEffect(() => {
    loadPackages();
  }, [loadPackages]);

  const featuredCount = useMemo(
    () => packages.filter((item) => Boolean(item?.is_featured)).length,
    [packages]
  );

  const totalPages = useMemo(() => {
    const pageCount = Math.ceil((pagination.count || 0) / pagination.pageSize);
    return Math.max(pageCount, 1);
  }, [pagination.count, pagination.pageSize]);

  const goToPreviousPage = () => {
    if (!pagination.previous || loading) {
      return;
    }
    setPagination((prev) => ({
      ...prev,
      page: Math.max(1, prev.page - 1),
    }));
  };

  const goToNextPage = () => {
    if (!pagination.next || loading) {
      return;
    }
    setPagination((prev) => ({
      ...prev,
      page: prev.page + 1,
    }));
  };

  const handleRefresh = () => {
    loadPackages();
  };

  const handleToggleFeatured = async (pkg) => {
    const ziyaratToken = `${pkg?.ziyarat_token || ""}`.trim();
    if (!ziyaratToken || updatingToken) {
      return;
    }

    const nextFeaturedValue = !Boolean(pkg?.is_featured);
    setUpdatingToken(ziyaratToken);
    try {
      await updateFeaturedPackageStatus({
        ziyarat_token: ziyaratToken,
        is_featured: nextFeaturedValue,
        partner_session_token: pkg?.partner_session_token || "",
      });
      setPackages((previousPackages) =>
        previousPackages.map((item) =>
          item?.ziyarat_token === ziyaratToken
            ? {
                ...item,
                is_featured: nextFeaturedValue,
              }
            : item
        )
      );
      toast.success(
        nextFeaturedValue
          ? "Package marked as featured successfully."
          : "Package removed from featured list."
      );
    } catch (error) {
      toast.error(error?.message || "Failed to update package featured status.");
    } finally {
      setUpdatingToken("");
    }
  };

  return (
    <SuperAdminModuleShell
      title="Featured Packages"
      subtitle="Review active packages and mark the ones that should appear in website featured placements."
      showBackButton={false}
      toolbar={
        <AppButton
          variant="outline"
          size="sm"
          startIcon={<FiRefreshCw className="h-4 w-4" />}
          onClick={handleRefresh}
          disabled={loading}
        >
          Refresh
        </AppButton>
      }
    >
      <div className="app-content-stack">
        <AppCard className="border-slate-200">
          <AppSectionHeader
            title="Featured Queue"
            subtitle="Filter by package type and quickly toggle featured status."
            action={
              <div className="inline-flex items-center rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-700">
                {featuredCount} featured on this page
              </div>
            }
          />

          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_220px_220px]">
            <label className="relative block">
              <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by package name, token, or partner"
                className="w-full py-2.5 pl-9 pr-3 text-sm"
              />
            </label>

            <select
              value={packageType}
              onChange={(event) => setPackageType(event.target.value)}
              className="w-full px-3 py-2.5 text-sm"
            >
              {PACKAGE_TYPE_FILTERS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>

            <select
              value={featuredFilter}
              onChange={(event) => setFeaturedFilter(event.target.value)}
              className="w-full px-3 py-2.5 text-sm"
            >
              {FEATURED_STATUS_FILTERS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
        </AppCard>

        <AppCard className="border-slate-200">
          {loading ? (
            <div className="flex min-h-[260px] items-center justify-center">
              <Loader />
            </div>
          ) : packages.length === 0 ? (
            <AppEmptyState
              title="No packages found"
              message="Try adjusting your filters or search terms."
              className="min-h-[220px]"
            />
          ) : (
            <div className="space-y-3">
              {packages.map((pkg) => {
                const ziyaratToken = `${pkg?.ziyarat_token || ""}`;
                const isUpdating = updatingToken === ziyaratToken;
                const isFeatured = Boolean(pkg?.is_featured);

                return (
                  <article
                    key={ziyaratToken}
                    className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="space-y-1">
                        <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">
                          {pkg?.package_type || "Package"} • {ziyaratToken || "No token"}
                        </p>
                        <h3 className="text-base font-semibold text-ink-900">
                          {pkg?.package_name || "Untitled Package"}
                        </h3>
                        <p className="text-sm text-ink-600">
                          {pkg?.partner_name || "Unknown Partner"}
                          {pkg?.partner_email ? ` (${pkg.partner_email})` : ""}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                            isFeatured
                              ? "bg-amber-100 text-amber-800"
                              : "bg-slate-200 text-slate-700"
                          }`}
                        >
                          {isFeatured ? (
                            <>
                              <FiStar className="mr-1 h-3.5 w-3.5" />
                              Featured
                            </>
                          ) : (
                            "Not Featured"
                          )}
                        </span>
                        <span className="inline-flex items-center rounded-full bg-white px-3 py-1 text-xs font-semibold text-ink-600">
                          {pkg?.package_status || "Unknown Status"}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 grid gap-2 text-sm text-ink-700 sm:grid-cols-3">
                      <p>
                        <span className="font-semibold text-ink-900">Travel dates:</span>{" "}
                        {formatDate(pkg?.start_date)} - {formatDate(pkg?.end_date)}
                      </p>
                      <p>
                        <span className="font-semibold text-ink-900">Base cost:</span>{" "}
                        {formatAmount(pkg?.package_base_cost)}
                      </p>
                      <p>
                        <span className="font-semibold text-ink-900">Created:</span>{" "}
                        {formatDate(pkg?.created_time)}
                      </p>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <AppButton
                        type="button"
                        size="sm"
                        variant={isFeatured ? "outline" : "primary"}
                        onClick={() => handleToggleFeatured(pkg)}
                        disabled={isUpdating}
                      >
                        {isUpdating
                          ? "Updating..."
                          : isFeatured
                          ? "Remove Featured"
                          : "Mark as Featured"}
                      </AppButton>

                        <AppButton
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            navigate(`/detailpage/?packageId=${encodeURIComponent(ziyaratToken)}`)
                          }
                        >
                          Open Package Detail
                      </AppButton>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 pt-4">
            <p className="text-sm text-ink-600">
              Showing page {pagination.page} of {totalPages} • {pagination.count} total package
              {pagination.count === 1 ? "" : "s"}
            </p>
            <div className="flex items-center gap-2">
              <AppButton
                type="button"
                variant="outline"
                size="sm"
                onClick={goToPreviousPage}
                disabled={!pagination.previous || loading}
              >
                Previous
              </AppButton>
              <AppButton
                type="button"
                variant="outline"
                size="sm"
                onClick={goToNextPage}
                disabled={!pagination.next || loading}
              >
                Next
              </AppButton>
            </div>
          </div>
        </AppCard>
      </div>
    </SuperAdminModuleShell>
  );
};

export default FeaturedPackages;
