import React, { useState } from "react";
import Logo from "../../Logo";
import { Header } from "antd/es/layout/layout";
import {
  Avatar,
  Button,
  Menu,
  Drawer,
  Input,
  List,
  Badge,
  Tooltip,
} from "antd";
import { DownOutlined } from "@ant-design/icons";
import { Dropdown, Space } from "antd";
import { MdArrowDropDown } from "react-icons/md";
import { PiSignOutFill } from "react-icons/pi";
import { FaRegUser } from "react-icons/fa";
import { CiUser } from "react-icons/ci";
import {
  UserOutlined,
  LogoutOutlined,
  SearchOutlined,
  CloseOutlined,
  SettingOutlined,
  MailOutlined,
} from "@ant-design/icons";
import { useDispatch } from "react-redux";
import { logout } from "../../../../redux/slices/authSlice";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { MdMarkEmailRead } from "react-icons/md";
import { FaHospitalUser } from "react-icons/fa";
import { BiSolidMessageDetail } from "react-icons/bi";
import { IoSettings } from "react-icons/io5";
import { IoLogOut } from "react-icons/io5";
import { FaBell } from "react-icons/fa";

const ManagerHeader = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const showDrawer = () => {
    setOpen(true);
  };
  const onClose = () => {
    setOpen(false);
  };
  const { user } = useSelector((state) => state.auth);

  const menuItems = [
    {
      icon: <FaHospitalUser size={20} style={{ color: "#0165FF" }} />,
      text: "Thông tin cá nhân",
      color: "#D3E6FF",
    },
    {
      icon: <BiSolidMessageDetail size={20} style={{ color: "#0165FF" }} />,
      text: "Tin nhắn",
      color: "#D3E6FF",
    },
    {
      icon: <IoSettings size={20} style={{ color: "#0165FF" }} />,
      text: "Cài đặt",
      color: "#D3E6FF",
    },
    {
      icon: <IoLogOut size={20} style={{ color: "#FF0000" }} />,
      text: "Đăng xuất",
      color: "#FFE5D3",
      onClick: () => {
        dispatch(logout());
        navigate("/login");
      },
    },
  ];
  return (
    <Header
      className="app-header"
      style={{
        backgroundColor: "#0165FC",
        position: "sticky",
        top: 0,
        zIndex: 1,
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
      }}
    >
      {/* Search */}
      <Input
        placeholder="Tìm kiếm"
        suffix={<SearchOutlined />}
        style={{
          backgroundColor: "#D9D9D9",
          borderRadius: 10,
          width: 250,
          height: 40,
        }}
      />
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div
          style={{
            background: "#D3E6FF",
            padding: 10,
            borderRadius: 10,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Tooltip title="Tin nhắn">
            <Badge
              dot
              style={{ backgroundColor: "#FF0000", width: 7, height: 7 }}
            >
              <BiSolidMessageDetail
                size={20}
                color="#0165FF"
                style={{ cursor: "pointer" }}
              />
            </Badge>
          </Tooltip>
        </div>
        {/* Thông báo icon */}
        <div
          style={{
            background: "#D3E6FF",
            padding: 10,
            borderRadius: 10,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Tooltip title="Thông báo">
            <Badge
              dot
              style={{ backgroundColor: "#FF0000", width: 7, height: 7 }}
            >
              <FaBell size={20} color="#0165FF" style={{ cursor: "pointer" }} />
            </Badge>
          </Tooltip>
        </div>
        <div
          onClick={showDrawer}
          style={{
            cursor: "pointer",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            display: "flex",

            gap: 10,
          }}
        >
          {/* tên người dùng */}
          <Avatar
            src="https://img.freepik.com/premium-photo/3d-avatar-cartoon-character_113255-103130.jpg"
            size={40}
            style={{
              backgroundColor: "#D9D9D9",
              borderRadius: 10,
            }}
          />
        </div>
      </div>
      <Drawer
        title="Thông tin người dùng"
        closeIcon={<CloseOutlined />}
        onClose={onClose}
        placement="right"
        open={open}
        style={{
          backgroundColor: "#fff",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <Avatar
            src="https://img.freepik.com/premium-photo/3d-avatar-cartoon-character_113255-103130.jpg"
            size={70}
            style={{
              backgroundColor: "#D9D9D9",
              borderRadius: 10,
            }}
          />
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              gap: 10,
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
              }}
            >
              <span style={{ fontSize: 16, fontWeight: 500 }}>
                {user?.username}
              </span>
              <span style={{ fontSize: 14, color: "#808080" }}>
                {user?.role?.name || user?.role}
              </span>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                gap: 2,
                cursor: "pointer",
                alignItems: "center",
              }}
            >
              <MdMarkEmailRead style={{ color: "#0165FF" }} size={20} />
              <span style={{ fontSize: 14, color: "#0165fc" }}>
                {user?.username}
              </span>
            </div>
          </div>
        </div>
        <div style={{ marginTop: 20 }}>
          {menuItems?.map((item, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                cursor: "pointer",
                padding: "10px 0",
                borderBottom: "1px solid #D9D9D9",
              }}
              onClick={item.onClick}
            >
              <div
                style={{
                  backgroundColor: item.color,
                  padding: 10,
                  borderRadius: 10,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {item.icon}
              </div>
              <p style={{ fontWeight: 400, color: "#000" }}>{item.text}</p>
            </div>
          ))}
        </div>
      </Drawer>
    </Header>
  );
};

export default ManagerHeader;
