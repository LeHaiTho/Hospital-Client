import React, { useEffect, useState } from "react";
import SpecialtyForm from "../../features/hospital/components/SpecialtyForm";
import { Table, Space, Tooltip, Button, Card, Row, Col } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import axiosConfig from "../../apis/axiosConfig";
import { truncateDescription } from "../../utils/common";
import "./style.css";

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
  console.log(specialties);
  // useEffect(() => {
  //   const getSpecialties = async () => {
  //     const response = await axiosConfig.get(
  //       "/hospital-specialties/list-specialty-of-hospital"
  //     );
  //     setSpecialties(response.specialtiesOfSystem);
  //   };
  //   getSpecialties();
  // }, []);

  useEffect(() => {
    fetchData();
  }, []);

  const columns = [
    // {
    //   title: "ID",
    //   dataIndex: "id",
    //   key: "id",
    //   align: "center",
    //   width: "50px",
    //   render: (text, record) => <div>{record.id}</div>,
    // },
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
          <p style={{ fontStyle: "italic", color: "#797979" }}>
            {truncateDescription(record.description, 100)}
          </p>
          <span style={{ fontSize: "12px", color: "#797979" }}>
            Lượt khám: 39
          </span>
        </div>
      ),
    },
    {
      title: "Phí khám",
      dataIndex: "consultation_fee",
      key: "consultation_fee",

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
    <div style={{ display: "flex", flexDirection: "row", gap: "20px" }}>
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
        <Table
          columns={columns}
          size="small"
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
