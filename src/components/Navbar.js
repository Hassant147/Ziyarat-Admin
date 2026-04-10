import React from "react";
import bannerbg from "../assets/Components/bannerbg.svg";
import { AppPageBanner } from "./ui";

const Navbar = ({ title, subtitle }) => {
  if (!title && !subtitle) {
    return null;
  }

  return (
    <div className="pt-3 pb-6">
      <AppPageBanner>
        <div className="relative overflow-hidden">
          <img
            src={bannerbg}
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute right-0 top-1/2 w-[520px] max-w-none -translate-y-1/2 opacity-50"
          />
          <h2 className="app-page-title relative z-10">{title}</h2>
          {subtitle ? <p className="app-page-subtitle relative z-10">{subtitle}</p> : null}
        </div>
      </AppPageBanner>
    </div>
  );
};

export default Navbar;
