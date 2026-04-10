import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import avatar from "../../assets/nullprofile.svg";
import bell from "../../assets/bell.svg";
import logo from "../../assets/logo.svg";
import name from "../../assets/name.svg";
import logoutIcon from "../../assets/logout2.svg";
import profile from "../../assets/user-check.svg";
import faq from "../../assets/faq.svg";
import { AppButton, AppContainer } from "../ui";
import { useAdminAuth } from "../../utility/adminSession";
import "./HeaderForAdminPanel.css";

const COUNTRY_OPTIONS = ["US", "PK", "GB", "FR", "DE"];

const Header = () => {
  const [selectedCountry, setSelectedCountry] = useState("PK");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const notifications = useMemo(() => [], []);

  const dropdownRef = useRef(null);
  const notificationRef = useRef(null);
  const navigate = useNavigate();
  const { isAuthenticated, logout: logoutAdmin, user } = useAdminAuth();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setIsNotificationsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await logoutAdmin();
    navigate("/", { replace: true });
  };

  const unreadCount = notifications.filter((notification) => notification.isNew).length;
  const displayName = user?.name || user?.username || "Admin";
  const profileImageUrl = avatar;

  return (
    <header className="app-header-shell">
      <AppContainer className="flex w-full justify-between items-center py-4 gap-4">
        <div className="flex items-center gap-x-2">
          <img src={logo} alt="Logo" className="h-6 sm:h-8" />
          <img src={name} alt="Name" className="h-4 sm:h-6 mt-2" />
          <span className="app-status-pill hidden sm:inline-flex">Business</span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <label className="hidden md:inline-flex items-center">
            <span className="sr-only">Select admin locale</span>
            <select
              value={selectedCountry}
              onChange={(event) => setSelectedCountry(event.target.value)}
              className="admin-country-select"
              aria-label="Select admin locale"
            >
              {COUNTRY_OPTIONS.map((code) => (
                <option key={code} value={code}>
                  {code}
                </option>
              ))}
            </select>
          </label>

          <div className="relative" ref={notificationRef}>
            <button type="button" onClick={() => setIsNotificationsOpen((prev) => !prev)} className="relative">
              <img src={bell} alt="Notifications" className="size-[26px]" />
              {unreadCount > 0 ? (
                <span className="absolute top-0 right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
                  {unreadCount}
                </span>
              ) : null}
            </button>

            {isNotificationsOpen ? (
              <div className="absolute right-0 mt-3 w-[320px] max-w-[90vw] app-panel z-50">
                <div className="p-4 border-b border-slate-200">
                  <h1 className="text-ink-900 font-semibold text-base">Notifications</h1>
                </div>
                <p className="text-sm text-ink-500 text-center p-4">There are no notifications yet.</p>
              </div>
            ) : null}
          </div>

          <div className="h-6 w-px bg-slate-300" />

          <div className="relative" ref={dropdownRef}>
            <button type="button" onClick={() => setIsDropdownOpen((prev) => !prev)} className="relative">
              <img src={profileImageUrl} alt="Avatar" className="size-[38px] rounded-full object-cover" />
              <div className="h-3 w-3 rounded-full absolute top-[25px] left-[25px] bg-brand-500 border border-white" />
            </button>

            {isDropdownOpen ? (
              <div className="absolute right-0 w-64 mt-2 bg-white border border-gray-200 rounded-md shadow-lg z-50 overflow-hidden">
                <div className="flex items-center px-4 py-3 gap-3">
                  <img src={profileImageUrl} alt="Avatar" className="size-[38px] rounded-full object-cover" />
                  <div>
                    <h1 className="text-ink-900 font-semibold text-sm">{displayName}</h1>
                    <div className="text-xs text-ink-500">{isAuthenticated ? "Admin" : "Admin Session"}</div>
                  </div>
                </div>
                <div className="border-t border-slate-200" />
                <Link to="/profile" className="flex items-center px-4 py-3 hover:bg-slate-50 text-sm text-ink-700">
                  <img src={profile} alt="Profile" className="mr-3 size-[18px]" />
                  My Profile
                </Link>
                <Link to="/faq" className="flex items-center px-4 py-3 hover:bg-slate-50 text-sm text-ink-700">
                  <img src={faq} alt="FAQ" className="mr-3 size-[18px]" />
                  FAQ
                </Link>
                <div className="border-t border-slate-200" />
                <div className="px-4 py-3">
                  <AppButton onClick={handleSignOut} variant="secondary" className="w-full flex items-center justify-center gap-2">
                    <img src={logoutIcon} alt="Sign Out" className="size-[14px]" />
                    Sign Out
                  </AppButton>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </AppContainer>
    </header>
  );
};

export default Header;
