import React, { useState, useEffect } from "react";
import { Button, Layout, Menu, theme } from "antd";
import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import { FaRegUser } from "react-icons/fa";
import { RiHospitalLine } from "react-icons/ri";
import { FaHospitalUser } from "react-icons/fa6";
import { FaCalendarAlt } from "react-icons/fa";
import { MdFolderSpecial } from "react-icons/md";
import { FaUserDoctor } from "react-icons/fa6";
import { FaListOl } from "react-icons/fa";
import { MdPlaylistAddCheckCircle } from "react-icons/md";
import { IoIosStats } from "react-icons/io";
import { useLocation, useNavigate } from "react-router-dom";
import ManagerContent from "../components/sidebar/hospitalManager/ManagerContent";
import ManagerHeader from "../components/sidebar/hospitalManager/ManagerHeader";

const { Header, Sider } = Layout;

const items = [
  {
    key: "hospital-info-parent",
    label: "Cơ sở của tôi",
    icon: <RiHospitalLine size={25} />,
    children: [
      {
        key: "hospital-info",
        label: "Thông tin cơ sở y tế",
        icon: <FaHospitalUser size={20} />,
      },
      {
        key: "working-schedule",
        icon: <FaCalendarAlt size={20} />,
        label: "Lịch hoạt động",
      },
    ],
  },
  {
    key: "specialty-parent",
    label: "Chuyên khoa",
    icon: <MdFolderSpecial size={25} />,
    children: [
      {
        key: "specialty-list",
        label: "Chuyên khoa cơ sở",
      },
      {
        key: "specialty-info",
        label: "Dịch vụ chuyên khoa",
      },
    ],
  },
  {
    key: "doctor-parent",
    label: "Bác sĩ",
    icon: <FaUserDoctor size={25} />,
    children: [
      {
        key: "doctor-list",
        label: "Danh sách bác sĩ",
        icon: <FaListOl size={20} />,
      },
      {
        key: "schedule-doctor",
        icon: <FaCalendarAlt size={20} />,
        label: "Lịch làm việc",
      },
      {
        key: "time-off-list",
        label: "Duyệt đơn",
        icon: <MdPlaylistAddCheckCircle size={20} />,
      },
    ],
  },
  {
    key: "history-booking",
    label: "Thống kê",
    icon: <IoIosStats size={25} />,
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
  "hospital-info": "/manager/hospital-info",
  "working-schedule": "/manager/working-schedule",
  "specialty-list": "/manager/specialty-list",
  "specialty-info": "/manager/specialty-info",
  "doctor-list": "/manager/doctor-list",
  "schedule-doctor": "/manager/schedule-doctor",
  "time-off-list": "/manager/time-off-list",
  "history-booking": "/manager/history-booking",
};

const ManagerLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [stateOpenKeys, setStateOpenKeys] = useState(["hospital-info-parent"]);
  const [selectedKeys, setSelectedKeys] = useState(["hospital-info"]);

  const {
    token: { colorBgContainer, borderRadiusLG },
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
        <ManagerHeader />
        <ManagerContent />
      </Layout>
    </Layout>
  );
};

export default ManagerLayout;
