import React from "react";
import { Layout, theme } from "antd";
import AppHeader from "../components/AppHeader";
import AppSider from "../components/AppSider";
import AppContent from "../components/AppContent";

const AdminLayout = () => {
  return (
    <Layout hasSider>
      <AppSider />
      <Layout style={{ minHeight: "100vh", marginInlineStart: 200 }}>
        <AppHeader />
        <AppContent />
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
