import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Button,
  Tag,
  Space,
  DatePicker,
  Select,
  Tabs,
  Modal,
  List,
  Typography,
  Descriptions,
  Row,
  Col,
  Tooltip,
  Divider,
  message,
} from "antd";
import {
  CalendarOutlined,
  EyeOutlined,
  EditOutlined,
  HistoryOutlined,
  FileTextOutlined,
  FileAddFilled,
  DownloadOutlined,
  FileImageOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import {
  getDetailedExamResultByAppointmentCode,
  getDoctorDetailedExamResults,
  getPatientExamHistory,
} from "../../apis/detailedExamResultApi";
import { getAppointmentsByDoctorId } from "../../apis/appointmentApi";
import { useSelector } from "react-redux";

const { RangePicker } = DatePicker;
const { Option } = Select;
const { Text, Title } = Typography;

const Appointments = () => {
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [historyModalVisible, setHistoryModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [previewModalVisible, setPreviewModalVisible] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedExamRecord, setSelectedExamRecord] = useState(null);
  const [previewFile, setPreviewFile] = useState(null);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [pastAppointments, setPastAppointments] = useState([]);
  const navigate = useNavigate();
  const { user, token } = useSelector((state) => state.auth);
  console.log("token", token);
  console.log("selectedPatient", selectedPatient);

  // Add CSS animation for loading spinner
  React.useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const loadDoctorAppointments = async () => {
    try {
      setLoading(true);

      const response = await getAppointmentsByDoctorId({
        page: 1,
        limit: 100,
      });
      if (response?.success) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const upcoming = response.data?.filter((appointment) => {
          const appointmentDate = new Date(appointment.doctorSchedule.date);
          return (
            appointment.status === "confirmed" ||
            appointment.status === "pending"
          );
        });

        const past = response.data?.filter((appointment) => {
          const appointmentDate = new Date(appointment.doctorSchedule.date);
          return appointment.status === "completed";
        });

        setUpcomingAppointments(
          (upcoming || []).map((appointment) => ({
            id: appointment.id,
            appointmentCode: appointment.appointment_code,
            time: `${appointment.appointmentSlot.start_time} - ${appointment.appointmentSlot.end_time}`,
            date: moment(appointment.doctorSchedule.date).format("DD/MM/YYYY"),
            patient: appointment.patient.fullname,
            patientPhone: appointment.patient.phone,
            patientId: appointment.patient.id,
            patientType: appointment.patientType,
            status: appointment.status,
            notes: appointment.reason,
          }))
        );

        // Map past appointments individually (not grouped)
        setPastAppointments(
          (past || [])
            .map((appointment) => ({
              id: appointment.id,
              appointmentCode: appointment.appointment_code,
              time: `${moment(
                appointment.appointmentSlot.start_time,
                "HH:mm:ss"
              ).format("HH:mm")} - ${moment(
                appointment.appointmentSlot.end_time,
                "HH:mm"
              ).format("HH:mm")}`,
              date: moment(appointment.doctorSchedule.date).format(
                "DD/MM/YYYY"
              ),
              patient: appointment.patient.fullname,
              patientPhone: appointment.patient.phone,
              patientId: appointment.patient.id,
              patientType: appointment.patientType,
              status: appointment.status,
              notes: appointment.reason,
            }))
            .sort(
              (a, b) =>
                moment(b.date, "DD/MM/YYYY").diff(
                  moment(a.date, "DD/MM/YYYY")
                ) || moment(b.time, "HH:mm").diff(moment(a.time, "HH:mm"))
            ) // Sort by date descending
        );
      }
    } catch (error) {
      console.error("Error loading doctor appointments:", error);
      message.error("Không thể tải danh sách lịch hẹn");
    } finally {
      setLoading(false);
    }
  };
  console.log("pastAppointments", pastAppointments);
  // Load data on component mount
  useEffect(() => {
    loadDoctorAppointments();
  }, []);
  // Danh sách kết quả khám của bác sĩ
  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed":
        return "blue";
      case "waiting":
        return "orange";
      case "completed":
        return "green";
      case "cancelled":
        return "red";
      default:
        return "default";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "confirmed":
        return "Đang chờ khám";
      case "completed":
        return "Hoàn thành";
      case "cancelled":
        return "Đã hủy";
      default:
        return status;
    }
  };

  const handleViewHistory = async (record) => {
    try {
      setLoading(true);

      // Now all records are individual appointments (no more grouped records)
      let requestData = {};

      if (record.patientId && record.patientType) {
        requestData = {
          patientId: record.patientId,
          patientType: record.patientType,
        };
      } else {
        requestData = {
          patientInfo: {
            fullname: record.patient,
            phone: record.patientPhone,
          },
        };
      }

      const response = await getPatientExamHistory(requestData);

      if (response?.success) {
        const examHistory = response.data.examHistory;

        setSelectedPatient({
          ...record,
          examHistory: examHistory,
          totalRecords: response.data.totalRecords,
          searchMethod: response.data.searchMethod,
        });
        setHistoryModalVisible(true);
      } else {
        message.error(response.message || "Không thể lấy lịch sử khám bệnh");
        setSelectedPatient({
          ...record,
          examHistory: [],
          totalRecords: 0,
        });
        setHistoryModalVisible(true);
      }
    } catch (error) {
      console.error("Error loading patient exam history:", error);
      message.error("Có lỗi xảy ra khi tải lịch sử khám bệnh");

      setSelectedPatient({
        ...record,
        examHistory: [],
        totalRecords: 0,
      });
      setHistoryModalVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = async (examRecord) => {
    try {
      setDetailLoading(true);
      const appointmentCode = examRecord.appointmentCode;
      if (!appointmentCode) {
        message.error("Không tìm thấy mã lịch hẹn");
        setDetailLoading(false);
        return;
      }

      const response = await getDetailedExamResultByAppointmentCode(
        appointmentCode
      );

      if (response?.success) {
        const detailedResult = response.data.detailedExamResult;
        const appointment = response.data.appointment;
        console.log("appointment", appointment);

        const formattedExamRecord = {
          ...detailedResult,
          appointmentCode: appointment.appointment_code,
          date: appointment.doctorSchedule?.date
            ? new Date(appointment.doctorSchedule.date).toLocaleDateString(
                "vi-VN"
              )
            : new Date(appointment.createdAt).toLocaleDateString("vi-VN"),
          examDate:
            detailedResult.exam_date || appointment.doctorSchedule?.date,
          examTime: appointment.doctorSchedule
            ? `${appointment.appointmentSlot?.start_time || ""} - ${
                appointment.appointmentSlot?.end_time || ""
              }`
            : "",

          hospital: {
            name: appointment.hospital?.name || "Bệnh viện",
            address: appointment.hospital?.address || "Địa chỉ bệnh viện",
          },

          doctor: appointment.doctor?.user?.fullname || "Bác sĩ",

          specialty: appointment.specialty?.name || "Chuyên khoa",

          patientInfo: {
            fullName:
              appointment.familyMembers?.fullname ||
              appointment.user?.fullname ||
              "Bệnh nhân",
            dateOfBirth:
              appointment.familyMembers?.date_of_birth ||
              appointment.user?.date_of_birth ||
              "",
            gender:
              appointment.familyMembers?.gender ||
              appointment.user?.gender ||
              "",
            address:
              appointment.familyMembers?.address ||
              appointment.user?.address ||
              "",
            phone:
              appointment.familyMembers?.phone || appointment.user?.phone || "",
            reasonForExam: appointment.reason_for_visit || "",
          },

          clinicalExam: {
            pulse: detailedResult.pulse,
            temperature: detailedResult.temperature,
            bloodPressure: detailedResult.blood_pressure,
            skin: detailedResult.skin_condition,
            mucousMembrane: detailedResult.mucous_membrane,
            organExamination: detailedResult.organ_examination,
          },

          testResults: detailedResult.testResults || [],
          detailedPrescriptions: detailedResult.detailedPrescriptions || [],
          prescriptions: detailedResult.detailedPrescriptions || [],

          appointment: appointment,
        };

        setSelectedExamRecord(formattedExamRecord);
        setDetailModalVisible(true);

        console.log("Successfully loaded exam detail:", formattedExamRecord);
      } else {
        console.error("API Error:", response);
        message.error(
          response?.message || "Không thể lấy thông tin chi tiết kết quả khám"
        );
      }
    } catch (error) {
      console.error("Error fetching exam detail:", error);
      message.error("Có lỗi xảy ra khi lấy thông tin chi tiết kết quả khám");
    } finally {
      setDetailLoading(false);
    }
  };
  console.log("selectedExamRecord", selectedExamRecord);
  const handleFileView = (file) => {
    console.log("Viewing file:", file);

    // Construct full URL for API files
    const fileUrl = file.file_url || file.fileUrl;

    // Check if running in browser environment before accessing process.env
    const apiUrl =
      typeof window !== "undefined" && window.location
        ? `${window.location.protocol}//${window.location.hostname}:3000`
        : "http://localhost:3000";

    const fullUrl = fileUrl?.startsWith("http")
      ? fileUrl
      : `${apiUrl}${fileUrl}`;

    const fileType = file.file_type || file.fileType;

    console.log("File URL:", fullUrl, "File Type:", fileType);

    if (
      fileType === "image" ||
      fileType?.includes("image") ||
      fileUrl?.match(/\.(jpg|jpeg|png|gif|bmp|webp)$/i)
    ) {
      // Modal preview cho ảnh
      setPreviewFile({
        ...file,
        fileUrl: fullUrl,
        fileName: file.file_name || file.fileName || "Ảnh",
      });
      setPreviewModalVisible(true);
    } else {
      // Tab mới cho PDF/file khác
      window.open(fullUrl, "_blank");
    }
  };

  const handleAddExamResult = (record) => {
    // Chuyển đến trang thêm kết quả khám mới
    navigate(`/doctor/appointments/exam-result/${record.appointmentCode}`, {
      state: {
        appointmentData: {
          appointmentCode: record.appointmentCode,
          patient: record.patient,
          date: record.date,
          time: record.time,
          notes: record.notes,
          status: record.status,
        },
      },
    });
  };

  const upcomingColumns = [
    {
      title: "Mã lịch hẹn",
      dataIndex: "appointmentCode",
      key: "appointmentCode",
      width: 120,
    },
    {
      title: "Tên bệnh nhân",
      dataIndex: "patient",
      key: "patient",
    },
    {
      title: "Ngày khám",
      dataIndex: "date",
      key: "date",
      width: 120,
    },
    {
      title: "Thời gian",
      key: "timeSlot",
      render: (_, record) => (
        <div style={{ display: "flex", gap: 5, flexDirection: "row" }}>
          {record.time.split(" - ").map((time, index) => (
            <p key={index}>
              {moment(time, "HH:mm:ss").format("HH:mm")}
              {index < record.time.split(" - ").length - 1 && " - "}
            </p>
          ))}
        </div>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>
      ),
    },
    {
      title: "",
      key: "action",
      width: 200,
      align: "center",
      render: (_, record) => (
        <Space size="small" direction="vertical">
          <Space>
            <Button
              variant="outlined"
              icon={<HistoryOutlined />}
              onClick={() => handleViewHistory(record)}
            >
              Lịch sử
            </Button>

            <Button
              variant="outlined"
              icon={<FileAddFilled style={{ color: "green" }} />}
              onClick={() => handleAddExamResult(record)}
            >
              Cập nhật
            </Button>
          </Space>
        </Space>
      ),
    },
  ];

  const pastColumns = [
    {
      title: "Mã lịch hẹn",
      dataIndex: "appointmentCode",
      key: "appointmentCode",
      width: 120,
    },
    {
      title: "Tên bệnh nhân",
      dataIndex: "patient",
      key: "patient",
    },
    {
      title: "Ngày khám",
      dataIndex: "date",
      key: "date",
      width: 120,
    },
    {
      title: "Thời gian",
      key: "timeSlot",
      render: (_, record) => <div>{record.time}</div>,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>
      ),
    },
    {
      title: "",
      key: "action",
      width: 200,
      align: "center",
      render: (_, record) => (
        <Space size="small" direction="vertical">
          <Space>
            <Button
              variant="outlined"
              icon={<HistoryOutlined />}
              onClick={() => handleViewHistory(record)}
            >
              Lịch sử
            </Button>

            <Button
              variant="outlined"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetail(record)}
            >
              Chi tiết
            </Button>
          </Space>
        </Space>
      ),
    },
  ];

  const tabItems = [
    {
      key: "upcoming",
      label: "Lịch hẹn sắp tới",
      children: (
        <Table
          columns={upcomingColumns}
          dataSource={upcomingAppointments}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} lịch hẹn`,
          }}
        />
      ),
    },
    {
      key: "past",
      label: "Lịch hẹn đã qua",
      children: (
        <Table
          columns={pastColumns}
          dataSource={pastAppointments}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} lịch hẹn`,
          }}
        />
      ),
    },
  ];

  return (
    <div style={{}}>
      <Card
        title={
          <Space>
            <CalendarOutlined />
            Quản lý lịch hẹn khám
          </Space>
        }
      >
        <Tabs defaultActiveKey="upcoming" items={tabItems} />
      </Card>

      {/* Modal xem lịch sử khám */}
      <Modal
        title={
          <Space>
            <HistoryOutlined />
            {`Lịch sử khám - ${selectedPatient?.patient}`}
          </Space>
        }
        open={historyModalVisible}
        onCancel={() => setHistoryModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setHistoryModalVisible(false)}>
            Đóng
          </Button>,
        ]}
        width={900}
      >
        {loading ? (
          <div style={{ textAlign: "center", padding: "50px" }}>
            <div style={{ marginBottom: "16px" }}>
              <div
                className="loading-spinner"
                style={{
                  width: "40px",
                  height: "40px",
                  border: "4px solid #f3f3f3",
                  borderTop: "4px solid #1890ff",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                  margin: "0 auto",
                }}
              ></div>
            </div>
            <Text>Đang tải lịch sử khám bệnh...</Text>
          </div>
        ) : selectedPatient?.examHistory?.length > 0 ? (
          <List
            dataSource={selectedPatient.examHistory}
            renderItem={(item) => (
              <List.Item
                actions={[
                  <Button
                    type="link"
                    icon={<EyeOutlined />}
                    onClick={() => handleViewDetail(item)}
                  >
                    Chi tiết
                  </Button>,
                ]}
              >
                <List.Item.Meta
                  avatar={
                    <FileTextOutlined
                      style={{ fontSize: "24px", color: "#1890ff" }}
                    />
                  }
                  title={
                    <Space>
                      <Text strong>{item.date}</Text>
                      <Tag color="blue">{item.appointmentCode}</Tag>
                    </Space>
                  }
                  description={
                    <div>
                      <div>
                        <Text type="secondary">Cơ sở y tế: </Text>
                        <Text>{item.hospital}</Text>
                      </div>
                      <div>
                        <Text type="secondary">Bác sĩ: </Text>
                        <Text>{item.doctor}</Text>
                      </div>
                      <div>
                        <Text type="secondary">Chuyên khoa: </Text>
                        <Text>{item.specialty}</Text>
                      </div>
                      <div>
                        <Text type="secondary">Chẩn đoán: </Text>
                        <Text>{item.diagnosis || "Chưa có chẩn đoán"}</Text>
                      </div>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        ) : (
          <div style={{ textAlign: "center", padding: "50px" }}>
            <FileTextOutlined
              style={{
                fontSize: "48px",
                color: "#d9d9d9",
                marginBottom: "16px",
              }}
            />
            <div>
              <Text type="secondary">Chưa có lịch sử khám bệnh nào</Text>
            </div>
            <div style={{ marginTop: "8px" }}>
              <Text type="secondary" style={{ fontSize: "12px" }}>
                Bệnh nhân "{selectedPatient?.patient}" chưa có kết quả khám bệnh
                nào được lưu trong hệ thống
              </Text>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal xem chi tiết kết quả khám */}
      <Modal
        title={
          <Title level={4}>
            KẾT QUẢ KHÁM BỆNH{" "}
            <Tag color="blue">#{selectedExamRecord?.appointmentCode}</Tag>
            <Text>Ngày khám: {selectedExamRecord?.date}</Text>
          </Title>
        }
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[]}
        width={"80%"}
        style={{ top: 20 }}
      >
        {detailLoading ? (
          <div style={{ textAlign: "center", padding: "50px" }}>
            <div style={{ marginBottom: "16px" }}>
              <div
                className="loading-spinner"
                style={{
                  width: "40px",
                  height: "40px",
                  border: "4px solid #f3f3f3",
                  borderTop: "4px solid #1890ff",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                  margin: "0 auto",
                }}
              ></div>
            </div>
            <Text>Đang tải thông tin chi tiết kết quả khám...</Text>
          </div>
        ) : selectedExamRecord ? (
          <div
            style={{ maxHeight: "75vh", overflowY: "auto", padding: "24px" }}
          >
            {/* Thông tin bệnh viện và bác sĩ */}
            <div
              style={{
                marginBottom: "24px",
                padding: "16px",
                backgroundColor: "#e6f7ff",
                borderRadius: "8px",
                border: "1px solid #91d5ff",
              }}
            >
              <Row gutter={[16, 12]}>
                <Col span={12}>
                  <Text strong>Bệnh viện: </Text>
                  <Text>
                    {selectedExamRecord?.hospital?.name ||
                      selectedExamRecord?.hospital}
                  </Text>
                </Col>
                <Col span={12}>
                  <Text strong>Địa chỉ: </Text>
                  <Text>
                    {selectedExamRecord?.hospital?.address ||
                      selectedExamRecord?.hospitalAddress}
                  </Text>
                </Col>
                <Col span={12}>
                  <Text strong>Bác sĩ: </Text>
                  <Text>
                    {selectedExamRecord?.doctor?.user?.fullname ||
                      selectedExamRecord?.doctor}
                  </Text>
                </Col>
                <Col span={12}>
                  <Text strong>Chuyên khoa: </Text>
                  <Text>
                    {selectedExamRecord?.appointment?.specialty?.name ||
                      selectedExamRecord?.specialty}
                  </Text>
                </Col>
                <Col span={12}>
                  <Text strong>Ngày khám: </Text>
                  <Text>
                    {selectedExamRecord?.exam_date
                      ? new Date(
                          selectedExamRecord.exam_date
                        ).toLocaleDateString("vi-VN")
                      : selectedExamRecord?.examDate}
                  </Text>
                </Col>
                <Col span={12}>
                  <Text strong>Giờ khám: </Text>
                  <Text>
                    {selectedExamRecord?.examTime
                      ? selectedExamRecord?.examTime
                          .split(" - ")
                          .map((time) =>
                            moment(time, "HH:mm:ss").format("HH:mm")
                          )
                          .join(" - ")
                      : ""}
                  </Text>
                </Col>
              </Row>
            </div>

            {/* I. Thông tin bệnh nhân */}
            <Divider orientation="left">I. HỒ SƠ THÔNG TIN BỆNH NHÂN</Divider>
            <div
              style={{
                marginBottom: "24px",
                padding: "16px",
                backgroundColor: "#fafafa",
                display: "flex",
                justifyContent: "space-between",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              <Col span={12}>
                <Text strong>Họ và tên: </Text>
                <Text style={{ marginLeft: "10px" }}>
                  {selectedExamRecord?.patientInfo?.fullName}
                </Text>
              </Col>

              <Col
                span={6}
                style={{
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <Text strong>Ngày sinh: </Text>
                <Text style={{ marginLeft: "10px" }}>
                  {moment(selectedExamRecord?.patientInfo?.dateOfBirth).format(
                    "DD/MM/YYYY"
                  )}
                </Text>
              </Col>

              <Col span={6}>
                <Text strong>Giới tính: </Text>
                <Text>
                  {selectedExamRecord?.patientInfo?.gender ? "Nam" : "Nữ"}
                </Text>
              </Col>

              <Col span={16}>
                <Text strong>Địa chỉ: </Text>
                <Text>{selectedExamRecord?.patientInfo?.address}</Text>
              </Col>

              <Col span={8}>
                <Text strong>Điện thoại: </Text>
                <Text>{selectedExamRecord?.patientInfo?.phone}</Text>
              </Col>
            </div>

            {/* II. Lý do khám */}
            <Divider orientation="left">II. LÝ DO KHÁM</Divider>
            <div
              style={{
                marginBottom: "24px",
                padding: "16px",
                backgroundColor: "#fafafa",
              }}
            >
              <Text strong>Lý do khám: </Text>
              <Text>{selectedExamRecord?.patientInfo?.reasonForExam}</Text>
            </div>

            {/* III. Tiểu sử bệnh */}
            <Divider orientation="left">III. TIỂU SỬ BỆNH</Divider>
            <div style={{ marginBottom: "16px", padding: "16px" }}>
              <Text>{selectedExamRecord?.medical_history}</Text>
            </div>

            {/* IV. Quá trình bệnh lý */}
            <Divider orientation="left">IV. QUÁ TRÌNH BỆNH LÝ</Divider>
            <div style={{ marginBottom: "16px", padding: "16px" }}>
              <Text>{selectedExamRecord?.disease_progression}</Text>
            </div>

            {/* V. Khám lâm sàng */}
            <Divider orientation="left">V. KHÁM LÂM SÀNG</Divider>

            {/* V.1. Toàn thân */}
            <div
              style={{
                marginLeft: "20px",
                marginBottom: "16px",
                padding: "16px",
              }}
            >
              <Title level={5}>1. Toàn thân:</Title>
              <Row gutter={[16, 8]}>
                <Col span={8}>
                  <Text strong>Mạch: </Text>
                  <Text>{selectedExamRecord?.clinicalExam?.pulse}</Text>
                </Col>
                <Col span={8}>
                  <Text strong>Nhiệt độ: </Text>
                  <Text>{selectedExamRecord?.clinicalExam?.temperature}</Text>
                </Col>
                <Col span={8}>
                  <Text strong>Huyết áp: </Text>
                  <Text>{selectedExamRecord?.clinicalExam?.bloodPressure}</Text>
                </Col>
                <Col span={12}>
                  <Text strong>Da: </Text>
                  <Text>{selectedExamRecord?.clinicalExam?.skin}</Text>
                </Col>
                <Col span={12}>
                  <Text strong>Niêm mạc: </Text>
                  <Text>
                    {selectedExamRecord?.clinicalExam?.mucousMembrane}
                  </Text>
                </Col>
              </Row>

              {/* V.2. Cơ quan */}
              <Title level={5}>2. Cơ quan:</Title>
              <div style={{ marginBottom: "16px", padding: "16px" }}>
                <Text>
                  {selectedExamRecord?.clinicalExam?.organExamination}
                </Text>
              </div>
            </div>

            {/* VI. Kết quả xét nghiệm */}
            <Divider orientation="left">VI. KẾT QUẢ CÁC XÉT NGHIỆM</Divider>
            <div style={{ marginBottom: "16px", padding: "16px" }}>
              {selectedExamRecord?.testResults &&
              selectedExamRecord.testResults.length > 0 ? (
                selectedExamRecord.testResults.map((result, index) => (
                  <div
                    key={index}
                    style={{
                      marginBottom: "16px",
                      padding: "12px",
                      border: "1px solid #d9d9d9",
                      borderRadius: "6px",
                    }}
                  >
                    <Row gutter={16} align="middle">
                      <Col span={6}>
                        <Space>
                          <FileImageOutlined style={{ color: "#1890ff" }} />
                          <Text strong>{result.file_name}</Text>
                        </Space>
                      </Col>
                      <Col span={12}>
                        <Text>{result.description}</Text>
                      </Col>
                      <Col span={6}>
                        <Space>
                          <Button
                            size="small"
                            icon={<EyeOutlined />}
                            onClick={() => handleFileView(result)}
                          >
                            Xem
                          </Button>
                        </Space>
                      </Col>
                    </Row>
                  </div>
                ))
              ) : (
                <Text type="secondary">Không có kết quả xét nghiệm</Text>
              )}
            </div>

            {/* VII. Chuẩn đoán */}
            <Divider orientation="left">VII. CHUẨN ĐOÁN</Divider>
            <div style={{ marginBottom: "16px", padding: "16px" }}>
              <Text>{selectedExamRecord?.diagnosis}</Text>
            </div>

            {/* VIII. Hướng điều trị */}
            <Divider orientation="left">VIII. HƯỚNG ĐIỀU TRỊ</Divider>
            <div style={{ marginBottom: "16px", padding: "16px" }}>
              <Text>{selectedExamRecord?.treatment_direction}</Text>
            </div>

            {/* IX. Đơn thuốc */}
            <Divider orientation="left">IX. ĐƠN THUỐC</Divider>
            <div style={{ marginBottom: "16px", padding: "16px" }}>
              {selectedExamRecord?.prescriptions &&
              selectedExamRecord.prescriptions.length > 0 ? (
                <Table
                  dataSource={selectedExamRecord.prescriptions}
                  pagination={false}
                  size="small"
                  columns={[
                    {
                      title: "Tên thuốc",
                      dataIndex: "medication",
                      key: "medication",
                    },
                    {
                      title: "Số lượng",
                      dataIndex: "quantity",
                      key: "quantity",
                    },
                    {
                      title: "Cách dùng",
                      dataIndex: "instructions",
                      key: "instructions",
                    },
                  ]}
                />
              ) : (
                <Text type="secondary">Không có đơn thuốc</Text>
              )}
            </div>
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "50px" }}>
            <FileTextOutlined
              style={{
                fontSize: "48px",
                color: "#d9d9d9",
                marginBottom: "16px",
              }}
            />
            <div>
              <Text type="secondary">Chưa có kết quả khám bệnh nào</Text>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal preview file ảnh */}
      <Modal
        title={
          <Space>
            <FileImageOutlined />
            {`Xem ảnh: ${previewFile?.fileName || "Ảnh"}`}
          </Space>
        }
        open={previewModalVisible}
        onCancel={() => setPreviewModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setPreviewModalVisible(false)}>
            Đóng
          </Button>,
        ]}
        width={900}
        centered
      >
        {previewFile && (
          <div style={{ textAlign: "center" }}>
            <div style={{ marginBottom: "16px" }}>
              <img
                src={previewFile.fileUrl}
                alt={previewFile.fileName}
                style={{
                  maxWidth: "100%",
                  maxHeight: "60vh",
                  objectFit: "contain",
                  border: "1px solid #d9d9d9",
                  borderRadius: "8px",
                }}
                onError={(e) => {
                  console.error("Error loading image:", previewFile.fileUrl);
                  e.target.style.display = "none";
                  e.target.nextSibling.style.display = "block";
                }}
                onLoad={(e) => {
                  console.log(
                    "Image loaded successfully:",
                    previewFile.fileUrl
                  );
                  e.target.nextSibling.style.display = "none";
                }}
              />
              <div
                style={{
                  display: "none",
                  padding: "40px",
                  border: "1px dashed #d9d9d9",
                  borderRadius: "8px",
                  backgroundColor: "#fafafa",
                }}
              >
                <FileImageOutlined
                  style={{
                    fontSize: "48px",
                    color: "#d9d9d9",
                    marginBottom: "16px",
                  }}
                />
                <div>
                  <Text type="secondary">Không thể tải ảnh</Text>
                </div>
                <div style={{ marginTop: "8px" }}>
                  <Text type="secondary" style={{ fontSize: "12px" }}>
                    URL: {previewFile.fileUrl}
                  </Text>
                </div>
              </div>
            </div>

            {previewFile.description && (
              <div
                style={{
                  marginTop: "16px",
                  padding: "12px",
                  backgroundColor: "#f5f5f5",
                  borderRadius: "6px",
                  textAlign: "left",
                }}
              >
                <Text strong>Mô tả: </Text>
                <Text>{previewFile.description}</Text>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Appointments;
