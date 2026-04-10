import React from "react";
import Loader from "../loader";

const RouteLoader = () => {
  return (
    <div className="app-page-container min-h-[45vh] flex items-center justify-center">
      <div className="app-panel px-6 py-6 flex items-center gap-3">
        <Loader />
        <span className="text-sm text-ink-700">Loading page...</span>
      </div>
    </div>
  );
};

export default RouteLoader;
