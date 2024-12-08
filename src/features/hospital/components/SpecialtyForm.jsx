import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  Button,
  Upload,
  Select,
  DatePicker,
  InputNumber,
  Checkbox,
  Row,
  Col,
  Image,
  message,
  Divider,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import axiosInstance from "../../../apis/axiosConfig";
import axiosConfig from "../../../apis/axiosConfig";
const SpecialtyForm = ({ onFinish }) => {
  const [form] = Form.useForm();
  const [image, setImage] = useState(null);
  const [specialties, setSpecialties] = useState([]);

  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       const response = await axiosInstance.get("/specialties/list-to-select");
  //       setSpecialties(response.specialties);
  //     } catch (error) {
  //       console.log(error);
  //     }
  //   };
  //   fetchData();
  // }, []);
  // console.log(specialties);
  useEffect(() => {
    const getSpecialties = async () => {
      const response = await axiosConfig.get(
        "/hospital-specialties/list-specialty-of-hospital"
      );
      setSpecialties(response.specialtiesOfSystem);
    };
    getSpecialties();
  }, []);
  console.log(specialties);

  const handleFinish = async (values) => {
    const formData = new FormData();
    formData.append("image", image.originFileObj);
    formData.append("specialty", values.specialty);
    formData.append("name", values.name);
    formData.append("description", values.description);
    formData.append("consultation_fee", values.consultation_fee);
    try {
      const response = await axiosConfig.post(
        "/hospital-specialties/create-new",
        formData
      );

      message.success(response.message);
      form.resetFields();
      if (onFinish) {
        onFinish();
      }
    } catch (error) {
      console.log(error);
      message.error("Thêm chuyên khoa thất bại, vui lòng thử lại!");
    }
  };

  const onChangeImage = ({ fileList }) => {
    setImage(fileList[0]);
  };

  return (
    <Form
      form={form}
      onFinish={handleFinish}
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        border: "1px solid #e5e5e5",
        padding: "20px",
        borderRadius: "10px",
      }}
      layout="vertical"
    >
      <h2
        style={{
          fontSize: "16px",
          fontWeight: "500",
          textTransform: "uppercase",
          textAlign: "center",
        }}
      >
        Dịch vụ chuyên khoa của cơ sở y tế
      </h2>
      <Divider />
      <Form.Item
        name="specialty"
        rules={[{ required: true, message: "Vui lòng chọn chuyên khoa" }]}
      >
        <Select style={{ width: "100%" }} placeholder="Chọn chuyên khoa">
          {specialties.map((item, index) => {
            return (
              <Select.Option key={index} value={item.id}>
                {item.name}
              </Select.Option>
            );
          })}
        </Select>
      </Form.Item>

      <Form.Item
        name="name"
        rules={[
          {
            required: true,
            message: "Vui lòng nhập tiêu đề chuyên khoa",
          },
        ]}
      >
        <Input placeholder="Nhập tiêu đề chuyên khoa" />
      </Form.Item>

      <Form.Item
        name="image"
        rules={[
          {
            required: true,
            message: "Vui lòng chọn ảnh thông tin chuyên khoa",
          },
        ]}
      >
        <Upload
          onChange={onChangeImage}
          maxCount={1}
          beforeUpload={() => false}
          accept="image/*"
        >
          <Button icon={<UploadOutlined />}>Upload</Button>
        </Upload>
      </Form.Item>

      <Form.Item
        name="consultation_fee"
        rules={[
          {
            required: true,
            message: "Vui lòng nhập phí khám",
          },
        ]}
      >
        <InputNumber
          min={0}
          style={{ width: "100%" }}
          placeholder="Nhập phí khám"
        />
      </Form.Item>

      <Form.Item
        name="description"
        rules={[
          {
            required: true,
            message: "Vui lòng nhập mô tả chuyên khoa",
          },
        ]}
      >
        <Input.TextArea
          style={{ width: "100%" }}
          rows={4}
          placeholder="Nhập mô tả chuyên khoa"
        />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit">
          Cập nhật
        </Button>
      </Form.Item>
    </Form>
  );
};

export default SpecialtyForm;
