import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import ProtectedRoute from "./utils/ProtectedRoute";
import Login from "./pages/auth/Login";
import AdminLayout from "./utils/layout/adminLayout";
import DoctorLayout from "./utils/layout/DoctorLayout";
import ManagerLayout from "./utils/layout/ManagerLayout";
import Unauthorized from "./utils/Unauthorized";
import { useDispatch } from "react-redux";
import { login, logout, setUserInfo } from "./redux/slices/authSlice";
import axiosConfig from "./apis/axiosConfig";
import ChangePasswordFirstLogin from "./pages/auth/ChangePasswordFirstLogin";
import ExamResult from "./pages/auth/ExamResult";
const App = () => {
  const dispatch = useDispatch();
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const fetchUserInfo = async () => {
        try {
          const response = await axiosConfig.get("/auth/user-info");
          dispatch(setUserInfo(response.user));

          console.log("response", response);
        } catch (error) {
          console.log("error", error);
          dispatch(logout());
        }
      };
      fetchUserInfo();
    }
  }, []);
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/change-password-first-login"
        element={<ChangePasswordFirstLogin />}
      />
      <Route path="/exam-result" element={<ExamResult />} />
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute role="admin">
            <AdminLayout />
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor/*"
        element={
          <ProtectedRoute role="doctor">
            <DoctorLayout />
          </ProtectedRoute>
        }
      />
      <Route
        path="/manager/*"
        element={
          <ProtectedRoute role="manager">
            <ManagerLayout />
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/unauthorized" element={<Unauthorized />} />
    </Routes>
  );
};

export default App;
