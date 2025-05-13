import React, { useState, useEffect } from "react";
import {
  SearchOutlined,
  EditOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import { GrRefresh } from "react-icons/gr";
import {
  Input,
  Space,
  Button,
  Select,
  Table,
  Tag,
  Dropdown,
  Modal,
  Typography,
  Row,
  Col,
  Avatar,
} from "antd";
import { IoIosMore } from "react-icons/io";
import { MdMarkEmailRead } from "react-icons/md";
import "../../index.css";
import axiosConfig from "../../apis/axiosConfig";
import moment from "moment";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { useLocation, useNavigate } from "react-router-dom";

const handleChange = (value) => {
  console.log(`selected ${value}`);
};

const ListDoctors = () => {
  const [visible, setVisible] = useState(false);
  const [doctorList, setDoctorList] = useState([]);
  const [viewDoctor, setViewDoctor] = useState(null);
  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // Hàm lấy page từ URL query params
  const getPageFromUrl = () => {
    const params = new URLSearchParams(location.search);
    return parseInt(params.get("page")) || 1;
  };

  // get doctor list
  const getDoctorList = async (page = 1, pageSize = 10, searchQuery = "") => {
    try {
      const response = await axiosConfig.get("/doctors", {
        params: {
          page,
          limit: pageSize,
          search: searchQuery || undefined,
        },
      });
      console.log(response);
      setDoctorList(response.doctorList);
      setPagination({
        current: response.pagination.currentPage,
        pageSize: response.pagination.limit,
        total: response.pagination.totalItems,
      });
    } catch (error) {
      console.error("Error fetching doctor list:", error);
    }
  };

  // Đồng bộ page từ URL khi component mount
  useEffect(() => {
    const pageFromUrl = getPageFromUrl();
    getDoctorList(pageFromUrl, pagination.pageSize, search);
  }, [location.search]);

  const handleSearch = (event) => {
    const value = event.target.value;
    setSearch(value);
    // Reset về trang 1 và cập nhật URL
    navigate(`/admin/doctor/list?page=1`);
    getDoctorList(1, pagination.pageSize, value);
  };

  const handleTableChange = (pagination) => {
    // Cập nhật URL với page mới
    navigate(`/admin/doctor/list?page=${pagination.current}`);
    getDoctorList(pagination.current, pagination.pageSize, search);
  };

  const showViewModal = (doctor) => {
    setVisible(true);
    setViewDoctor(doctor);
    setIsDescriptionExpanded(false); // Reset trạng thái mô tả khi mở modal
  };

  const handleCancel = () => {
    setVisible(false);
    setViewDoctor(null);
    setIsDescriptionExpanded(false); // Reset trạng thái mô tả khi đóng modal
  };

  const handleViewDoctor = (doctor) => {
    showViewModal(doctor);
  };

  const columns = [
    {
      title: "",
      dataIndex: "avatar",
      key: "avatar",
      align: "center",
      render: (avatar) => (
        <Avatar
          size={40}
          src={
            avatar && avatar.trim() !== ""
              ? `http://localhost:3000${avatar}`
              : "https://w7.pngwing.com/pngs/205/731/png-transparent-default-avatar-thumbnail.png"
          }
        />
      ),
    },
    {
      title: "Họ và tên",
      dataIndex: "fullname",
      key: "fullname",
      render: (fullname) => (
        <p
          style={{
            color: "#000",
            fontWeight: "500",
            textTransform: "uppercase",
          }}
        >
          {fullname}
        </p>
      ),
    },
    {
      title: "Chuyên khoa",
      dataIndex: "specialties",
      key: "specialties",
      render: (specialties) => (
        <p style={{ color: "#000" }}>
          {specialties.map((item) => item.name).join(", ")}
        </p>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      render: (email) => (
        <p
          style={{
            display: "flex",
            alignItems: "center",
            gap: "5px",
            fontSize: "14px",
          }}
        >
          <MdMarkEmailRead size={18} color="#0165ff" /> {email}
        </p>
      ),
    },
    {
      title: "Cơ sở y tế",
      dataIndex: "hospital",
      key: "hospital",
      render: (hospital) => <p style={{ color: "#000" }}>{hospital.name}</p>,
    },
    {
      title: "Giá khám",
      dataIndex: "consultation_fee",
      key: "consultation_fee",
      render: (consultation_fee) => (
        <p style={{ color: "#0165ff", fontWeight: "500" }}>
          {consultation_fee[0] &&
            `${Number(consultation_fee[0]).toLocaleString()} VNĐ`}
        </p>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive, isDeleted) =>
        isActive === true ? (
          <Tag color="success" bordered={false} icon={<CheckCircleOutlined />}>
            Đang làm việc
          </Tag>
        ) : (
          <Tag color="error" bordered={false} icon={<CloseCircleOutlined />}>
            Tạm ngừng hoạt động
          </Tag>
        ),
    },
    {
      title: "",
      key: "action",
      dataIndex: "action",
      render: (_, record) => {
        const items = [
          {
            label: "Xem chi tiết",
            icon: <EditOutlined />,
            key: "0",
            onClick: () => handleViewDoctor(record),
          },
        ];
        return (
          <Dropdown menu={{ items }} trigger={["click"]}>
            <Button
              type="text"
              icon={<IoIosMore size={20} />}
              style={{
                border: "none",
                backgroundColor: "transparent",
              }}
            />
          </Dropdown>
        );
      },
    },
  ];
  const renderDescription = (description) => {
    const maxLength = 100; // Giới hạn ký tự trước khi cắt
    if (!description) return "Chưa cung cấp";
    if (description.length <= maxLength || isDescriptionExpanded) {
      return (
        <>
          {description}
          {description.length > maxLength && (
            <Button
              type="link"
              style={{ padding: 0, marginLeft: 8 }}
              onClick={() => setIsDescriptionExpanded(false)}
            >
              Thu gọn
            </Button>
          )}
        </>
      );
    }
    return (
      <>
        {description.substring(0, maxLength)}...
        <Button
          type="link"
          style={{ padding: 0, marginLeft: 8 }}
          onClick={() => setIsDescriptionExpanded(true)}
        >
          Xem thêm
        </Button>
      </>
    );
  };

  return (
    <Space
      direction="vertical"
      size="middle"
      style={{
        minWidth: "100%",
        backgroundColor: "#fff",
        padding: "20px",
      }}
    >
      <h2 style={{ textTransform: "uppercase" }}>Danh sách bác sĩ</h2>
      <Space
        direction="horizontal"
        size="middle"
        style={{ width: "100%", justifyContent: "space-between" }}
      >
        <Space size="middle">
          <Input
            placeholder="Họ và tên, địa chỉ email, ..."
            suffix={<SearchOutlined />}
            style={{
              width: 300,
              backgroundColor: "#D9D9D9",
              border: "none",
            }}
            value={search}
            onChange={handleSearch}
          />
          {/* <Select
            defaultValue="Tất cả"
            style={{
              width: 120,
            }}
            onChange={handleChange}
            options={[
              {
                value: "all",
                label: "Trạng thái",
              },
              {
                value: "active",
                label: "Hoạt động",
              },
              {
                value: "lock",
                label: "Tạm khóa",
              },
            ]}
          /> */}
          <Button
            icon={<GrRefresh />}
            style={{
              border: "none",
              backgroundColor: "#DBEAFE",
              color: "#0165ff",
            }}
            onClick={() => {
              navigate(`/admin/doctor/list?page=1`);
              getDoctorList(1, pagination.pageSize);
              setSearch("");
            }}
          >
            Làm mới
          </Button>
          {/* <Button type="primary" onClick={() => exportToExcel(doctorList)}>
            Xuất Excel
          </Button>
          <Button type="primary" onClick={() => exportToPDF(doctorList)}>
            Xuất PDF
          </Button> */}
        </Space>
      </Space>

      <Modal
        title="Chi tiết bác sĩ"
        open={visible}
        onCancel={handleCancel}
        footer={[
          <Button key="cancel" onClick={handleCancel}>
            Đóng
          </Button>,
        ]}
        maskClosable={false}
        centered
        style={{
          margin: "5px auto",
        }}
      >
        {viewDoctor && (
          <Space direction="vertical" size="middle" style={{ width: "100%" }}>
            <Row gutter={16}>
              <Col span={12}>
                <div>
                  <Typography.Text strong>Tên bác sĩ</Typography.Text>
                  <Typography.Text style={{ display: "block", marginTop: 8 }}>
                    {viewDoctor.fullname || "Chưa cung cấp"}
                  </Typography.Text>
                </div>
              </Col>
              <Col span={12}>
                <div>
                  <Typography.Text strong>Ảnh đại diện</Typography.Text>
                  <div style={{ marginTop: 8 }}>
                    {viewDoctor.avatar ? (
                      <Avatar
                        size={64}
                        src={`http://localhost:3000${viewDoctor.avatar}`}
                      />
                    ) : (
                      <Typography.Text>Chưa có ảnh</Typography.Text>
                    )}
                  </div>
                </div>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <div>
                  <Typography.Text strong>Số điện thoại</Typography.Text>
                  <Typography.Text style={{ display: "block", marginTop: 8 }}>
                    {viewDoctor.phone || "Chưa cung cấp"}
                  </Typography.Text>
                </div>
              </Col>
              <Col span={12}>
                <div>
                  <Typography.Text strong>Email</Typography.Text>
                  <Typography.Text style={{ display: "block", marginTop: 8 }}>
                    {viewDoctor.email || "Chưa cung cấp"}
                  </Typography.Text>
                </div>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <div>
                  <Typography.Text strong>Ngày sinh</Typography.Text>
                  <Typography.Text style={{ display: "block", marginTop: 8 }}>
                    {viewDoctor.birthday
                      ? moment(viewDoctor.birthday).format("DD/MM/YYYY")
                      : "Chưa cung cấp"}
                  </Typography.Text>
                </div>
              </Col>
              <Col span={12}>
                <div>
                  <Typography.Text strong>Giới tính</Typography.Text>
                  <Typography.Text style={{ display: "block", marginTop: 8 }}>
                    {viewDoctor.gender ? "Nam" : "Nữ"}
                  </Typography.Text>
                </div>
              </Col>
            </Row>
            <div>
              <Typography.Text strong>Giá khám</Typography.Text>
              <Typography.Text style={{ display: "block", marginTop: 8 }}>
                {viewDoctor.consultation_fee[0]
                  ? `${Number(
                      viewDoctor.consultation_fee[0]
                    ).toLocaleString()} VNĐ`
                  : "Chưa cung cấp"}
              </Typography.Text>
            </div>
            <div>
              <Typography.Text strong>Mô tả</Typography.Text>
              <Typography.Text style={{ display: "block", marginTop: 8 }}>
                {renderDescription(viewDoctor.description)}
              </Typography.Text>
            </div>
            <div>
              <Typography.Text strong>Chuyên khoa</Typography.Text>
              <Typography.Text style={{ display: "block", marginTop: 8 }}>
                {viewDoctor.specialties?.map((item) => item.name).join(", ") ||
                  "Chưa cung cấp"}
              </Typography.Text>
            </div>
            <div>
              <Typography.Text strong>Bệnh viện</Typography.Text>
              <Typography.Text style={{ display: "block", marginTop: 8 }}>
                {viewDoctor.hospital?.name || "Chưa cung cấp"}
              </Typography.Text>
            </div>
          </Space>
        )}
      </Modal>
      <Table
        size="small"
        columns={columns}
        dataSource={doctorList.map((doctor) => ({
          ...doctor,
          key: doctor.id,
          specialties: doctor.specialties,
        }))}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: false,
        }}
        onChange={handleTableChange}
      />
    </Space>
  );
};

export default ListDoctors;
