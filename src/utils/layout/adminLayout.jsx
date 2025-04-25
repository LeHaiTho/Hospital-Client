import React, { useState, useEffect } from "react";
import { Layout, Menu, theme } from "antd";
import { RiHospitalLine } from "react-icons/ri";
import { MdFolderSpecial } from "react-icons/md";
import { LiaUserNurseSolid } from "react-icons/lia";
import { FaRegUser } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
import AppHeader from "../components/AppHeader";
import AppContent from "../components/AppContent";

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
  const [stateOpenKeys, setStateOpenKeys] = useState(["hospitals/list"]);
  const [selectedKeys, setSelectedKeys] = useState(["hospitals/list"]);

  const {
    token: { colorBgContainer },
  } = theme.useToken();

  useEffect(() => {
    const currentPath = location.pathname;
    const selectedKey = Object.keys(routeMap).find(
      (key) => routeMap[key] === currentPath
    );
    if (selectedKey) {
      setSelectedKeys([selectedKey]);
      const parentKey = items
        .filter((item) => item.children)
        .find((item) =>
          item.children.some((child) => child.key === selectedKey)
        )?.key;
      if (parentKey && !stateOpenKeys.includes(parentKey)) {
        setStateOpenKeys([parentKey]);
      }
    }
  }, [location.pathname]);

  const onOpenChange = (openKeys) => {
    const currentOpenKey = openKeys.find(
      (key) => stateOpenKeys.indexOf(key) === -1
    );
    if (currentOpenKey !== undefined) {
      const repeatIndex = openKeys
        .filter((key) => key !== currentOpenKey)
        .findIndex((key) => levelKeys[key] === levelKeys[currentOpenKey]);
      setStateOpenKeys(
        openKeys
          .filter((_, index) => index !== repeatIndex)
          .filter((key) => levelKeys[key] <= levelKeys[currentOpenKey])
      );
    } else {
      setStateOpenKeys(openKeys);
    }
  };

  const onMenuClick = ({ key }) => {
    if (routeMap[key]) {
      navigate(routeMap[key]);
    }
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
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
        <Menu
          mode="inline"
          selectedKeys={selectedKeys}
          openKeys={stateOpenKeys}
          onOpenChange={onOpenChange}
          onClick={onMenuClick}
          style={{ borderRight: 0 }}
          items={items}
        />
      </Sider>
      <Layout style={{ marginLeft: collapsed ? 80 : 256 }}>
        <AppHeader />
        <AppContent />
      </Layout>
    </Layout>
  );
};

export default AppSider;
