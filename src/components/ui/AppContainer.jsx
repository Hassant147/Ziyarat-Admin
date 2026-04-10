import React from "react";

const AppContainer = ({ as: Component = "div", className = "", children }) => {
  return (
    <Component className={`app-page-container ${className}`.trim()}>{children}</Component>
  );
};

export default AppContainer;
