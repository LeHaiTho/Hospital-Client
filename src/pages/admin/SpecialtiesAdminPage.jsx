import React, { useEffect, useState } from "react";
import {
  Modal,
  Form,
  Input,
  Button,
  Table,
  Space,
  Flex,
  Tooltip,
  Typography,
  message,
  Select,
  Upload,
} from "antd";
import { FiSearch } from "react-icons/fi";
import styled from "styled-components";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { truncateDescription } from "../../utils/common";
import axios from "axios";
import { htmlToText } from "html-to-text";
const { Text } = Typography;
const { Search } = Input;

const CustomModal = styled(Modal)`
  .ant-modal-body {
    max-height: 70vh; /* Adjust based on your needs */
    overflow-y: auto;
    /* Custom scrollbar styles for WebKit browsers */
    &::-webkit-scrollbar {
      width: 8px; /* Width of the scrollbar */
    }

    &::-webkit-scrollbar-track {
      background: #f1f1f1; /* Background color of the scrollbar track */
    }

    &::-webkit-scrollbar-thumb {
      background: #888; /* Color of the scrollbar thumb */
      border-radius: 4px; /* Rounded corners for the scrollbar thumb */
    }

    &::-webkit-scrollbar-thumb:hover {
      background: #555; /* Color of the scrollbar thumb on hover */
    }
  }
`;

const SpecialtiesAdminPage = () => {
  const [specialties, setSpecialties] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingSpecialty, setEditingSpecialty] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchSpecialties = async () => {
      setIsLoading(true);
      const res = await axios.get("http://localhost:3000/specialties/list");
      setSpecialties(res.data.specialties);
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
      const res = await axios.delete(
        `http://localhost:3000/specialties/delete/${id}`
      );
      console.log("res", res);
      setSpecialties(specialties.filter((item) => item.id !== id));
      message.success("Xóa chuyên khoa thành công");
    } catch (error) {
      message.error(error.response.data.message);
      console.log("error", error);
    }
  };

  const handleOk = async (formData) => {
    if (editingSpecialty) {
      const res = await axios.put(
        `http://localhost:3000/specialties/update/${editingSpecialty.id}`,
        formData
      );
      console.log("res", res);
      setSpecialties((pre) =>
        pre.map((item) =>
          item.id === editingSpecialty.id
            ? { ...item, ...res.data.updatedSpecialty }
            : item
        )
      );
    } else {
      try {
        const res = await axios.post(
          "http://localhost:3000/specialties/create-new",
          formData
        );
        console.log("res", res);
        setSpecialties((pre) => [...pre, { ...res.data.newSpecialty }]);
      } catch (error) {
        message.error(error.response.data.message);
        console.log("error", error);
      }
    }

    setIsModalVisible(false);
    setIsLoading(false);
  };

  const handleOpenModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  return (
    <>
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
        onOk={handleOk}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={800}
        maskClosable={false}
        style={{
          maxHeight: "90vh",
          overflow: "hidden",
        }}
      >
        <SpecialtyForm initialValues={editingSpecialty} onSubmit={handleOk} />
      </CustomModal>
    </>
  );
};

const SpecialtiesList = ({
  specialties,
  handleEdit,
  handleDelete,
  handleOpenModal,
  isLoading,
}) => {
  const onChange = (value) => {
    console.log(`selected ${value}`);
  };
  const onSearch = (value) => {
    console.log("search:", value);
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      align: "center",
      width: "10%",
      render: (text, record) => <div>{record.id}</div>,
    },
    {
      title: "Ảnh",
      dataIndex: "photo",
      key: "photo",
      align: "center",
      width: 60,
      height: 60,
      render: (text, record) => (
        <div
          style={{
            width: 60,
            height: 60,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <img
            src={`http://localhost:3000${record.photo}`}
            crossOrigin="anonymous"
            alt={record.name}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
      ),
    },
    {
      title: "Tên chuyên khoa",
      dataIndex: "name",
      key: "name",
      width: "20%",
      render: (text, record) => <p>{truncateDescription(record.name, 20)}</p>,
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      width: "30%",
      render: (text, record) => (
        <div
          style={{
            width: "100%",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {truncateDescription(htmlToText(record.description), 100)}
        </div>
      ),
    },
    {
      title: "Hành động",
      key: "action",
      dataIndex: "action",
      align: "center",
      width: "10%",
      render: (text, record) => (
        <Space>
          <Tooltip placement="bottom" title="Chỉnh sửa">
            <Button
              icon={<EditOutlined />}
              onClick={() => handleEdit(record.id)}
              type="text"
            />
          </Tooltip>

          <Tooltip placement="bottom" title="Xóa">
            <Button
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record.id)}
              type="text"
              danger
            />
          </Tooltip>
        </Space>
      ),
    },
  ];
  return (
    <div style={{ backgroundColor: "#fff", padding: 16, borderRadius: 7 }}>
      <h2 style={{ textAlign: "center" }}>DANH SÁCH CHUYÊN KHOA</h2>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "10px",
          gap: 10,
        }}
      >
        <Input
          placeholder="Tìm kiếm"
          style={{
            width: "20%",
            marginBottom: "10px",
            backgroundColor: "#D9D9D9",
          }}
          prefix={<FiSearch />}
        />
        <div style={{ display: "flex", gap: "10px" }}>
          <Button
            type="primary"
            onClick={handleOpenModal}
            icon={<PlusOutlined />}
          >
            Thêm mới
          </Button>
        </div>
      </div>
      <Table
        columns={columns}
        dataSource={specialties}
        size="small"
        rowKey="id"
        loading={isLoading}
      />
    </div>
  );
};

const SpecialtyForm = ({ initialValues, onSubmit, isLoading }) => {
  const [file, setFile] = useState([]);
  const [description, setDescription] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        name: initialValues.name,
      });
      setDescription(initialValues.description);
      if (initialValues.photo) {
        setFile([
          {
            uid: "-1",
            name: "image.png",
            status: "done",
            url: `http://localhost:3000${initialValues.photo}`,
          },
        ]);
      }
    }
  }, [initialValues]);
  const handleSubmit = () => {
    form.validateFields().then((values) => {
      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("photo", file[0].originFileObj);
      formData.append("description", description);
      onSubmit(formData);
      form.resetFields();
      setFile([]);
      setDescription(null);
    });
  };

  const handleUpload = (value) => {
    setFile(value.fileList);
    console.log(value.fileList);
  };

  return (
    <Form form={form} layout="vertical" initialValues={initialValues}>
      <Form.Item
        name="name"
        label="Tên chuyên khoa"
        rules={[{ required: true, message: "Vui lòng nhập tên chuyên khoa" }]}
      >
        <Input placeholder="Nhập tên chuyên khoa" name="name" />
      </Form.Item>
      <Form.Item
        label="Ảnh chuyên khoa"
        name="photo"
        rules={[
          {
            required: initialValues ? false : true,
            message: "Vui lòng upload ảnh!",
          },
        ]}
        valuePropName="file"
      >
        <Upload
          accept=".jpg, .jpeg, .png"
          maxCount={1}
          beforeUpload={() => false}
          onChange={handleUpload} // Xử lý sự kiện khi chọn file
          fileList={file}
        >
          <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
        </Upload>
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
              "imageUpload",
              "bulletedList",
              "numberedList",
              "blockQuote",
              "|",
              "undo",
              "redo",
            ],
          }}
        />
      </Form.Item>
      <Button
        type="primary"
        htmlType="submit"
        onClick={handleSubmit}
        loading={isLoading}
      >
        {initialValues ? "Cập nhật" : "Thêm mới"}
      </Button>
    </Form>
  );
};

export default SpecialtiesAdminPage;
