import React, { useState, useEffect } from "react";
import {
  Table,
  Input,
  Button,
  Space,
  Spin,
  Typography,
  Modal,
  Form,
  message,
  Switch,
  Tag,
  Tooltip,
  DatePicker,
  Select,
  Descriptions,
} from "antd";
import { SearchOutlined } from "@ant-design/icons";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import { theme } from "antd";
import axiosConfig from "../../apis/axiosConfig";
import { FiLock, FiUnlock, FiEdit } from "react-icons/fi";
import { CiViewList } from "react-icons/ci";

const { Title, Text } = Typography;
const { Option } = Select;

const ListUsers = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [filters, setFilters] = useState({
    search: "",
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [selectedUser, setSelectedUser] = useState(null);
  const [form] = Form.useForm();

  const {
    token: { colorBgContainer, colorPrimary },
  } = theme.useToken();

  // Fetch users
  const fetchUsers = async (page = 1, pageSize = 10) => {
    setLoading(true);
    try {
      const { search } = filters;
      const params = {
        page,
        limit: pageSize,
        ...(search && { search }),
      };
      const response = await axiosConfig.get("/users/get-users", { params });
      setUsers(response?.data || []);
      setPagination({
        current: parseInt(response?.page || page),
        pageSize: parseInt(response?.limit || pageSize),
        total: parseInt(response?.total || 0),
      });
    } catch (error) {
      console.error("Error fetching users:", error);
      message.error("Không thể tải danh sách người dùng!");
    } finally {
      setLoading(false);
    }
  };
  const fetchUserById = async (id) => {
    try {
      const response = await axiosConfig.get(`/users/get-user-by-id/${id}`);
      console.log(response);
      setSelectedUser(response?.data);
    } catch (error) {
      console.error("Error fetching user by id:", error);
      message.error("Không thể tải thông tin người dùng!");
    }
  };
  useEffect(() => {
    fetchUsers();
  }, []);
  console.log(selectedUser);
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, current: 1 }));
    fetchUsers(1, pagination.pageSize);
  };

  const handleTableChange = (newPagination) => {
    fetchUsers(newPagination.current, newPagination.pageSize);
  };
  console.log(modalMode);
  // Open modal
  const openModal = (mode, user = null) => {
    setModalMode(mode);
    if (user && mode !== "view") {
      setSelectedUser(user);
      form.setFieldsValue({
        ...user,
        date_of_birth: user.date_of_birth ? moment(user.date_of_birth) : null,
      });
    } else if (user && mode === "view") {
      fetchUserById(user.id);
    } else {
      form.resetFields();
    }
    setModalVisible(true);
  };

  // Handle form submission
  const handleSubmit = async (values) => {
    try {
      const payload = {
        ...values,
        date_of_birth: values.date_of_birth
          ? moment(values.date_of_birth).format("YYYY-MM-DD")
          : null,
      };
      if (modalMode === "create") {
        await axiosConfig.post("/users/create-user", payload);
        message.success("Tạo người dùng thành công!");
      } else if (modalMode === "update") {
        await axiosConfig.patch(
          `/users/update-user/${selectedUser?.id}`,
          payload
        );
        console.log(selectedUser?.id);
        console.log(payload);
        message.success("Cập nhật người dùng thành công!");
      }
      setModalVisible(false);
      fetchUsers(pagination.current, pagination.pageSize);
    } catch (error) {
      console.error("Error submitting user:", error);
      message.error("Thao tác thất bại!");
    }
  };

  // Handle lock/unlock
  const handleLock = async (id) => {
    Modal.confirm({
      title: "Xác nhận khóa",
      content: "Bạn có chắc muốn khóa người dùng này?",
      okText: "Khóa",
      cancelText: "Hủy",
      okType: "danger",
      onOk: async () => {
        try {
          await axiosConfig.patch(`/users/${id}/lock`, {
            isActivated: false,
            isDeleted: true,
          });
          message.success("Khóa người dùng thành công!");
          fetchUsers(pagination.current, pagination.pageSize);
        } catch (error) {
          console.error("Error locking user:", error);
          message.error("Khóa người dùng thất bại!");
        }
      },
    });
  };

  const handleUnlock = async (id) => {
    Modal.confirm({
      title: "Xác nhận mở khóa",
      content: "Bạn có chắc muốn mở khóa người dùng này?",
      okText: "Mở khóa",
      cancelText: "Hủy",
      okType: "primary",
      onOk: async () => {
        try {
          await axiosConfig.patch(`/users/${id}/lock`, {
            isActivated: true,
            isDeleted: false,
          });
          message.success("Mở khóa người dùng thành công!");
          fetchUsers(pagination.current, pagination.pageSize);
        } catch (error) {
          console.error("Error unlocking user:", error);
          message.error("Mở khóa người dùng thất bại!");
        }
      },
    });
  };

  // Table columns
  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Họ và tên",
      dataIndex: "fullname",
      key: "fullname",
    },

    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone",
      key: "phone",
    },

    {
      title: "Trạng thái",
      dataIndex: "isActivated",
      key: "isActivated",
      render: (isActivated) =>
        isActivated ? (
          <Tag style={{ background: "green", color: "white" }}>
            Đã kích hoạt
          </Tag>
        ) : (
          <Tag style={{ background: "red", color: "white" }}>Tạm khóa</Tag>
        ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => moment(date).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <div style={{ display: "flex", gap: 8 }}>
          <Space>
            <Tooltip placement="bottom" title="Xem chi tiết">
              <Button
                icon={<CiViewList size={24} color="#000" />}
                type="text"
                onClick={() => openModal("view", record)}
              />
            </Tooltip>
            <Tooltip placement="bottom" title="Chỉnh sửa">
              <Button
                icon={<FiEdit size={22} color="#000" />}
                type="text"
                onClick={() => openModal("update", record)}
              />
            </Tooltip>
            {record.isActivated && !record.isDeleted ? (
              <Tooltip placement="bottom" title="Khóa">
                <Button
                  icon={<FiLock size={22} color="#ff4d4f" />}
                  type="text"
                  onClick={() => handleLock(record.id)}
                />
              </Tooltip>
            ) : !record.isActivated ? (
              <Tooltip placement="bottom" title="Mở khóa">
                <Button
                  icon={<FiUnlock size={22} color="#52c41a" />}
                  type="text"
                  onClick={() => handleUnlock(record.id)}
                />
              </Tooltip>
            ) : null}
          </Space>
        </div>
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
      <Title level={2}>Quản lý tài khoản người dùng</Title>
      <Space
        direction="vertical"
        size="middle"
        style={{ width: "100%", marginBottom: 16 }}
      >
        <Space style={{ display: "flex", justifyContent: "space-between" }}>
          <Input
            placeholder="Tìm kiếm theo tên hoặc email"
            prefix={<SearchOutlined />}
            value={filters.search}
            onChange={(e) => handleFilterChange("search", e.target.value)}
            style={{ width: 200 }}
          />
          <Button type="primary" onClick={() => openModal("create")}>
            Thêm người dùng
          </Button>
        </Space>
      </Space>
      <Spin spinning={loading}>
        <Table
          columns={columns}
          dataSource={users}
          pagination={pagination}
          onChange={handleTableChange}
          rowKey="id"
        />
      </Spin>
      <Modal
        title="Chi tiết người dùng"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={modalMode === "view" ? null : undefined}
        okText={modalMode === "create" ? "Thêm" : "Cập nhật"}
        cancelText="Hủy"
        onOk={modalMode !== "view" ? () => form.submit() : undefined}
        width={modalMode === "view" ? 800 : 600}
      >
        {modalMode === "view" && selectedUser ? (
          <Descriptions
            bordered
            column={2}
            labelStyle={{ width: 150, fontWeight: "bold" }}
            contentStyle={{ background: "#fff" }}
          >
            <Descriptions.Item label="ID">{selectedUser.id}</Descriptions.Item>
            <Descriptions.Item label="Họ và tên">
              {selectedUser.fullname || "Chưa cập nhật"}
            </Descriptions.Item>
            <Descriptions.Item label="Tên đăng nhập">
              {selectedUser.username || "Chưa cập nhật"}
            </Descriptions.Item>
            <Descriptions.Item label="Email">
              {selectedUser.email || "Chưa cập nhật"}
            </Descriptions.Item>
            <Descriptions.Item label="Số điện thoại">
              {selectedUser.phone || "Chưa cập nhật"}
            </Descriptions.Item>
            <Descriptions.Item label="Vai trò">
              {selectedUser.role || "Chưa cập nhật"}
            </Descriptions.Item>
            <Descriptions.Item label="Địa chỉ">
              {selectedUser.address || "Chưa cập nhật"}
            </Descriptions.Item>
            <Descriptions.Item label="Giới tính">
              {selectedUser.gender === false ? "Nữ" : "Nam"}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày sinh">
              {selectedUser.date_of_birth
                ? moment(selectedUser.date_of_birth).format("DD/MM/YYYY")
                : "Chưa cập nhật"}
            </Descriptions.Item>
            <Descriptions.Item label="Tỉnh/Thành phố">
              {selectedUser.province || "Chưa cập nhật"}
            </Descriptions.Item>
            <Descriptions.Item label="Quận/Huyện">
              {selectedUser.district || "Chưa cập nhật"}
            </Descriptions.Item>
            <Descriptions.Item label="Phường/Xã">
              {selectedUser.ward || "Chưa cập nhật"}
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              {selectedUser.isActivated ? "Đã kích hoạt" : "Tạm khóa"}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày tạo">
              {moment(selectedUser.createdAt).format("DD/MM/YYYY HH:mm") ||
                "Chưa cập nhật"}
            </Descriptions.Item>
          </Descriptions>
        ) : (
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            disabled={modalMode === "view"}
          >
            <Form.Item
              name="fullname"
              label="Họ và tên"
              rules={[{ required: true, message: "Vui lòng nhập họ và tên!" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="username"
              label="Tên đăng nhập"
              rules={
                modalMode === "update"
                  ? []
                  : [
                      {
                        required: true,
                        message: "Vui lòng nhập tên đăng nhập!",
                      },
                    ]
              }
            >
              <Input disabled={modalMode === "update"} />
            </Form.Item>
            {/* {modalMode === "create" && (
              <Form.Item
                name="password"
                label="Mật khẩu"
                rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
              >
                <Input.Password />
              </Form.Item>
            )} */}
            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: "Vui lòng nhập email!" },
                { type: "email", message: "Email không hợp lệ!" },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="phone"
              label="Số điện thoại"
              rules={[
                { required: true, message: "Vui lòng nhập số điện thoại!" },
                {
                  pattern: /^[0-9]{10,11}$/,
                  message: "Số điện thoại không hợp lệ!",
                },
              ]}
            >
              <Input />
            </Form.Item>
            {modalMode === "create" && (
              <Form.Item
                name="isActivated"
                label="Kích hoạt"
                valuePropName="checked"
                initialValue={true}
              >
                <Switch />
              </Form.Item>
            )}
          </Form>
        )}
      </Modal>
    </div>
  );
};

export default ListUsers;
