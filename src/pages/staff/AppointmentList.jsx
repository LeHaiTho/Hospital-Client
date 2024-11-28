import React, { useEffect, useState } from "react";
import {
  Tabs,
  Table,
  Tag,
  Button,
  Modal,
  Radio,
  Select,
  Form,
  notification,
  message,
  Tooltip,
} from "antd";
import { EditOutlined, EyeOutlined } from "@ant-design/icons";
import axiosConfig from "../../apis/axiosConfig";
import moment from "moment";

const { TabPane } = Tabs;
const { Option } = Select;

// translate status
const statusOptions = [
  { value: "pending", label: "Chờ xác nhận", color: "#eaa615" },
  { value: "confirmed", label: "Đã xác nhận", color: "#0958d9" },
  { value: "cancelled", label: "Đã hủy", color: "#ea1515" },
  { value: "completed", label: "Đã khám xong", color: "#60ea15" },
];

const filterStatusOptions = statusOptions.filter(
  (option) => option.value !== "completed" && option.value !== "pending"
);

// Cấu hình cột cho bảng lịch hẹn
const columns = (onEditClick) => [
  {
    title: "Mã lịch hẹn",
    dataIndex: "appointment_code",
    key: "appointment_code",
    align: "center",
    render: (_, record) => record?.appointment_code,
  },
  {
    title: "Họ tên bệnh nhân",
    dataIndex: "fullnamePatient",
    key: "fullnamePatient",

    render: (_, record) => record?.patient?.fullname,
  },
  {
    title: "Số điện thoại",
    dataIndex: "phonePatient",
    key: "phonePatient",

    render: (_, record) => record?.patient?.phone,
  },
  {
    title: "Họ tên bác sĩ",
    dataIndex: "fullnameDoctor",
    key: "fullnameDoctor",

    render: (_, record) => record?.doctor?.fullname,
  },
  {
    title: "Chuyên khoa",
    dataIndex: "specialty",
    key: "specialty",
    render: (_, record) => record?.specialty?.name,
  },
  {
    title: "Lý do khám",
    dataIndex: "reason",
    key: "reason",
    render: (_, record) => record?.reason,
  },
  {
    title: "Ngày hẹn",
    dataIndex: "date",
    key: "date",
    render: (_, record) =>
      moment(record?.appointment_date).format("DD/MM/YYYY"),
  },
  {
    title: "Khung giờ khám",
    dataIndex: "time",
    key: "time",
    render: (_, record) => (
      <p>
        {`${moment(record?.appointmentSlot?.start_time, "HH:mm").format(
          "HH:mm"
        )} - ${moment(record?.appointmentSlot?.end_time, "HH:mm").format(
          "HH:mm"
        )}`}
      </p>
    ),
  },
  {
    title: "Trạng thái lịch hẹn",
    dataIndex: "status",
    key: "status",
    render: (status) => (
      <Tag color={statusOptions.find((item) => item.value === status)?.color}>
        {statusOptions.find((item) => item.value === status)?.label}
      </Tag>
    ),
  },
  {
    title: "",
    key: "action",
    render: (_, record) => (
      <>
        {record?.status === "pending" && (
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => onEditClick(record)}
            />
          </Tooltip>
        )}
        <Tooltip title="Xem chi tiết">
          <Button type="text" icon={<EyeOutlined color="blue" />} />
        </Tooltip>
      </>
    ),
  },
];

const AppointmentList = () => {
  const [activeTab, setActiveTab] = useState("1");
  const [appointments, setAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [selectedStatus, setSelectedStatus] = useState(null);

  const fetchAppointments = async () => {
    const response = await axiosConfig.get(
      "/appointments/get-appointment-by-hospital-id"
    );
    setAppointments(response?.appointmentList);
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleTabChange = (key) => {
    setActiveTab(key);
  };

  const handleEditClick = (appointment) => {
    setSelectedAppointment(appointment);
    setSelectedStatus(appointment?.status);
    form.setFieldsValue({ status: appointment?.status });
    setIsModalVisible(true);
  };
  console.log(appointments);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const response = await axiosConfig.patch(
        `/appointments/update-appointment-status/${selectedAppointment.id}`,
        { status: values.status }
      );

      message.success("Cập nhật trạng thái lịch hẹn thành công");
      setIsModalVisible(false);
      fetchAppointments();
    } catch (error) {
      console.log(error);
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  // Lọc dữ liệu cho từng tab
  const allAppointments = appointments;
  const pendingAppointments = appointments.filter(
    (item) => item.status === "pending"
  );
  const completedAppointments = appointments.filter(
    (item) => item.status === "completed"
  );
  const confirmedAppointments = appointments.filter(
    (item) => item.status === "confirmed"
  );

  return (
    <>
      <Tabs
        activeKey={activeTab}
        onChange={handleTabChange}
        className="custom-tabs"
      >
        <TabPane tab="Tất cả lịch hẹn" key="1">
          <Table
            dataSource={allAppointments}
            size="small"
            columns={columns(handleEditClick)}
            rowKey="id"
          />
        </TabPane>
        <TabPane
          tab={`Lịch hẹn chưa duyệt (${pendingAppointments.length})`}
          key="2"
        >
          <Table
            dataSource={pendingAppointments}
            size="small"
            columns={columns(handleEditClick)}
            rowKey="id"
          />
        </TabPane>
        <TabPane tab="Lịch hẹn đã xác nhận" key="3">
          <Table
            dataSource={confirmedAppointments}
            size="small"
            columns={columns(handleEditClick)}
            rowKey="id"
          />
        </TabPane>
        <TabPane tab="Lịch hẹn đã hoàn thành" key="4">
          <Table
            dataSource={completedAppointments}
            size="small"
            columns={columns(handleEditClick)}
            rowKey="id"
          />
        </TabPane>
      </Tabs>

      <Modal
        title="Chi tiết lịch hẹn"
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        okButtonProps={{
          disabled: selectedStatus === selectedAppointment?.status,
        }} // Vô hiệu hóa nút OK khi trạng thái không thay đổi
      >
        <p>Thông tin lịch hẹn:</p>
        {selectedAppointment && (
          <ul>
            <li>Bệnh nhân: {selectedAppointment?.patient?.fullname}</li>
            <li>
              Ngày hẹn:
              {moment(selectedAppointment?.appointment_date).format(
                "DD/MM/YYYY"
              )}
            </li>
            <li>Bác sĩ: {selectedAppointment?.doctor?.fullname}</li>
            <li>Chuyên khoa: {selectedAppointment?.specialty?.name}</li>
            <li>Lý do khám: {selectedAppointment?.reason}</li>
          </ul>
        )}
        <Form form={form} layout="vertical">
          <Form.Item label="Trạng thái" name="status">
            <Select onChange={(value) => setSelectedStatus(value)}>
              {filterStatusOptions
                .filter(
                  (option) => option.value !== selectedAppointment?.status
                ) // Loại bỏ trạng thái hiện tại
                .map((option) => (
                  <Option key={option.value} value={option.value}>
                    {option.value === "cancelled"
                      ? "Hủy lịch hẹn"
                      : option.value === "confirmed"
                      ? "Xác nhận"
                      : option.label}
                  </Option>
                ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default AppointmentList;
