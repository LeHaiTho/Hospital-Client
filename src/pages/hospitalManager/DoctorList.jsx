import React, { useRef, useState, useMemo, useEffect } from "react";
import {
  UserOutlined,
  SearchOutlined,
  PlusOutlined,
  DownOutlined,
  EditOutlined,
  DeleteOutlined,
  ExclamationCircleFilled,
  CustomerServiceOutlined,
  RadiusUpleftOutlined,
  RadiusUprightOutlined,
  RadiusBottomleftOutlined,
  RadiusBottomrightOutlined,
  TwitterOutlined,
  CalendarTwoTone,
  CalendarOutlined,
  PhoneOutlined,
  CloseCircleOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import NotificationComponent from "../../utils/NotificationComponent";
import { GrRefresh } from "react-icons/gr";
import {
  Input,
  Space,
  Button,
  Select,
  Table,
  Divider,
  Tag,
  Dropdown,
  Modal,
  Typography,
  Form,
  Radio,
  Upload,
  DatePicker,
  Avatar,
  notification,
  Tabs,
  Row,
  Col,
  Alert,
  Spin,
} from "antd";
import { IoIosMore } from "react-icons/io";
import { UploadOutlined, CheckCircleOutlined } from "@ant-design/icons";
import { MdOutlineMailOutline } from "react-icons/md";
import { LiaUserNurseSolid } from "react-icons/lia";
import "../../index.css";
import axiosConfig from "../../apis/axiosConfig";
import dayjs from "dayjs";
import { GoDotFill } from "react-icons/go";
import moment from "moment";
import { MdMarkEmailRead } from "react-icons/md";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
const { Search } = Input;
const { confirm } = Modal;
const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;
import jsPDF from "jspdf";
import "jspdf-autotable";

const handleChange = (value) => {
  console.log(`selected ${value}`);
};

const showDeleteConfirm = () => {
  confirm({
    title: "Bạn có chắc sẽ xóa tài khoản người dùng này?",
    icon: <ExclamationCircleFilled />,
    okText: "Chấp nhận",
    okType: "primary",
    cancelText: "Hủy",

    onOk() {
      console.log("OK");
      NotificationComponent("success", "Xóa thành công", "bottomRight");
    },
    onCancel() {
      console.log("Cancel");
    },
  });
};

const DoctorList = () => {
  const [visible, setVisible] = useState(false);
  const [form] = Form.useForm();
  const [specialties, setSpecialties] = useState([]);
  const [doctorList, setDoctorList] = useState([]);
  const [doctorDetail, setDoctorDetail] = useState();
  const [editDoctor, setEditDoctor] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [image, setImage] = useState();
  const [searchData, setSearchData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  // Tìm kiếm bác sĩ

  console.log("doctorDetail", doctorDetail);
  // get doctor list
  const getDoctorList = async () => {
    const response = await axiosConfig.get("/doctors/list");
    setDoctorList(response.doctorList);
  };
  useEffect(() => {
    getDoctorList();
  }, []);
  console.log("doctorList", doctorList);

  const handleSearch = (event) => {
    const value = event.target.value; // Lấy giá trị từ Input
    setSearch(value); // Cập nhật giá trị input

    if (value.trim() === "") {
      setSearchData(doctorList); // Nếu input trống, hiển thị danh sách gốc
    } else {
      // Lọc danh sách
      const searchDoctor = doctorList.filter((doctor) => {
        return (
          doctor.fullname.toLowerCase().includes(value.toLowerCase()) ||
          doctor.email.toLowerCase().includes(value.toLowerCase()) ||
          doctor.phone.toLowerCase().includes(value.toLowerCase())
        );
      });
      setSearchData(searchDoctor); // Cập nhật danh sách hiển thị
    }
  };
  // check license code
  const checkLicenseCode = async (licenseCode) => {
    const response = await axiosConfig.get(
      `/doctors/get-doctor-by-license-code?licenseCode=${licenseCode}`
    );
    if (response.doctorDetail) {
      form.setFieldsValue({
        fullname: response.doctorDetail.fullname,
        phone: response.doctorDetail.phone,
        email: response.doctorDetail.email,
        description: response.doctorDetail.description,
        gender: response.doctorDetail.gender,
        birthday: response.doctorDetail.birthday
          ? moment(response.doctorDetail.birthday)
          : null,
        image: response.doctorDetail.avatar,
      });
      setDoctorDetail(response.doctorDetail);
      setImage(response.doctorDetail.avatar);
      console.log(response.doctorDetail.avatar);
    } else {
      form.setFieldsValue({
        fullname: "",
        phone: "",
        email: "",
        description: "",
        gender: "",
        birthday: "",
        image: "",
      });
      setDoctorDetail(null);
      setImage(null);
    }
  };
  // get specialties of hospital
  console.log("image", image);
  useEffect(() => {
    const getSpecialties = async () => {
      const response = await axiosConfig.get(
        "/hospital-specialties/list-specialty-of-hospital"
      );
      setSpecialties(response.specialtiesOfSystem);
    };
    getSpecialties();
  }, []);

  const showAddModal = () => {
    setVisible(true);
    setEditMode(false);
    setEditDoctor(null);
    setDoctorDetail(null);
  };

  const showEditModal = (doctor) => {
    setVisible(true);
    setEditMode(true);
    form.setFieldsValue({
      fullname: doctor.fullname,
      phone: doctor.phone,
      email: doctor.email,
      description: doctor.description,
      consultation_fee: doctor.consultation_fee[0],
      gender: doctor.gender,
      birthday: doctor.birthday ? moment(doctor.birthday) : null,
      image: doctor.avatar,
      licenseCode: doctor.licenseCode,
      specialty: doctor.specialties?.map((item) => item.id),
    });
    setImage(doctor.avatar);
    setEditDoctor(doctor);
    // setDoctorDetail(doctor);
  };

  const handleCancel = () => {
    form.resetFields();
    setVisible(false);
  };

  const onChangeImage = ({ fileList }) => {
    setImage(fileList[0]);
  };
  console.log(image);

  const handleFinish = async (values) => {
    try {
      const formData = new FormData();
      formData.append("image", image?.originFileObj);
      formData.append("fullname", values.fullname);
      formData.append("phone", values.phone);
      formData.append("email", values.email);
      formData.append("gender", values.gender);
      formData.append("licenseCode", values.licenseCode);
      formData.append("specialty", values.specialty);
      formData.append("birthday", values.birthday);
      formData.append("description", values.description);
      formData.append("consultation_fee", values.consultation_fee);
      console.log(formData.get("image"));
      console.log(formData.get("fullname"));
      console.log(formData.get("phone"));
      console.log(formData.get("email"));
      console.log(formData.get("gender"));
      console.log(formData.get("licenseCode"));
      console.log(formData.get("specialty"));
      console.log(formData.get("birthday"));
      console.log(formData.get("description"));
      console.log(formData.get("consultation_fee"));
      const response = await axiosConfig.post(
        "/doctors/create-doctor",
        formData
      );
      form.resetFields();
      setVisible(false);
      console.log(response);
      NotificationComponent(
        "success",
        editMode ? "Cập nhật bác sĩ thành công" : "Thêm bác sĩ thành công"
      );
      getDoctorList();
    } catch (error) {
      console.log(error);
    }
  };

  const handleOk = () => {
    form.submit();
  };
  const handleEditDoctor = (doctor) => {
    showEditModal(doctor);
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
              : (avatar =
                  "https://w7.pngwing.com/pngs/205/731/png-transparent-default-avatar-thumbnail.png")
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
      title: "Số điện thoại",
      dataIndex: "phone",
      key: "phone",
      render: (phone) => <p style={{ color: "#000" }}>{phone}</p>,
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
      render: (isActive) =>
        isActive === true ? (
          <Tag color="success" bordered={false} icon={<CheckCircleOutlined />}>
            Đang làm việc
          </Tag>
        ) : (
          <Tag color="error" bordered={false} icon={<CloseCircleOutlined />}>
            Đã nghỉ việc
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
            label: "Chỉnh sửa",
            icon: <EditOutlined />,
            key: "0",
            onClick: () => handleEditDoctor(record),
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
  const exportToExcel = (data) => {
    // Tạo dữ liệu để xuất
    const excelData = data.map((record) => ({
      "Họ và tên": record.fullname,
      "Chuyên khoa": record.specialties.map((item) => item.name).join(", "),
      Email: record.email,
      "Số điện thoại": record.phone,
      "Giá khám": record.consultation_fee[0]
        ? `${Number(record.consultation_fee[0]).toLocaleString()} VNĐ`
        : "",
      "Trạng thái": record.isActive ? "Đang làm việc" : "Đã nghỉ việc",
    }));

    // Tạo một worksheet
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Tạo một workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Danh sách bác sĩ");

    // Xuất file
    XLSX.writeFile(workbook, "DanhSachBacSi.xlsx");
  };

  const exportToPDF = (data) => {
    const doc = new jsPDF();

    // Tiêu đề
    doc.setFontSize(18);
    doc.text("DANH SÁCH BÁC SĨ", 14, 20);

    // Ngày xuất file
    doc.setFontSize(12);
    doc.text(`Ngày xuất: ${new Date().toLocaleDateString("vi-VN")}`, 14, 30);

    // Chuẩn bị dữ liệu bảng
    const tableData = data.map((record, index) => [
      index + 1,
      record.fullname,
      record.specialties.map((item) => item.name).join(", "),
      record.email,
      record.phone,
      record.consultation_fee[0]
        ? `${Number(record.consultation_fee[0]).toLocaleString()} VNĐ`
        : "",
      record.isActive ? "Đang làm việc" : "Đã nghỉ việc",
    ]);

    // Cấu hình bảng
    doc.autoTable({
      head: [
        [
          "STT",
          "Họ và tên",
          "Chuyên khoa",
          "Email",
          "Số điện thoại",
          "Giá khám",
          "Trạng thái",
        ],
      ],
      body: tableData,
      startY: 40,
      theme: "grid",
      headStyles: {
        fillColor: [0, 123, 255],
        textColor: [255, 255, 255],
        fontSize: 12,
      },
      bodyStyles: {
        fontSize: 10,
      },
      columnStyles: {
        0: { cellWidth: 10 }, // STT
        1: { cellWidth: 40 }, // Họ và tên
        2: { cellWidth: 50 }, // Chuyên khoa
        3: { cellWidth: 50 }, // Email
        4: { cellWidth: 30 }, // Số điện thoại
        5: { cellWidth: 30 }, // Giá khám
        6: { cellWidth: 30 }, // Trạng thái
      },
    });

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    doc.setFontSize(10);
    doc.text(`Trang ${pageCount}`, 180, 290); // Góc dưới cùng bên phải

    // Xuất file PDF
    doc.save("DanhSachBacSi.pdf");
  };
  return (
    <Space
      direction="vertical"
      size="middle"
      style={{
        minWidth: "100%",
        backgroundColor: "#fff",
        padding: "20px",
        borderRadius: "10px",
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
            placeholder="Họ và tên, địa chỉ email, ... "
            suffix={<SearchOutlined />}
            style={{
              width: 300,
              backgroundColor: "#D9D9D9",
              border: "none",
            }}
            value={search}
            onChange={handleSearch}
          />
          <Select
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
          />
          <Button
            icon={<GrRefresh />}
            style={{
              border: "none",
              backgroundColor: "#DBEAFE",
              color: "#0165ff",
            }}
          >
            Làm mới
          </Button>
          <Button type="primary" onClick={() => exportToExcel(doctorList)}>
            Xuất Excel
          </Button>
          <Button type="primary" onClick={() => exportToPDF(doctorList)}>
            Xuất PDF
          </Button>
        </Space>

        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <Button
            style={{
              backgroundColor: "#0165ff",
              color: "#fff",
              border: "none",
              fontWeight: "500",
            }}
            onClick={showAddModal}
          >
            Thêm mới
          </Button>
        </div>
      </Space>

      <Modal
        title={editMode ? "Thay đổi thông tin" : "Thêm mới"}
        open={visible}
        onOk={handleOk}
        onCancel={handleCancel}
        okText={editMode ? "Cập nhật" : "Thêm mới"}
        cancelText="Hủy"
        maskClosable={false}
        centered
        style={{
          margin: "5px auto",
        }}
      >
        <Form form={form} layout="vertical" onFinish={handleFinish}>
          {/* Thông tin cơ bản */}

          <Form.Item
            name="licenseCode"
            label="Mã chứng chỉ hành nghề"
            rules={[{ required: true, message: "Vui lòng nhập mã chứng chỉ" }]}
          >
            <Input
              placeholder="Nhập mã chứng chỉ"
              onBlur={
                editMode ? undefined : (e) => checkLicenseCode(e.target.value)
              }
            />
          </Form.Item>
          {doctorDetail && (
            <p
              style={{
                color: "#ff4d4f",
                marginTop: "-20px",
                fontSize: "12px",
              }}
            >
              Bác sĩ đang làm việc tại cơ sở y tế khác. Các thông tin đã được tự
              động cập nhật, hãy cung cấp thông tin chuyên khoa khám của bác sĩ
              này tại cơ sở y tế của bạn.
            </p>
          )}
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="fullname"
                label="Tên bác sĩ"
                rules={[
                  { required: true, message: "Vui lòng nhập tên bác sĩ" },
                ]}
              >
                <Input
                  placeholder="Nhập tên bác sĩ"
                  disabled={doctorDetail ? true : false}
                  style={{
                    color: "#000",
                  }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="avatar" label="Ảnh đại diện">
                <Upload
                  onChange={onChangeImage}
                  maxCount={1}
                  accept=".jpg,.png,.jpeg"
                  fileList={image ? [image] : []}
                  beforeUpload={() => false}
                >
                  <Button icon={<UploadOutlined />}>Upload</Button>
                </Upload>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="phone"
                label="Số điện thoại"
                rules={[
                  { required: true, message: "Vui lòng nhập số điện thoại" },
                ]}
              >
                <Input
                  placeholder="Nhập số điện thoại"
                  disabled={doctorDetail ? true : false}
                  style={{
                    color: "#000",
                  }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[{ required: true, message: "Vui lòng nhập email" }]}
              >
                <Input
                  placeholder="Nhập email bác sĩ"
                  disabled={doctorDetail ? true : false}
                  style={{
                    color: "#000",
                  }}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            {/* Ngày sinh */}
            <Col span={12}>
              <Form.Item
                name="birthday"
                label="Ngày sinh"
                rules={[{ required: true, message: "Vui lòng chọn ngày sinh" }]}
              >
                <DatePicker
                  disabled={doctorDetail ? true : false}
                  placeholder="Chọn ngày sinh"
                  format="DD/MM/YYYY"
                  style={{
                    width: "100%",
                    color: "#000",
                  }}
                />
              </Form.Item>
            </Col>
            {/* Giới tính */}
            <Col span={12}>
              <Form.Item
                name="gender"
                label="Giới tính"
                rules={[{ required: true, message: "Vui lòng chọn giới tính" }]}
              >
                <Select disabled={doctorDetail ? true : false}>
                  <Option value={true}>Nam</Option>
                  <Option value={false}>Nữ</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="consultation_fee"
            label="Giá khám"
            rules={[{ required: true, message: "Vui lòng nhập giá khám" }]}
          >
            <Input
              type="number"
              placeholder="Nhập giá khám"
              style={{
                color: "#000",
              }}
            />
          </Form.Item>
          <Form.Item
            name="description"
            label="Mô tả"
            rules={[{ required: true, message: "Vui lòng nhập mô tả" }]}
          >
            <Input.TextArea
              placeholder="Nhập mô tả bác sĩ"
              rows={4}
              disabled={doctorDetail ? true : false}
              style={{
                color: "#000",
              }}
            />
          </Form.Item>
          <Form.Item
            name="specialty"
            label="Chọn chuyên khoa"
            rules={[{ required: true, message: "Vui lòng chọn chuyên khoa" }]}
          >
            <Select
              mode="multiple"
              showSearch
              placeholder="Select a person"
              filterOption={(input, option) =>
                (option?.label ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              options={specialties.map((item, i) => {
                return {
                  value: item.id,
                  label: item.name,
                };
              })}
            />
          </Form.Item>
        </Form>
      </Modal>
      <Table
        size="small"
        columns={columns}
        dataSource={doctorList.map((doctor) => {
          return {
            ...doctor,
            key: doctor.id,
            specialties: doctor.specialties,
          };
        })}
      />
    </Space>
  );
};

export default DoctorList;
