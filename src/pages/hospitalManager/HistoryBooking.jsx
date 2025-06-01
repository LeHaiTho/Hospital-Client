import React, { useState, useEffect } from "react";
import {
  Table,
  Input,
  Select,
  DatePicker,
  Button,
  Space,
  Spin,
  Typography,
  Tabs,
  message,
  Tag,
} from "antd";
import { SearchOutlined } from "@ant-design/icons";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import { theme } from "antd";
import axiosConfig from "../../apis/axiosConfig";

const { Title } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;
const { TabPane } = Tabs;

const HistoryBooking = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("bookings");
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} bản ghi`,
  });
  const [filters, setFilters] = useState({
    search: "",
    doctorId: null,
    dateRange: [],
    status: null,
    selectedMonth: moment().month(),
  });
  console.log(filters);
  const {
    token: { colorBgContainer, colorPrimary },
  } = theme.useToken();

  // Fetch doctors
  const fetchDoctors = async () => {
    try {
      const response = await axiosConfig.get("/doctors/name-list");
      const doctorList = (response?.doctorList || []).map((doctor) => ({
        id: doctor.id,
        name: doctor.fullname,
      }));
      setDoctors(doctorList);
    } catch (error) {
      console.error("Error fetching doctors:", error);
      message.error("Không thể tải danh sách bác sĩ!");
    }
  };

  // Fetch bookings
  const fetchBookings = async (page = 1, pageSize = 10) => {
    setLoading(true);
    try {
      const { search, doctorId, dateRange, status } = filters;
      const params = {
        page,
        limit: pageSize,
        ...(search && { search }),
        ...(doctorId && { doctorId }),
        ...(dateRange.length === 2 && {
          startDate: moment(dateRange[0]).format("YYYY-MM-DD"),
          endDate: moment(dateRange[1]).format("YYYY-MM-DD"),
        }),
        ...(status && { status }),
      };
      const response = await axiosConfig.get(
        "/appointments/get-history-booking",
        { params }
      );

      console.log("API Response:", response); // Debug log

      setBookings(response?.data || []);
      setPagination((prev) => ({
        ...prev,
        current: response?.page || page,
        pageSize: response?.limit || pageSize,
        total: response?.total || 0,
      }));
      calculateStats(response?.data || []);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      message.error("Không thể tải danh sách lịch khám!");
      setBookings([]);
      setPagination((prev) => ({
        ...prev,
        total: 0,
      }));
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics
  const calculateStats = (bookingsToProcess) => {
    console.log("Calculating stats for bookings:", bookingsToProcess);

    const statsData = doctors.map((doctor) => {
      const doctorBookings = bookingsToProcess.filter(
        (b) => b.doctorName === doctor.name
      );

      return {
        key: doctor.id,
        doctorName: doctor.name,
        total: doctorBookings.length,
        completed: doctorBookings.filter(
          (b) => b.originalStatus === "completed"
        ).length,
        pending: doctorBookings.filter(
          (b) =>
            b.originalStatus === "pending" || b.originalStatus === "confirmed"
        ).length,
        cancelled: doctorBookings.filter(
          (b) => b.originalStatus === "cancelled"
        ).length,
      };
    });

    // Chỉ hiển thị bác sĩ có ít nhất 1 lịch hẹn trong khoảng thời gian được chọn
    const filteredStats = statsData.filter((stat) => stat.total > 0);
    setStats(filteredStats);
  };
  console.log("stats", stats);

  // Initialize data
  useEffect(() => {
    fetchDoctors();
    fetchBookings();
  }, []);

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  // Apply filters for booking list
  const handleSearch = () => {
    setPagination((prev) => ({ ...prev, current: 1 }));
    fetchBookings(1, pagination.pageSize);
  };

  // Handle table pagination and sorting for booking list
  const handleTableChange = (newPagination, filters, sorter) => {
    console.log("Table change:", newPagination); // Debug log
    fetchBookings(newPagination.current, newPagination.pageSize);
  };

  // Apply filters for statistics
  const handleStatsFilter = async () => {
    setLoading(true);
    try {
      const { doctorId, selectedMonth } = filters;
      let adjustedDateRange = [];

      // Lọc theo tháng được chọn dựa trên appointment_date
      if (selectedMonth !== null) {
        const currentYear = moment().year();
        adjustedDateRange = [
          moment([currentYear, selectedMonth, 1]), // Ngày đầu tiên của tháng đã chọn
          moment([currentYear, selectedMonth, 1]).endOf("month"), // Ngày cuối cùng của tháng đã chọn
        ];
      }

      const params = {
        ...(doctorId && { doctorId }),
        ...(adjustedDateRange.length === 2 && {
          startDate: moment(adjustedDateRange[0]).format("YYYY-MM-DD"),
          endDate: moment(adjustedDateRange[1]).format("YYYY-MM-DD"),
        }),
      };

      console.log("Stats filter params:", params);

      const response = await axiosConfig.get(
        "/appointments/get-history-booking",
        { params }
      );
      calculateStats(response?.data || []);
    } catch (error) {
      console.error("Error fetching stats:", error);
      message.error("Không thể tải thống kê!");
    } finally {
      setLoading(false);
    }
  };

  // Tạo danh sách các tháng
  const monthOptions = Array.from({ length: 12 }, (_, i) => ({
    value: i,
    label: `Tháng ${i + 1}`,
  }));

  // Helper function to get status color and display
  const getStatusConfig = (status) => {
    switch (status) {
      case "Lịch sắp tới":
        return {
          color: "blue",
          backgroundColor: "#e6f7ff",
          borderColor: "#91d5ff",
        };
      case "Đã hủy":
        return {
          color: "red",
          backgroundColor: "#fff2e8",
          borderColor: "#ffbb96",
        };
      case "Đã hoàn thành":
        return {
          color: "green",
          backgroundColor: "#f6ffed",
          borderColor: "#95de64",
        };
      default:
        return {
          color: "default",
          backgroundColor: "#fafafa",
          borderColor: "#d9d9d9",
        };
    }
  };

  // Booking list columns
  const bookingColumns = [
    {
      title: "Mã đặt lịch",
      dataIndex: "appointmentCode", // Changed from "id" to "appointmentCode"
      key: "appointmentCode",
      width: 120,
    },
    {
      title: "Bệnh nhân",
      dataIndex: "patientName",
      key: "patientName",
      width: 150,
    },
    {
      title: "Bác sĩ",
      dataIndex: "doctorName",
      key: "doctorName",
      width: 150,
    },
    {
      title: "Chuyên khoa",
      dataIndex: "specialty",
      key: "specialty",
      width: 120,
    },
    {
      title: "Ngày khám",
      dataIndex: "appointmentDate", // Ngày từ doctorSchedule.date
      key: "appointmentDate",
      sorter: true,
      width: 110,
      render: (date) => {
        return date || "N/A";
      },
    },
    {
      title: "Giờ khám",
      dataIndex: "appointmentTime", // Giờ từ appointmentSlot
      key: "appointmentTime",
      width: 120,
      render: (time) => {
        return time || "N/A";
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status) => {
        const config = getStatusConfig(status);
        return (
          <Tag
            color={config.color}
            style={{
              backgroundColor: config.backgroundColor,
              borderColor: config.borderColor,
              color: config.color === "default" ? "#000" : config.color,
              border: `1px solid ${config.borderColor}`,
            }}
          >
            {status}
          </Tag>
        );
      },
    },
    {
      title: "Giá khám",
      dataIndex: "price",
      key: "price",
      width: 120,
      render: (price) =>
        price ? `${parseFloat(price).toLocaleString("vi-VN")} VNĐ` : "N/A",
    },
  ];

  // Statistics columns
  const statsColumns = [
    {
      title: "Bác sĩ",
      dataIndex: "doctorName",
      key: "doctorName",
      width: 150,
    },
    {
      title: "Tổng số lịch khám",
      dataIndex: "total",
      key: "total",
      width: 120,
      render: (total) => (
        <span style={{ fontWeight: "bold", color: "#1890ff" }}>{total}</span>
      ),
    },
    {
      title: "Lịch sắp tới",
      dataIndex: "pending",
      key: "pending",
      width: 120,
      render: (pending) => <span style={{ color: "#52c41a" }}>{pending}</span>,
    },
    {
      title: "Hoàn thành",
      dataIndex: "completed",
      key: "completed",
      width: 120,
      render: (completed) => (
        <span style={{ color: "#13c2c2" }}>{completed}</span>
      ),
    },
    {
      title: "Đã hủy",
      dataIndex: "cancelled",
      key: "cancelled",
      width: 100,
      render: (cancelled) => (
        <span style={{ color: "#f5222d" }}>{cancelled}</span>
      ),
    },
  ];

  return (
    <div
      style={{
        padding: 24,
        background: colorBgContainer,
        minHeight: "100vh",
      }}
    >
      <Title level={2}>Lịch sử khám bệnh</Title>
      {activeTab === "bookings" && (
        <Space
          direction="vertical"
          size="middle"
          style={{ width: "100%", marginBottom: 16 }}
        >
          <Space wrap>
            <Input
              placeholder="Tìm kiếm bệnh nhân, bác sĩ, mã lịch hẹn..."
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              style={{ width: 250 }}
              prefix={<SearchOutlined />}
            />
            <Select
              placeholder="Chọn bác sĩ"
              value={filters.doctorId}
              onChange={(value) => handleFilterChange("doctorId", value)}
              style={{ width: 200 }}
              allowClear
            >
              {doctors.map((doctor) => (
                <Option key={doctor.id} value={doctor.id}>
                  {doctor.name}
                </Option>
              ))}
            </Select>
            <RangePicker
              value={filters.dateRange}
              onChange={(dates) => handleFilterChange("dateRange", dates || [])}
              format="DD/MM/YYYY"
              placeholder={["Từ ngày", "Đến ngày"]}
            />
            <Select
              placeholder="Chọn trạng thái"
              value={filters.status}
              onChange={(value) => handleFilterChange("status", value)}
              style={{ width: 150 }}
              allowClear
            >
              <Option value="pending">Lịch sắp tới</Option>
              <Option value="cancelled">Đã hủy</Option>
              <Option value="completed">Hoàn thành</Option>
            </Select>
            <Button type="primary" onClick={handleSearch}>
              Tìm kiếm
            </Button>
          </Space>
        </Space>
      )}
      <Tabs defaultActiveKey="bookings" onChange={(key) => setActiveTab(key)}>
        <TabPane tab="Danh sách lịch khám" key="bookings">
          <Spin spinning={loading}>
            <Table
              columns={bookingColumns}
              dataSource={bookings}
              pagination={pagination}
              onChange={handleTableChange}
              rowKey="id"
              scroll={{ x: 1000 }}
              size="middle"
            />
          </Spin>
        </TabPane>
        <TabPane tab="Thống kê" key="stats">
          <Space direction="vertical" size="middle" style={{ width: "100%" }}>
            <Space wrap>
              <Select
                placeholder="Chọn bác sĩ"
                value={filters.doctorId}
                onChange={(value) => handleFilterChange("doctorId", value)}
                style={{ width: 200 }}
                allowClear
              >
                {doctors.map((doctor) => (
                  <Option key={doctor.id} value={doctor.id}>
                    {doctor.name}
                  </Option>
                ))}
              </Select>
              <Select
                placeholder="Chọn tháng cụ thể"
                value={filters.selectedMonth}
                onChange={(value) => handleFilterChange("selectedMonth", value)}
                style={{ width: 150 }}
                allowClear
              >
                {monthOptions.map((month) => (
                  <Option key={month.value} value={month.value}>
                    {month.label}
                  </Option>
                ))}
              </Select>
              <Button type="primary" onClick={handleStatsFilter}>
                Lọc thống kê
              </Button>
            </Space>

            <Spin spinning={loading}>
              <Table
                columns={statsColumns}
                dataSource={
                  filters.doctorId
                    ? stats.filter((s) => s.key === filters.doctorId)
                    : stats
                }
                pagination={false}
                rowKey="key"
                scroll={{ x: 800 }}
                size="middle"
              />
            </Spin>
          </Space>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default HistoryBooking;
