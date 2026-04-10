import React from "react";

const joinClasses = (...classes) => classes.filter(Boolean).join(" ");

const AppSectionHeader = ({
  title,
  subtitle,
  action = null,
  className = "",
  titleClassName = "",
  subtitleClassName = "",
}) => {
  return (
    <header className={joinClasses("app-section-header", className)}>
      <div>
        {title ? (
          <h2 className={joinClasses("app-section-title", titleClassName)}>{title}</h2>
        ) : null}
        {subtitle ? (
          <p className={joinClasses("app-section-subtitle", subtitleClassName)}>{subtitle}</p>
        ) : null}
      </div>
      {action ? <div className="app-section-action">{action}</div> : null}
    </header>
  );
};

export default React.memo(AppSectionHeader);
