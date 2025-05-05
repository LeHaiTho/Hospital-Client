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
  return (
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
