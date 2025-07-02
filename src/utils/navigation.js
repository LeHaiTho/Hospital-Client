export const handleNavigation = (role, navigate) => {
  switch (role) {
    case "admin":
      navigate("/admin/hospitals/list");
      break;
    case "doctor":
      navigate("/doctor/appointments");
      break;
    case "manager":
      navigate("/manager/hospital-info");
      break;
    default:
      navigate("/");
      break;
  }
};
