import React from "react";
import { Card, Row, Col, Avatar, Table, Button } from "antd";
import {
  CalendarOutlined,
  UserOutlined,
  UsergroupAddOutlined,
  DollarCircleOutlined,
} from "@ant-design/icons";
import { FaCalendarCheck } from "react-icons/fa";
import { FaUser } from "react-icons/fa";
import { MdGroups3 } from "react-icons/md";
import { SiBitcoincash } from "react-icons/si";
import { HiOutlineDotsHorizontal } from "react-icons/hi";
import moment from "moment";

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  Title,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";
import { Pie, Bar } from "react-chartjs-2";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  Title,
  CategoryScale,
  LinearScale,
  BarElement
);

const Dashboard = () => {
  // Dữ liệu giả lập cho biểu đồ
  const appointmentData = [
    { day: "Thứ 2", appointments: 12 },
    { day: "Thứ 3", appointments: 19 },
    { day: "Thứ 4", appointments: 7 },
    { day: "Thứ 5", appointments: 14 },
    { day: "Thứ 6", appointments: 10 },
    { day: "Thứ 7", appointments: 5 },
    { day: "Chủ Nhật", appointments: 8 },
  ];

  // Chuyển dữ liệu thành định dạng phù hợp cho biểu đồ
  const labels = appointmentData.map((item) => item.day);
  const values = appointmentData.map((item) => item.appointments);

  const data2 = {
    labels,
    datasets: [
      {
        label: "Số lượng đặt lịch",
        data: values,
        backgroundColor: [
          "#4caf50",
          "#2196f3",
          "#ff9800",
          "#e91e63",
          "#9c27b0",
          "#00bcd4",
          "#8bc34a",
        ],
        borderColor: "#ffffff",
        borderWidth: 2,
        borderRadius: 5,
      },
    ],
  };

  const options2 = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: "top",
        labels: {
          color: "#4f4f4f",
        },
      },
      title: {
        display: true,
        text: "Thống Kê Số Lượng Đặt Lịch Theo Ngày Trong Tuần",
        color: "#4f4f4f",
        font: {
          size: 18,
          weight: "bold",
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Ngày",
          color: "#4f4f4f",
          font: {
            size: 14,
            weight: "bold",
          },
        },
      },
      y: {
        title: {
          display: true,
          text: "Số lượng đặt lịch",
          color: "#4f4f4f",
          font: {
            size: 14,
            weight: "bold",
          },
        },
        beginAtZero: true,
      },
    },
  };
  // Dữ liệu giả lập cho biểu đồ
  const dataChart = {
    labels: [
      "Khoa Ngoại",
      "Khoa Nội",
      "Khoa Nhi",
      "Khoa Da liễu",
      "Khoa Tai Mũi Họng",
    ],
    datasets: [
      {
        label: "Số lượng đặt lịch",
        data: [120, 90, 80, 60, 50],
        backgroundColor: [
          "#1890ff",
          "#52c41a",
          "#faad14",
          "#f5222d",
          "#13c2c2",
        ],
        borderColor: "#fff",
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      // title: {
      //   display: true,
      //   text: "Top 5 Chuyên Khoa Được Đặt Lịch Nhiều Nhất",
      // },
    },
  };

  const data = [
    {
      title: "Tổng lịch hẹn",
      value: 120,
      icon: <FaCalendarCheck style={{ fontSize: 24, color: "#fff" }} />,
      backgroundColor: "#1890ff",
      url: "https://png.pngtree.com/png-vector/20220118/ourmid/pngtree-flat-hospital-building-icon-on-isolated-background-icon-service-city-vector-png-image_43883858.jpg",
    },
    {
      title: "Tổng bệnh nhân",
      value: 300,
      icon: <FaUser style={{ fontSize: 24, color: "#fff" }} />,
      backgroundColor: "#52c41a",
      url: "https://png.pngtree.com/png-vector/20220118/ourmid/pngtree-flat-hospital-building-icon-on-isolated-background-icon-service-city-vector-png-image_43883858.jpg",
    },
    {
      title: "Tổng bác sĩ",
      value: 45,
      icon: <MdGroups3 style={{ fontSize: 24, color: "#fff" }} />,
      backgroundColor: "#faad14",
      url: "https://png.pngtree.com/png-vector/20220118/ourmid/pngtree-flat-hospital-building-icon-on-isolated-background-icon-service-city-vector-png-image_43883858.jpg",
    },
    {
      title: "Tổng doanh thu",
      value: "$10,000",
      icon: <SiBitcoincash style={{ fontSize: 24, color: "#fff" }} />,
      backgroundColor: "#f5222d",
      url: "https://png.pngtree.com/png-vector/20220118/ourmid/pngtree-flat-hospital-building-icon-on-isolated-background-icon-service-city-vector-png-image_43883858.jpg",
    },
  ];

  const topDoctors = [
    {
      id: 1,
      name: "Bác sĩ A",
      avatar:
        "https://png.pngtree.com/png-vector/20220118/ourmid/pngtree-flat-hospital-building-icon-on-isolated-background-icon-service-city-vector-png-image_43883858.jpg",
      specialty: "Nha khoa",
      totalAppointment: 100,
    },
    {
      id: 1,
      name: "Bác sĩ A",
      avatar:
        "https://png.pngtree.com/png-vector/20220118/ourmid/pngtree-flat-hospital-building-icon-on-isolated-background-icon-service-city-vector-png-image_43883858.jpg",
      specialty: "Nha khoa",
      totalAppointment: 100,
    },
    {
      id: 1,
      name: "Bác sĩ A",
      avatar:
        "https://png.pngtree.com/png-vector/20220118/ourmid/pngtree-flat-hospital-building-icon-on-isolated-background-icon-service-city-vector-png-image_43883858.jpg",
      specialty: "Nha khoa",
      totalAppointment: 100,
    },
    {
      id: 1,
      name: "Bác sĩ A",
      avatar:
        "https://png.pngtree.com/png-vector/20220118/ourmid/pngtree-flat-hospital-building-icon-on-isolated-background-icon-service-city-vector-png-image_43883858.jpg",
      specialty: "Nha khoa",
      totalAppointment: 100,
    },
  ];
  // Các lịch hẹn sắp tới
  const upcomingAppointments = [
    {
      id: 1,
      name: "Bệnh nhân A",
      gender: false,
      doctor: "Bác sĩ A",
      avatar:
        "https://img.freepik.com/premium-photo/3d-avatar-cartoon-character_113255-103130.jpg",
      appointmentDate: "2024-01-01",
      appointmentTime: "10:00",
      reason: "Bệnh đau bụng",
    },
    {
      id: 2,
      name: "Bệnh nhân B",
      gender: true,
      doctor: "Bác sĩ B",
      avatar:
        "https://img.freepik.com/premium-photo/3d-avatar-cartoon-character_113255-103130.jpg",
      appointmentDate: "2024-01-02",
      appointmentTime: "11:00",
      reason: "Bệnh đau đầu",
    },
    {
      id: 3,
      name: "Bệnh nhân C",
      doctor: "Bác sĩ C",
      gender: false,
      avatar:
        "https://img.freepik.com/premium-photo/3d-avatar-cartoon-character_113255-103130.jpg",
      appointmentDate: "2024-01-03",
      appointmentTime: "12:00",
      reason: "Bệnh đau đầu",
    },
    {
      id: 4,
      name: "Trần Minh Hùng Huỳnh Bảo",
      gender: false,
      doctor: "Bác sĩ D",
      avatar:
        "https://img.freepik.com/premium-photo/3d-avatar-cartoon-character_113255-103130.jpg",
      appointmentDate: "2024-01-04",
      appointmentTime: "13:00",
      reason: "Bệnh đau đầu",
    },
  ];
  const columns = [
    {
      title: "Bệnh nhân",
      dataIndex: "name",
      key: "name",
      align: "center",
    },
    {
      title: "Giới tính",
      dataIndex: "gender",
      key: "gender",
      align: "center",
      render: (_, record) => <p>{record?.gender ? "Nữ" : "Nam"}</p>,
    },
    {
      title: "Bác sĩ",
      dataIndex: "doctor",
      key: "doctor",
      align: "center",
      render: (_, record) => (
        <div>
          <Avatar src={record.avatar} size={24} />
          <span>{record.doctor}</span>
        </div>
      ),
    },
    {
      title: "Ngày hẹn",
      dataIndex: "appointmentDate",
      key: "appointmentDate",
      align: "center",
    },
    {
      title: "Giờ hẹn",
      dataIndex: "appointmentTime",
      key: "appointmentTime",
      align: "center",
    },
    {
      title: "Lý do",
      dataIndex: "reason",
      key: "reason",
      align: "center",
      render: (_, record) => (
        <p
          style={{
            textAlign: "center",
            backgroundColor: "#FFE5D3",
            color: "#FF4D4F",
            borderRadius: 10,
            padding: "2px 10px",
            display: "inline-block",
            width: "fit-content",
          }}
        >
          {record.reason}
        </p>
      ),
    },
  ];
  return (
    <div
      style={{
        gap: 10,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Row gutter={[16, 16]}>
        {data.map((item, index) => (
          <Col xs={24} sm={12} md={12} lg={6} key={index}>
            <div
              style={{
                borderRadius: "8px",
                backgroundColor: "#fff",
                padding: 10,
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <div
                    style={{
                      backgroundColor: item.backgroundColor,
                      borderRadius: 10,
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      width: 40,
                      height: 40,
                      margin: "auto",
                    }}
                  >
                    {item.icon}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <p style={{ color: "#595959" }}>{item.title}</p>
                    <p style={{ fontWeight: "bold" }}>{item.value}</p>
                  </div>
                </div>
                <img
                  style={{
                    width: 70,
                    height: 70,
                  }}
                  src={item.url}
                  alt="hospital"
                />
              </div>
            </div>
          </Col>
        ))}
      </Row>
      {/* Biểu đồ */}
      <Row gutter={[16, 16]}>
        <Col span={16}>
          <Card>
            <div
              style={{
                height: "300px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Bar data={data2} options={options2} />
            </div>
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <div
              style={{
                width: "100%",
                height: "300px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Pie data={dataChart} options={options} />
            </div>
          </Card>
        </Col>
      </Row>
      {/* Top 5 bác sĩ */}
      <Row gutter={[16, 16]}>
        <Col span={8}>
          <Card>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <h3>Top 5 bác sĩ</h3>
              <span style={{ cursor: "pointer", color: "#1890ff" }}>
                Xem tất cả
              </span>
            </div>
            {topDoctors.map((doctor, index) => (
              <div
                style={{
                  display: "flex",
                  padding: 10,
                  borderRadius: 10,
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 10,
                }}
                key={index}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    gap: 10,
                    cursor: "pointer",
                    alignItems: "center",
                  }}
                >
                  <Avatar src={doctor.avatar} size={50} />
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      cursor: "pointer",
                    }}
                  >
                    <p style={{ fontWeight: "bold", color: "#1890ff" }}>
                      {doctor.name}
                    </p>
                    <p style={{ color: "#595959" }}>{doctor.specialty}</p>
                  </div>
                </div>
                <HiOutlineDotsHorizontal
                  size={20}
                  color="#595959"
                  style={{ cursor: "pointer" }}
                />
              </div>
            ))}
          </Card>
        </Col>
        <Col span={16}>
          <Card>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <h3>Các lịch hẹn sắp tới</h3>
              <span style={{ cursor: "pointer", color: "#1890ff" }}>
                Xem tất cả
              </span>
            </div>
            <Table
              dataSource={upcomingAppointments}
              columns={columns}
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
