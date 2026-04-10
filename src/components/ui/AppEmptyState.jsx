import React from "react";

const joinClasses = (...classes) => classes.filter(Boolean).join(" ");

const AppEmptyState = ({
  icon = null,
  title = "No data found",
  message = "",
  action = null,
  className = "",
}) => {
  return (
    <div className={joinClasses("app-empty-state", className)}>
      {icon ? <div className="app-empty-icon">{icon}</div> : null}
      <h3 className="app-empty-title">{title}</h3>
      {message ? <p className="app-empty-message">{message}</p> : null}
      {action ? <div className="app-empty-action">{action}</div> : null}
    </div>
  );
};

export default React.memo(AppEmptyState);
