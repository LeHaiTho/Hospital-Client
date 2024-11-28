import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  message,
  Space,
  Typography,
  Tag,
  Tooltip,
  Dropdown,
  notification,
} from "antd";
import axios from "axios";
import { truncateDescription } from "../../utils/common";
import { IoIosMore } from "react-icons/io";
import axiosConfig from "../../apis/axiosConfig";
import {
  PlusOutlined,
  EditOutlined,
  LockOutlined,
  EyeOutlined,
} from "@ant-design/icons";
const { Text } = Typography;
const { Search } = Input;
const HospitalAdminPage = () => {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  // Lấy danh sách bệnh viện khi component được mount
  useEffect(() => {
    fetchHospitals();
  }, []);

  const fetchHospitals = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "http://localhost:3000/hospitals/get-list"
      );
      console.log("get list", response.data);
      setHospitals(response.data.hospitals);
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  };

  const items = [
    {
      label: "Chỉnh sửa",
      icon: <EditOutlined />,
      key: "1",
    },
    {
      label: "Thông tin cơ sở",
      icon: <EyeOutlined />,
      key: "2",
    },
    {
      label: "Tạm ngưng hoạt động",
      icon: <LockOutlined />,
      danger: true,
      key: "3",
    },
  ];

  const handleOpenModal = () => {
    setIsModalVisible(true);
  };

  const handleOk = async (values) => {
    try {
      const response = await axiosConfig.post(
        "http://localhost:3000/hospitals/create-new",
        values
      );
      setHospitals((pre) => [
        ...pre,
        {
          ...response.newHospital,
          manager: response.manager_hospital,
        },
      ]);
      notification.success({
        message: "Thêm mới cơ sở y tế thành công",
        duration: 2,
      });
      handleCancel();
    } catch (error) {
      console.log(error);
      message.error(error.response.data.message);
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };
  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Tên bệnh viện",
      dataIndex: "name",
      key: "name",
      width: "400",
      render: (text, record) => {
        return <p>{record.name}</p>;
      },
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Địa chỉ",
      dataIndex: "address",
      key: "address",
      width: "400",
      render: (text, record) => (
        <p>{truncateDescription(record.address, 20)}</p>
      ),
    },
    {
      title: "Người quản lý",
      dataIndex: "managerName",
      key: "managerName",
      render: (text, record) => {
        return <p>{record.manager?.username}</p>;
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      align: "center",
      render: (text, record) =>
        text ? (
          <Tag color="green" bordered={false} style={{ borderRadius: 0 }}>
            Đang hoạt động
          </Tag>
        ) : (
          <Tag color="red" bordered={false} style={{ borderRadius: 0 }}>
            Không hoạt động
          </Tag>
        ),
    },
    {
      title: "Action",
      key: "action",
      align: "center",
      render: (text, record) => {
        return (
          <Dropdown menu={{ items }} trigger={["click"]} arrow>
            <Tooltip title="Xem chi tiết">
              <IoIosMore
                size={20}
                style={{
                  cursor: "pointer",
                  color: "#1677ff",
                }}
              />
            </Tooltip>
          </Dropdown>
        );
      },
    },
  ];

  return (
    <Space direction="vertical" size={10} style={{ width: "100%" }}>
      <Text strong italic>
        Cơ sở y tế
      </Text>
      <div
        style={{
          backgroundColor: "white",
          boxShadow: "0 0 5px 0 rgba(0, 0, 0, 0.1)",
          border: "1px solid #d9d9d9",
          padding: 16,
          borderRadius: 7,
        }}
      >
        <Space direction="vertical" size={16} style={{ width: "100%" }}>
          <Search placeholder="input search text" onSearch={() => {}} />
          <Button
            type="primary"
            onClick={handleOpenModal}
            icon={<PlusOutlined />}
          >
            Thêm mới
          </Button>
          <Modal
            title="Thêm mới cơ sở y tế"
            open={isModalVisible}
            onCancel={handleCancel}
            footer={null}
          >
            <AddNewHospital onSubmit={handleOk} form={form} />
          </Modal>
          <Table
            columns={columns}
            dataSource={hospitals}
            size="small"
            rowKey="id"
            loading={loading}
          />
        </Space>
      </div>
    </Space>
  );
};

const AddNewHospital = ({ onSubmit, form }) => {
  const handleSubmit = () => {
    form.validateFields().then((values) => {
      onSubmit(values);
    });
  };
  return (
    <Form form={form} layout="vertical">
      <Form.Item
        name="name"
        label="Hospital Name"
        rules={[{ required: true, message: "Please enter hospital name" }]}
      >
        <Input placeholder="Enter hospital name" />
      </Form.Item>

      <Form.Item
        name="email"
        label="Email"
        rules={[{ required: true, message: "Please enter email" }]}
      >
        <Input placeholder="Enter email" />
      </Form.Item>

      <Form.Item
        name="address"
        label="Address"
        rules={[{ required: true, message: "Please enter address" }]}
      >
        <Input placeholder="Enter address" />
      </Form.Item>
      <Button type="primary" htmlType="submit" onClick={handleSubmit}>
        Thêm mới
      </Button>
    </Form>
  );
};

export default HospitalAdminPage;
