import React from "react";
import { Layout, theme } from "antd";
import StaffContent from "../components/sidebar/staff/StaffContent";
import StaffHeader from "../components/sidebar/staff/StaffHeader";
import StaffSider from "../components/sidebar/staff/StaffSider";

const StaffLayout = () => {
  return (
    <Layout>
      <StaffHeader />
      <Layout>
        <StaffSider />
        <StaffContent />
      </Layout>
    </Layout>
  );
};

export default StaffLayout;
