import React from "react";

const AppPageBanner = ({ title, subtitle, children, className = "" }) => {
  return (
    <section className={`app-page-container ${className}`.trim()}>
      <div className="app-page-banner px-5 py-6 md:px-8 md:py-9">
        {children ? (
          children
        ) : (
          <>
            <h1 className="app-page-title">{title}</h1>
            {subtitle ? <p className="app-page-subtitle">{subtitle}</p> : null}
          </>
        )}
      </div>
    </section>
  );
};

export default AppPageBanner;
