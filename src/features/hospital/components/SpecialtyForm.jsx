import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  Button,
  Upload,
  Select,
  InputNumber,
  Divider,
  Image,
  message,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import axiosConfig from "../../../apis/axiosConfig";

const SpecialtyForm = ({ onFinish, initialValues }) => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const [specialties, setSpecialties] = useState([]);

  useEffect(() => {
    const getSpecialties = async () => {
      try {
        const response = await axiosConfig.get(
          "/hospital-specialties/list-specialty-of-hospital"
        );
        setSpecialties(response.specialtiesOfSystem);
      } catch (error) {
        console.log(error);
        message.error("Lỗi khi tải danh sách chuyên khoa");
      }
    };
    getSpecialties();
  }, []);

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        specialty: initialValues.specialty,
        name: initialValues.name,
        description: initialValues.description,
        consultation_fee: initialValues.consultation_fee,
      });
      if (initialValues.image) {
        setFileList([
          {
            uid: "-1",
            name: "image.png",
            status: "done",
            url: `http://localhost:3000${initialValues.image}`,
          },
        ]);
      }
    } else {
      form.resetFields();
      setFileList([]);
    }
  }, [initialValues, form]);

  const handleFinish = async (values) => {
    if (fileList.length === 0) {
      message.error("Vui lòng chọn ảnh thông tin chuyên khoa");
      return;
    }

    const formData = new FormData();
    if (fileList[0].originFileObj) {
      formData.append("image", fileList[0].originFileObj);
    }
    formData.append("specialty", values.specialty);
    formData.append("name", values.name);
    formData.append("description", values.description);
    formData.append("consultation_fee", values.consultation_fee);

    try {
      const response = await axiosConfig.post(
        "/hospital-specialties/create-new",
        formData
      );
      message.success(response.message || "Thêm chuyên khoa thành công");
      form.resetFields();
      setFileList([]);
      if (onFinish) {
        onFinish();
      }
    } catch (error) {
      console.log(error);
      message.error("Thêm chuyên khoa thất bại, vui lòng thử lại!");
    }
  };

  const onChangeImage = ({ fileList: newFileList }) => {
    setFileList(newFileList);
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
        backgroundColor: "#fff",
      }}
      layout="vertical"
    >
      <h2
        style={{
          fontSize: "16px",
          fontWeight: "500",
          textTransform: "uppercase",
          textAlign: "center",
          color: "#0165fc",
        }}
      >
        DỊCH VỤ CHUYÊN KHOA CỦA CƠ SỞ Y TẾ
      </h2>
      <Divider />
      <Form.Item
        name="specialty"
        label="Chuyên khoa"
        rules={[{ required: true, message: "Vui lòng chọn chuyên khoa" }]}
      >
        <Select
          style={{ width: "100%", borderRadius: 8 }}
          placeholder="Chọn chuyên khoa"
        >
          {specialties.map((item) => (
            <Select.Option key={item.id} value={item.id}>
              {item.name}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item
        name="name"
        label="Tiêu đề chuyên khoa"
        rules={[
          { required: true, message: "Vui lòng nhập tiêu đề chuyên khoa" },
        ]}
      >
        <Input
          placeholder="Nhập tiêu đề chuyên khoa"
          style={{ borderRadius: 8 }}
        />
      </Form.Item>

      <Form.Item
        name="image"
        label="Ảnh thông tin chuyên khoa"
        rules={[
          {
            required: !initialValues,
            message: "Vui lòng chọn ảnh thông tin chuyên khoa",
          },
        ]}
      >
        <Upload
          onChange={onChangeImage}
          maxCount={1}
          beforeUpload={() => false}
          accept="image/*"
          fileList={fileList}
          listType="picture"
        >
          <Button icon={<UploadOutlined />} style={{ borderRadius: 8 }}>
            Upload
          </Button>
        </Upload>
        {fileList.length > 0 && fileList[0].url && (
          <Image
            src={fileList[0].url}
            alt="preview"
            style={{
              width: "100%",
              maxWidth: 200,
              height: "auto",
              marginTop: 8,
              borderRadius: 8,
              objectFit: "cover",
            }}
            preview={false}
            onError={(e) =>
              (e.target.src = "https://via.placeholder.com/200?text=No+Image")
            }
          />
        )}
      </Form.Item>

      <Form.Item
        name="consultation_fee"
        label="Phí khám"
        rules={[{ required: true, message: "Vui lòng nhập phí khám" }]}
      >
        <InputNumber
          min={0}
          style={{ width: "100%", borderRadius: 8 }}
          placeholder="Nhập phí khám"
          formatter={(value) =>
            `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
          }
          parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
        />
      </Form.Item>

      <Form.Item
        name="description"
        label="Mô tả"
        rules={[{ required: true, message: "Vui lòng nhập mô tả chuyên khoa" }]}
      >
        <Input.TextArea
          style={{ width: "100%", borderRadius: 8 }}
          rows={4}
          placeholder="Nhập mô tả chuyên khoa"
        />
      </Form.Item>

      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          style={{
            width: "100%",
            borderRadius: 8,
            backgroundColor: "#0165fc",
            borderColor: "#0165fc",
          }}
        >
          {initialValues ? "Cập nhật" : "Thêm mới"}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default SpecialtyForm;
