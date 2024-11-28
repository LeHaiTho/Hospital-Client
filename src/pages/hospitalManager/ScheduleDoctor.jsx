import { Tabs, Table, Button } from "antd";

const { TabPane } = Tabs;

import React, { useEffect, useState } from "react";
import { Dropdown, Menu } from "antd";
import { BellOutlined } from "@ant-design/icons";
import { Badge, Drawer, List, Typography } from "antd";

const { Title } = Typography;

// Dữ liệu mẫu cho thông báo
const sampleNotifications = [
  {
    id: 1,
    message: "Luke Norman: I am searching for flutter Developer ASAP",
    read: false,
  },
  { id: 2, message: "Dầu Phòng TV đã đăng video mới", read: false },
  { id: 3, message: "Ryan Vỗ đã mời bạn thích Pet Paté", read: true },
  {
    id: 4,
    message: "Trung Hiếu: NHỮNG CÔNG CỤ AI GIÚP CUỘC SỐNG BẠN 'ĐỂ THỞ' HƠN 1",
    read: false,
  },
  {
    id: 5,
    message: "Người tham gia đã danh: Mọi người cho em hỏi...",
    read: true,
  },
  { id: 6, message: "Trung Phan đã chấp nhận lời mời bạn.", read: false },
];

const NotificationDrawer = () => {
  const [notifications, setNotifications] = useState(sampleNotifications);
  const [visible, setVisible] = useState(false);

  // Hàm để mở Drawer
  const showDrawer = () => {
    setVisible(true);
  };

  // Hàm để đóng Drawer
  const onClose = () => {
    setVisible(false);
  };

  // Hàm để đánh dấu thông báo là đã đọc
  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  return (
    <>
      <Badge
        count={notifications.filter((n) => !n.read).length}
        style={{ backgroundColor: "#f5222d" }}
      >
        <Button type="text" icon={<BellOutlined />} onClick={showDrawer} />
      </Badge>
      <Drawer
        title="Thông báo"
        placement="right"
        closable={false}
        onClose={onClose}
        visible={visible}
        width={400}
      >
        <List
          dataSource={notifications}
          renderItem={(item) => (
            <List.Item onClick={() => markAsRead(item.id)}>
              <Typography.Text
                style={{ fontWeight: item.read ? "normal" : "bold" }}
              >
                {item.message}
              </Typography.Text>
            </List.Item>
          )}
        />
      </Drawer>
    </>
  );
};

// Dữ liệu mẫu cho lịch hẹn
const sampleData = [
  {
    id: 1,
    customerPhone: "0123456789",
    status: "pending",
  },
  {
    id: 2,
    customerPhone: "0987654321",
    status: "confirmed",
  },
  {
    id: 3,
    customerPhone: "0112233445",
    status: "completed",
  },
  {
    id: 4,
    customerPhone: "0123344556",
    status: "pending",
  },
];

const ScheduleDoctor = () => {
  const [appointments, setAppointments] = useState(sampleData);

  // Hàm để lấy lịch hẹn từ API (giả lập)
  useEffect(() => {
    // Ở đây bạn có thể gọi API để lấy lịch hẹn thực tế
    setAppointments(sampleData);
  }, []);

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "SĐT Khách Hàng",
      dataIndex: "customerPhone",
      key: "customerPhone",
    },
    {
      title: "Trạng Thái",
      dataIndex: "status",
      key: "status",
    },
    {
      title: "Hành Động",
      key: "action",
      render: (text, record) => (
        <Button type="primary" onClick={() => handleConfirm(record.id)}>
          Xác Nhận
        </Button>
      ),
    },
  ];

  const handleConfirm = (appointmentId) => {
    console.log(`Xác nhận lịch hẹn ID: ${appointmentId}`);
    // Gọi API để thay đổi trạng thái lịch hẹn nếu cần
  };

  // Tính toán số lượng lịch hẹn theo trạng thái
  const pendingCount = appointments.filter(
    (appt) => appt.status === "pending"
  ).length;
  const confirmedCount = appointments.filter(
    (appt) => appt.status === "confirmed"
  ).length;
  const completedCount = appointments.filter(
    (appt) => appt.status === "completed"
  ).length;

  return (
    <div>
      <h2>Quản Lý Lịch Hẹn</h2>
      <NotificationDrawer />
      <Tabs defaultActiveKey="1">
        <TabPane tab={`Tất Cả Lịch Hẹn`} key="1">
          <Table dataSource={appointments} columns={columns} rowKey="id" />
        </TabPane>
        <TabPane
          tab={`Lịch Hẹn Chưa Duyệt ${
            pendingCount > 0 ? (
              <span style={{ color: "red" }}>({pendingCount})</span>
            ) : (
              ""
            )
          }`}
          key="2"
        >
          <Table
            dataSource={appointments.filter(
              (appt) => appt.status === "pending"
            )}
            columns={columns}
            rowKey="id"
          />
        </TabPane>
        <TabPane
          tab={`Lịch Hẹn Đã Duyệt ${
            confirmedCount > 0 ? (
              <span style={{ color: "red" }}>({confirmedCount})</span>
            ) : (
              ""
            )
          }`}
          key="3"
        >
          <Table
            dataSource={appointments.filter(
              (appt) => appt.status === "confirmed"
            )}
            columns={columns}
            rowKey="id"
          />
        </TabPane>
        <TabPane
          tab={`Lịch Hẹn Đã Khám Xong ${
            completedCount > 0 ? (
              <span style={{ color: "red" }}>({completedCount})</span>
            ) : (
              ""
            )
          }`}
          key="4"
        >
          <Table
            dataSource={appointments.filter(
              (appt) => appt.status === "completed"
            )}
            columns={columns}
            rowKey="id"
          />
        </TabPane>
      </Tabs>
    </div>
  );
};

export default ScheduleDoctor;
