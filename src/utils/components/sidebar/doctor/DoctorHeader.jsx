import React from "react";
import { Layout, Button, Dropdown, Avatar, Space } from "antd";
import {
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
const { Header } = Layout;

const DoctorHeader = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  console.log(user);
  const handleLogout = () => {
    // Add logout logic here
    localStorage.removeItem("token");
    localStorage.removeItem("userInfo");
    navigate("/login");
  };

  const menuItems = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Thông tin cá nhân",
      onClick: () => navigate("/doctor/profile"),
    },
    {
      key: "settings",
      icon: <SettingOutlined />,
      label: "Cài đặt",
      onClick: () => navigate("/doctor/settings"),
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Đăng xuất",
      onClick: handleLogout,
    },
  ];

  return (
    <Header
      style={{
        padding: "0 24px",
        background: "#0165fc",
        display: "flex",
        justifyContent: "flex-end",
        alignItems: "center",
        borderBottom: "1px solid #f0f0f0",
      }}
    >
      {/* <div>
        <h2 style={{ margin: 0, color: "#1890ff" }}>
          Hệ thống quản lý - Bác sĩ
        </h2>
      </div> */}
      <Space>
        <Dropdown menu={{ items: menuItems }} placement="bottomRight" arrow>
          <Button type="text" style={{ height: "auto", padding: "4px 8px" }}>
            <Space>
              <Avatar size="large" icon={<UserOutlined />} />
              {user?.fullname && <span>Bác sĩ {user.fullname}</span>}
            </Space>
          </Button>
        </Dropdown>
      </Space>
    </Header>
  );
};

export default DoctorHeader;
