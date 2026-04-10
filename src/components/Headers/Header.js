import React, { useEffect, useRef, useState } from "react";
import { FaBell } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
import avatar1 from "../../assets/Avatar.svg";
import ziyaratLogo from "../../assets/logoForHeader.png";
import { AppButton, AppContainer } from "../ui";
import { useAdminAuth } from "../../utility/adminSession";

const Header = () => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications] = useState([]);

  const profileRef = useRef(null);
  const notificationsRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAdminAuth();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target) &&
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target)
      ) {
        setIsProfileOpen(false);
        setIsNotificationsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const isLoginRoute = location.pathname === "/";

  const handleSignOut = async () => {
    await logout();
    navigate("/", { replace: true });
  };

  return (
    <div className="app-header-shell font-kd">
      <AppContainer className="flex items-center justify-between py-4">
        <button
          type="button"
          onClick={() => navigate(isLoginRoute ? "/" : "/super-admin-dashboard")}
          className="flex items-end space-x-4"
          aria-label="Go to dashboard"
        >
          <img src={ziyaratLogo} alt="Ziyarat" className="h-8" />
        </button>

        {!isLoginRoute ? (
          <div className="flex items-center space-x-4">
            <div className="relative" ref={notificationsRef}>
              <button
                type="button"
                className="relative flex items-center justify-center"
                onClick={() => {
                  setIsNotificationsOpen((prev) => !prev);
                  if (isProfileOpen) setIsProfileOpen(false);
                }}
              >
                <FaBell className="h-6 w-6 text-ink-500" />
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1 py-0.5 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-[#dc2626] rounded-full">
                  {notifications.length}
                </span>
              </button>

              {isNotificationsOpen ? (
                <div className="absolute right-0 mt-2 w-72 app-panel z-20 overflow-hidden">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-sm text-ink-500">No new notifications</div>
                  ) : (
                    <ul className="py-2">
                      {notifications.map((notification, index) => (
                        <li
                          key={index}
                          className="px-4 py-2 hover:bg-slate-50 cursor-pointer text-sm text-ink-700"
                        >
                          {notification}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : null}
            </div>

            <div className="w-px bg-slate-300 h-6 mx-1" />

            <div className="relative" ref={profileRef}>
              <button
                type="button"
                className="relative"
                onClick={() => {
                  setIsProfileOpen((prev) => !prev);
                  if (isNotificationsOpen) setIsNotificationsOpen(false);
                }}
              >
                <img src={avatar1} alt="User Profile" className="h-9 w-9 rounded-full" />
                <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-brand-500 ring-2 ring-white" />
              </button>

              {isProfileOpen ? (
                <div className="absolute right-0 mt-2 w-52 app-panel z-20">
                  <ul className="py-2 text-sm text-ink-700">
                    <li>
                      <button
                        type="button"
                        className="w-full px-4 py-2 text-left hover:bg-slate-50"
                        onClick={() => {
                          setIsProfileOpen(false);
                          navigate("/profile");
                        }}
                      >
                        My Profile
                      </button>
                    </li>
                    <li>
                      <button
                        type="button"
                        className="w-full px-4 py-2 text-left hover:bg-slate-50"
                        onClick={() => {
                          setIsProfileOpen(false);
                          navigate("/faq");
                        }}
                      >
                        Help & FAQ
                      </button>
                    </li>
                    <li className="px-4 py-2">
                      <AppButton
                        onClick={handleSignOut}
                        variant="secondary"
                        className="w-full justify-center"
                      >
                        Logout
                      </AppButton>
                    </li>
                  </ul>
                </div>
              ) : null}
            </div>
          </div>
        ) : null}
      </AppContainer>
    </div>
  );
};

export default Header;
