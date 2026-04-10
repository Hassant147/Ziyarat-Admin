import React from "react";
import { useLocation } from "react-router-dom";
import Navbar from "./Headers/Header";
import Banner from "./Navbar";
import Footer from "./Footers/Footer";

const HeaderNavbarCom = ({ title, subtitle, children }) => {
  const location = useLocation();
  const isLoginRoute = location.pathname === "/";

  return (
    <div className="admin-theme min-h-screen flex flex-col">
      <Navbar />
      {!isLoginRoute ? <Banner title={title} subtitle={subtitle} /> : null}
      <main className="flex-1">{children}</main>
      {!isLoginRoute ? <Footer /> : null}
    </div>
  );
};

export default HeaderNavbarCom;
