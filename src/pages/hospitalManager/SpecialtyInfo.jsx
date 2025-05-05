import React, { useEffect, useState } from "react";
import SpecialtyForm from "../../features/hospital/components/SpecialtyForm";
import { Table, Space, Tooltip, Button, Card, Row, Col, Input } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import axiosConfig from "../../apis/axiosConfig";
import { truncateDescription } from "../../utils/common";
import { LiaEditSolid } from "react-icons/lia";
import { FiSearch } from "react-icons/fi";
import "./style.css";
import { RiDeleteBin5Line } from "react-icons/ri";

const SpecialtyInfo = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [specialties, setSpecialties] = useState([]);

  const fetchData = async () => {
    try {
      const response = await axiosConfig.get("/hospital-specialties/list");
      setSpecialties(response.specialties);
      console.log("/hospital-specialties/list", response.specialties);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const columns = [
    {
      title: "Ảnh",
      dataIndex: "image",
      key: "image",
      align: "center",
      width: "60px",
      height: "60px",
      render: (text, record) => (
        <div style={{ width: "60px", height: "60px" }}>
          <img
            src={`http://localhost:3000${record.image}`}
            crossOrigin="anonymous"
            alt={record.name}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
      ),
    },
    {
      title: "Nội dung dịch vụ",
      dataIndex: "name",
      key: "name",
      width: "auto",
      render: (text, record) => (
        <div>
          <p
            style={{
              fontWeight: "500",
              fontSize: "16px",
            }}
          >
            {record.name}
          </p>
          <p style={{ fontStyle: "italic" }}>
            {truncateDescription(record.description, 100)}
          </p>
        </div>
      ),
    },
    {
      title: "Phí khám",
      dataIndex: "consultation_fee",
      key: "consultation_fee",
      align: "center",

      render: (text, record) => (
        <p style={{ fontStyle: "italic", color: "#0165ff", fontWeight: "500" }}>
          {Number(record.consultation_fee).toLocaleString()}
        </p>
      ),
    },

    {
      title: "",
      key: "action",
      dataIndex: "action",
      align: "center",
      width: "10%",
      render: (text, record) => (
        <div>
          <Tooltip placement="bottom" title="Chỉnh sửa">
            <Button
              icon={<LiaEditSolid size={24} color="#000" />}
              onClick={() => handleEdit(record.id)}
              type="text"
            />
          </Tooltip>

          <Tooltip placement="bottom" title="Xóa">
            <Button
              icon={<RiDeleteBin5Line size={22} color="#ff0000" />}
              onClick={() => handleDelete(record.id)}
              type="text"
            />
          </Tooltip>
        </div>
      ),
    },
  ];
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        gap: "20px",
        backgroundColor: "#fff",
        padding: "20px",
        borderRadius: "10px",
      }}
    >
      <div
        style={{
          backgroundColor: "#fff",
          width: "30%",
        }}
      >
        <SpecialtyForm onFinish={fetchData} />
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          width: "100%",
        }}
      >
        <h1 style={{ fontSize: "24px", fontWeight: "500" }}>
          Danh sách dịch vụ
        </h1>
        <Input
          placeholder="Tìm kiếm"
          style={{
            width: "20%",
            marginBottom: "10px",
            backgroundColor: "#D9D9D9",
          }}
          prefix={<FiSearch />}
        />
        <Table
          columns={columns}
          size="small"
          pagination={false}
          dataSource={specialties.map((specialty) => ({
            ...specialty,
            key: specialty.id,
          }))}
        />
      </div>
    </div>
  );
};

export default SpecialtyInfo;
