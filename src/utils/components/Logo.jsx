import React from "react";
import { FireFilled } from "@ant-design/icons";
import { Avatar } from "antd";
import { logo } from "../../assets";
import { Typography } from "antd";

const { Title } = Typography;

const Logo = () => {
  return (
    <div className="app-name">
      <Avatar size={40} src={logo} shape="square" />
      <span
        level={4}
        style={{
          marginBottom: 0,
          fontWeight: "bold",
          fontFamily: "Helvetica",
        }}
      >
        HOSPITAL
      </span>
    </div>
  );
};

export default Logo;
