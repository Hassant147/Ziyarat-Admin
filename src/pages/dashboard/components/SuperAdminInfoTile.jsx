import React from "react";

const SuperAdminInfoTile = ({ label, value }) => {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-300">{label}</p>
      <p className="mt-1 text-sm text-ink-700">{value}</p>
    </div>
  );
};

export default React.memo(SuperAdminInfoTile);

