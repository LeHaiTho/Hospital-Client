import React, { useState } from "react";
import {
  Form,
  Input,
  Button,
  DatePicker,
  Upload,
  Select,
  message,
  Row,
  Col,
  Card,
  Modal,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useForm } from "antd/es/form/Form";

const { TextArea } = Input;
const { Option } = Select;
const { confirm } = Modal;

const AddHospital = ({ visible, onCancel, onFinish }) => {
  const [form] = Form.useForm();

  // const autoGeneratePassword = () => {
  //   const password = Math.random().toString(36).slice(-8);
  //   message.info(`Mật khẩu tự động: ${password}`);
  // };

  // modal

  return (
    // <Form
    //   style={{
    //     background: "#fff",
    //     padding: "24px",
    //     borderRadius: "8px",
    //     boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
    //     margin: "0 auto",
    //     overflow: "hidden",
    //   }}
    //   layout="vertical"
    //   onFinish={onFinish}
    //   form={form}
    // >
    //   <h2
    //     style={{
    //       textAlign: "center",
    //     }}
    //   >
    //     Tạo mới bệnh viện và cấp tài khoản quản trị viên
    //   </h2>

    //   <Row gutter={16}>
    //     <Col span={24}>
    //       <Form.Item
    //         label="Tên bệnh viện"
    //         name="hospitalName"
    //         rules={[{ required: true, message: "Vui lòng nhập tên bệnh viện" }]}
    //       >
    //         <Input />
    //       </Form.Item>
    //     </Col>
    //   </Row>

    //   <Row gutter={16}>
    //     <Col span={6}>
    //       <Form.Item
    //         label="Tỉnh/Thành phố"
    //         name="province"
    //         rules={[
    //           { required: true, message: "Vui lòng chọn tỉnh/thành phố" },
    //         ]}
    //       >
    //         <Select>
    //           <Option value="ho-chi-minh">Hồ Chí Minh</Option>
    //           <Option value="ha-noi">Hà Nội</Option>
    //           <Option value="da-nang">Đà Nẵng</Option>
    //           {/* Thêm các tỉnh/thành phố khác */}
    //         </Select>
    //       </Form.Item>
    //     </Col>

    //     <Col span={6}>
    //       <Form.Item
    //         label="Quận/Huyện"
    //         name="district"
    //         rules={[{ required: true, message: "Vui lòng chọn quận/huyện" }]}
    //       >
    //         <Select>
    //           <Option value="quan-1">Quận 1</Option>
    //           <Option value="quan-3">Quận 3</Option>
    //           <Option value="quan-7">Quận 7</Option>
    //           {/* Thêm các quận/huyện khác */}
    //         </Select>
    //       </Form.Item>
    //     </Col>
    //     <Col span={12}>
    //       <Form.Item
    //         label="Địa chỉ"
    //         name="hospitalAddress"
    //         rules={[{ required: true, message: "Vui lòng nhập địa chỉ" }]}
    //       >
    //         <Input />
    //       </Form.Item>
    //     </Col>
    //   </Row>

    //   {/* <Card
    //     title="Thông tin quản trị viên bệnh viện"
    //     style={{
    //       borderRadius: "8px",
    //       marginBottom: "24px",
    //     }}
    //   >
    //     <Row gutter={16}>
    //       <Col span={12}>
    //         <Form.Item
    //           label="Họ và tên"
    //           name="adminName"
    //           rules={[{ required: true, message: "Vui lòng nhập họ và tên" }]}
    //         >
    //           <Input />
    //         </Form.Item>
    //       </Col>

    //       <Col span={12}>
    //         <Form.Item
    //           label="Số điện thoại"
    //           name="adminPhone"
    //           rules={[
    //             { required: true, message: "Vui lòng nhập số điện thoại" },
    //           ]}
    //         >
    //           <Input />
    //         </Form.Item>
    //       </Col>
    //     </Row>

    //     <Row gutter={16}>
    //       <Col span={12}>
    //         <Form.Item
    //           label="Email"
    //           name="adminEmail"
    //           rules={[{ required: true, message: "Vui lòng nhập email" }]}
    //         >
    //           <Input type="email" />
    //         </Form.Item>
    //       </Col>

    //       <Col span={12}>
    //         <Form.Item
    //           label="Tên đăng nhập"
    //           name="adminUsername"
    //           rules={[
    //             { required: true, message: "Vui lòng nhập tên đăng nhập" },
    //           ]}
    //         >
    //           <Input />
    //         </Form.Item>
    //       </Col>
    //     </Row>
    //   </Card> */}

    //   <Form.Item
    //     style={{
    //       display: "flex",
    //       justifyContent: "center",
    //     }}
    //   >
    //     <Button type="primary" htmlType="submit">
    //       Thêm mới
    //     </Button>
    //     <Button
    //       style={{ marginLeft: "10px" }}
    //       onClick={() => {
    //         form.resetFields();
    //         navigate(-1);
    //       }}
    //       htmlType="button"
    //     >
    //       Quay lại
    //     </Button>
    //   </Form.Item>
    // </Form>
    <Modal
      title="Thêm mới bệnh viện"
      open={visible}
      onOk={() => form.submit()}
      onCancel={() => {
        form.resetFields();
        onCancel();
      }}
      okText="Lưu"
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
        name="add_hospital"
        onFinish={onFinish}
      >
        <Form.Item
          name="nameHospital"
          label="Tên bệnh viện"
          rules={[
            {
              required: true,
              message: "Vui lòng nhập Tên bệnh viện!",
            },
          ]}
        >
          <Input placeholder="Tên bệnh viện" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddHospital;
