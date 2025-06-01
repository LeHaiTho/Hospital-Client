import React, { useState } from "react";
import {
  Card,
  Table,
  Button,
  Input,
  Space,
  Tag,
  Modal,
  Form,
  Select,
  DatePicker,
  Row,
  Col,
} from "antd";
import {
  SearchOutlined,
  EyeOutlined,
  EditOutlined,
  PlusOutlined,
} from "@ant-design/icons";

const { Search } = Input;
const { Option } = Select;

const PatientList = () => {
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [form] = Form.useForm();

  // Mock data - replace with real API calls
  const patientsData = [
    {
      id: 1,
      code: "BN001",
      name: "Nguyễn Văn A",
      age: 35,
      gender: "Nam",
      phone: "0123456789",
      address: "Hà Nội",
      lastVisit: "2024-01-15",
      status: "active",
      diagnosis: "Cao huyết áp",
    },
    {
      id: 2,
      code: "BN002",
      name: "Trần Thị B",
      age: 28,
      gender: "Nữ",
      phone: "0987654321",
      address: "TP.HCM",
      lastVisit: "2024-01-10",
      status: "active",
      diagnosis: "Đái tháo đường",
    },
    {
      id: 3,
      code: "BN003",
      name: "Lê Văn C",
      age: 42,
      gender: "Nam",
      phone: "0345678901",
      address: "Đà Nẵng",
      lastVisit: "2023-12-20",
      status: "inactive",
      diagnosis: "Tim mạch",
    },
  ];

  const columns = [
    {
      title: "Mã BN",
      dataIndex: "code",
      key: "code",
      width: 100,
    },
    {
      title: "Họ và tên",
      dataIndex: "name",
      key: "name",
      filteredValue: [searchText],
      onFilter: (value, record) =>
        record.name.toLowerCase().includes(value.toLowerCase()) ||
        record.code.toLowerCase().includes(value.toLowerCase()),
    },
    {
      title: "Tuổi",
      dataIndex: "age",
      key: "age",
      width: 80,
    },
    {
      title: "Giới tính",
      dataIndex: "gender",
      key: "gender",
      width: 100,
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone",
      key: "phone",
      width: 120,
    },
    {
      title: "Chẩn đoán gần nhất",
      dataIndex: "diagnosis",
      key: "diagnosis",
    },
    {
      title: "Lần khám cuối",
      dataIndex: "lastVisit",
      key: "lastVisit",
      width: 120,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status) => (
        <Tag color={status === "active" ? "green" : "red"}>
          {status === "active" ? "Đang điều trị" : "Ngừng điều trị"}
        </Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="primary"
            icon={<EyeOutlined />}
            size="small"
            onClick={() => handleViewPatient(record)}
          >
            Xem
          </Button>
          <Button
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEditPatient(record)}
          >
            Sửa
          </Button>
        </Space>
      ),
    },
  ];

  const handleViewPatient = (patient) => {
    setSelectedPatient(patient);
    setModalVisible(true);
  };

  const handleEditPatient = (patient) => {
    form.setFieldsValue(patient);
    setSelectedPatient(patient);
    setModalVisible(true);
  };

  const handleAddPatient = () => {
    form.resetFields();
    setSelectedPatient(null);
    setModalVisible(true);
  };

  const handleModalOk = () => {
    form.validateFields().then((values) => {
      console.log("Patient data:", values);
      setModalVisible(false);
      // Add API call here
    });
  };

  return (
    <div style={{ padding: "24px" }}>
      <Card
        title="Danh sách bệnh nhân"
        extra={
          <Space>
            <Search
              placeholder="Tìm kiếm bệnh nhân..."
              allowClear
              onSearch={(value) => setSearchText(value)}
              style={{ width: 300 }}
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddPatient}
            >
              Thêm bệnh nhân
            </Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={patientsData}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} bệnh nhân`,
          }}
        />
      </Card>

      <Modal
        title={selectedPatient ? "Thông tin bệnh nhân" : "Thêm bệnh nhân mới"}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => setModalVisible(false)}
        width={800}
        okText="Lưu"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Mã bệnh nhân"
                name="code"
                rules={[
                  { required: true, message: "Vui lòng nhập mã bệnh nhân!" },
                ]}
              >
                <Input placeholder="Nhập mã bệnh nhân" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Họ và tên"
                name="name"
                rules={[
                  { required: true, message: "Vui lòng nhập họ và tên!" },
                ]}
              >
                <Input placeholder="Nhập họ và tên" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label="Tuổi"
                name="age"
                rules={[{ required: true, message: "Vui lòng nhập tuổi!" }]}
              >
                <Input type="number" placeholder="Nhập tuổi" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Giới tính"
                name="gender"
                rules={[
                  { required: true, message: "Vui lòng chọn giới tính!" },
                ]}
              >
                <Select placeholder="Chọn giới tính">
                  <Option value="Nam">Nam</Option>
                  <Option value="Nữ">Nữ</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Số điện thoại"
                name="phone"
                rules={[
                  { required: true, message: "Vui lòng nhập số điện thoại!" },
                ]}
              >
                <Input placeholder="Nhập số điện thoại" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Địa chỉ" name="address">
                <Input placeholder="Nhập địa chỉ" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Chẩn đoán" name="diagnosis">
                <Input placeholder="Nhập chẩn đoán" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Trạng thái" name="status">
                <Select placeholder="Chọn trạng thái">
                  <Option value="active">Đang điều trị</Option>
                  <Option value="inactive">Ngừng điều trị</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Lần khám cuối" name="lastVisit">
                <DatePicker style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

export default PatientList;
