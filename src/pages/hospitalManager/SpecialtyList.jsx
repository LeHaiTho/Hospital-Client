import React, { useEffect, useState } from "react";
import { Card, Col, Row, Input, Select, Checkbox, Table, Button } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import axiosInstance from "../../apis/axiosConfig";

import "./style.css";
const { Search } = Input;
const { Meta } = Card;

const SpecialtyList = () => {
  const [selectedSpecialties, setSelectedSpecialties] = useState([]);
  const [specialtiesData, setSpecialtiesData] = useState([]);
  const [tempSelectedSpecialties, setTempSelectedSpecialties] = useState([]);

  // fecth specialties of system
  const fecthSpecialties = async () => {
    const res = await axiosInstance.get("/specialties/list");
    setSpecialtiesData(res.specialties);
  };

  // fecth specialties of hospital
  const fetchSpecialtiesOfHospital = async () => {
    const res = await axiosInstance.get(
      "/hospital-specialties/list-specialty-of-hospital"
    );
    setSelectedSpecialties(res.specialtiesOfSystem);
  };

  useEffect(() => {
    fecthSpecialties();
    fetchSpecialtiesOfHospital();
  }, []);

  console.log(specialtiesData);

  const handleDelete = (id) => {
    console.log(id);
  };

  const handleCheckBoxChange = (e, specialtyID) => {
    if (e.target.checked) {
      setTempSelectedSpecialties([...tempSelectedSpecialties, specialtyID]);
    } else {
      setTempSelectedSpecialties(
        tempSelectedSpecialties.filter((item) => item !== specialtyID)
      );
    }
  };
  console.log("tempSelectedSpecialties", tempSelectedSpecialties);

  const handleAddSpecialty = async () => {
    const res = await axiosInstance.post(
      "/hospital-specialties/add-specialty-to-hospital",
      {
        specialtyIds: tempSelectedSpecialties,
      }
    );
    fetchSpecialtiesOfHospital();
  };

  const columns = [
    {
      title: "STT",
      dataIndex: "id",
      align: "center",
      width: "10%",
      render: (text, record, index) => index + 1,
    },
    {
      title: "Chuyên khoa",
      dataIndex: "name",
      align: "center",
      ellipsis: true,
    },
    {
      title: "Hành động",
      dataIndex: "action",
      align: "center",
      width: "20%",
      render: (text, record) => (
        <Button
          type="text"
          icon={<DeleteOutlined style={{ color: "red" }} />}
          onClick={() => handleDelete(record.id)}
        />
      ),
    },
  ];

  return (
    <div>
      <h3>Chuyên khoa</h3>
      <Row gutter={20}>
        <Col span={10}>
          <Card style={{ borderRadius: 0 }}>
            <div
              style={{
                flexDirection: "column",
                justifyContent: "space-between",
                gap: 20,
                alignItems: "center",
                display: "flex",
              }}
            >
              <h3 style={{ fontWeight: "bold" }}>Chuyên khoa hệ thống</h3>
              <Search placeholder="Tìm kiếm chuyên khoa" />
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 20,
                  alignItems: "center",
                  justifyContent: "space-between",
                  width: "100%",
                }}
              >
                {specialtiesData
                  ?.filter(
                    (specialty) =>
                      !selectedSpecialties.some(
                        (item) => item.id === specialty.id
                      )
                  )
                  .map((specialty) => (
                    <Checkbox
                      key={specialty.id}
                      onChange={(e) => handleCheckBoxChange(e, specialty.id)}
                    >
                      {specialty.name}
                    </Checkbox>
                  ))}
              </div>
              <Button
                type="primary"
                onClick={handleAddSpecialty}
                style={{
                  boxShadow: "none",
                  borderRadius: 0,
                  width: "10",
                }}
              >
                Thêm
              </Button>
            </div>
          </Card>
        </Col>
        <Col span={14}>
          <Card
            className="scroll-container"
            style={{
              maxHeight: "100vh",
              minHeight: "100%",
              borderRadius: 0,
              boxShadow: "0 1px 2px rgba(0, 0, 0, 0.2)",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: 20,
                alignItems: "center",
              }}
            >
              <h3>Chuyên khoa đã có</h3>
              <Search
                placeholder="Tìm kiếm chuyên khoa"
                style={{
                  width: "40%",
                  marginLeft: "auto",
                  marginRight: "0",
                }}
              />

              {/* danh sách chuyên khoa đã được thêm */}
              <Table
                dataSource={selectedSpecialties}
                rowKey={(record) => record.id}
                pagination={false}
                columns={columns}
                style={{
                  width: "100%",
                  boxShadow: "0 1px 2px rgba(0, 0, 0, 0.2)",
                  borderColor: "#e0e0e0",
                  border: "1px solid #e0e0e0",
                }}
                size="small"
              />
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default SpecialtyList;
