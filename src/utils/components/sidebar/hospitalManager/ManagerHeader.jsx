import React from "react";
import Logo from "../../Logo";
import { Header } from "antd/es/layout/layout";
import { Avatar, Button, Menu } from "antd";
import { DownOutlined } from "@ant-design/icons";
import { Dropdown, Space } from "antd";
import { MdArrowDropDown } from "react-icons/md";
import { PiSignOutFill } from "react-icons/pi";
import { FaRegUser } from "react-icons/fa";
import { CiUser } from "react-icons/ci";
import { UserOutlined, LogoutOutlined } from "@ant-design/icons";
import { useDispatch } from "react-redux";
import { logout } from "../../../../redux/slices/authSlice";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const ManagerHeader = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const items = [
    {
      label: "Thông tin tài khoản",
      key: "/info",
      icon: <UserOutlined />,
    },
    {
      type: "divider",
    },
    {
      label: "Đăng xuất",
      key: "3",
      icon: <LogoutOutlined />,
      danger: true,
      onClick: () => {
        dispatch(logout());
        navigate("/login");
      },
    },
  ];
  return (
    <Header className="app-header">
      <Logo />
      <div
        style={{
          cursor: "pointer",
        }}
      >
        <Dropdown
          menu={{
            items,
          }}
          trigger={["click"]}
          placement="bottomRight"
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <Avatar src="https://w7.pngwing.com/pngs/205/731/png-transparent-default-avatar-thumbnail.png" />
            <div
              style={{
                display: "flex",
                flexDirection: "column",
              }}
            >
              {user?.username}
            </div>
            <MdArrowDropDown size={20} />
          </div>
        </Dropdown>
      </div>
    </Header>
  );
};

export default ManagerHeader;
