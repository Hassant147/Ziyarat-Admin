import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Navigate, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";
import "./customToast.css";
import "./components/ScrollToTopButton.css";
import ScrollToTopButton from "./components/ScrollToTopButton";
import HeaderNavbarCom from "./components/HeaderNavbarComponent";
import { RouteLoader } from "./components/ui";
import { CurrencyProvider } from "./utility/CurrencyContext";
import { AdminAuthProvider, useAdminAuth } from "./utility/adminSession";

const LoginPage = lazy(() => import("./pages/login/login"));

const SuperAdminDashboard = lazy(() => import("./pages/dashboard/dashboard"));
const PendingProfilePage = lazy(() => import("./pages/dashboard/dashboard-pages/PendingProfilePages/PendingProfilesList"));
const ApproveAmountsPage = lazy(() => import("./pages/dashboard/dashboard-pages/ApproveAmountsPages/ApproveAmountsPage"));
const ProfileApprovalPage = lazy(() => import("./pages/dashboard/dashboard-pages/PendingProfilePages/ProfileApprovalDetailPage"));
const BookingDetailsPage = lazy(() => import("./pages/dashboard/dashboard-pages/ApproveAmountsPages/BookingDetailsPage/BookingDetailsPage"));
const ApprovePartnerAmountsPage = lazy(() => import("./pages/dashboard/dashboard-pages/ApproveAmountsPartners/ApprovePartnerAmountsPage"));
const PartnerBookingDetailsPage = lazy(() => import("./pages/dashboard/dashboard-pages/ApproveAmountsPartners/BookingDetailsPage/BookingDetailsPage"));
const DetailPage = lazy(() => import("./pages/dashboard/dashboard-pages/ApproveAmountsPages/BookingDetailsPage/PackageDetailPage"));

const Profile = lazy(() => import("./pages/Admin-Panel/ProfilePage/Profile"));
const FQA = lazy(() => import("./pages/Admin-Panel/ExtraPages/FrequentlyAskedQuestions/FQA"));
const PrivacyPolicy = lazy(() => import("./pages/Admin-Panel/ExtraPages/PrivacyPolicy/PrivacyPolicy"));
const TermsServices = lazy(() => import("./pages/Admin-Panel/ExtraPages/TermsServices/TermsServices"));
const Documentation = lazy(() => import("./pages/Admin-Panel/ExtraPages/Documentation-Page/doc"));
const HotelCatalog = lazy(() => import("./pages/Admin-Panel/HotelCatalog/HotelCatalog"));
const FeaturedPackages = lazy(() => import("./pages/Admin-Panel/FeaturedPackages/FeaturedPackages"));

const SuperAdminProtectedRoute = ({ element }) => {
  const { isAuthenticated, isLoading } = useAdminAuth();

  if (isLoading) {
    return <RouteLoader />;
  }

  if (isAuthenticated) {
    return element;
  }

  return <Navigate to="/" replace />;
};

const AdminFallbackRoute = () => {
  const { isAuthenticated, isLoading } = useAdminAuth();

  if (isLoading) {
    return <RouteLoader />;
  }

  if (isAuthenticated) {
    return <Navigate to="/super-admin-dashboard" replace />;
  }

  return <Navigate to="/" replace />;
};

const LoginRedirectRoute = ({ element }) => {
  const { isAuthenticated, isLoading } = useAdminAuth();

  if (isLoading) {
    return <RouteLoader />;
  }

  return isAuthenticated ? <Navigate to="/super-admin-dashboard" replace /> : element;
};

const SUPER_ADMIN_ROUTES = [
  {
    path: "/super-admin-dashboard",
    title: "Dashboard",
    subtitle: "Welcome to the dashboard. Manage your content here.",
    Component: SuperAdminDashboard,
    showPageBanner: true,
  },
  {
    path: "/pending-profiles",
    title: "Pending Profiles",
    subtitle: "Review and approve pending profiles.",
    Component: PendingProfilePage,
    showPageBanner: false,
  },
  {
    path: "/approve-amounts",
    title: "Approve Pending Amounts",
    subtitle: "Approve or reject booking amounts.",
    Component: ApproveAmountsPage,
    showPageBanner: false,
  },
  {
    path: "/profile-approval",
    title: "Profile Approval",
    subtitle: "Review profile details and decide approval.",
    Component: ProfileApprovalPage,
    showPageBanner: false,
  },
  {
    path: "/booking-details",
    title: "Booking Details",
    subtitle: "View and manage booking details.",
    Component: BookingDetailsPage,
    showPageBanner: false,
  },
  {
    path: "/detailpage",
    title: "Package Details",
    subtitle: "View detailed package information for the selected booking.",
    Component: DetailPage,
    showPageBanner: false,
  },
  {
    path: "/approve-partners-amounts",
    title: "Approve Pending Amounts of Partners",
    subtitle: "Approve or reject partner amounts.",
    Component: ApprovePartnerAmountsPage,
    showPageBanner: false,
  },
  {
    path: "/booking-details-for-partners",
    title: "Booking Details",
    subtitle: "View and manage partner booking details.",
    Component: PartnerBookingDetailsPage,
    showPageBanner: false,
  },
  {
    path: "/hotel-catalog",
    title: "Hotel Catalog",
    subtitle: "Manage reusable hotel templates used in partner package creation.",
    Component: HotelCatalog,
    showPageBanner: false,
  },
  {
    path: "/featured-packages",
    title: "Featured Packages",
    subtitle: "Manage packages highlighted on the website.",
    Component: FeaturedPackages,
    showPageBanner: false,
  },
];

const SHARED_LAYOUT_ROUTES = [
  { path: "/faq", Component: FQA },
  { path: "/privacy-policy", Component: PrivacyPolicy },
  { path: "/terms-of-services", Component: TermsServices },
  { path: "/documentation", Component: Documentation },
];

const App = () => {
  return (
    <div className="App admin-theme">
      <CurrencyProvider>
        <AdminAuthProvider>
          <Router>
            <Suspense fallback={<RouteLoader />}>
              <Routes>
                <Route
                  path="/"
                  element={
                    <LoginRedirectRoute
                      element={
                        <HeaderNavbarCom>
                          <LoginPage />
                        </HeaderNavbarCom>
                      }
                    />
                  }
                />

                {SUPER_ADMIN_ROUTES.map(({
                  path,
                  title,
                  subtitle,
                  Component,
                  showPageBanner = true,
                }) => (
                  <Route
                    key={path}
                    path={path}
                    element={
                      <SuperAdminProtectedRoute
                        element={
                          <HeaderNavbarCom
                            title={showPageBanner ? title : ""}
                            subtitle={showPageBanner ? subtitle : ""}
                          >
                            <Component />
                          </HeaderNavbarCom>
                        }
                      />
                    }
                  />
                ))}

                <Route
                  path="/profile"
                  element={<SuperAdminProtectedRoute element={<Profile />} />}
                />

                {SHARED_LAYOUT_ROUTES.map(({ path, Component, props }) => (
                  <Route
                    key={path}
                    path={path}
                    element={<SuperAdminProtectedRoute element={<Component {...(props || {})} />} />}
                  />
                ))}

                <Route path="*" element={<AdminFallbackRoute />} />
              </Routes>
            </Suspense>

            <ScrollToTopButton />
            <ToastContainer
              position="top-right"
              autoClose={5000}
              hideProgressBar
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
            />
          </Router>
        </AdminAuthProvider>
      </CurrencyProvider>
    </div>
  );
};

export default App;
