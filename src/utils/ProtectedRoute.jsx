import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { jwtDecode } from "jwt-decode";
const ProtectedRoute = ({ children, role }) => {
  const { user } = useSelector((state) => state.auth);
  const token = localStorage.getItem("token");
  const safelyDecodeToken = (token) => {
    if (typeof token !== "string") {
      console.error("Token is not a string:", token);
    }
    try {
      return jwtDecode(token);
    } catch (error) {
      console.error("Error decoding token:", error);
      return null;
    }
  };

  if (!token) {
    console.log("No token found, redirecting to login");
    return <Navigate to="/login" replace />;
  }

  const decodedToken = safelyDecodeToken(token);

  if (!decodedToken) {
    console.log("Invalid token, clearing and redirecting to login");
    localStorage.removeItem("token");
    return <Navigate to="/login" replace />;
  }

  if (decodedToken.role !== role) {
    console.log(
      `User role ${decodedToken.role} does not match required role ${role}`
    );
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;
