import React, { useState, useEffect } from "react";
import {
  SearchOutlined,
  PlusOutlined,
  EditOutlined,
  CloseCircleOutlined,
  UploadOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import NotificationComponent from "../../utils/NotificationComponent";
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
  Form,
  Upload,
  DatePicker,
  Avatar,
  Row,
  Col,
} from "antd";
import { IoIosMore } from "react-icons/io";
import { MdMarkEmailRead } from "react-icons/md";
import "../../index.css";
import axiosConfig from "../../apis/axiosConfig";
import moment from "moment";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";

const { Option } = Select;
const { TextArea } = Input;

const handleChange = (value) => {
  console.log(`selected ${value}`);
};

const DoctorList = () => {
  const [visible, setVisible] = useState(false);
  const [form] = Form.useForm();
  const [specialties, setSpecialties] = useState([]);
  const [doctorList, setDoctorList] = useState([]);
  const [doctorDetail, setDoctorDetail] = useState(null);
  const [editDoctor, setEditDoctor] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [searchData, setSearchData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  // Get doctor list
  const getDoctorList = async () => {
    try {
      const response = await axiosConfig.get("/doctors/list");
      setDoctorList(response.doctorList);
      setSearchData(response.doctorList);
    } catch (error) {
      console.error("Error fetching doctor list:", error);
    }
  };
  // Check license code
  const checkLicenseCode = async (licenseCode) => {
    try {
      const response = await axiosConfig.get(
        `/doctors/get-doctor-by-license-code?licenseCode=${licenseCode}`
      );
      console.log(response);
      if (response.doctorDetail) {
        form.setFieldsValue({
          fullname: response.doctorDetail.fullname,
          phone: response.doctorDetail.phone,
          email: response.doctorDetail.email,
          description: response.doctorDetail.description,
          gender: response.doctorDetail.gender,
          birthday: response.doctorDetail.birthday
            ? moment(response.doctorDetail.birthday, "YYYY-MM-DD")
            : null,
        });
        setDoctorDetail(response.doctorDetail);
        setFileList(
          response.doctorDetail.avatar
            ? [
                {
                  uid: "-1",
                  name: "avatar",
                  status: "done",
                  url: `http://localhost:3000${response.doctorDetail.avatar}`,
                },
              ]
            : []
        );
      } else {
        form.setFieldsValue({
          fullname: "",
          phone: "",
          email: "",
          description: "",
          gender: undefined,
          birthday: null,
        });
        setDoctorDetail(null);
        setFileList([]);
      }
    } catch (error) {
      console.error("Error checking license code:", error);
    }
  };
  useEffect(() => {
    getDoctorList();
  }, []);
  console.log(doctorList);
  // Search doctors
  const handleSearch = (event) => {
    const value = event.target.value;
    setSearch(value);
    if (value.trim() === "") {
      setSearchData(doctorList);
    } else {
      const searchDoctor = doctorList.filter((doctor) =>
        [doctor.fullname, doctor.email, doctor.phone].some((field) =>
          field?.toLowerCase().includes(value.toLowerCase())
        )
      );
      setSearchData(searchDoctor);
    }
  };

  useEffect(() => {
    const getSpecialties = async () => {
      try {
        const response = await axiosConfig.get(
          "/hospital-specialties/list-specialty-of-hospital"
        );
        setSpecialties(response.specialtiesOfSystem);
      } catch (error) {
        console.error("Error fetching specialties:", error);
      }
    };
    getSpecialties();
  }, []);

  const showAddModal = () => {
    setVisible(true);
    setEditMode(false);
    setEditDoctor(null);
    setDoctorDetail(null);
    setFileList([]);
    form.resetFields();
  };

  const showEditModal = (doctor) => {
    setVisible(true);
    setEditMode(true);
    setEditDoctor(doctor);
    setDoctorDetail(null);
    form.setFieldsValue({
      licenseCode: doctor.licenseCode,
      fullname: doctor.fullname,
      phone: doctor.phone,
      email: doctor.email,
      description: doctor.description,
      consultation_fee: doctor.consultation_fee[0],
      gender: doctor.gender,
      birthday: doctor.birthday ? moment(doctor.birthday, "YYYY-MM-DD") : null,
      specialty: doctor.specialties?.map((item) => item.id),
    });
    setFileList(
      doctor.avatar
        ? [
            {
              uid: "-1",
              name: "avatar",
              status: "done",
              url: `http://localhost:3000${doctor.avatar}`,
            },
          ]
        : []
    );
  };

  const handleCancel = () => {
    form.resetFields();
    setVisible(false);
    setFileList([]);
    setEditDoctor(null);
    setEditMode(false);
    setDoctorDetail(null);
  };

  const onChangeImage = ({ fileList: newFileList }) => {
    if (doctorDetail) {
      return;
    }
    setFileList(newFileList);
  };

  const handleFinish = async (values) => {
    try {
      console.log(values);
      setLoading(true);
      const formData = new FormData();

      // Chỉ append ảnh khi không phải bác sĩ có sẵn và có file mới
      if (!doctorDetail && fileList.length > 0 && fileList[0].originFileObj) {
        formData.append("image", fileList[0].originFileObj);
      }

      formData.append("fullname", values.fullname);
      formData.append("phone", values.phone);
      formData.append("email", values.email);
      formData.append("gender", values.gender);
      formData.append("licenseCode", values.licenseCode);
      formData.append("specialty", values.specialty.join(","));
      formData.append(
        "birthday",
        values.birthday ? values.birthday.format("YYYY-MM-DD") : ""
      );
      formData.append("description", values.description || "");
      formData.append("consultation_fee", values.consultation_fee);
      // console.log(formData.getAll());
      console.log(formData.get("fullname"));
      console.log(formData.get("image"));

      const url = editMode
        ? `/doctors/update-doctor/${editDoctor.id}`
        : "/doctors/create-doctor";
      const method = editMode ? "put" : "post";
      const response = await axiosConfig({
        method,
        url,
        data: formData,
        headers: { "Content-Type": "multipart/form-data" },
      });

      form.resetFields();
      setVisible(false);
      setFileList([]);
      setDoctorDetail(null); // Reset doctorDetail
      NotificationComponent(
        "success",
        editMode ? "Cập nhật bác sĩ thành công" : "Thêm bác sĩ thành công"
      );
      getDoctorList();
    } catch (error) {
      console.error("Error saving doctor:", error);
      NotificationComponent(
        "error",
        error.response?.data?.message || "Lỗi khi lưu thông tin bác sĩ"
      );
    } finally {
      setLoading(false);
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
      dataIndex: "isActivated",
      key: "isActivated",
      render: (isActivated, isDeleted) =>
        isActivated && isDeleted ? (
          <Tag color="success" bordered={false} icon={<CheckCircleOutlined />}>
            Đang làm việc
          </Tag>
        ) : (
          <Tag color="error" bordered={false} icon={<CloseCircleOutlined />}>
            Tạm khóa
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
      <h2 style={{ textTransform: "uppercase" }}>Danh sách bác sĩ </h2>

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
          <Select
            defaultValue="Tất cả"
            style={{ width: 120 }}
            onChange={handleChange}
            options={[
              { value: "all", label: "Trạng thái" },
              { value: "active", label: "Hoạt động" },
              { value: "lock", label: "Tạm khóa" },
            ]}
          />
          <Button
            icon={<GrRefresh />}
            style={{
              border: "none",
              backgroundColor: "#DBEAFE",
              color: "#0165ff",
            }}
            onClick={() => {
              setSearch("");
              setSearchData(doctorList);
            }}
          >
            Làm mới
          </Button>
        </Space>
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
        style={{ margin: "5px auto" }}
        confirmLoading={loading}
      >
        <Form form={form} layout="vertical" onFinish={handleFinish}>
          <Row gutter={16}>
            <Col span={12}>
              {!editMode && (
                <Form.Item
                  name="licenseCode"
                  label="Mã chứng chỉ hành nghề"
                  rules={[
                    { required: true, message: "Vui lòng nhập mã chứng chỉ" },
                  ]}
                >
                  <Input
                    placeholder="Nhập mã chứng chỉ"
                    disabled={editMode}
                    onBlur={
                      editMode
                        ? undefined
                        : (e) => checkLicenseCode(e.target.value)
                    }
                  />
                </Form.Item>
              )}
              {doctorDetail && (
                <p
                  style={{
                    color: "#ff4d4f",
                    marginTop: "-20px",
                    fontSize: "12px",
                  }}
                >
                  Bác sĩ đang làm việc tại cơ sở y tế khác. Các thông tin đã
                  được tự động cập nhật, hãy cung cấp thông tin chuyên khoa khám
                  của bác sĩ này tại cơ sở y tế của bạn.
                </p>
              )}
            </Col>
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
                  disabled={doctorDetail}
                  style={{ color: "#000" }}
                />
              </Form.Item>
            </Col>
            {/* <Col span={12}>
              <Form.Item
                name="licenseCode"
                label="Mã chứng chỉ hành nghề"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập mã chứng chỉ hành nghề",
                  },
                ]}
              >
                <Input
                  placeholder="Nhập mã chứng chỉ hành nghề"
                  disabled={doctorDetail}
                  style={{ color: "#000" }}
                />
              </Form.Item>
            </Col> */}
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="avatar"
                label="Ảnh đại diện"
                rules={[
                  {
                    required: !editMode && !doctorDetail,
                    message: "Vui lòng chọn ảnh đại diện",
                  },
                ]}
              >
                <Upload
                  listType="picture"
                  fileList={fileList}
                  onChange={onChangeImage}
                  maxCount={1}
                  accept=".jpg,.png,.jpeg"
                  beforeUpload={() => false}
                  disabled={doctorDetail !== null}
                >
                  <Button
                    icon={<UploadOutlined />}
                    disabled={doctorDetail !== null}
                  >
                    {doctorDetail ? "Ảnh từ hồ sơ có sẵn" : "Upload"}
                  </Button>
                </Upload>
              </Form.Item>
            </Col>
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
                  disabled={doctorDetail}
                  style={{ color: "#000" }}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[{ required: true, message: "Vui lòng nhập email" }]}
              >
                <Input
                  placeholder="Nhập email bác sĩ"
                  disabled={doctorDetail}
                  style={{ color: "#000" }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="birthday"
                label="Ngày sinh"
                rules={[{ required: true, message: "Vui lòng chọn ngày sinh" }]}
              >
                <DatePicker
                  disabled={doctorDetail}
                  placeholder="Chọn ngày sinh"
                  format="DD/MM/YYYY"
                  style={{ width: "100%", color: "#000" }}
                  // defaultValue={form.getFieldValue("birthday") || null}
                  defaultValue={null}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="gender"
                label="Giới tính"
                rules={[{ required: true, message: "Vui lòng chọn giới tính" }]}
              >
                <Select disabled={doctorDetail}>
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
              style={{ color: "#000" }}
            />
          </Form.Item>
          <Form.Item
            name="description"
            label="Mô tả"
            rules={[{ required: true, message: "Vui lòng nhập mô tả" }]}
          >
            <TextArea
              placeholder="Nhập mô tả bác sĩ"
              rows={4}
              disabled={doctorDetail}
              style={{ color: "#000" }}
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
              placeholder="Chọn chuyên khoa"
              filterOption={(input, option) =>
                (option?.label ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              options={specialties.map((item) => ({
                value: item.id,
                label: item.name,
              }))}
            />
          </Form.Item>
        </Form>
      </Modal>
      <Table
        size="small"
        columns={columns}
        dataSource={searchData.map((doctor) => ({
          ...doctor,
          key: doctor.id,
          specialties: doctor.specialties,
        }))}
      />
    </Space>
  );
};

export default DoctorList;
