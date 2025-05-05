import React from "react";
import { Route, Routes } from "react-router-dom";
import { Layout, theme } from "antd";
import ListDoctors from "../../features/doctor/ListDoctors";
import DoctorSchedule from "../../features/doctor/DoctorSchedule";
import ListUsers from "../../features/user/ListUsers";
// import ListHospital from "../../features/hospital/ListHospital";
import AddHospital from "../../features/hospital/AddHospital";
import EditHospital from "../../features/hospital/EditHospital";
import SpecialtiesAdminPage from "../../pages/admin/SpecialtiesAdminPage";
import HospitalAdminPage from "../../pages/admin/HospitalAdminPage";
const { Content } = Layout;

const AppContent = () => {
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
        <Route path="/users" element={<ListUsers />}></Route>
        {/* <Route path="/hospitals" element={<ListHospital />}></Route> */}
        <Route path="/hospitals/add-new" element={<AddHospital />}></Route>
        <Route path="/hospitals/edit" element={<EditHospital />}></Route>
        {/* Route cho Doctor */}
        <Route path="/doctor/list" element={<ListDoctors />} />
        <Route path="/doctor/schedules" element={<DoctorSchedule />} />
        <Route path="/hospitals/list" element={<HospitalAdminPage />} />
        <Route path="/specialties/list" element={<SpecialtiesAdminPage />} />
      </Routes>
    </Content>
  );
};

export default AppContent;
