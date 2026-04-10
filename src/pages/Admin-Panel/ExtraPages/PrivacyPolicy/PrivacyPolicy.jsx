import React from "react";
import AdminPanelLayout from "../../../../components/layout/AdminPanelLayout";

const sections = [
  {
    title: "Information We Use",
    body: [
      "Ziyarat Admin may process account details, role assignments, approval activity, package management changes, and operational support records.",
      "We also process basic technical data needed to keep the admin console secure and functional.",
    ],
  },
  {
    title: "How Information Is Used",
    body: [
      "Information is used to authenticate users, enforce permissions, manage platform content, review requests, and support bookings and receivables.",
      "Data may also be used to detect abuse, investigate incidents, and improve Ziyarat platform operations.",
    ],
  },
  {
    title: "Information Sharing",
    body: [
      "Data is shared only with authorized personnel, service providers, or systems required to operate the platform.",
      "We do not use admin data for unrelated legacy pilgrimage workflows.",
    ],
  },
  {
    title: "Retention and Security",
    body: [
      "We keep information only as long as needed for platform operations, legal obligations, and audit requirements.",
      "Access controls, logging, and standard security practices are used to protect platform data.",
    ],
  },
  {
    title: "Contact",
    body: [
      "Questions about privacy handling should be routed through the organization-approved support channel for the Ziyarat deployment.",
    ],
  },
];

const PrivacyPolicy = () => {
  return (
    <AdminPanelLayout
      title="Privacy Policy"
      subtitle="How admin data is collected, used, and protected."
      mainClassName="py-5 bg-gray-50"
    >
      <div className="min-h-screen bg-gray-50 flex flex-col justify-start">
        <main>
          <div className="mt-10">
            <h2 className="text-center text-3xl text-gray-900">
              Privacy Policy
            </h2>
            <div className="flex flex-col items-center py-8">
              <div className="w-[90%] mx-auto px-3 px-lg-0 text-justify">
                <p className="mb-8 text-base font-medium leading-relaxed text-gray-600">
                  This policy explains how the Ziyarat Admin platform handles
                  operational and account data.
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
        </main>
      </div>
    </AdminPanelLayout>
  );
};

export default PrivacyPolicy;
