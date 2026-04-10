import React from "react";
import { AppCard } from "../../../components/ui";

const SuperAdminMetricCard = ({ title, value, hint }) => {
  return (
    <AppCard className="border-slate-200">
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-300">{title}</p>
      <p className="mt-2 text-2xl font-semibold text-ink-900">{value}</p>
      <p className="mt-1 text-sm text-ink-500">{hint}</p>
    </AppCard>
  );
};

export default React.memo(SuperAdminMetricCard);

