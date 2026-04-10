import React, { useState } from "react";
import { BiErrorAlt } from "react-icons/bi";
import { useNavigate } from "react-router-dom";
import FooterForSignup from "../../components/Footers/FooterForSingup";
import Loader from "../../components/loader";
import { AppButton, AppContainer } from "../../components/ui";
import bgimg from "../../assets/bgImage.png";
import { useAdminAuth } from "../../utility/adminSession";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAdminAuth();
  const [formValues, setFormValues] = useState({
    username: "",
    password: "",
  });
  const [errors, setErrors] = useState({ username: "", password: "" });
  const [apiError, setApiError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const nextErrors = {
      username: formValues.username.trim() ? "" : "Username is required.",
      password: formValues.password ? "" : "Password is required.",
    };

    setErrors(nextErrors);
    setApiError("");

    if (nextErrors.username || nextErrors.password) {
      return;
    }

    setIsLoading(true);

    try {
      const result = await login({
        username: formValues.username,
        password: formValues.password,
      });

      if (result.ok) {
        navigate("/super-admin-dashboard", { replace: true });
        return;
      }

      setApiError(result.message || "Unable to sign in.");
    } catch (error) {
      setApiError("Unable to reach the admin auth service.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="flex flex-col min-h-screen"
      style={{
        backgroundImage: `linear-gradient(180deg, rgba(255,255,255,0.88), rgba(244,247,247,0.92)), url(${bgimg})`,
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
      }}
    >
      <main className="flex-grow flex items-center py-8">
        <AppContainer>
          <div className="max-w-md mx-auto app-card px-6 py-10 md:px-8">
            <h2 className="text-xl font-semibold text-ink-900 text-center">Admin sign in</h2>
            <p className="mt-2 mb-6 text-sm text-ink-500 text-center">
              Use your backend-managed admin credentials to continue.
            </p>

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="username" className="block text-sm font-semibold text-ink-700 mb-1.5">
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  autoComplete="username"
                  value={formValues.username}
                  onChange={(event) => {
                    setFormValues((currentValues) => ({
                      ...currentValues,
                      username: event.target.value,
                    }));
                    if (errors.username || apiError) {
                      setErrors((currentErrors) => ({
                        ...currentErrors,
                        username: "",
                      }));
                      setApiError("");
                    }
                  }}
                  className={`mt-1 block w-full rounded-xl border bg-white px-4 py-3 text-sm text-ink-900 shadow-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100 ${
                    errors.username ? "border-red-500" : "border-slate-200"
                  }`}
                  placeholder="Enter your admin username"
                />
                {errors.username ? <p className="mt-2 text-sm text-red-600">{errors.username}</p> : null}
              </div>

              <div className="mb-4">
                <label htmlFor="password" className="block text-sm font-semibold text-ink-700 mb-1.5">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={formValues.password}
                  onChange={(event) => {
                    setFormValues((currentValues) => ({
                      ...currentValues,
                      password: event.target.value,
                    }));
                    if (errors.password || apiError) {
                      setErrors((currentErrors) => ({
                        ...currentErrors,
                        password: "",
                      }));
                      setApiError("");
                    }
                  }}
                  className={`mt-1 block w-full rounded-xl border bg-white px-4 py-3 text-sm text-ink-900 shadow-sm outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100 ${
                    errors.password ? "border-red-500" : "border-slate-200"
                  }`}
                  placeholder="Enter your password"
                />
                {errors.password ? <p className="mt-2 text-sm text-red-600">{errors.password}</p> : null}
              </div>

              {apiError ? (
                <div className="text-red-500 text-sm flex items-center gap-1 mt-1 mb-4">
                  <BiErrorAlt />
                  <span>{apiError}</span>
                </div>
              ) : null}

              <AppButton
                type="submit"
                className={`w-full ${isLoading ? "opacity-60 cursor-not-allowed" : ""}`}
                disabled={isLoading}
              >
                {isLoading ? <Loader /> : "Continue"}
              </AppButton>
            </form>
          </div>
        </AppContainer>
      </main>

      <FooterForSignup />
    </div>
  );
};

export default LoginPage;
