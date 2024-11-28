import React from "react";
import { Route, Routes } from "react-router-dom";
import { Card, Layout, theme } from "antd";
import AppointmentList from "../../../../pages/staff/AppointmentList";

const { Content } = Layout;

const StaffContent = () => {
  const {
    token: { borderRadiusLG },
  } = theme.useToken();
  return (
    <Content
      style={{
        minHeight: 280,
        padding: 16,
      }}
    >
      <Routes>
        <Route path="/appointment-list/all" element={<AppointmentList />} />
      </Routes>
    </Content>
  );
};

export default StaffContent;
