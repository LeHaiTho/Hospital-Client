import React, { useState, useEffect } from "react";
import {
  Card,
  Form,
  Input,
  Button,
  Row,
  Col,
  Select,
  DatePicker,
  InputNumber,
  Upload,
  Space,
  Divider,
  Typography,
  message,
  Table,
  Modal,
  Radio,
} from "antd";
import {
  SaveOutlined,
  ArrowLeftOutlined,
  PlusOutlined,
  DeleteOutlined,
  UploadOutlined,
  FileImageOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import dayjs from "dayjs";
import { createDetailedExamResult } from "../../apis/detailedExamResultApi";
import { getAppointmentByCode } from "../../apis/appointmentApi";

const { TextArea } = Input;
const { Option } = Select;
const { Title, Text } = Typography;
const { confirm } = Modal;

const ExamResultForm = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [prescriptions, setPrescriptions] = useState([
    { id: 1, medication: "", quantity: "", instructions: "" },
  ]);
  const [testResults, setTestResults] = useState([]);
  const [fileList, setFileList] = useState([]);
  const [patientInfo, setPatientInfo] = useState(null);
  const [appointmentDetails, setAppointmentDetails] = useState(null);
  const navigate = useNavigate();
  const { appointmentCode } = useParams();
  const location = useLocation();
  const appointmentData = location.state?.appointmentData;

  console.log(patientInfo);
  // Load appointment and patient information
  const loadAppointmentData = async () => {
    try {
      setLoading(true);
      const response = await getAppointmentByCode(appointmentCode);
      console.log("response", response);

      if (response.success && response.data) {
        const appointment = response.data;
        setAppointmentDetails(appointment);

        // Set patient info from the structured response
        const patient = appointment.patient;
        console.log("Patient data:", patient); // Debug log

        setPatientInfo({
          fullName: patient.fullname,
          dateOfBirth: patient.date_of_birth
            ? dayjs(patient.date_of_birth).format("DD/MM/YYYY")
            : patient.date_of_birth,
          gender: patient.gender,
          address: patient.address,
          phone: patient.phone,
          email: patient.email,
          reasonForExam: appointment.reason_for_visit,
          patientType: patient.type,
          relationship: patient.relationship,
        });
      } else {
        console.log("Invalid response format:", response);
        message.error("Không thể tải thông tin lịch hẹn");
      }
    } catch (error) {
      console.error("Error loading appointment data:", error);
      message.error("Có lỗi xảy ra khi tải thông tin lịch hẹn");
      // Fallback to mock data
      setPatientInfo({
        fullName: "Nguyễn Văn A",
        dateOfBirth: "15/05/1985",
        gender: "Nam",
        address: "123 Đường ABC, Phường XYZ, Quận 1, TP.HCM",
        phone: "0123456789",
        reasonForExam: "Đau đầu kéo dài, chóng mặt, mệt mỏi",
      });
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    if (appointmentCode) {
      loadAppointmentData();
    }
  }, [appointmentCode]);

  const handleAddPrescription = () => {
    setPrescriptions([
      ...prescriptions,
      { id: Date.now(), medication: "", quantity: "", instructions: "" },
    ]);
  };

  const handleDeletePrescription = (id) => {
    setPrescriptions(prescriptions.filter((item) => item.id !== id));
  };

  const handleUploadChange = (info) => {
    const { fileList } = info;
    console.log("Upload change fileList:", fileList);

    // Filter only image files
    const imageFileList = fileList.filter((file) => {
      const isImage =
        file.type?.startsWith("image/") ||
        /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(file.name);
      if (!isImage) {
        message.warning(
          `File "${file.name}" không phải là file ảnh. Chỉ chấp nhận file ảnh.`
        );
      }
      return isImage;
    });

    // Update fileList state
    setFileList(imageFileList);

    // Tạo text field cho mỗi file upload
    const newTestResults = imageFileList.map((file, index) => {
      console.log(`Processing file ${index}:`, file);
      return {
        id: file.uid || `file-${index}`,
        fileName: file.name,
        file: file.originFileObj || file, // Store the actual file object
        description:
          testResults.find((t) => t.id === file.uid)?.description || "",
      };
    });

    console.log("New testResults:", newTestResults);
    setTestResults(newTestResults);
  };
  console.log("testResults", testResults);
  const handleTestResultDescriptionChange = (id, description) => {
    setTestResults(
      testResults.map((result) =>
        result.id === id ? { ...result, description } : result
      )
    );
  };

  const handleDeleteTestResult = (id) => {
    // Remove from testResults
    setTestResults(testResults.filter((result) => result.id !== id));

    // Remove from fileList
    setFileList(fileList.filter((file) => file.uid !== id));

    message.success("Đã xóa file ảnh");
  };

  const onFinish = async (values) => {
    // Hiển thị modal confirm trước khi lưu
    confirm({
      title: "Xác nhận lưu kết quả khám bệnh",
      icon: <ExclamationCircleOutlined />,
      content: (
        <div>
          <p>
            <strong>Lưu ý quan trọng:</strong>
          </p>
          <p>
            • Sau khi lưu kết quả khám bệnh, bạn sẽ{" "}
            <strong>KHÔNG thể chỉnh sửa</strong> được nữa.
          </p>
          <p>• Vui lòng kiểm tra kỹ tất cả thông tin trước khi xác nhận.</p>
          <p>Bạn có chắc chắn muốn lưu kết quả khám bệnh này không?</p>
        </div>
      ),
      okText: "Xác nhận lưu",
      cancelText: "Hủy bỏ",
      okType: "primary",
      onOk: () => handleConfirmSave(values),
      onCancel: () => {
        console.log("Hủy lưu kết quả");
      },
    });
  };

  const handleConfirmSave = async (values) => {
    setLoading(true);
    try {
      // Prepare FormData for file uploads
      const formData = new FormData();

      // Add basic exam data
      const examData = {
        appointmentCode: appointmentCode,
        appointmentId: appointmentDetails?.id,
        medicalHistory: values.medicalHistory,
        diseaseProgression: values.diseaseProgression,
        pulse: values.pulse,
        temperature: values.temperature,
        bloodPressure: values.bloodPressure,
        skin: values.skin,
        mucousMembrane: values.mucousMembrane,
        organExamination: values.organExamination,
        diagnosis: values.diagnosis,
        treatmentDirection: values.treatmentDirection,
        prescriptions: prescriptions.filter(
          (p) => p.medication && p.quantity && p.instructions
        ),
        testResults: testResults.map((t) => ({
          fileName: t.fileName,
          description: t.description,
        })),
      };

      // Add JSON data to FormData
      Object.keys(examData).forEach((key) => {
        if (key === "prescriptions" || key === "testResults") {
          formData.append(key, JSON.stringify(examData[key]));
        } else {
          formData.append(key, examData[key]);
        }
      });

      // Add files to FormData
      testResults.forEach((result, index) => {
        if (result.file && result.file instanceof File) {
          console.log(`Adding file ${index}:`, result.file.name, result.file);
          formData.append("testResultFiles", result.file);
        }
      });

      console.log("=== FormData Debug ===");
      for (let pair of formData.entries()) {
        console.log(pair[0], pair[1]);
      }
      console.log("=====================");

      const response = await createDetailedExamResult(formData);
      console.log("response", response);

      if (response.success) {
        message.success("Lưu kết quả khám bệnh thành công!");
        navigate("/doctor/appointments");
        console.log("response", response);
      } else {
        message.error(
          response.message || "Có lỗi xảy ra khi lưu kết quả khám bệnh!"
        );
      }
    } catch (error) {
      console.error("Error saving exam result:", error);
      message.error(
        error.message || "Có lỗi xảy ra khi lưu kết quả khám bệnh!"
      );
    } finally {
      setLoading(false);
    }
  };

  const uploadProps = {
    name: "file",
    multiple: true,
    accept: ".jpg,.jpeg,.png,.gif,.bmp,.webp",
    fileList: fileList,
    beforeUpload: (file) => {
      // Validate file type on client side
      const isImage =
        file.type?.startsWith("image/") ||
        /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(file.name);
      if (!isImage) {
        message.error(`${file.name} không phải là file ảnh hợp lệ!`);
        return false;
      }

      // Validate file size (max 10MB)
      const isLt10M = file.size / 1024 / 1024 < 10;
      if (!isLt10M) {
        message.error(`${file.name} có kích thước quá lớn! Tối đa 10MB.`);
        return false;
      }

      return false; // Prevent auto upload
    },
    onChange: handleUploadChange,
  };

  return (
    <div style={{}}>
      <Card>
        <Title level={3} style={{ textAlign: "center" }}>
          KẾT QUẢ KHÁM BỆNH
        </Title>

        {/* Show loading or patient not found */}
        {loading && !patientInfo ? (
          <div style={{ textAlign: "center", padding: "50px" }}>
            <Text>Đang tải thông tin bệnh nhân...</Text>
          </div>
        ) : !patientInfo ? (
          <div style={{ textAlign: "center", padding: "50px" }}>
            <Text type="danger">
              Không thể tải thông tin bệnh nhân. Vui lòng thử lại.
            </Text>
            <br />
            <Button
              type="primary"
              onClick={loadAppointmentData}
              style={{ marginTop: "16px" }}
            >
              Thử lại
            </Button>
          </div>
        ) : (
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            initialValues={{
              examDate: dayjs(),
            }}
          >
            {/* I. Thông tin bệnh nhân */}
            <Divider orientation="left">I. HỒ SƠ THÔNG TIN BỆNH NHÂN</Divider>

            {/* Thông tin bệnh viện và bác sĩ */}
            {/* {appointmentDetails && (
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
                    <Text>{appointmentDetails.hospital?.name}</Text>
                  </Col>
                  <Col span={12}>
                    <Text strong>Địa chỉ BV: </Text>
                    <Text>{appointmentDetails.hospital?.address}</Text>
                  </Col>
                  <Col span={6}>
                    <Text strong>Ngày khám: </Text>
                    <Text>
                      {appointmentDetails.doctorSchedule?.date
                        ? dayjs(appointmentDetails.doctorSchedule.date).format(
                            "DD/MM/YYYY"
                          )
                        : "N/A"}
                    </Text>
                  </Col>
                  <Col span={6}>
                    <Text strong>Giờ khám: </Text>
                    <Text>
                      {appointmentDetails.formatted?.appointment_time_range}
                    </Text>
                  </Col>
                  <Col span={6}>
                    <Text strong>Bác sĩ: </Text>
                    <Text>{appointmentDetails.doctor?.user?.fullname}</Text>
                  </Col>
                  <Col span={6}>
                    <Text strong>Chuyên khoa: </Text>
                    <Text>{appointmentDetails.specialty?.name}</Text>
                  </Col>
                </Row>
              </div>
            )} */}

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
                  {patientInfo?.fullName}
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
                  {patientInfo?.dateOfBirth}
                </Text>
              </Col>

              <Col span={6}>
                <Text strong>Giới tính: </Text>
                <Text>{patientInfo?.gender ? "Nam" : "Nữ"}</Text>
              </Col>

              <Col span={16}>
                <Text strong>Địa chỉ: </Text>
                <Text>{patientInfo?.address}</Text>
              </Col>

              <Col span={8}>
                <Text strong>Điện thoại: </Text>
                <Text>{patientInfo?.phone}</Text>
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
              <Text>{patientInfo?.reasonForExam}</Text>
            </div>

            {/* III. Tiểu sử bệnh */}
            <Divider orientation="left">III. TIỂU SỬ BỆNH</Divider>
            <div
              style={{
                marginBottom: "24px",
                paddingRight: "16px",
                paddingLeft: "16px",
              }}
            >
              <Form.Item
                name="medicalHistory"
                rules={[
                  { required: true, message: "Vui lòng nhập tiểu sử bệnh!" },
                ]}
              >
                <TextArea
                  rows={4}
                  placeholder="Nhập tiểu sử bệnh của bệnh nhân..."
                />
              </Form.Item>
            </div>

            {/* IV. Quá trình bệnh lý */}
            <Divider orientation="left">IV. QUÁ TRÌNH BỆNH LÝ</Divider>
            <div
              style={{
                marginBottom: "24px",
                paddingRight: "16px",
                paddingLeft: "16px",
              }}
            >
              <Form.Item
                name="diseaseProgression"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập quá trình bệnh lý!",
                  },
                ]}
              >
                <TextArea rows={4} placeholder="Mô tả quá trình bệnh lý..." />
              </Form.Item>
            </div>

            {/* V. Khám lâm sàng */}
            <Divider orientation="left">V. KHÁM LÂM SÀNG</Divider>

            {/* V.1. Toàn thân */}
            <div style={{ marginLeft: "20px" }}>
              <Title level={5}>1. Toàn thân:</Title>
              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item
                    label="Mạch (lần/phút)"
                    name="pulse"
                    rules={[{ required: true, message: "Vui lòng nhập mạch!" }]}
                  >
                    <Input placeholder="VD: 72" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    label="Nhiệt độ (°C)"
                    name="temperature"
                    rules={[
                      { required: true, message: "Vui lòng nhập nhiệt độ!" },
                    ]}
                  >
                    <Input placeholder="VD: 36.5" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    label="Huyết áp (mmHg)"
                    name="bloodPressure"
                    rules={[
                      { required: true, message: "Vui lòng nhập huyết áp!" },
                    ]}
                  >
                    <Input placeholder="VD: 120/80" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="Da"
                    name="skin"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng mô tả tình trạng da!",
                      },
                    ]}
                  >
                    <Input placeholder="VD: Hồng hào, không vàng da, không phù..." />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Niêm mạc"
                    name="mucousMembrane"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng mô tả tình trạng niêm mạc!",
                      },
                    ]}
                  >
                    <Input placeholder="VD: Hồng, ẩm, không xuất huyết..." />
                  </Form.Item>
                </Col>
              </Row>

              {/* V.2. Cơ quan */}
              <Title level={5}>2. Cơ quan:</Title>
              <Form.Item
                name="organExamination"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập kết quả khám cơ quan!",
                  },
                ]}
              >
                <TextArea
                  rows={6}
                  placeholder="Mô tả kết quả khám các cơ quan (tim, phổi, bụng, thần kinh...)..."
                />
              </Form.Item>
            </div>

            {/* VI. Kết quả xét nghiệm */}
            <Divider orientation="left">VI. KẾT QUẢ CÁC XÉT NGHIỆM</Divider>
            <div
              style={{
                marginBottom: "24px",
                paddingRight: "16px",
                paddingLeft: "16px",
              }}
            >
              <Form.Item label="Tải lên kết quả xét nghiệm (chỉ file ảnh)">
                <Upload {...uploadProps}>
                  <Button icon={<UploadOutlined />}>
                    Tải lên ảnh xét nghiệm
                  </Button>
                </Upload>
              </Form.Item>

              {testResults.map((result) => (
                <div
                  key={result.id}
                  style={{
                    marginBottom: "16px",
                    padding: "12px",
                    border: "1px solid #d9d9d9",
                    borderRadius: "6px",
                    backgroundColor: "#fafafa",
                  }}
                >
                  <Row gutter={16} align="middle">
                    <Col span={5}>
                      <Space>
                        <FileImageOutlined style={{ color: "#1890ff" }} />
                        <Text strong>{result.fileName}</Text>
                      </Space>
                    </Col>
                    <Col span={16}>
                      <Input
                        placeholder="Mô tả kết quả xét nghiệm..."
                        value={result.description}
                        onChange={(e) =>
                          handleTestResultDescriptionChange(
                            result.id,
                            e.target.value
                          )
                        }
                      />
                    </Col>
                    <Col span={3}>
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleDeleteTestResult(result.id)}
                        title="Xóa file ảnh này"
                      >
                        Xóa
                      </Button>
                    </Col>
                  </Row>
                </div>
              ))}

              {testResults.length === 0 && (
                <div
                  style={{
                    textAlign: "center",
                    padding: "20px",
                    color: "#999",
                    fontStyle: "italic",
                  }}
                >
                  Chưa có file ảnh xét nghiệm nào được chọn
                </div>
              )}
            </div>

            {/* VII. Chuẩn đoán */}
            <Divider orientation="left">VII. CHUẨN ĐOÁN</Divider>
            <div
              style={{
                marginBottom: "24px",
                paddingRight: "16px",
                paddingLeft: "16px",
              }}
            >
              <Form.Item
                name="diagnosis"
                rules={[
                  { required: true, message: "Vui lòng nhập chuẩn đoán!" },
                ]}
              >
                <TextArea rows={3} placeholder="Nhập chuẩn đoán chi tiết..." />
              </Form.Item>
            </div>

            {/* VIII. Hướng điều trị */}
            <Divider orientation="left">VIII. HƯỚNG ĐIỀU TRỊ</Divider>
            <div
              style={{
                marginBottom: "24px",
                paddingRight: "16px",
                paddingLeft: "16px",
              }}
            >
              <Form.Item
                name="treatmentDirection"
                rules={[
                  { required: true, message: "Vui lòng nhập hướng điều trị!" },
                ]}
              >
                <TextArea
                  rows={4}
                  placeholder="Mô tả hướng điều trị, lời khuyên cho bệnh nhân..."
                />
              </Form.Item>
            </div>

            {/* IX. Đơn thuốc */}
            <Divider orientation="left">IX. ĐƠN THUỐC</Divider>
            <div
              style={{
                marginBottom: "24px",
                paddingRight: "16px",
                paddingLeft: "16px",
              }}
            >
              <Form.Item label="Đơn thuốc">
                {prescriptions.map((item, index) => (
                  <div
                    key={item.id}
                    style={{
                      display: "flex",
                      gap: "10px",
                      alignItems: "center",
                      marginBottom: "1em",
                    }}
                  >
                    <Input
                      placeholder="Tên thuốc"
                      value={item.medication}
                      onChange={(e) =>
                        setPrescriptions(
                          prescriptions.map((prescription) =>
                            prescription.id === item.id
                              ? { ...prescription, medication: e.target.value }
                              : prescription
                          )
                        )
                      }
                      style={{ width: "30%" }}
                    />
                    <Input
                      placeholder="Số lượng"
                      value={item.quantity}
                      onChange={(e) =>
                        setPrescriptions(
                          prescriptions.map((prescription) =>
                            prescription.id === item.id
                              ? { ...prescription, quantity: e.target.value }
                              : prescription
                          )
                        )
                      }
                      style={{ width: "20%" }}
                    />
                    <Input
                      placeholder="Hướng dẫn sử dụng"
                      value={item.instructions}
                      onChange={(e) =>
                        setPrescriptions(
                          prescriptions.map((prescription) =>
                            prescription.id === item.id
                              ? {
                                  ...prescription,
                                  instructions: e.target.value,
                                }
                              : prescription
                          )
                        )
                      }
                      style={{ width: "40%" }}
                    />
                    <Button
                      type="text"
                      onClick={() => handleDeletePrescription(item.id)}
                      style={{ color: "red" }}
                    >
                      <DeleteOutlined />
                    </Button>
                  </div>
                ))}
                <Button
                  type="link"
                  icon={<PlusOutlined />}
                  onClick={handleAddPrescription}
                  style={{ width: "100%" }}
                >
                  Thêm thuốc
                </Button>
              </Form.Item>
            </div>
            <Divider />

            <Form.Item>
              <Space
                style={{
                  justifyContent: "flex-end",
                  width: "100%",
                  paddingRight: "16px",
                }}
              >
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  icon={<SaveOutlined />}
                >
                  Lưu kết quả
                </Button>
                <Button onClick={() => navigate("/doctor/appointments")}>
                  Quay lại
                </Button>
              </Space>
            </Form.Item>
          </Form>
        )}
      </Card>
    </div>
  );
};

export default ExamResultForm;
