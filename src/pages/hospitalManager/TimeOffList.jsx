import React, { useEffect, useState } from "react";
import {
  Tabs,
  Table,
  Tag,
  Button,
  Modal,
  Radio,
  Form,
  notification,
  message,
  Tooltip,
} from "antd";
import { EditOutlined, EyeOutlined } from "@ant-design/icons";
import axiosConfig from "../../apis/axiosConfig";
import moment from "moment";

const { TabPane } = Tabs;

// translate status
const statusOptions = [
  {
    value: "pending",
    label: "Chờ duyệt",
    color: "#0165FF",
    background: "#E5F4FF",
  },
  {
    value: "approved",
    label: "Đã duyệt",
    color: "#27AE60",
    background: "#E5F4FF",
  },
  {
    value: "rejected",
    label: "Đã hủy",
    color: "#EB5757",
    background: "#FFE5E5",
  },
];

const filterStatusOptions = statusOptions?.filter(
  (option) => option.value !== "completed" && option.value !== "pending"
);

// Cấu hình cột cho bảng lịch hẹn
const columns = (onEditClick) => [
  {
    title: "Tên nhân viên",
    dataIndex: "fullname",
    key: "fullname",
    render: (_, record) => record?.doctor.fullname,
  },
  {
    title: "Tiêu đề",
    dataIndex: "title",
    key: "title",
    render: (_, record) => record?.title,
  },
  {
    title: "Lý do đơn",
    dataIndex: "reason",
    key: "reason",
    render: (_, record) => record?.reason,
  },
  {
    title: "Từ ngày",
    dataIndex: "from_date",
    key: "from_date",
    render: (_, record) =>
      moment(record?.unavailable_start_date).format("DD/MM/YYYY HH:mm"),
  },
  {
    title: "Đến ngày",
    dataIndex: "to_date",
    key: "to_date",
    render: (_, record) =>
      moment(record?.unavailable_end_date).format("DD/MM/YYYY HH:mm"),
  },
  {
    title: "Trạng thái đơn",
    dataIndex: "status",
    key: "status",
    render: (status) => (
      <Tag
        style={{
          backgroundColor: statusOptions.find((item) => item.value === status)
            ?.background,
          color: statusOptions.find((item) => item.value === status)?.color,
          fontWeight: "500",
          borderRadius: 5,
          border: "none",
          padding: "2px 10px",
        }}
      >
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

const TimeOffList = () => {
  const [activeTab, setActiveTab] = useState("1");
  const [data, setData] = useState([]);
  const [selectedData, setSelectedData] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [selectedStatus, setSelectedStatus] = useState(null);

  const fetchData = async () => {
    try {
      const response = await axiosConfig.get(
        "/doctor-unavailable-times/get-list-by-hospital"
      );
      setData(response?.doctorUnavailableTime);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleTabChange = (key) => {
    setActiveTab(key);
  };

  const handleEditClick = (data) => {
    setSelectedData(data);
    setSelectedStatus(data?.status);
    form.setFieldsValue({ status: data?.status });
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleOk = async () => {
    try {
      const res = await axiosConfig.patch(
        `/doctor-unavailable-times/update-status/${selectedData?.id}`,
        { status: selectedStatus }
      );
      message.success("Cập nhật trạng thái thành công");
      fetchData();
    } catch (error) {
      console.log(error);
    }
  };

  // Lọc dữ liệu cho từng tab
  const allData = data;
  const pendingData = data?.filter((item) => item.status === "pending");
  const completedData = data?.filter((item) => item.status === "completed");
  const confirmedData = data?.filter((item) => item.status === "rejected");
  console.log("allData", pendingData);
  return (
    <>
      <Tabs
        activeKey={activeTab}
        onChange={handleTabChange}
        className="custom-tabs"
      >
        <TabPane tab="Tất cả " key="1">
          <Table
            dataSource={allData}
            size="small"
            columns={columns(handleEditClick)}
            rowKey="id"
          />
        </TabPane>
        <TabPane tab={`Đơn chưa duyệt (${pendingData?.length})`} key="2">
          <Table
            dataSource={pendingData}
            size="small"
            columns={columns(handleEditClick)}
            rowKey="id"
          />
        </TabPane>
        <TabPane tab="Đơn đã hủy" key="3">
          <Table
            dataSource={confirmedData}
            size="small"
            columns={columns(handleEditClick)}
            rowKey="id"
          />
        </TabPane>
      </Tabs>

      <Modal
        title="Chi tiết đơn"
        open={isModalVisible}
        onCancel={handleCancel}
        okButtonProps={{
          disabled: selectedStatus === selectedData?.status,
        }} // Vô hiệu hóa nút OK khi trạng thái không thay đổi
        onOk={handleOk}
      >
        {selectedData && (
          <div
            style={{
              marginBottom: 10,
              marginTop: 10,
              alignItems: "center",
            }}
          >
            <p style={{ fontWeight: "500", fontSize: 16 }}>
              {selectedData?.title}
            </p>
            <p>{`Lý do: ${selectedData?.reason}`}</p>
            <p style={{ color: "#828282", fontStyle: "italic" }}>
              {`Từ ${moment(selectedData?.unavailable_start_date).format(
                "DD/MM/YYYY HH:mm"
              )} - Đến ${moment(selectedData?.unavailable_end_date).format(
                "DD/MM/YYYY HH:mm"
              )}`}
            </p>
            <div style={{ display: "flex", alignItems: "center" }}>
              <p style={{ color: "#828282", marginRight: 10 }}>
                Trạng thái hiện tại:
              </p>
              <Tag
                style={{
                  backgroundColor: statusOptions.find(
                    (item) => item.value === selectedData?.status
                  )?.background,
                  borderRadius: 5,
                  border: "none",
                  padding: "2px 10px",
                  color: statusOptions.find(
                    (item) => item.value === selectedData?.status
                  )?.color,
                  fontWeight: "500",
                }}
              >
                {
                  statusOptions.find(
                    (item) => item.value === selectedData?.status
                  )?.label
                }
              </Tag>
            </div>
          </div>
        )}
        <Form form={form} layout="vertical">
          <Form.Item label="Trạng thái" name="status">
            <Radio.Group
              onChange={(e) => setSelectedStatus(e.target.value)}
              value={selectedStatus}
            >
              {filterStatusOptions
                .filter((option) => option.value !== selectedData?.status)
                .map((option) => (
                  <Radio key={option.value} value={option.value}>
                    {option.value === "rejected"
                      ? "Hủy đơn"
                      : option.value === "approved"
                        ? "Duyệt"
                        : option.label}
                  </Radio>
                ))}
            </Radio.Group>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default TimeOffList;
