import React, { useEffect, useState } from "react";
import {
  Modal,
  Form,
  Input,
  Button,
  Table,
  Space,
  Tooltip,
  Typography,
  message,
  Upload,
} from "antd";
import { FiSearch } from "react-icons/fi";
import styled from "styled-components";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
  SyncOutlined,
} from "@ant-design/icons";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { truncateDescription } from "../../utils/common";
import axios from "axios";
import { htmlToText } from "html-to-text";

const { Text } = Typography;

// Styled Components
const Container = styled.div`
  background-color: #fff;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
`;

const Header = styled.h2`
  text-align: center;
  font-size: 24px;
  font-weight: 600;
  color: #1d39c4;
  margin-bottom: 24px;
  text-transform: uppercase;
`;

const SearchInput = styled(Input)`
  width: 300px;
  border-radius: 8px;
  background-color: #f5f5f5;
  transition: all 0.3s;

  &:hover,
  &:focus {
    background-color: #fff;
    border-color: #1d39c4;
    box-shadow: 0 0 0 2px rgba(29, 57, 196, 0.2);
  }
`;

const ActionButton = styled(Button)`
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.3s;

  // &.ant-btn-primary {
  //   background-color: #1d39c4;
  //   border-color: #1d39c4;
  // }
`;

const CustomModal = styled(Modal)`
  .ant-modal-content {
    border-radius: 12px;
  }

  .ant-modal-header {
    border-radius: 12px 12px 0 0;
    // background-color: #1d39c4;
  }

  .ant-modal-title {
    color: #000;
    font-weight: 600;
  }

  .ant-modal-body {
    max-height: 70vh;
    overflow-y: auto;
    padding: 24px;

    &::-webkit-scrollbar {
      width: 8px;
    }

    &::-webkit-scrollbar-track {
      background: #f1f1f1;
    }

    &::-webkit-scrollbar-thumb {
      background: #888;
      border-radius: 4px;
    }

    &::-webkit-scrollbar-thumb:hover {
      background: #555;
    }
  }
`;

const ImagePreview = styled.img`
  width: 100%;
  max-width: 200px;
  height: auto;
  border-radius: 8px;
  margin-top: 8px;
  object-fit: cover;
`;

const SpecialtiesAdminPage = () => {
  const [specialties, setSpecialties] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingSpecialty, setEditingSpecialty] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchSpecialties = async () => {
      setIsLoading(true);
      try {
        const res = await axios.get("http://localhost:3000/specialties/list");
        setSpecialties(res.data.specialties);
      } catch (error) {
        message.error("Lỗi khi tải danh sách chuyên khoa");
      }
      setIsLoading(false);
    };
    fetchSpecialties();
  }, []);

  const handleEdit = (id) => {
    setIsModalVisible(true);
    const specialty = specialties.find((item) => item.id === id);
    setEditingSpecialty(specialty);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:3000/specialties/delete/${id}`);
      setSpecialties(specialties.filter((item) => item.id !== id));
      message.success("Xóa chuyên khoa thành công");
    } catch (error) {
      message.error(error.response?.data?.message || "Lỗi khi xóa chuyên khoa");
    }
  };

  const handleOk = async (formData) => {
    setIsLoading(true);
    try {
      if (editingSpecialty) {
        const res = await axios.put(
          `http://localhost:3000/specialties/update/${editingSpecialty.id}`,
          formData
        );
        setSpecialties((prev) =>
          prev.map((item) =>
            item.id === editingSpecialty.id
              ? { ...item, ...res.data.updatedSpecialty }
              : item
          )
        );
        message.success("Cập nhật chuyên khoa thành công");
      } else {
        const res = await axios.post(
          "http://localhost:3000/specialties/create-new",
          formData
        );
        setSpecialties((prev) => [...prev, res.data.newSpecialty]);
        message.success("Thêm chuyên khoa thành công");
      }
      setIsModalVisible(false);
      setEditingSpecialty(null);
    } catch (error) {
      message.error(error.response?.data?.message || "Lỗi khi lưu chuyên khoa");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = () => {
    setIsModalVisible(true);
    setEditingSpecialty(null);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingSpecialty(null);
  };

  return (
    <Container>
      <Header>DANH SÁCH CHUYÊN KHOA</Header>
      <SpecialtiesList
        handleOpenModal={handleOpenModal}
        handleDelete={handleDelete}
        handleEdit={handleEdit}
        specialties={specialties}
        isLoading={isLoading}
      />
      <CustomModal
        title={
          editingSpecialty ? "Chỉnh sửa chuyên khoa" : "Thêm mới chuyên khoa"
        }
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={900}
        maskClosable={false}
      >
        <SpecialtyForm
          initialValues={editingSpecialty}
          onSubmit={handleOk}
          isLoading={isLoading}
        />
      </CustomModal>
    </Container>
  );
};

const SpecialtiesList = ({
  specialties,
  handleEdit,
  handleDelete,
  handleOpenModal,
  isLoading,
}) => {
  const generateKeywords = async (id) => {
    try {
      message.loading({ content: "Đang tạo từ khóa...", key: "keywords" });
      await axios.post(
        `http://localhost:3000/specialties/generate-keywords/${id}`
      );
      message.success({
        content: "Tạo từ khóa thành công",
        key: "keywords",
        duration: 2,
      });
    } catch (error) {
      message.error({
        content: error.response?.data?.message || "Lỗi khi tạo từ khóa",
        key: "keywords",
        duration: 2,
      });
    }
  };

  const columns = [
    {
      title: "Ảnh",
      dataIndex: "photo",
      key: "photo",
      align: "center",
      width: 100,
      render: (photo) => (
        <div
          style={{
            width: 60,
            height: 60,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 8,
            overflow: "hidden",
            backgroundColor: "#f5f5f5",
          }}
        >
          {photo ? (
            <img
              src={`http://localhost:3000${photo}`}
              alt="specialty"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              onError={(e) =>
                (e.target.src = "https://via.placeholder.com/60?text=No+Image")
              }
            />
          ) : (
            <img
              src="https://via.placeholder.com/60?text=No+Image"
              alt="placeholder"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          )}
        </div>
      ),
    },
    {
      title: "Tên chuyên khoa",
      dataIndex: "name",
      key: "name",
      width: "20%",
      render: (text) => (
        <Text style={{ fontWeight: 500 }}>{truncateDescription(text, 30)}</Text>
      ),
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      render: (text) => (
        <div
          style={{
            maxWidth: "100%",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "normal",
            lineHeight: "1.5",
          }}
        >
          {truncateDescription(htmlToText(text), 150)}
        </div>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      align: "center",
      width: 200,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Chỉnh sửa">
            <ActionButton
              type="primary"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record.id)}
              size="small"
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <ActionButton
              type="primary"
              danger
              icon={<DeleteOutlined />}
              onClick={() => {
                Modal.confirm({
                  title: "Xác nhận xóa",
                  content: "Bạn có chắc chắn muốn xóa chuyên khoa này?",
                  okText: "Xóa",
                  okType: "danger",
                  cancelText: "Hủy",
                  onOk: () => handleDelete(record.id),
                });
              }}
              size="small"
            />
          </Tooltip>
          <Tooltip title="Tạo từ khóa">
            <ActionButton
              type="default"
              icon={<SyncOutlined />}
              onClick={() => generateKeywords(record.id)}
              size="small"
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <SearchInput
          placeholder="Tìm kiếm chuyên khoa"
          prefix={<FiSearch style={{ color: "#8c8c8c" }} />}
        />
        <ActionButton
          type="primary"
          onClick={handleOpenModal}
          icon={<PlusOutlined />}
        >
          Thêm mới
        </ActionButton>
      </div>
      <Table
        columns={columns}
        dataSource={specialties}
        rowKey="id"
        loading={isLoading}
        pagination={{ pageSize: 10 }}
        rowClassName={() => "hover-row"}
        style={{ borderRadius: 8, overflow: "hidden" }}
      />
    </div>
  );
};

const SpecialtyForm = ({ initialValues, onSubmit, isLoading }) => {
  const [fileList, setFileList] = useState([]);
  const [description, setDescription] = useState("");
  const [form] = Form.useForm();

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        name: initialValues.name,
      });
      setDescription(initialValues.description || "");
      if (initialValues.photo) {
        setFileList([
          {
            uid: "-1",
            name: "image.png",
            status: "done",
            url: `http://localhost:3000${initialValues.photo}`,
          },
        ]);
      } else {
        setFileList([]);
      }
    } else {
      form.resetFields();
      setDescription("");
      setFileList([]);
    }
  }, [initialValues, form]);

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      const formData = new FormData();
      formData.append("name", values.name);
      if (fileList.length > 0 && fileList[0].originFileObj) {
        formData.append("photo", fileList[0].originFileObj);
      }
      formData.append("description", description || "");
      onSubmit(formData);
      form.resetFields();
      setFileList([]);
      setDescription("");
    });
  };

  const handleUpload = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  return (
    <Form form={form} layout="vertical">
      <Form.Item
        name="name"
        label="Tên chuyên khoa"
        rules={[{ required: true, message: "Vui lòng nhập tên chuyên khoa" }]}
      >
        <Input placeholder="Nhập tên chuyên khoa" style={{ borderRadius: 8 }} />
      </Form.Item>
      <Form.Item
        label="Ảnh chuyên khoa"
        name="photo"
        rules={[
          {
            required: !initialValues,
            message: "Vui lòng chọn ảnh chuyên khoa",
          },
        ]}
      >
        <Upload
          accept=".jpg,.jpeg,.png"
          maxCount={1}
          beforeUpload={() => false}
          onChange={handleUpload}
          fileList={fileList}
          listType="picture"
        >
          <ActionButton icon={<UploadOutlined />}>Chọn ảnh</ActionButton>
        </Upload>
        {fileList.length > 0 && fileList[0].url && (
          <ImagePreview
            src={fileList[0].url}
            alt="preview"
            onError={(e) =>
              (e.target.src = "https://via.placeholder.com/200?text=No+Image")
            }
          />
        )}
      </Form.Item>
      <Form.Item
        name="description"
        label="Mô tả"
        rules={[{ required: true, message: "Vui lòng nhập mô tả" }]}
      >
        <CKEditor
          editor={ClassicEditor}
          data={description}
          onChange={(event, editor) => {
            const data = editor.getData();
            setDescription(data);
          }}
          config={{
            toolbar: [
              "heading",
              "|",
              "bold",
              "italic",
              "link",
              "bulletedList",
              "numberedList",
              "|",
              "undo",
              "redo",
            ],
          }}
        />
      </Form.Item>
      <Form.Item>
        <ActionButton
          type="primary"
          onClick={handleSubmit}
          loading={isLoading}
          block
        >
          {initialValues ? "Cập nhật" : "Thêm mới"}
        </ActionButton>
      </Form.Item>
    </Form>
  );
};

export default SpecialtiesAdminPage;

// CSS for table row hover effect
const styles = `
  .hover-row:hover {
    background-color: #f5f5f5;
    transition: background-color 0.3s;
  }
`;

// Inject styles
const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);
