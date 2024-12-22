import React from "react";
import { Layout, theme } from "antd";
import ManagerHeader from "../components/sidebar/hospitalManager/ManagerHeader";
import ManagerSider from "../components/sidebar/hospitalManager/ManagerSider";
import ManagerContent from "../components/sidebar/hospitalManager/ManagerContent.jsx";
const ManagerLayout = () => {
  return (
    <Layout hasSider>
      <ManagerSider />
      <Layout style={{ minHeight: "100vh", marginInlineStart: 200 }}>
        <ManagerHeader />
        <ManagerContent />
      </Layout>
    </Layout>
  );
};

export default ManagerLayout;
