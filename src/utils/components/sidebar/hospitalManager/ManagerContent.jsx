import React from "react";
import { Route, Routes } from "react-router-dom";
import { Card, Layout, theme } from "antd";
import HospitalInfo from "../../../../pages/hospitalManager/HospitalInfo";
import SpecialtyInfo from "../../../../pages/hospitalManager/SpecialtyInfo";
import DoctorList from "../../../../pages/hospitalManager/DoctorList";
import ScheduleDoctor from "../../../../pages/hospitalManager/ScheduleDoctor";
import SpecialtyList from "../../../../pages/hospitalManager/SpecialtyList";
import WorkingSchedule from "../../../../pages/hospitalManager/WorkingSchedule";
import TimeOffList from "../../../../pages/hospitalManager/TimeOffList";
import Dashboard from "../../../../pages/hospitalManager/Dashboard";
import HistoryBooking from "../../../../pages/hospitalManager/HistoryBooking";
const { Content } = Layout;

const ManagerContent = () => {
  const {
    token: { borderRadiusLG },
  } = theme.useToken();
  return (
    <Content
      style={{
        minHeight: 280,
        padding: 16,
        backgroundColor: "#EAEDF7",
        overflow: "initial",
        // margin: "16px",
      }}
    >
      <Routes>
        <Route path="/hospital-info" element={<HospitalInfo />} />
        <Route path="/specialty-info" element={<SpecialtyInfo />} />
        <Route path="/doctor-list" element={<DoctorList />} />
        <Route path="/schedule-doctor" element={<ScheduleDoctor />} />
        <Route path="/specialty-list" element={<SpecialtyList />} />
        <Route path="/working-schedule" element={<WorkingSchedule />} />
        {/* <Route path="/room" element={<RoomList />} /> */}
        <Route path="/time-off-list" element={<TimeOffList />} />
        <Route path="/history-booking" element={<HistoryBooking />} />
        <Route path="/" element={<Dashboard />} />
      </Routes>
    </Content>
  );
};

export default ManagerContent;
