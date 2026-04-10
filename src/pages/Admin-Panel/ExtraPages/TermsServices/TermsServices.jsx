import React, { useEffect } from "react";
import AdminPanelLayout from "../../../../components/layout/AdminPanelLayout";

const sections = [
  {
    title: "Platform Agreement",
    body: [
      "Ziyarat Admin is the internal management surface for the Ziyarat platform.",
      "By using the admin tools, you agree to follow the platform rules, access controls, and operational workflows configured by the organization.",
    ],
  },
  {
    title: "Authorized Use",
    body: [
      "Access is limited to approved staff and operators.",
      "You must protect your credentials, act only within your assigned permissions, and keep business data confidential.",
    ],
  },
  {
    title: "Operational Scope",
    body: [
      "The admin console supports Ziyarat package, booking, hotel catalog, profile review, receivable, and support operations.",
      "Route, city, and package semantics must follow the Ziyarat model for Iraq, Iran, and Iran-Iraq service lines.",
    ],
  },
  {
    title: "Prohibited Conduct",
    body: [
      "Do not attempt unauthorized access, data extraction, fraud, account sharing, or interference with platform operations.",
      "Do not use the admin console to introduce legacy pilgrimage product content into active Ziyarat workflows.",
    ],
  },
  {
    title: "Service Changes",
    body: [
      "Ziyarat may update admin workflows, labels, endpoints, and operational rules as the platform evolves.",
      "Continued use after an update means you accept the revised terms for administrative access.",
    ],
  },
  {
    title: "Contact",
    body: [
      "For policy or access questions, use the organization-approved support and operations channels configured for the deployment.",
    ],
  },
];

const TermsServices = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <AdminPanelLayout
      title="Terms of Service"
      subtitle="Admin platform terms for Ziyarat operations."
      mainClassName="py-5 bg-gray-50"
    >
      <div className="min-h-screen bg-gray-50 flex flex-col justify-start sm:px-6 lg:px-8">
        <div className="mt-10">
          <h2 className="text-center text-3xl text-gray-900">
            Terms of Service
          </h2>
          <div className="flex flex-col items-center py-8">
            <div className="w-[90%] mx-auto px-3 px-lg-0 text-justify">
              <p className="mb-8 text-base font-medium leading-relaxed text-gray-600">
                These terms govern use of the Ziyarat admin console and the
                operational content managed through it.
              </p>
              <div className="space-y-8">
                {sections.map((section) => (
                  <section key={section.title}>
                    <h3 className="mx-auto mb-3 text-2xl text-black">
                      {section.title}
                    </h3>
                    <div className="space-y-3">
                      {section.body.map((line) => (
                        <p
                          key={line}
                          className="mb-0 text-base font-medium leading-relaxed text-gray-600"
                        >
                          {line}
                        </p>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminPanelLayout>
  );
};

export default TermsServices;
