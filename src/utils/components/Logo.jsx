import React from "react";
import { FireFilled } from "@ant-design/icons";
import { Avatar } from "antd";
import { logo } from "../../assets";
import { Typography } from "antd";

const { Title } = Typography;

const Logo = () => {
  return (
    <div
      className="app-name"
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Avatar size={50} style={{}} src={logo} shape="square" />
    </div>
  );
};

export default Logo;
