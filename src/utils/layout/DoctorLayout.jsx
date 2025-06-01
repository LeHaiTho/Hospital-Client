import React, { useState, useEffect } from "react";
import { Layout, Menu, theme } from "antd";
import {
  DashboardOutlined,
  UserOutlined,
  CalendarOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  FileDoneOutlined,
} from "@ant-design/icons";
import { FaUserInjured } from "react-icons/fa";
import { MdMedicalServices } from "react-icons/md";
import { useLocation, useNavigate } from "react-router-dom";
import DoctorContent from "../components/sidebar/doctor/DoctorContent";
import DoctorHeader from "../components/sidebar/doctor/DoctorHeader";

const { Sider } = Layout;

const items = [
  {
    key: "appointment-management",
    label: "Quản lý lịch hẹn",
    icon: <CalendarOutlined style={{ fontSize: "20px" }} />,
    children: [
      {
        key: "appointments",
        label: "Lịch hẹn khám",
        icon: <CalendarOutlined style={{ fontSize: "16px" }} />,
      },
    ],
  },
];

const getLevelKeys = (items1) => {
  const key = {};
  const func = (items2, level = 1) => {
    items2.forEach((item) => {
      if (item.key) {
        key[item.key] = level;
      }
      if (item.children) {
        func(item.children, level + 1);
      }
    });
  };
  func(items1);
  return key;
};

const levelKeys = getLevelKeys(items);

const routeMap = {
  appointments: "/doctor/appointments",
};

const DoctorLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [stateOpenKeys, setStateOpenKeys] = useState(["patient-management"]);
  const [selectedKeys, setSelectedKeys] = useState(["dashboard"]);

  const {
    token: { colorBgContainer },
  } = theme.useToken();

  // Update selectedKeys and openKeys based on current route
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
        {/* <div
          style={{
            height: 64,
            margin: 16,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            borderRadius: 8,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontWeight: "bold",
            fontSize: "18px",
          }}
        >
          <MdMedicalServices size={24} style={{ marginRight: 8 }} />
          Doctor Panel
        </div> */}
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
        <DoctorHeader />
        <DoctorContent />
      </Layout>
    </Layout>
  );
};

export default DoctorLayout;
