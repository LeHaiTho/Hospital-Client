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
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import axiosInstance from "../../../apis/axiosConfig";

const SpecialtyForm = ({ onFinish }) => {
  const [form] = Form.useForm();
  const [image, setImage] = useState(null);
  const [specialties, setSpecialties] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axiosInstance.get("/specialties/list-to-select");
        setSpecialties(response.specialties);
      } catch (error) {
        console.log(error);
      }
    };
    fetchData();
  }, []);

  const handleFinish = async (values) => {
    const formData = new FormData();
    formData.append("image", image.originFileObj);
    formData.append("specialty", values.specialty);
    formData.append("name", values.name);
    formData.append("description", values.description);
    try {
      const response = await axiosInstance.post(
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
    <Form form={form} layout="horizontal" onFinish={handleFinish}>
      <Row gutter={16}>
        <Col span={16}>
          <Row>
            <Col span={24}>
              <Form.Item
                name="specialty"
                label="Chọn chuyên khoa"
                rules={[
                  { required: true, message: "Vui lòng chọn chuyên khoa" },
                ]}
              >
                <Select>
                  {specialties.map((item, index) => {
                    return (
                      <Select.Option key={index} value={item.id}>
                        {item.name}
                      </Select.Option>
                    );
                  })}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <Form.Item
                name="name"
                label="Tiêu đề chuyên khoa"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập tiêu đề chuyên khoa",
                  },
                ]}
              >
                <Input placeholder="Nhập tiêu đề chuyên khoa" />
              </Form.Item>
            </Col>
          </Row>
        </Col>

        <Col span={8}>
          <Row>
            <Col span={24}>
              <Form.Item
                name="image"
                label="Ảnh chuyên khoa"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng chọn ảnh chuyên khoa",
                  },
                ]}
              >
                <Upload
                  onChange={onChangeImage}
                  maxCount={1}
                  beforeUpload={() => false}
                >
                  <Button icon={<UploadOutlined />}>Upload</Button>
                </Upload>
              </Form.Item>
            </Col>
          </Row>
        </Col>
      </Row>
      <Row>
        <Col span={24}>
          <Form.Item
            name="description"
            label="Mô tả chuyên khoa"
            rules={[
              {
                required: true,
                message: "Vui lòng nhập mô tả chuyên khoa",
              },
            ]}
          >
            <Input.TextArea />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item>
        <Button type="primary" htmlType="submit">
          Cập nhật
        </Button>
      </Form.Item>
    </Form>
  );
};

export default SpecialtyForm;
