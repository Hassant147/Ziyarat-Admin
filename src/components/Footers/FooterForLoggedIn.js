import React from "react";
import { Link } from "react-router-dom";
import { AppContainer } from "../ui";

const Footer = () => {
  return (
    <footer className="app-footer-shell py-4 mt-6">
      <AppContainer className="flex flex-col md:flex-row items-center justify-between gap-3 text-sm text-ink-500">
        <nav className="flex flex-wrap items-center justify-center gap-4">
          <Link to="/terms-of-services" className="hover:text-brand-600">
            Terms of Services
          </Link>
          <Link to="/privacy-policy" className="hover:text-brand-600">
            Privacy Policy
          </Link>
          <Link to="/documentation" className="hover:text-brand-600">
            Documentation
          </Link>
          <Link to="/faq" className="hover:text-brand-600">
            FAQs
          </Link>
        </nav>
        <div>
          © Copyright <span className="font-semibold text-brand-600">Ziyarat</span> 2026
        </div>
      </AppContainer>
    </footer>
  );
};

export default Footer;
