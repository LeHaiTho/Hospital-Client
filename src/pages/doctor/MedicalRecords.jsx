import React from "react";
import { Card, Typography } from "antd";

const { Title } = Typography;

const MedicalRecords = () => {
  return (
    <div style={{ padding: "24px" }}>
      <Card>
        <Title level={2}>Hồ sơ bệnh án</Title>
        <p>Trang quản lý hồ sơ bệnh án đang được phát triển...</p>
      </Card>
    </div>
  );
};

export default MedicalRecords;
