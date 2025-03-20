import React, { useState } from "react";
import Scanner from "react-qr-barcode-scanner";
import {
  Col,
  FloatButton,
  notification,
  Row,
  Select,
  Spin,
  Upload,
} from "antd";
import { Form, Input, Button, Descriptions, Card, message, Modal } from "antd";
import axiosConfig from "../../apis/axiosConfig";
import moment from "moment";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";

const ExamResult = () => {
  const [data, setData] = useState(""); // Biến để lưu dữ liệu quét được
  const [error, setError] = useState(null); // Biến để lưu lỗi (nếu có)
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [customerInfo, setCustomerInfo] = useState(null);
  const [form] = Form.useForm();

  const { Option } = Select;
  // Biến để lưu dữ liệu nhập vào form
  const [formData, setFormData] = useState({
    appointment: {
      id: "",
      status: "completed",
    },
    healthCheckInfo: {
      weight: "",
      height: "",
      bloodPressure: "",
      heartRate: "",
    },
    examResults: [
      {
        description: "",
        findings: "",
        recommendation: "",
      },
    ],
    prescriptions: {
      items: [
        {
          medication: "",
          dosage: "",
          quantity: "",
          instructions: "",
        },
      ],
    },
    imagingDiagnostics: [],
  });

  console.log(formData);
  const handleScan = async (result) => {
    try {
      setData(result.text);

      try {
        const res = await axiosConfig.get(
          `/appointments/get-appointment-by-id-by-hospital/${result.text}`
        );
        setIsModalVisible(false);
        setCustomerInfo(res?.appointmentDetail);
        setFormData({
          ...formData,
          appointment: { id: res?.appointmentDetail?.id },
        });
        // if (res.status === 200) {
        //   message.success("Check-in thành công");
        // }
      } catch (error) {
        console.log(error);
        if (error.response.status === 404) {
          message.error(error.response.data.message);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };
  const handleCheckIn = async () => {
    if (!data) {
      message.error("Vui lòng nhập mã barcode");
      return;
    }
    setLoading(true);
    try {
      const res = await axiosConfig.get(
        `/appointments/get-appointment-by-id-by-hospital/${data}`
      );
      setCustomerInfo(res?.appointmentDetail);
      setFormData({
        ...formData,
        appointment: { id: res?.appointmentDetail?.id },
      });
      if (res.status === 200) {
        message.success("Check-in thành công");
      }
    } catch (error) {
      console.log(error);
      if (error.response.status === 404) {
        message.error(error.response.data.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleError = (err) => {
    setError(err?.message || "Có lỗi xảy ra");

    console.error(err);
  };

  const onFinish = async () => {
    const formDataToSend = new FormData();

    // Append the other data as a JSON string
    formDataToSend.append(
      "data",
      JSON.stringify({
        appointment: formData.appointment,
        healthCheckInfo: formData.healthCheckInfo,
        examResults: formData.examResults,
        prescriptions: formData.prescriptions,
        imagingDiagnostics: formData.imagingDiagnostics.map((diag) => ({
          description: diag.description,
          fileType: diag.fileType, // Ensure you have this field in your state
        })),
      })
    );

    // Append each file under the field name "files"
    formData.imagingDiagnostics.forEach((diag) => {
      formDataToSend.append("files", diag.file); // Use "files" as the field name
    });

    console.log(formDataToSend.get("data"));
    console.log(formDataToSend.get("files"));
    // Call API
    try {
      const res = await axiosConfig.post(
        "medical-histories/receive-medical-history",
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data", // Ensure the correct content type
          },
        }
      );
      if (res.status === 200) {
        notification.success("Lưu kết quả khám thành công");
      }
      form.resetFields();
      setFormData({
        ...formData,
        imagingDiagnostics: [],
      });
      console.log(res);
    } catch (error) {
      console.log(error);
    }
  };
  console.log(customerInfo?.id);
  const handleFileChange = (event) => {
    const uploadedFiles = Array.from(event.target.files);

    const newDiagnostics = uploadedFiles.map((file) => ({
      file,
      description: "",
      fileType: "",
    }));

    setFormData((prev) => ({
      ...prev,
      imagingDiagnostics: [...prev.imagingDiagnostics, ...newDiagnostics],
    }));
  };
  console.log(formData);
  const handleDiagnosticChange = (index, key, value) => {
    const updatedDiagnostics = [...formData.imagingDiagnostics];
    updatedDiagnostics[index][key] = value;
    setFormData((prev) => ({
      ...prev,
      imagingDiagnostics: updatedDiagnostics,
    }));
  };

  const handleRemoveDiagnostic = (index) => {
    setFormData((prev) => ({
      ...prev,
      imagingDiagnostics: prev.imagingDiagnostics.filter((_, i) => i !== index),
    }));
  };
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "20px",
      }}
    >
      <Card title="Check-in Bệnh Nhân">
        <Input
          placeholder="Nhập mã barcode"
          value={data}
          onChange={(e) => setData(e.target.value)}
          style={{ width: "300px", marginRight: "10px" }}
        />
        <Button type="primary" loading={loading} onClick={handleCheckIn}>
          Check-in
        </Button>
        <Button
          style={{ marginLeft: "10px" }}
          onClick={() => setIsModalVisible(true)}
        >
          Quét mã barcode
        </Button>
      </Card>

      {/* Modal Quét Mã */}
      <Modal
        title="Quét Mã Barcode"
        open={isModalVisible}
        footer={null}
        onCancel={() => setIsModalVisible(false)}
      >
        <Scanner
          onUpdate={(err, result) => {
            if (result) {
              handleScan(result);
              return;
            }
            // if (err) handleError(err);
          }}
        />
      </Modal>
      {customerInfo && (
        <Card title="Thông tin khách hàng" style={{ marginBottom: "20px" }}>
          <Descriptions bordered>
            <Descriptions.Item label="Họ tên">
              {customerInfo?.member?.fullname ||
                customerInfo?.patient?.fullname}
            </Descriptions.Item>
            <Descriptions.Item label="Số điện thoại">
              {customerInfo?.member?.phone || customerInfo?.patient?.phone}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày hẹn">
              {moment(customerInfo?.appointment_date).format("DD/MM/YYYY")}
            </Descriptions.Item>
            <Descriptions.Item label="Bác sĩ phụ trách">
              {customerInfo?.doctor?.fullname}
            </Descriptions.Item>
          </Descriptions>
        </Card>
      )}
      {customerInfo && (
        <Card title="Nhập Kết Quả Khám" style={{ width: "auto" }}>
          <Form layout="vertical" onFinish={onFinish}>
            <Row gutter={16}>
              <Col span={6}>
                <Form.Item
                  label="Cân nặng (kg)"
                  name="weight"
                  rules={[
                    { required: true, message: "Vui lòng nhập cân nặng" },
                  ]}
                >
                  <Input
                    type="number"
                    value={formData.healthCheckInfo.weight}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        healthCheckInfo: {
                          ...formData.healthCheckInfo,
                          weight: e.target.value,
                        },
                      });
                    }}
                  />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  label="Chiều cao (cm)"
                  name="height"
                  rules={[
                    { required: true, message: "Vui lòng nhập chiều cao" },
                  ]}
                >
                  <Input
                    type="number"
                    value={formData.healthCheckInfo.height}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        healthCheckInfo: {
                          ...formData.healthCheckInfo,
                          height: e.target.value,
                        },
                      });
                    }}
                  />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  label="Huyết áp"
                  name="bloodPressure"
                  rules={[
                    { required: true, message: "Vui lòng nhập huyết áp" },
                  ]}
                >
                  <Input
                    value={formData.healthCheckInfo.bloodPressure}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        healthCheckInfo: {
                          ...formData.healthCheckInfo,
                          bloodPressure: e.target.value,
                        },
                      });
                    }}
                  />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  label="Nhịp tim"
                  name="heartRate"
                  rules={[
                    { required: true, message: "Vui lòng nhập nhịp tim" },
                  ]}
                >
                  <Input
                    type="number"
                    value={formData.healthCheckInfo.heartRate}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        healthCheckInfo: {
                          ...formData.healthCheckInfo,
                          heartRate: e.target.value,
                        },
                      });
                    }}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Kết quả khám"
                  name="description"
                  rules={[
                    { required: true, message: "Vui lòng nhập kết quả khám" },
                  ]}
                >
                  <Input.TextArea rows={2} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Kết luận"
                  name="findings"
                  rules={[
                    { required: true, message: "Vui lòng nhập kết luận" },
                  ]}
                >
                  <Input.TextArea rows={2} />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item
              label="Chỉ định"
              name="recommendation"
              rules={[{ required: true, message: "Vui lòng nhập chỉ định" }]}
            >
              <Input.TextArea />
            </Form.Item>
            {/* medicine */}
            <Form.Item label="Đơn thuốc">
              {formData.prescriptions.items.map((item, index) => (
                <div
                  key={index}
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
                      setFormData((prev) => {
                        const updatedItems = [...prev.prescriptions.items];
                        updatedItems[index].medication = e.target.value;
                        return {
                          ...prev,
                          prescriptions: { items: updatedItems },
                        };
                      })
                    }
                    style={{ width: "20%" }}
                  />
                  <Input
                    placeholder="Liều lượng"
                    value={item.dosage}
                    onChange={(e) =>
                      setFormData((prev) => {
                        const updatedItems = [...prev.prescriptions.items];
                        updatedItems[index].dosage = e.target.value;
                        return {
                          ...prev,
                          prescriptions: { items: updatedItems },
                        };
                      })
                    }
                    style={{ width: "20%" }}
                  />
                  <Input
                    placeholder="Số lượng"
                    value={item.quantity}
                    onChange={(e) =>
                      setFormData((prev) => {
                        const updatedItems = [...prev.prescriptions.items];
                        updatedItems[index].quantity = e.target.value;
                        return {
                          ...prev,
                          prescriptions: { items: updatedItems },
                        };
                      })
                    }
                    style={{ width: "20%" }}
                  />
                  <Input
                    placeholder="Hướng dẫn sử dụng"
                    value={item.instructions}
                    onChange={(e) =>
                      setFormData((prev) => {
                        const updatedItems = [...prev.prescriptions.items];
                        updatedItems[index].instructions = e.target.value;
                        return {
                          ...prev,
                          prescriptions: { items: updatedItems },
                        };
                      })
                    }
                    style={{ width: "30%" }}
                  />
                  <Button
                    type="text"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        prescriptions: {
                          items: prev.prescriptions.items.filter(
                            (_, i) => i !== index
                          ),
                        },
                      }))
                    }
                    style={{ color: "red" }}
                  >
                    <DeleteOutlined />
                  </Button>
                </div>
              ))}
              <Button
                type="link"
                icon={<PlusOutlined />}
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    prescriptions: {
                      items: [
                        ...prev.prescriptions.items,
                        {
                          medication: "",
                          dosage: "",
                          quantity: "",
                          instructions: "",
                        },
                      ],
                    },
                  }))
                }
                style={{ width: "100%" }}
              >
                Thêm thuốc
              </Button>
            </Form.Item>
            {/* image Imaging Diagnostics */}
            <Form.Item>
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                accept=".jpg,.png,.jpeg"
              />
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                {formData.imagingDiagnostics.map((diag, index) => (
                  <div
                    key={index}
                    style={{
                      marginBottom: "1em",
                      alignItems: "center",
                      justifyContent: "center",
                      display: "flex",
                      gap: 10,
                    }}
                  >
                    <p>File: {diag.file.name}</p>
                    <input
                      style={{
                        width: "auto",
                        padding: 8,
                        borderRadius: 10,
                        color: "black",
                        border: "1px solid #ccc",
                      }}
                      type="text"
                      placeholder="mô tả"
                      value={diag.description}
                      onChange={(e) =>
                        handleDiagnosticChange(
                          index,
                          "description",
                          e.target.value
                        )
                      }
                    />

                    <Button
                      type="text"
                      onClick={() => handleRemoveDiagnostic(index)}
                    >
                      <DeleteOutlined style={{ color: "red" }} />
                    </Button>
                  </div>
                ))}
              </div>
            </Form.Item>

            <Button type="primary" htmlType="submit">
              Lưu thông tin
            </Button>
          </Form>
        </Card>
      )}
    </div>
  );
};

export default ExamResult;
