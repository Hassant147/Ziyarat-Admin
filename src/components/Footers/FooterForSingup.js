import React from "react";
import { AppContainer } from "../ui";

const Footer = () => {
  return (
    <footer className="app-footer-shell py-4">
      <AppContainer>
        <p className="text-center text-sm text-ink-500">
          By signing up you agree to the <span className="text-brand-600">Terms of Services</span> and <span className="text-brand-600">Privacy Policy</span>.
        </p>
      </AppContainer>
    </footer>
  );
};

export default Footer;
