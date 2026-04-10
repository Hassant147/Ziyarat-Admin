import React from "react";

const joinClasses = (...classes) => classes.filter(Boolean).join(" ");

const VARIANT_CLASS = {
  primary: "app-btn-primary",
  secondary: "app-btn-secondary",
  ghost: "app-btn-ghost",
  danger: "app-btn-danger",
  outline: "app-btn-outline",
};

const SIZE_CLASS = {
  sm: "app-btn-sm",
  md: "app-btn-md",
  lg: "app-btn-lg",
};

const AppButton = ({
  as: Component = "button",
  type = "button",
  variant = "primary",
  size = "md",
  loading = false,
  loadingLabel = "Please wait...",
  startIcon = null,
  endIcon = null,
  disabled = false,
  className = "",
  children,
  ...props
}) => {
  const isNativeButton = Component === "button";
  const isDisabled = disabled || loading;
  const variantClass = VARIANT_CLASS[variant] || VARIANT_CLASS.primary;
  const sizeClass = SIZE_CLASS[size] || SIZE_CLASS.md;
  const componentProps = {
    className: joinClasses("app-btn", sizeClass, variantClass, className),
    ...props,
  };

  if (isNativeButton) {
    componentProps.type = type;
    componentProps.disabled = isDisabled;
    componentProps["aria-busy"] = loading;
  } else if (isDisabled) {
    componentProps["aria-disabled"] = true;
  }

  return (
    <Component {...componentProps}>
      {loading ? (
        <>
          <span className="app-btn-spinner" />
          <span>{loadingLabel}</span>
        </>
      ) : (
        <>
          {startIcon}
          {children}
          {endIcon}
        </>
      )}
    </Component>
  );
};

export default React.memo(AppButton);
