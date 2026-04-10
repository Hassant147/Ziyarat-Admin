import React from "react";

const joinClasses = (...classes) => classes.filter(Boolean).join(" ");

const AppSegmentedControl = ({
  items = [],
  value,
  onChange,
  className = "",
  itemClassName = "",
  getLabel = (item) => item?.label ?? item?.name ?? "",
  getValue = (item) => item?.value ?? item?.name ?? item,
  getIcon = (item) => item?.icon ?? null,
}) => {
  return (
    <div className={joinClasses("app-segmented", className)} role="tablist">
      {items.map((item) => {
        const itemValue = getValue(item);
        const isActive = itemValue === value;

        return (
          <button
            key={itemValue}
            type="button"
            role="tab"
            aria-selected={isActive}
            className={joinClasses(
              "app-segmented-item",
              isActive ? "is-active" : "",
              itemClassName
            )}
            onClick={() => onChange?.(itemValue)}
          >
            {getIcon(item)}
            <span>{getLabel(item)}</span>
          </button>
        );
      })}
    </div>
  );
};

export default React.memo(AppSegmentedControl);
