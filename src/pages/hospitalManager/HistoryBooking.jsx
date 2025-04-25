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
  });
  const [filters, setFilters] = useState({
    search: "",
    doctorId: null,
    dateRange: [],
    status: null,
    period: null, // For week/month
    selectedMonth: moment().month() + 1, // Thêm selectedMonth với giá trị mặc định là tháng hiện tại
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
      setBookings(response?.data || []);
      setPagination({
        current: page,
        pageSize,
        total: response?.data?.total || 0,
      });
      calculateStats(response?.data || []);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      message.error("Không thể tải danh sách lịch khám!");
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics
  const calculateStats = (bookingsToProcess) => {
    const statsData = doctors.map((doctor) => {
      const doctorBookings = bookingsToProcess.filter(
        (b) => b.doctorName === doctor.name
      );
      return {
        key: doctor.id,
        doctorName: doctor.name,
        total: doctorBookings.length,
        completed: doctorBookings.filter((b) => b.status === "completed")
          .length,
        pending: doctorBookings.filter((b) => b.status === "pending").length,
        cancelled: doctorBookings.filter((b) => b.status === "cancelled")
          .length,
      };
    });
    setStats(statsData);
  };

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
    if (filters) {
      setPagination((prev) => ({ ...prev, current: 1 }));
      fetchBookings(1, pagination.pageSize);
    } else {
      fetchBookings();
    }
  };

  // Handle table pagination and sorting for booking list
  const handleTableChange = (newPagination, filters, sorter) => {
    fetchBookings(newPagination.current, newPagination.pageSize);
  };

  // Apply filters for statistics
  const handleStatsFilter = async () => {
    setLoading(true);
    try {
      const { doctorId, period, selectedMonth } = filters;
      let adjustedDateRange = [];

      // Adjust date range based on period or selectedMonth
      if (period === "week") {
        adjustedDateRange = [moment().startOf("week"), moment().endOf("week")];
      } else if (period === "month") {
        adjustedDateRange = [
          moment().startOf("month"),
          moment().endOf("month"),
        ];
      } else if (selectedMonth !== null) {
        // Nếu chọn tháng cụ thể
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

  // Booking list columns
  const bookingColumns = [
    {
      title: "Mã đặt lịch",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Bệnh nhân",
      dataIndex: "patientName",
      key: "patientName",
    },
    {
      title: "Bác sĩ",
      dataIndex: "doctorName",
      key: "doctorName",
    },
    {
      title: "Chuyên khoa",
      dataIndex: "specialty",
      key: "specialty",
    },
    {
      title: "Thời gian",
      dataIndex: "appointmentDate",
      key: "appointmentDate",
      sorter: true,
      render: (date) => {
        const [datePart, timePart] = date.split(" ");
        return `${datePart} ${timePart.split("-")[0].trim()}`;
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const color =
          status === "completed"
            ? "green"
            : status === "cancelled"
              ? "red"
              : "blue";
        return (
          <Tag
            color={color}
            style={{
              backgroundColor: color,
              color: "white",
            }}
          >
            {status.toUpperCase()}
          </Tag>
        );
      },
    },
    {
      title: "Giá khám",
      dataIndex: "price",
      key: "price",
      render: (price) => `${parseFloat(price).toLocaleString("vi-VN")} VNĐ`,
    },
  ];

  // Statistics columns
  const statsColumns = [
    {
      title: "Bác sĩ",
      dataIndex: "doctorName",
      key: "doctorName",
    },
    {
      title: "Tổng số lịch khám",
      dataIndex: "total",
      key: "total",
    },
    {
      title: "Hoàn thành",
      dataIndex: "completed",
      key: "completed",
    },
    {
      title: "Đang chờ",
      dataIndex: "pending",
      key: "pending",
    },
    {
      title: "Đã hủy",
      dataIndex: "cancelled",
      key: "cancelled",
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
              placeholder="Chọn trạng thái"
              value={filters.status}
              onChange={(value) => handleFilterChange("status", value)}
              style={{ width: 150 }}
              allowClear
            >
              <Option value="completed">Hoàn thành</Option>
              <Option value="cancelled">Đã hủy</Option>
              <Option value="pending">Đang chờ</Option>
            </Select>
            <Button type="primary" onClick={handleSearch}>
              Lọc
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
              {/* <Select
                placeholder="Chọn khoảng thời gian"
                value={filters.period}
                onChange={(value) => {
                  handleFilterChange("period", value);
                  // Reset selectedMonth nếu đã chọn period
                  if (value) {
                    handleFilterChange("selectedMonth", null);
                  }
                }}
                style={{ width: 150 }}
                allowClear
              >
                <Option value="week">Tuần</Option>
                <Option value="month">Tháng hiện tại</Option>
              </Select> */}
              <Select
                placeholder="Chọn tháng cụ thể"
                value={filters.selectedMonth}
                onChange={(value) => {
                  handleFilterChange("selectedMonth", value);
                  // Reset period nếu đã chọn tháng cụ thể
                  if (value !== null) {
                    handleFilterChange("period", null);
                  }
                }}
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
              />
            </Spin>
          </Space>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default HistoryBooking;
