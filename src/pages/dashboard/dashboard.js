import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  FiArrowRight,
  FiBriefcase,
  FiDollarSign,
  FiMapPin,
  FiStar,
  FiUserCheck,
} from "react-icons/fi";
import { AppCard, AppContainer } from "../../components/ui";
import { useAdminAuth } from "../../utility/adminSession";

const DASHBOARD_LINKS = [
  {
    to: "/pending-profiles",
    title: "Pending Profiles",
    description: "Review profiles waiting for approval.",
    priority: "Approval",
    icon: FiUserCheck,
    accentClassName: "bg-amber-50 text-amber-700 border-amber-100",
  },
  {
    to: "/approve-amounts",
    title: "Approve Amounts",
    description: "Review paid booking amount requests.",
    priority: "Finance",
    icon: FiDollarSign,
    accentClassName: "bg-emerald-50 text-emerald-700 border-emerald-100",
  },
  {
    to: "/approve-partners-amounts",
    title: "Partner Amounts",
    description: "Review partner payout and amount requests.",
    priority: "Finance",
    icon: FiBriefcase,
    accentClassName: "bg-violet-50 text-violet-700 border-violet-100",
  },
  {
    to: "/hotel-catalog",
    title: "Hotel Catalog",
    description: "Manage master hotel templates for package creation.",
    priority: "Catalog",
    icon: FiMapPin,
    accentClassName: "bg-cyan-50 text-cyan-700 border-cyan-100",
  },
  {
    to: "/featured-packages",
    title: "Featured Packages",
    description: "Highlight packages for website featured placements.",
    priority: "Catalog",
    icon: FiStar,
    accentClassName: "bg-amber-50 text-amber-700 border-amber-100",
  },
];

const Dashboard = () => {
  const { user } = useAdminAuth();
  const userName = useMemo(() => {
    return user?.name || user?.username || "Admin";
  }, [user]);

  return (
    <main className="app-main-shell pb-10">
      <AppContainer className="app-content-stack py-6">
        <AppCard className="border-slate-200 overflow-hidden">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-300">
                Super Admin Workspace
              </p>
              <h1 className="mt-2 text-3xl font-semibold text-ink-900">
                Welcome back, {userName}
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-ink-500">
                Manage onboarding, compliance checks, and financial approval flows from a single
                control center.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:min-w-[280px]">
              <SummaryTile label="Modules" value={`${DASHBOARD_LINKS.length}`} />
              <SummaryTile label="Approval Flows" value="2" />
              <SummaryTile label="Profile Queues" value="1" />
              <SummaryTile label="Action Ready" value="Yes" />
            </div>
          </div>
        </AppCard>

        <section className="app-content-stack">
          <header className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-xl font-semibold text-ink-900">Operational Modules</h2>
            <p className="text-sm text-ink-500">Use these modules to process daily admin tasks.</p>
          </header>

          <div className="grid gap-4 md:grid-cols-2">
            {DASHBOARD_LINKS.map((link) => (
              <ModuleCard key={link.to} link={link} />
            ))}
          </div>
        </section>
      </AppContainer>
    </main>
  );
};

const SummaryTile = React.memo(({ label, value }) => {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-300">{label}</p>
      <p className="mt-1 text-lg font-semibold text-ink-900">{value}</p>
    </div>
  );
});

const ModuleCard = React.memo(({ link }) => {
  const Icon = link.icon;
  return (
    <Link
      to={link.to}
      className="app-card group border-slate-200 p-5 transition duration-150 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <span
          className={`inline-flex h-11 w-11 items-center justify-center rounded-xl border ${link.accentClassName}`}
        >
          <Icon className="h-5 w-5" />
        </span>
        <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-ink-500">
          {link.priority}
        </span>
      </div>

      <h3 className="mt-4 text-lg font-semibold text-ink-900">{link.title}</h3>
      <p className="mt-1 text-sm text-ink-500">{link.description}</p>

      <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-brand-600">
        Open Module
        <FiArrowRight className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-0.5" />
      </div>
    </Link>
  );
});

export default Dashboard;
