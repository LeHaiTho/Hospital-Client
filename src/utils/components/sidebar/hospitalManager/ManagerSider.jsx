import React, { useState } from "react";
import { Menu } from "antd";
import { FaRegUser } from "react-icons/fa";
import { RiHospitalLine } from "react-icons/ri";
import { LiaUserNurseSolid } from "react-icons/lia";
import { Layout, theme } from "antd";
import { useNavigate, useLocation } from "react-router-dom";

const { Sider } = Layout;

const ManagerSider = () => {
  const [openKeys, setOpenKeys] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  const handleClick = (e) => {
    navigate(e.key);
    setOpenKeys([]);
  };

  const handleOpenChange = (keys) => {
    setOpenKeys(keys);
  };

  const items = [
    {
      key: "dashboard",
      label: "Dashboard",
      icon: <FaRegUser size={15} />,
    },
    {
      key: "hospitals",
      label: "Cơ sở của tôi",
      icon: <RiHospitalLine size={15} />,
    },
    {
      key: "hospitals",
      label: "Cơ sở của tôi",
      icon: <RiHospitalLine size={15} />,
    },
    // Các mục menu khác tùy theo manager
  ];

  const {
    token: { colorBgContainer },
    shadows,
  } = theme.useToken();

  return (
    <Sider
      width={200}
      style={{
        background: colorBgContainer,
        minHeight: "100vh",
        overflow: "auto",
        height: "100vh",
        position: "fixed",
        insetInlineStart: 0,
        top: 0,
        bottom: 0,
        scrollbarWidth: "thin",
        scrollbarGutter: "stable",
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
      }}
    >
      <Menu
        onClick={handleClick}
        onOpenChange={handleOpenChange}
        className="menu-bar"
        mode="inline"
        style={{
          // height: "100%",
          borderRight: 0,
          // boxShadow: shadows.card,
        }}
        items={items}
        selectedKeys={[location.pathname.substring(1)]}
        openKeys={openKeys}
      />
    </Sider>
  );
};

export default ManagerSider;
