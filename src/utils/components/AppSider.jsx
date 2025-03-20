import React, { useState } from "react";
import { Menu } from "antd";
import { FaRegUser } from "react-icons/fa";
import { RiHospitalLine } from "react-icons/ri";
import { LiaUserNurseSolid } from "react-icons/lia";
import { Layout, theme } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import Logo from "./Logo";
import { MdFolderSpecial } from "react-icons/md";

const { Sider } = Layout;

const AppSider = () => {
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

  // const items = [
  //   {
  //     key: "users",
  //     icon: <FaRegUser size={15} />,
  //     label: "Người dùng",
  //   },
  //   {
  //     key: "hospitals/list",
  //     label: "Cơ sở y tế",
  //     icon: <RiHospitalLine size={15} />,
  //   },
  //   {
  //     label: "Bác sĩ",
  //     icon: <LiaUserNurseSolid size={20} />,
  //     children: [
  //       {
  //         key: "doctor/list",
  //         label: "Thông tin",
  //       },
  //       {
  //         key: "doctor/schedules",
  //         label: "Lịch làm việc",
  //       },
  //     ],
  //   },
  // ];
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
      label: "Bác sĩ",
      icon: <LiaUserNurseSolid size={25} />,
      children: [
        {
          key: "doctor/list",
          label: "Thông tin",
        },
        {
          key: "doctor/schedules",
          label: "Lịch làm việc",
        },
      ],
    },
  ];

  const {
    token: { colorBgContainer },
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
      <Logo />
      <Menu
        onClick={handleClick}
        onOpenChange={handleOpenChange}
        className="menu-bar"
        mode="inline"
        style={{
          borderRight: 0,
        }}
        items={items}
        selectedKeys={[location.pathname.substring(1)]}
        openKeys={openKeys}
      />
    </Sider>
  );
};

export default AppSider;
