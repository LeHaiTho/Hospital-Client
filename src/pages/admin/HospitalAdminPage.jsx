import React, { useState, useEffect } from "react";
import { Table, Button, Modal, Form, Input, notification, Tooltip } from "antd";
import axios from "axios";
import { FiSearch } from "react-icons/fi";
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

  const fetchHospitals = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "http://localhost:3000/hospitals/get-list"
      );
      setHospitals(response.data.hospitals);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const handleExportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(hospitals);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Hospitals");
    XLSX.writeFile(workbook, "hospital_list.xlsx");
  };

  const handleExportToPDF = () => {
    const doc = new jsPDF();

    // Add Roboto font
    doc.addFileToVFS("Roboto-Regular.ttf", RobotoFont);
    doc.addFont("Roboto-Regular.ttf", "Roboto", "normal");
    doc.setFont("Roboto");

    // Title
    doc.text("Danh sách cơ sở y tế", 14, 10);

    // Table data
    const tableColumn = ["Tên bệnh viện", "Email", "Địa chỉ", "Người quản lý"];
    const tableRows = hospitals.map((hospital) => [
      hospital.name,
      hospital.email,
      hospital.address,
      hospital.managerName,
    ]);

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });

    doc.save("hospital_list.pdf");
  };

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
      console.error(error);
      notification.error({
        message: error.response?.data?.message || "Đã xảy ra lỗi!",
      });
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
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
      title: "Người quản lý",
      dataIndex: "managerName",
      key: "managerName",
    },
    {
      title: "Hành động",
      key: "action",
      render: (text, record) => (
        <div>
          <Tooltip placement="bottom" title="Chỉnh sửa">
            <Button
              icon={<LiaEditSolid size={24} color="#000" />}
              type="text"
            />
          </Tooltip>
          <Tooltip placement="bottom" title="Xóa">
            <Button
              icon={<RiDeleteBin5Line size={22} color="#ff0000" />}
              type="text"
            />
          </Tooltip>
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
          <Button type="primary" onClick={handleExportToExcel}>
            Xuất Excel
          </Button>
          <Button type="primary" onClick={handleExportToPDF}>
            Xuất PDF
          </Button>
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
        rules={[{ required: true, message: "Vui lòng nhập email" }]}
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
