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
  Popconfirm,
  Space,
} from "antd";
import {
  UploadOutlined,
  DeleteOutlined,
  EditOutlined,
} from "@ant-design/icons";
import axiosConfig from "../../../apis/axiosConfig";

const SpecialtyForm = ({ onFinish, editingSpecialty, existingSpecialties }) => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

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
    if (editingSpecialty) {
      form.setFieldsValue({
        specialty: editingSpecialty.specialty_id,
        name: editingSpecialty.name,
        description: editingSpecialty.description,
        consultation_fee: editingSpecialty.consultation_fee,
      });
      if (editingSpecialty.image) {
        setFileList([
          {
            uid: "-1",
            name: "image.png",
            status: "done",
            url: `http://localhost:3000${editingSpecialty.image}`,
          },
        ]);
      }
    } else {
      form.resetFields();
      setFileList([]);
    }
  }, [editingSpecialty, form]);

  const handleFinish = async (values) => {
    if (!editingSpecialty && fileList.length === 0) {
      message.error("Vui lòng chọn ảnh thông tin chuyên khoa");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    if (fileList[0]?.originFileObj) {
      formData.append("image", fileList[0].originFileObj);
    }
    formData.append("specialty", values.specialty);
    formData.append("name", values.name);
    formData.append("description", values.description);
    formData.append("consultation_fee", values.consultation_fee);

    try {
      let response;
      if (editingSpecialty) {
        // Cập nhật
        response = await axiosConfig.put(
          `/hospital-specialties/update/${editingSpecialty.id}`,
          formData
        );
        message.success("Cập nhật chuyên khoa thành công");
      } else {
        // Thêm mới
        response = await axiosConfig.post(
          "/hospital-specialties/create-new",
          formData
        );
        message.success("Thêm chuyên khoa thành công");
      }

      form.resetFields();
      setFileList([]);
      if (onFinish) {
        onFinish();
      }
    } catch (error) {
      console.log(error);
      message.error(
        editingSpecialty
          ? "Cập nhật chuyên khoa thất bại, vui lòng thử lại!"
          : "Thêm chuyên khoa thất bại, vui lòng thử lại!"
      );
    } finally {
      setLoading(false);
    }
  };

  // Hàm xử lý xóa chuyên khoa
  const handleDelete = async () => {
    if (!editingSpecialty) {
      return;
    }

    setDeleteLoading(true);
    try {
      await axiosConfig.patch(
        `/hospital-specialties/soft-delete/${editingSpecialty.id}`
      );
      message.success("Xóa chuyên khoa thành công");
      form.resetFields();
      setFileList([]);
      if (onFinish) {
        onFinish();
      }
    } catch (error) {
      console.log(error);
      message.error("Xóa chuyên khoa thất bại, vui lòng thử lại!");
    } finally {
      setDeleteLoading(false);
    }
  };

  const onChangeImage = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  // Lọc ra các chuyên khoa chưa có dịch vụ
  const getAvailableSpecialties = () => {
    if (!specialties || !existingSpecialties) return [];

    // Nếu đang chỉnh sửa, vẫn hiển thị chuyên khoa hiện tại
    if (editingSpecialty) {
      return specialties.filter(
        (specialty) =>
          specialty.id === editingSpecialty.specialty_id ||
          !existingSpecialties.includes(specialty.id)
      );
    }

    // Nếu thêm mới, chỉ hiển thị các chuyên khoa chưa có dịch vụ
    return specialties.filter(
      (specialty) => !existingSpecialties.includes(specialty.id)
    );
  };

  const availableSpecialties = getAvailableSpecialties();

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
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2
          style={{
            fontSize: "16px",
            fontWeight: "500",
            textTransform: "uppercase",
            color: "#0165fc",
          }}
        >
          {editingSpecialty
            ? "CẬP NHẬT DỊCH VỤ CHUYÊN KHOA"
            : "THÊM DỊCH VỤ CHUYÊN KHOA"}
        </h2>
      </div>
      <Divider />
      <Form.Item
        name="specialty"
        label="Chuyên khoa"
        rules={[{ required: true, message: "Vui lòng chọn chuyên khoa" }]}
      >
        <Select
          style={{ width: "100%", borderRadius: 8 }}
          placeholder="Chọn chuyên khoa"
          disabled={editingSpecialty}
        >
          {availableSpecialties.map((item) => (
            <Select.Option key={item.id} value={item.id}>
              {item.name}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item
        name="name"
        label="Tên gói dịch vụ khám"
        rules={[
          { required: true, message: "Vui lòng nhập tên gói dịch vụ khám" },
        ]}
      >
        <Input
          placeholder="Nhập tên gói dịch vụ khám"
          style={{ borderRadius: 8 }}
        />
      </Form.Item>

      <Form.Item
        name="image"
        label="Ảnh thông tin gói dịch vụ"
        rules={[
          {
            required: !editingSpecialty,
            message: "Vui lòng chọn ảnh thông tin gói dịch vụ",
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
        rules={[{ required: true, message: "Vui lòng nhập mô tả gói dịch vụ" }]}
      >
        <Input.TextArea
          style={{ width: "100%", borderRadius: 8 }}
          rows={4}
          placeholder="Nhập mô tả chuyên khoa"
        />
      </Form.Item>

      <Space style={{ marginTop: 16 }}>
        <Button
          type="primary"
          htmlType="submit"
          loading={loading}
          icon={<EditOutlined />}
          style={{
            borderRadius: 8,
            backgroundColor: "#0165fc",
            borderColor: "#0165fc",
          }}
        >
          {editingSpecialty ? "Cập nhật" : "Thêm mới"}
        </Button>

        {editingSpecialty && (
          <>
            <Popconfirm
              title="Xóa chuyên khoa"
              description="Bạn có chắc chắn muốn xóa chuyên khoa này không?"
              onConfirm={handleDelete}
              okText="Xóa"
              cancelText="Hủy"
              okButtonProps={{ danger: true, loading: deleteLoading }}
            >
              <Button danger icon={<DeleteOutlined />} loading={deleteLoading}>
                Xóa
              </Button>
            </Popconfirm>

            <Button
              type="default"
              onClick={() => {
                form.resetFields();
                setFileList([]);
                onFinish();
              }}
              style={{
                borderRadius: 8,
              }}
            >
              Hủy chỉnh sửa
            </Button>
          </>
        )}
      </Space>
    </Form>
  );
};

export default SpecialtyForm;
