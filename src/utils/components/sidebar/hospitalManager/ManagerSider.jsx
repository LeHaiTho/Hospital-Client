import React, { useState } from "react";
import { Menu } from "antd";
import { FaRegUser } from "react-icons/fa";
import { RiHospitalLine } from "react-icons/ri";
import { LiaUserNurseSolid } from "react-icons/lia";
import { Layout, theme } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import { FaUserDoctor } from "react-icons/fa6";
import { MdFolderSpecial } from "react-icons/md";
import { FaHospitalUser } from "react-icons/fa6";
import { FaCalendarAlt } from "react-icons/fa";
import { MdMeetingRoom } from "react-icons/md";
import { FaListOl } from "react-icons/fa";
import { MdPlaylistAddCheckCircle } from "react-icons/md";
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
      key: "",
      label: "Dashboard",
      icon: <FaRegUser size={25} />,
    },
    {
      key: "hospital-info",
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
        {
          key: "room",
          label: "Phòng làm việc",
          icon: <MdMeetingRoom size={20} />,
        },
      ],
    },

    {
      // key: "doctor-list",
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
    // {
    //   key: "specialty-info",
    //   label: "Chuyên khoa dịch vụ",
    //   icon: <RiHospitalLine size={15} />,
    // },
    // Các mục menu khác tùy theo manager
  ];

  const {
    token: { colorBgContainer },
    shadows,
  } = theme.useToken();

  return (
    <Sider
      style={{
        background: colorBgContainer,
        minHeight: "100vh",
        overflow: "auto",
        height: "100vh",
        position: "fixed",
        insetInlineStart: 0,
        top: 0,
        bottom: 0,
        // scrollbarWidth: "thin",
        // scrollbarGutter: "stable",
        // boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
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
