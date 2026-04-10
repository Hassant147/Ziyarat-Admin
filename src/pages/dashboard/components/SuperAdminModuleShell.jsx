import React from "react";
import { useNavigate } from "react-router-dom";
import { AppButton, AppCard, AppContainer, AppSectionHeader } from "../../../components/ui";

const SuperAdminModuleShell = ({
  title,
  subtitle,
  toolbar = null,
  showBackButton = true,
  children,
}) => {
  const navigate = useNavigate();
  const actionAlignmentClass = toolbar ? "items-end" : "items-center";
  const hasActionContent = showBackButton || Boolean(toolbar);

  return (
    <section className="app-main-shell py-5">
      <AppContainer className="app-content-stack pb-8">
        <AppCard className="border-slate-200">
          <AppSectionHeader
            title={title}
            subtitle={subtitle}
            action={hasActionContent ? (
              <div className={`flex flex-wrap gap-2 ${actionAlignmentClass}`}>
                {showBackButton ? (
                  <AppButton
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(-1)}
                    className="min-w-[84px]"
                  >
                    Back
                  </AppButton>
                ) : null}
                {toolbar}
              </div>
            ) : null}
          />
        </AppCard>
        {children}
      </AppContainer>
    </section>
  );
};

export default React.memo(SuperAdminModuleShell);
