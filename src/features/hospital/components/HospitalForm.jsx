import {
  Form,
  Input,
  Upload,
  Button,
  Row,
  Col,
  message,
  Spin,
  notification,
  Card,
  Modal,
} from "antd";
import { useEffect, useState } from "react";
import { UploadOutlined, CheckCircleOutlined } from "@ant-design/icons";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import axiosInstance from "../../../apis/axiosConfig";
import axios from "axios";
import "../../../index.css";
import "../../../pages/hospitalManager/style.css";
import { FaMagnifyingGlassLocation } from "react-icons/fa6";

const HERE_API_KEY = "te9pF-AZqdY4Dez0jND9_-Eh_Xpe7DWthoixEhgtmeE";

const HospitalForm = () => {
  const [form] = Form.useForm();
  const [description, setDescription] = useState("");
  const [initialValues, setInitialValues] = useState(null);
  const [avatar, setAvatar] = useState([]);
  const [banner, setBanner] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [address, setAddress] = useState("");

  // Fetch hospital info
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const res = await axiosInstance.get("/hospitals");
        const hospital = {
          name: res.hospital.name,
          email: res.hospital.email,
          phone: res.hospital.phone,
          address: res.hospital.address,
          latitude: res.hospital.latitude,
          longitude: res.hospital.longitude,
        };
        form.setFieldsValue(hospital);
        setInitialValues({
          ...hospital,
          description: res.hospital.description,
          avatar: res.hospital.avatar,
          banner: res.hospital.banner,
        });
        setDescription(res.hospital.description || "");
        setAddress(res.hospital.address || "");
        setLatitude(res.hospital.latitude || "");
        setLongitude(res.hospital.longitude || "");
        if (res.hospital.avatar) {
          setAvatar([
            {
              uid: "-1",
              name: "avatar.png",
              status: "done",
              url: `http://localhost:3000${res.hospital.avatar}`,
            },
          ]);
        }
        if (res.hospital.banner) {
          setBanner([
            {
              uid: "-2",
              name: res.hospital.banner.split("/").pop(),
              status: "done",
              url: `http://localhost:3000${res.hospital.banner}`,
            },
          ]);
        }
      } catch (error) {
        notification.error({
          message: "Lỗi",
          description: "Không thể tải thông tin cơ sở y tế!",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [form]);

  // Reverse geocoding to get address from coordinates
  const fetchAddressFromCoordinates = async (latitude, longitude) => {
    try {
      const res = await fetch(
        `https://revgeocode.search.hereapi.com/v1/revgeocode?at=${latitude},${longitude}&lang=vi-VN&apiKey=${HERE_API_KEY}`
      );
      const data = await res.json();
      if (data.items && data.items.length > 0) {
        const location = data.items[0];
        setAddress(location.address.label);
        form.setFieldsValue({ address: location.address.label });
      }
    } catch (error) {
      notification.error({
        message: "Lỗi",
        description: "Không thể lấy địa chỉ từ tọa độ!",
      });
    }
  };

  // Get current location
  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLatitude(latitude);
          setLongitude(longitude);
          form.setFieldsValue({
            latitude: latitude.toString(),
            longitude: longitude.toString(),
          });
          fetchAddressFromCoordinates(latitude, longitude);
          message.success("Lấy vị trí thành công!");
        },
        (error) => {
          message.error("Không thể lấy vị trí, vui lòng thử lại!");
        }
      );
    } else {
      message.error("Trình duyệt không hỗ trợ Geolocation");
    }
  };

  // Handle form submission
  const handleFinish = async (values) => {
    // Validate avatar and banner
    if (!avatar.length && !initialValues?.avatar) {
      notification.error({
        message: "Lỗi",
        description: "Vui lòng tải ảnh đại diện!",
      });
      return;
    }
    if (!banner.length && !initialValues?.banner) {
      notification.error({
        message: "Lỗi",
        description: "Vui lòng tải ảnh bìa!",
      });
      return;
    }

    Modal.confirm({
      title: "Xác nhận cập nhật",
      content: "Bạn có chắc muốn cập nhật thông tin cơ sở y tế?",
      okText: "Cập nhật",
      cancelText: "Hủy",
      onOk: async () => {
        const formData = new FormData();
        formData.append("name", values.name || initialValues.name);
        formData.append("email", values.email || initialValues.email);
        formData.append("phone", values.phone || initialValues.phone);
        formData.append(
          "address",
          address || values.address || initialValues.address
        );
        formData.append(
          "description",
          description || initialValues.description
        );
        formData.append("latitude", latitude || initialValues.latitude || "");
        formData.append(
          "longitude",
          longitude || initialValues.longitude || ""
        );

        if (avatar && avatar[0] && avatar[0].originFileObj) {
          formData.append("avatar", avatar[0].originFileObj);
        } else if (initialValues.avatar) {
          formData.append("avatar", initialValues.avatar);
        }
        if (banner && banner[0] && banner[0].originFileObj) {
          formData.append("banner", banner[0].originFileObj);
        } else if (initialValues.banner) {
          formData.append("banner", initialValues.banner);
        }

        try {
          setIsLoading(true);
          const res = await axios.put(
            "http://localhost:3000/hospitals/update",
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );
          notification.success({
            message: "Thành công",
            description: "Cập nhật thông tin cơ sở y tế thành công!",
          });
        } catch (error) {
          notification.error({
            message: "Lỗi",
            description:
              error.response?.data?.message ||
              "Không thể cập nhật thông tin cơ sở y tế!",
          });
        } finally {
          setIsLoading(false);
        }
      },
    });
  };

  // Handle avatar and banner upload
  const onChangeAvatar = ({ fileList }) => {
    setAvatar(fileList);
  };

  const onChangeBanner = ({ fileList }) => {
    setBanner(fileList);
  };

  return (
    <Card
      title="Thông tin cơ sở y tế"
      style={{
        maxWidth: 800,
        margin: "20px auto",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
        borderRadius: 8,
      }}
      headStyle={{
        backgroundColor: "#0165fc",
        color: "#fff",
        fontSize: 18,
        fontWeight: "bold",
        textAlign: "center",
      }}
    >
      {isLoading ? (
        <div style={{ textAlign: "center", padding: "20px" }}>
          <Spin size="large" />
        </div>
      ) : (
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFinish}
          style={{ padding: "20px" }}
        >
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Form.Item
                label="Tên cơ sở y tế"
                name="name"
                rules={[
                  { required: true, message: "Vui lòng nhập tên cơ sở y tế!" },
                ]}
              >
                <Input
                  placeholder="Tên cơ sở y tế"
                  style={{ borderRadius: 6 }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Email"
                name="email"
                rules={[
                  { required: true, message: "Vui lòng nhập email!" },
                  { type: "email", message: "Email không hợp lệ!" },
                ]}
              >
                <Input
                  placeholder="Email"
                  type="email"
                  style={{ borderRadius: 6 }}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Form.Item
                label="Số điện thoại"
                name="phone"
                rules={[
                  { required: true, message: "Vui lòng nhập số điện thoại!" },
                  {
                    pattern: /^[0-9]{10}$/,
                    message: "Số điện thoại phải có 10 chữ số!",
                  },
                ]}
              >
                <Input
                  placeholder="Số điện thoại"
                  style={{ borderRadius: 6 }}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Địa chỉ"
                name="address"
                rules={[{ required: true, message: "Vui lòng nhập địa chỉ!" }]}
              >
                <Input
                  placeholder="Địa chỉ"
                  style={{ borderRadius: 6 }}
                  suffix={
                    <Button
                      type="link"
                      icon={<FaMagnifyingGlassLocation />}
                      onClick={handleGetCurrentLocation}
                      style={{ color: "#0165fc" }}
                    >
                      Lấy vị trí
                    </Button>
                  }
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Form.Item
                label="Kinh độ"
                name="longitude"
                rules={[{ required: true, message: "Vui lòng nhập kinh độ!" }]}
              >
                <Input
                  placeholder="Kinh độ"
                  style={{ borderRadius: 6 }}
                  disabled
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Vĩ độ"
                name="latitude"
                rules={[{ required: true, message: "Vui lòng nhập vĩ độ!" }]}
              >
                <Input
                  placeholder="Vĩ độ"
                  style={{ borderRadius: 6 }}
                  disabled
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Form.Item
                label="Ảnh đại diện"
                name="avatar"
                rules={[
                  {
                    validator: (_, value) =>
                      !initialValues?.avatar && (!value || value.length === 0)
                        ? Promise.reject("Vui lòng tải ảnh đại diện!")
                        : Promise.resolve(),
                  },
                ]}
              >
                <Upload
                  listType="picture-card"
                  maxCount={1}
                  // beforeUpload={() => false}
                  onChange={onChangeAvatar}
                  fileList={avatar}
                  accept=".jpg,.jpeg,.png"
                  beforeUpload={(file) => {
                    const isLt2M = file.size / 1024 / 1024 < 2;
                    if (!isLt2M) {
                      notification.error({
                        message: "Lỗi",
                        description: "Ảnh phải nhỏ hơn 2MB!",
                      });
                    }
                    return isLt2M;
                  }}
                >
                  {avatar.length < 1 && (
                    <div>
                      <UploadOutlined />
                      <div style={{ marginTop: 8 }}>Tải ảnh</div>
                    </div>
                  )}
                </Upload>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Ảnh bìa"
                name="banner"
                rules={[
                  {
                    validator: (_, value) =>
                      !initialValues?.banner && (!value || value.length === 0)
                        ? Promise.reject("Vui lòng tải ảnh bìa!")
                        : Promise.resolve(),
                  },
                ]}
              >
                <Upload
                  listType="picture-card"
                  maxCount={1}
                  // beforeUpload={() => false}
                  onChange={onChangeBanner}
                  fileList={banner}
                  accept=".jpg,.jpeg,.png"
                  beforeUpload={(file) => {
                    const isLt2M = file.size / 1024 / 1024 < 2;
                    if (!isLt2M) {
                      notification.error({
                        message: "Lỗi",
                        description: "Ảnh phải nhỏ hơn 2MB!",
                      });
                    }
                    return isLt2M;
                  }}
                >
                  {banner.length < 1 && (
                    <div>
                      <UploadOutlined />
                      <div style={{ marginTop: 8 }}>Tải ảnh</div>
                    </div>
                  )}
                </Upload>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            label="Mô tả"
            name="description"
            rules={[{ required: true, message: "Vui lòng nhập mô tả!" }]}
          >
            <CKEditor
              editor={ClassicEditor}
              data={description}
              onChange={(event, editor) => {
                const data = editor.getData();
                setDescription(data);
              }}
              config={{
                toolbar: [
                  "heading",
                  "|",
                  "bold",
                  "italic",
                  "link",
                  "bulletedList",
                  "numberedList",
                  "blockQuote",
                  "|",
                  "undo",
                  "redo",
                ],
                placeholder: "Nhập mô tả cơ sở y tế...",
              }}
            />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              icon={<CheckCircleOutlined />}
              style={{
                backgroundColor: "#0165fc",
                borderRadius: 6,
                padding: "0 20px",
              }}
            >
              Cập nhật
            </Button>
          </Form.Item>
        </Form>
      )}
    </Card>
  );
};

export default HospitalForm;
