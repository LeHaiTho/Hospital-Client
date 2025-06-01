import React from "react";
import { Route, Routes } from "react-router-dom";
import { Layout } from "antd";
import DoctorDashboard from "../../../../pages/doctor/DoctorDashboard";
import PatientList from "../../../../pages/doctor/PatientList";
import Appointments from "../../../../pages/doctor/Appointments";
import MedicalRecords from "../../../../pages/doctor/MedicalRecords";
import Schedule from "../../../../pages/doctor/Schedule";
import TimeOffRequest from "../../../../pages/doctor/TimeOffRequest";
import Profile from "../../../../pages/doctor/Profile";
import Settings from "../../../../pages/doctor/Settings";
import ExamResultForm from "../../../../pages/doctor/ExamResultForm";

const { Content } = Layout;

const DoctorContent = () => {
  return (
    <Content
      style={{
        minHeight: 280,
        padding: 16,
        backgroundColor: "#EAEDF7",
        overflow: "initial",
      }}
    >
      <Routes>
        <Route path="/" element={<DoctorDashboard />} />
        <Route path="/dashboard" element={<DoctorDashboard />} />
        <Route path="/patients" element={<PatientList />} />
        <Route path="/appointments" element={<Appointments />} />
        <Route
          path="/appointments/exam-result/:appointmentCode"
          element={<ExamResultForm />}
        />
        <Route path="/medical-records" element={<MedicalRecords />} />
        <Route path="/schedule" element={<Schedule />} />
        <Route path="/time-off" element={<TimeOffRequest />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Content>
  );
};

export default DoctorContent;
