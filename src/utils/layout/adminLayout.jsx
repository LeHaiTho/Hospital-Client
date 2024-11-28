import React from "react";
import { Layout, theme } from "antd";
import AppHeader from "../components/AppHeader";
import AppSider from "../components/AppSider";
import AppContent from "../components/AppContent";

const AdminLayout = () => {
  return (
    <Layout>
      <AppHeader />
      <Layout>
        <AppSider />
        <AppContent />
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
