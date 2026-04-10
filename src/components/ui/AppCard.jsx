import React from "react";

const joinClasses = (...classes) => classes.filter(Boolean).join(" ");

const AppCard = ({
  as: Component = "section",
  className = "",
  elevated = false,
  padded = true,
  children,
  ...props
}) => {
  return (
    <Component
      className={joinClasses(
        "app-card",
        elevated ? "app-card-elevated" : "app-card-soft",
        padded ? "app-card-body" : "",
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
};

export default React.memo(AppCard);
