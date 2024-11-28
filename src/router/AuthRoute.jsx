import React from "react";
import { Route, Routes } from "react-router-dom";
import Login from "../pages/auth/Login";
import ChangePasswordFirstLogin from "../pages/auth/ChangePasswordFirstLogin";

const AuthRoute = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/change-password-first-login"
        element={<ChangePasswordFirstLogin />}
      />
    </Routes>
  );
};

export default AuthRoute;
