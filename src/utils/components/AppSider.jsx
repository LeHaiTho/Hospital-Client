import React, { useState, useEffect } from "react";
import { Layout, Menu, theme } from "antd";
import { RiHospitalLine } from "react-icons/ri";
import { MdFolderSpecial } from "react-icons/md";
import { LiaUserNurseSolid } from "react-icons/lia";
import { FaRegUser } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";

const { Sider } = Layout;

const items = [
  {
    key: "hospitals/list",
    label: "Cơ sở y tế",
    icon: <RiHospitalLine size={25} />,
  },
  {
    key: "specialties/list",
    icon: <MdFolderSpecial size={25} />,
    label: "Chuyên khoa",
  },
  {
    key: "doctor/list",
    label: "Bác sĩ",
    icon: <LiaUserNurseSolid size={25} />,
  },
  {
    key: "users",
    icon: <FaRegUser size={25} />,
    label: "Người dùng",
  },
];

const routeMap = {
  "hospitals/list": "/admin/hospitals/list",
  "specialties/list": "/admin/specialties/list",
  "doctor/list": "/admin/doctor/list",
  users: "/admin/users",
};

const AppSider = ({ collapsed, onCollapse }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedKeys, setSelectedKeys] = useState(["hospitals/list"]);

  const {
    token: { colorBgContainer },
  } = theme.useToken();

  // Update selectedKeys based on current route
  useEffect(() => {
    const currentPath = location.pathname;
    const selectedKey = Object.keys(routeMap).find(
      (key) => routeMap[key] === currentPath
    );
    if (selectedKey) {
      setSelectedKeys([selectedKey]);
    }
  }, [location.pathname]);

  const onMenuClick = ({ key }) => {
    if (routeMap[key]) {
      navigate(routeMap[key]);
    }
  };

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={onCollapse}
      width={256}
      style={{
        background: colorBgContainer,
        overflow: "auto",
        height: "100vh",
        position: "fixed",
        left: 0,
        top: 0,
        bottom: 0,
      }}
    >
      <div
        style={{
          height: 32,
          margin: 16,
          background: "rgba(0, 0, 0, 0.2)",
          borderRadius: 6,
        }}
      />
      <Menu
        mode="inline"
        selectedKeys={selectedKeys}
        onClick={onMenuClick}
        style={{ borderRight: 0 }}
        items={items}
      />
    </Sider>
  );
};

export default AppSider;
