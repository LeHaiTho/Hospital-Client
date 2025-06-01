import React from "react";
import { Card, Row, Col, Statistic, Calendar, List, Tag } from "antd";
import {
  UserOutlined,
  CalendarOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import { useSelector } from "react-redux";

const DoctorDashboard = () => {
  const { user, token } = useSelector((state) => state.auth);
  console.log("user", user);
  console.log("token", token);
  // Mock data - replace with real API calls
  const todayAppointments = [
    {
      id: 1,
      time: "09:00",
      patient: "Nguyễn Văn A",
      type: "Khám tổng quát",
      status: "confirmed",
    },
    {
      id: 2,
      time: "10:30",
      patient: "Trần Thị B",
      type: "Tái khám",
      status: "waiting",
    },
    {
      id: 3,
      time: "14:00",
      patient: "Lê Văn C",
      type: "Khám chuyên khoa",
      status: "confirmed",
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed":
        return "green";
      case "waiting":
        return "orange";
      case "completed":
        return "blue";
      default:
        return "default";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "confirmed":
        return "Đã xác nhận";
      case "waiting":
        return "Chờ khám";
      case "completed":
        return "Hoàn thành";
      default:
        return status;
    }
  };

  return (
    <div style={{ padding: "24px" }}>
      <h1 style={{ marginBottom: "24px", color: "#1890ff" }}>
        Trang chủ - Bác sĩ
      </h1>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Bệnh nhân hôm nay"
              value={8}
              prefix={<UserOutlined />}
              valueStyle={{ color: "#3f8600" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Lịch hẹn tuần này"
              value={25}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Hồ sơ đã tạo"
              value={156}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: "#722ed1" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Giờ làm việc tháng này"
              value={120}
              suffix="h"
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: "#f5222d" }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* Today's Appointments */}
        <Col xs={24} lg={12}>
          <Card title="Lịch hẹn hôm nay" extra={<CalendarOutlined />}>
            <List
              dataSource={todayAppointments}
              renderItem={(item) => (
                <List.Item
                  extra={
                    <Tag color={getStatusColor(item.status)}>
                      {getStatusText(item.status)}
                    </Tag>
                  }
                >
                  <List.Item.Meta
                    title={`${item.time} - ${item.patient}`}
                    description={item.type}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        {/* Quick Calendar */}
        <Col xs={24} lg={12}>
          <Card title="Lịch làm việc">
            <Calendar fullscreen={false} style={{ minHeight: "300px" }} />
          </Card>
        </Col>
      </Row>

      {/* Recent Activities */}
      <Row gutter={[16, 16]} style={{ marginTop: "16px" }}>
        <Col span={24}>
          <Card title="Hoạt động gần đây">
            <List
              dataSource={[
                "Đã hoàn thành khám cho bệnh nhân Nguyễn Văn A",
                "Tạo hồ sơ bệnh án mới cho Trần Thị B",
                "Cập nhật lịch làm việc tuần tới",
                "Duyệt đơn xin nghỉ phép",
              ]}
              renderItem={(item, index) => (
                <List.Item>
                  <span style={{ color: "#666" }}>
                    {new Date().toLocaleTimeString()} - {item}
                  </span>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DoctorDashboard;
