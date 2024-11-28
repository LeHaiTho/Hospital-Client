import React, { useEffect, useState } from "react";
import SpecialtyForm from "../../features/hospital/components/SpecialtyForm";
import { Table, Space, Tooltip, Button, Card, Row, Col } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import axiosInstance from "../../apis/axiosConfig";
import { truncateDescription } from "../../utils/common";

const SpecialtyInfo = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [specialties, setSpecialties] = useState([]);

  const fetchData = async () => {
    try {
      const response = await axiosInstance.get("/hospital-specialties/list");
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
      title: "ID",
      dataIndex: "id",
      key: "id",
      align: "center",
      width: "50px",
      render: (text, record) => <div>{record.id}</div>,
    },
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
      title: "Chuyên khoa",
      dataIndex: "name",
      key: "name",
      width: "auto",
      render: (text, record) => (
        <p
          style={{
            color: "blue",
            fontWeight: "bold",
            fontSize: "16px",
            fontStyle: "italic",
          }}
        >
          {record.name}
          <br />
          <span
            style={{
              fontSize: "12px",
              color: "gray",
            }}
          >
            {truncateDescription(record.description, 50)}
          </span>
        </p>
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
              icon={<EditOutlined style={{ color: "blue" }} />}
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
    <>
      <SpecialtyForm onFinish={fetchData} />

      <Table
        columns={columns}
        size="small"
        dataSource={specialties.map((specialty) => ({
          ...specialty,
          key: specialty.id,
        }))}
      />
    </>
  );
};

export default SpecialtyInfo;
