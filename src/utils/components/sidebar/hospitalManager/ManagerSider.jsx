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
import { IoIosStats } from "react-icons/io";
const { Sider } = Layout;
import "../../../../index.css";

const items = [
  // {
  //   key: "",
  //   label: "Dashboard",
  //   icon: <FaRegUser size={25} />,
  // },
  {
    key: "hospital-info-parent", // Unique parent key
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
      // {
      //   key: "room",
      //   label: "Phòng làm việc",
      //   icon: <MdMeetingRoom size={20} />,
      // },
    ],
  },
  {
    key: "specialty-parent", // Unique parent key
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
    key: "doctor-parent", // Unique parent key
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

const ManagerSider = () => {
  const [openKeys, setOpenKeys] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  const [stateOpenKeys, setStateOpenKeys] = useState(["hospital-info-parent"]);
  const onOpenChange = (openKeys) => {
    const currentOpenKey = openKeys.find(
      (key) => stateOpenKeys.indexOf(key) === -1
    );
    // open
    if (currentOpenKey !== undefined) {
      const repeatIndex = openKeys
        .filter((key) => key !== currentOpenKey)
        .findIndex((key) => levelKeys[key] === levelKeys[currentOpenKey]);
      setStateOpenKeys(
        openKeys
          // remove repeat key
          .filter((_, index) => index !== repeatIndex)
          // remove current level all child
          .filter((key) => levelKeys[key] <= levelKeys[currentOpenKey])
      );
    } else {
      // close
      setStateOpenKeys(openKeys);
    }
  };

  const handleClick = (e) => {
    // navigate(e.key);
    console.log(e.key);
  };
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  return (
    <Sider
      style={{
        background: colorBgContainer,

        // overflow: "auto",
        // height: "100vh",
        // position: "fixed",
        // insetInlineStart: 0,
        // top: 0,
        // bottom: 0,
      }}
    >
      <Menu
        defaultSelectedKeys={["hospital-info-parent"]}
        openKeys={stateOpenKeys}
        onClick={handleClick}
        onOpenChange={onOpenChange}
        // className="menu-bar"
        mode="inline"
        theme="dark"
        // style={{
        //   borderRight: 0,
        // }}
        items={items}
        selectedKeys={[location.pathname.substring(1)]}
      />
      //{" "}
    </Sider>
  );
};

export default ManagerSider;
