import React from "react";
import { Card, Typography } from "antd";

const { Title } = Typography;

const Profile = () => {
  return (
    <div style={{ padding: "24px" }}>
      <Card>
        <Title level={2}>Thông tin cá nhân</Title>
        <p>Trang thông tin cá nhân đang được phát triển...</p>
      </Card>
    </div>
  );
};

export default Profile;
