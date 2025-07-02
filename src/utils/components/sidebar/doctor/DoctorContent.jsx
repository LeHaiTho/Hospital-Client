import React from "react";
import { Route, Routes } from "react-router-dom";
import { Layout } from "antd";
import Appointments from "../../../../pages/doctor/Appointments";
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
        <Route path="/appointments" element={<Appointments />} />
        <Route
          path="/appointments/exam-result/:appointmentCode"
          element={<ExamResultForm />}
        />
      </Routes>
    </Content>
  );
};

export default DoctorContent;
