import React from "react";
import AdminPanelLayout from "../../../components/layout/AdminPanelLayout";
import { AppButton, AppCard } from "../../../components/ui";
import { useAdminAuth } from "../../../utility/adminSession";

import Loader from "react-js-loader";

const AdminSessionProfileView = () => {
  const { user, refreshSession } = useAdminAuth();

  const sessionFields = [
    {
      label: "Name",
      value: user?.name || user?.username || "Admin",
    },
    {
      label: "Username",
      value: user?.username || "Not provided",
    },
    {
      label: "Email",
      value: user?.email || "Not provided",
    },
    {
      label: "Role",
      value: user?.role || "admin",
    },
  ];

  return (
    <AdminPanelLayout
      title="My Profile"
      subtitle="Review the active admin session details sourced from the backend session API."
    >
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <AppCard className="border-slate-200">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-300">
                Admin Identity
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-ink-900">
                {user?.name || user?.username || "Admin"}
              </h2>
              <p className="mt-2 max-w-2xl text-sm text-ink-500">
                This profile view is backed by `/management/auth/me/` and no longer reads partner
                profile state from local storage.
              </p>
            </div>
            <AppButton variant="outline" size="sm" onClick={() => refreshSession()}>
              Refresh Session
            </AppButton>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {sessionFields.map((field) => (
              <div key={field.label} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-300">
                  {field.label}
                </p>
                <p className="mt-1 text-sm font-medium text-ink-900">{field.value}</p>
              </div>
            ))}
          </div>
        </AppCard>

        <AppCard className="border-slate-200">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-300">
            Session Status
          </p>
          <h3 className="mt-2 text-lg font-semibold text-ink-900">Authenticated</h3>
          <p className="mt-2 text-sm text-ink-500">
            Admin-only routes in this app now resolve identity from the backend-managed session
            instead of partner storage keys.
          </p>
        </AppCard>
      </div>
    </AdminPanelLayout>
  );
};

const Profile = () => {
  const { isLoading } = useAdminAuth();

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Loader
          type="spinner-cub"
          bgColor="#00936c"
          color="#00936c"
          title="Loading"
          size={50}
        />
      </div>
    );
  }

  return <AdminSessionProfileView />;
};

export default Profile;
