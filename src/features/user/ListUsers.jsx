import React, { useRef, useState, useMemo } from "react";
import {
  UserOutlined,
  SearchOutlined,
  PlusOutlined,
  DownOutlined,
  EditOutlined,
  DeleteOutlined,
  ExclamationCircleFilled,
  CustomerServiceOutlined,
  RadiusUpleftOutlined,
  RadiusUprightOutlined,
  RadiusBottomleftOutlined,
  RadiusBottomrightOutlined,
} from "@ant-design/icons";
import NotificationComponent from "../../utils/NotificationComponent.js";
import {
  Input,
  Space,
  Button,
  Select,
  Table,
  Divider,
  Tag,
  Dropdown,
  Modal,
  Form,
  Radio,
  Upload,
  DatePicker,
  Avatar,
  notification,
} from "antd";
import { IoIosMore } from "react-icons/io";
import { UploadOutlined, CheckCircleOutlined } from "@ant-design/icons";
import { LiaUserNurseSolid } from "react-icons/lia";
import { jwtDecode } from "jwt-decode";

const { Search } = Input;
const { confirm } = Modal;
const { Option } = Select;
const { TextArea } = Input;

const handleChange = (value) => {
  console.log(`selected ${value}`);
};

const showDeleteConfirm = () => {
  confirm({
    title: "Bạn có chắc sẽ xóa tài khoản người dùng này?",
    icon: <ExclamationCircleFilled />,
    okText: "Chấp nhận",
    okType: "primary",
    cancelText: "Hủy",
    onOk() {
      console.log("OK");
      NotificationComponent("success", "Xóa thành công", "bottomRight");
    },
    onCancel() {
      console.log("Cancel");
    },
  });
};
const items = [
  {
    label: "Chỉnh sửa",
    icon: <EditOutlined />,
    key: "0",
  },
  {
    label: "Xóa",
    icon: <DeleteOutlined />,
    danger: true,
    key: "1",
    onClick: showDeleteConfirm,
  },
];
const data = [
  {
    key: "1",
    fullname: "John Brown",
    avatar: "",
    email: "john.brown@gmail.com",
    status: "Hoạt động",
    phone: "101010101001",
    lastLogin: "2024-08-17 19:00:00",
  },
  {
    key: "2",
    avatar:
      "data:image/jpeg;base64,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",
    fullname: "John Brown",
    email: "john.brown@gmail.com",
    status: "Hoạt động",
    phone: "101010101001",
  },
  {
    key: "3",
    fullname: "John Brown",
    email: "john.brown@gmail.com",
    status: "Hoạt động",
    phone: "101010101001",
  },
  {
    key: "4",
    fullname: "John Brown",
    email: "john.brown@gmail.com",
    status: "Tạm khóa",
    phone: "101010101001",
  },
];

const ListUsers = () => {
  const token = localStorage.getItem("token");
  const decodedToken = jwtDecode(token);
  console.log(decodedToken);

  const [tableParams, setTableParams] = useState({
    pagination: {
      current: 1,
      pageSize: 10,
    },
  });
  const [visible, setVisible] = useState(false);
  const [form] = Form.useForm();

  const showModal = () => {
    setVisible(true);
  };

  const handleCancel = () => {
    form.resetFields();
    setVisible(false);
  };

  const handleOk = () => {
    form
      .validateFields()
      .then((values) => {
        form.resetFields();
        setVisible(false);
        const formData = new FormData();
        // Append các trường từ form
        for (const key in values) {
          formData.append(key, values[key]);
        }
        console.log(values);
      })
      .catch((info) => {
        console.log("Validate Failed:", info);
      });
  };

  const handleValueFromEvent = (e) => {
    const value = Array.isArray(e) ? e : e && e.fileList;
    return value;
  };

  const handleFinish = (values) => {
    console.log("Form values:", values);
  };
  const columns = [
    {
      title: "",
      dataIndex: "avatar",
      key: "avatar",
      render: (avatar) => (
        <Avatar
          src={
            avatar && avatar.trim() !== ""
              ? avatar
              : (avatar =
                  "https://w7.pngwing.com/pngs/205/731/png-transparent-default-avatar-thumbnail.png")
          }
        />
      ),
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
      dataIndex: "status",
      key: "status",
      render: (status) =>
        status === "Hoạt động" ? (
          <Tag color="green">{status}</Tag>
        ) : (
          <Tag color="red">{status}</Tag>
        ),
    },
    {
      title: "Lần đăng nhập cuối",
      dataIndex: "lastLogin",
      key: "lastLogin",
    },
    // {
    //   title: "Vai trò",
    //   dataIndex: "role",
    //   key: "role",
    //   render: (role) => {
    //     if (role === "Bác sĩ") {
    //       return (
    //         <Tag
    //           color="blue"
    //           style={{
    //             display: "inline-flex",
    //             justifyContent: "center",
    //             alignItems: "center",
    //             gap: 4,
    //           }}
    //         >
    //           <LiaUserNurseSolid size={15} /> {role}
    //         </Tag>
    //       );
    //     } else if (role === "Nhân viên") {
    //       return (
    //         <Tag icon={<CustomerServiceOutlined />} color="orange">
    //           {role}
    //         </Tag>
    //       );
    //     } else {
    //       return (
    //         <Tag icon={<UserOutlined />} color="purple">
    //           {role}
    //         </Tag>
    //       );
    //     }
    //   },
    // },

    {
      title: "",
      key: "action",
      dataIndex: "action",
      render: () => (
        <Dropdown menu={{ items }} trigger={["click"]}>
          <Button
            shape="circle"
            icon={<IoIosMore size={20} />}
            style={{
              border: "none",
              backgroundColor: "transparent",
            }}
          />
        </Dropdown>
      ),
    },
  ];
  return (
    <Space
      direction="vertical"
      size="middle"
      style={{
        minWidth: "100%",
      }}
    >
      <Space>
        <Input
          placeholder="Họ và tên, địa chỉ email, ... "
          suffix={<SearchOutlined />}
          style={{
            width: 300,
          }}
        />
        <Select
          defaultValue="Tất cả"
          style={{
            width: 120,
          }}
          onChange={handleChange}
          options={[
            {
              value: "all",
              label: "Trạng thái",
            },
            {
              value: "active",
              label: "Hoạt động",
            },
            {
              value: "lock",
              label: "Tạm khóa",
            },
          ]}
        />
      </Space>
      <div>
        <Button type="primary" icon={<PlusOutlined />} onClick={showModal}>
          Thêm mới
        </Button>
      </div>
      <Modal
        title="Thêm Tài Khoản Mới"
        open={visible}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="Thêm"
        cancelText="Hủy"
        maskClosable={false}
        centered
        style={{
          margin: "5px auto",
        }}
      >
        <Form
          form={form}
          layout="vertical"
          name="add_user_form"
          onFinish={handleFinish}
        >
          <Form.Item
            name="fullname"
            label="Họ và tên"
            rules={[
              {
                required: true,
                message: "Vui lòng nhập họ và tên!",
              },
            ]}
          >
            <Input placeholder="Họ và tên" />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              {
                required: true,
                message: "Vui lòng nhập email!",
                type: "email",
              },
            ]}
          >
            <Input placeholder="Email" />
          </Form.Item>
          <Form.Item
            name="phone"
            label="Số điện thoại"
            rules={[
              {
                required: true,
                message: "Vui lòng nhập số điện thoại!",
              },
              {
                pattern: /^[0-9]{10,11}$/,
                message: "Số điện thoại không hợp lệ!",
              },
            ]}
          >
            <Input placeholder="Số điện thoại" />
          </Form.Item>
          <Form.Item
            name="birthdate"
            label="Ngày sinh"
            rules={[
              {
                required: true,
                message: "Vui lòng chọn ngày sinh!",
              },
            ]}
          >
            <DatePicker format="DD/MM/YYYY" style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            name="address"
            label="Địa chỉ chi tiết"
            rules={[
              {
                required: true,
                message: "Vui lòng nhập địa chỉ chi tiết!",
              },
            ]}
          >
            <TextArea rows={4} placeholder="Địa chỉ chi tiết" />
          </Form.Item>
          <Form.Item
            name="role"
            label="Vai trò"
            rules={[
              {
                required: true,
                message: "Vui lòng chọn vai trò!",
              },
            ]}
          >
            <Select placeholder="Chọn vai trò">
              <Option value="doctor">Bác sĩ</Option>
              <Option value="staff">Nhân viên</Option>
              <Option value="customer">Khách hàng</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="avatar"
            label="Ảnh đại diện"
            valuePropName="fileList"
            getValueFromEvent={handleValueFromEvent}
          >
            <Upload
              name="avatar"
              listType="picture"
              accept="image/*"
              maxCount={1}
              beforeUpload={() => false}
            >
              <Button icon={<UploadOutlined />}>Tải ảnh</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
      <Table
        style={{
          minWidth: "100%",
        }}
        columns={columns}
        dataSource={data}
      />
    </Space>
  );
};

export default ListUsers;
