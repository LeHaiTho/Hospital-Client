export const handleNavigation = (role, navigate) => {
  switch (role) {
    case "admin":
      navigate("/admin");
      break;
    case "doctor":
      navigate("/doctor");
      break;
    case "manager":
      navigate("/manager");
      break;
    case "staff":
      navigate("/staff");
      break;
    default:
      navigate("/");
      break;
  }
};
