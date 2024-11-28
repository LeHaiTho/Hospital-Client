import React from "react";
import { Table, Button } from "antd";

const DoctorList = ({ doctors, onSchedule }) => {
  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Specialty",
      dataIndex: "specialty",
      key: "specialty",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
    },
    {
      title: "Action",
      key: "action",
      render: (text, record) => (
        <Button type="primary" onClick={() => onSchedule(record)}>
          Lập lịch
        </Button>
      ),
    },
  ];

  return <Table dataSource={doctors} columns={columns} rowKey="id" />;
};

export default DoctorList;
