import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  notification,
  Tooltip,
  Tag,
} from "antd";
import axios from "axios";
import { FiSearch, FiLock, FiUnlock } from "react-icons/fi";
import { LiaEditSolid } from "react-icons/lia";
import { RiDeleteBin5Line } from "react-icons/ri";
import { PlusOutlined } from "@ant-design/icons";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import RobotoFont from "../../assets/fonts/Roboto-Regular-normal.js"; // Import font

const HospitalAdminPage = () => {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchHospitals();
  }, []);
  console.log("hospitals", hospitals);
  const fetchHospitals = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "http://localhost:3000/hospitals/get-list"
      );
      setHospitals(response.data.hospitals);
    } catch (error) {
      console.error(error);
      notification.error({
        message: "Lỗi",
        description: "Không thể tải danh sách cơ sở y tế!",
      });
    }
    setLoading(false);
  };

  // const handleExportToExcel = () => {
  //   const worksheet = XLSX.utils.json_to_sheet(hospitals);
  //   const workbook = XLSX.utils.book_new();
  //   XLSX.utils.book_append_sheet(workbook, worksheet, "Hospitals");
  //   XLSX.writeFile(workbook, "hospital_list.xlsx");
  // };

  // const handleExportToPDF = () => {
  //   const doc = new jsPDF();
  //   doc.addFileToVFS("Roboto-Regular.ttf", RobotoFont);
  //   doc.addFont("Roboto-Regular.ttf", "Roboto", "normal");
  //   doc.setFont("Roboto");
  //   doc.text("Danh sách cơ sở y tế", 14, 10);

  //   const tableColumn = ["Tên bệnh viện", "Email", "Địa chỉ", "Người quản lý"];
  //   const tableRows = hospitals.map((hospital) => [
  //     hospital.name,
  //     hospital.email,
  //     hospital.address,
  //     hospital.managerName,
  //   ]);

  //   doc.autoTable({
  //     head: [tableColumn],
  //     body: tableRows,
  //     startY: 20,
  //   });
  //   doc.save("hospital_list.pdf");
  // };

  const handleOpenModal = () => {
    setIsModalVisible(true);
  };

  const handleOk = async (values) => {
    try {
      const response = await axios.post(
        "http://localhost:3000/hospitals/create-new",
        values
      );
      setHospitals((prev) => [...prev, response.data.newHospital]);
      notification.success({
        message: "Thêm mới cơ sở y tế thành công",
        duration: 2,
      });
      handleCancel();
    } catch (error) {
      notification.error({
        message: "Lỗi",
        description: error.response?.data?.message || "Đã xảy ra lỗi!",
      });
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  // Handle lock hospital (client-side for testing)
  const handleLock = (hospitalId) => {
    Modal.confirm({
      title: "Xác nhận khóa",
      content: "Bạn có chắc muốn khóa cơ sở y tế này?",
      okText: "Khóa",
      cancelText: "Hủy",
      okType: "danger",
      onOk: () => {
        setHospitals((prev) =>
          prev.map((hospital) =>
            hospital.id === hospitalId
              ? { ...hospital, isActive: false }
              : hospital
          )
        );
        axios.put(`http://localhost:3000/hospitals/disable/${hospitalId}`, {
          isActive: false,
        });
        notification.success({
          message: "Thành công",
          description: "Đã khóa cơ sở y tế!",
          duration: 2,
        });
      },
    });
  };

  // Handle unlock hospital (client-side for testing)
  const handleUnlock = (hospitalId) => {
    Modal.confirm({
      title: "Xác nhận mở khóa",
      content: "Bạn có chắc muốn mở khóa cơ sở y tế này?",
      okText: "Mở khóa",
      cancelText: "Hủy",
      onOk: () => {
        setHospitals((prev) =>
          prev.map((hospital) =>
            hospital.id === hospitalId
              ? { ...hospital, isActive: true }
              : hospital
          )
        );
        axios.put(`http://localhost:3000/hospitals/disable/${hospitalId}`, {
          isActive: true,
        });
        notification.success({
          message: "Thành công",
          description: "Đã mở khóa cơ sở y tế!",
          duration: 2,
        });
      },
    });
  };

  const columns = [
    {
      title: "Tên bệnh viện",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Địa chỉ",
      dataIndex: "address",
      key: "address",
    },
    {
      title: "Tình trạng",
      dataIndex: "status",
      key: "status",
      render: (text, record) => (
        <Tag
          color={
            record.isActive &&
            record?.manager?.isFirstLogin === false &&
            record?.isDeleted === false
              ? "green"
              : record.isActive === false
                ? "red"
                : "yellow"
          }
        >
          {record.isActive &&
          record?.manager?.isFirstLogin === false &&
          record?.isDeleted === false
            ? "Đang hoạt động"
            : record.isActive === false
              ? "Đã khóa"
              : "Chưa kích hoạt"}
        </Tag>
      ),
    },
    {
      title: "Hành động",
      key: "action",
      render: (text, record) => (
        <div style={{ display: "flex", gap: 8 }}>
          {record.isActive &&
          record?.manager?.isFirstLogin === false &&
          record?.isDeleted === false ? (
            <Tooltip placement="bottom" title="Khóa">
              <Button
                icon={<FiLock size={22} color="#ff4d4f" />}
                type="text"
                onClick={() => handleLock(record.id)}
              />
            </Tooltip>
          ) : record.isActive === false ? (
            <Tooltip placement="bottom" title="Mở khóa">
              <Button
                icon={<FiUnlock size={22} color="#52c41a" />}
                type="text"
                onClick={() => handleUnlock(record.id)}
              />
            </Tooltip>
          ) : null}
        </div>
      ),
    },
  ];

  return (
    <div style={{ backgroundColor: "#fff", padding: 16, borderRadius: 7 }}>
      <h2 style={{ textAlign: "center" }}>DANH SÁCH CƠ SỞ Y TẾ</h2>
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
          {/* <Button type="primary" onClick={handleExportToExcel}>
            Xuất Excel
          </Button>
          <Button type="primary" onClick={handleExportToPDF}>
            Xuất PDF
          </Button> */}
          <Button
            type="primary"
            onClick={handleOpenModal}
            icon={<PlusOutlined />}
          >
            Thêm mới
          </Button>
        </div>
      </div>
      <Modal
        title="Thêm mới cơ sở y tế"
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <AddNewHospital onSubmit={handleOk} form={form} />
      </Modal>
      <Table
        columns={columns}
        dataSource={hospitals}
        size="small"
        rowKey="id"
        loading={loading}
      />
    </div>
  );
};

const AddNewHospital = ({ onSubmit, form }) => {
  const handleSubmit = () => {
    form.validateFields().then((values) => {
      onSubmit(values);
    });
  };

  return (
    <Form form={form} layout="vertical">
      <Form.Item
        name="name"
        label="Tên cơ sở y tế"
        rules={[{ required: true, message: "Vui lòng nhập tên cơ sở y tế" }]}
      >
        <Input placeholder="Nhập tên cơ sở y tế" />
      </Form.Item>
      <Form.Item
        name="email"
        label="Email"
        rules={[
          { required: true, message: "Vui lòng nhập email" },
          { type: "email", message: "Email không hợp lệ" },
        ]}
      >
        <Input placeholder="Nhập email" />
      </Form.Item>
      <Button type="primary" htmlType="submit" onClick={handleSubmit}>
        Thêm mới
      </Button>
    </Form>
  );
};

export default HospitalAdminPage;
