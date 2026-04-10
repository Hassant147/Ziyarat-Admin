import React from "react";
import Footer from "../Footers/FooterForLoggedIn";
import Header from "../Headers/HeaderForAdminPanel";
import NavigationBar from "../NavigationBarForContent";
import { AppContainer, AppPageBanner } from "../ui";

const AdminPanelLayout = ({
  title,
  subtitle,
  children,
  mainClassName = "py-5 md:py-6 app-main-shell",
  contentClassName = "",
  useContainer = true,
}) => {
  return (
    <div className="admin-theme min-h-screen flex flex-col">
      <Header />
      <NavigationBar />

      <main className={`flex-1 ${mainClassName}`.trim()}>
        {title ? (
          <AppPageBanner title={title} subtitle={subtitle} className="mb-4" />
        ) : null}

        {useContainer ? (
          <AppContainer className={`app-content-stack ${contentClassName}`.trim()}>
            {children}
          </AppContainer>
        ) : (
          children
        )}
      </main>

      <Footer />
    </div>
  );
};

export default AdminPanelLayout;
