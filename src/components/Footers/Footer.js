import React from "react";
import { AppContainer } from "../ui";

const Footer = () => {
  return (
    <footer className="app-footer-shell py-4 mt-6">
      <AppContainer className="flex justify-end">
        <p className="text-sm text-ink-500">
          © Copyright <span className="text-brand-600 font-semibold">Ziyarat</span> 2026
        </p>
      </AppContainer>
    </footer>
  );
};

export default Footer;
