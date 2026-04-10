import React from "react";
import AdminPanelLayout from "../../../../components/layout/AdminPanelLayout";

const DocumentationPage = () => {
  return (
    <AdminPanelLayout
      title="Documentation"
      subtitle="Guides and reference material for admin and partner operations."
      mainClassName="py-5 bg-[#f6f6f6]"
    >
      <div className="mt-10 text-center app-card p-10">
        <h2 className="text-2xl font-bold mb-4">Documentation</h2>
        <p className="text-gray-600">Page coming soon.</p>
      </div>
    </AdminPanelLayout>
  );
};

export default DocumentationPage;
