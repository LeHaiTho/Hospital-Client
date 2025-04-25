import React, { useState } from "react";
import { Form, Input, Button, notification, Space, Typography } from "antd";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { login } from "../../redux/slices/authSlice";
import { useDispatch } from "react-redux";
import { CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";

const { Text } = Typography;

const ChangePasswordFirstLogin = () => {
  const [loading, setLoading] = useState(false);
  const [passwordCriteria, setPasswordCriteria] = useState({
    hasUpperCase: false,
    hasNumber: false,
    hasSpecialChar: false,
    minLength: false,
  });
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [form] = Form.useForm();

  // Hàm kiểm tra các tiêu chí mật khẩu
  const validatePassword = (value) => {
    const hasUpperCase = /[A-Z]/.test(value);
    const hasNumber = /[0-9]/.test(value);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);
    const minLength = value.length >= 8;

    setPasswordCriteria({
      hasUpperCase,
      hasNumber,
      hasSpecialChar,
      minLength,
    });

    return hasUpperCase && hasNumber && hasSpecialChar && minLength;
  };

  // Hàm xử lý gửi form đổi mật khẩu
  const onFinish = async (values) => {
    const token = localStorage.getItem("temporaryToken");
    const decoded = jwtDecode(token);
    setLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:3000/auth/change-password-first-login",
        { ...values, username: decoded.username },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      localStorage.removeItem("temporaryToken");
      dispatch(login(response?.data));
      setLoading(false);
      notification.success({
        message: "Thành công",
        description: "Đổi mật khẩu thành công!",
        duration: 2,
      });
      navigate("/manager/hospital-info");
    } catch (error) {
      setLoading(false);
      if (error.response?.status === 401) {
        notification.error({
          message: "Lỗi",
          description:
            "Phiên đăng nhập của bạn đã hết hạn. Vui lòng đăng nhập lại",
        });
        localStorage.removeItem("temporaryToken");
        navigate("/login");
      } else {
        notification.error({
          message: "Lỗi",
          description: error.response?.data?.message || "Đã xảy ra lỗi!",
        });
      }
    }
  };

  // Hàm xử lý khi nhập mật khẩu
  const handlePasswordChange = (e) => {
    const value = e.target.value;
    validatePassword(value);
  };

  return (
    <div
      style={{
        maxWidth: 400,
        margin: "50px auto",
        padding: "20px",
        background: "#fff",
        borderRadius: "8px",
      }}
    >
      <h2 style={{ textAlign: "center" }}>Đổi Mật Khẩu Lần Đầu</h2>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{ remember: true }}
      >
        <Form.Item
          label="Mật khẩu mới"
          name="newPassword"
          hasFeedback
          rules={[
            { required: true, message: "Vui lòng nhập mật khẩu mới" },
            {
              validator: (_, value) => {
                if (!value) return Promise.reject();
                const isValid = validatePassword(value);
                if (isValid) {
                  return Promise.resolve();
                }
                return Promise.reject(
                  "Mật khẩu chưa đáp ứng các tiêu chí bên dưới"
                );
              },
            },
          ]}
          validateTrigger={["onChange", "onBlur"]}
        >
          <Input.Password
            placeholder="Nhập mật khẩu mới"
            onChange={handlePasswordChange}
          />
        </Form.Item>

        {/* Hiển thị danh sách tiêu chí mật khẩu */}
        <Space direction="vertical" style={{ marginBottom: "16px" }}>
          <Text>
            <span style={{ marginRight: "8px" }}>
              {passwordCriteria.minLength ? (
                <CheckCircleOutlined style={{ color: "#52c41a" }} />
              ) : (
                <CloseCircleOutlined style={{ color: "#ff4d4f" }} />
              )}
            </span>
            Ít nhất 8 ký tự
          </Text>
          <Text>
            <span style={{ marginRight: "8px" }}>
              {passwordCriteria.hasUpperCase ? (
                <CheckCircleOutlined style={{ color: "#52c41a" }} />
              ) : (
                <CloseCircleOutlined style={{ color: "#ff4d4f" }} />
              )}
            </span>
            Ít nhất 1 chữ hoa (A-Z)
          </Text>
          <Text>
            <span style={{ marginRight: "8px" }}>
              {passwordCriteria.hasNumber ? (
                <CheckCircleOutlined style={{ color: "#52c41a" }} />
              ) : (
                <CloseCircleOutlined style={{ color: "#ff4d4f" }} />
              )}
            </span>
            Ít nhất 1 số (0-9)
          </Text>
          <Text>
            <span style={{ marginRight: "8px" }}>
              {passwordCriteria.hasSpecialChar ? (
                <CheckCircleOutlined style={{ color: "#52c41a" }} />
              ) : (
                <CloseCircleOutlined style={{ color: "#ff4d4f" }} />
              )}
            </span>
            Ít nhất 1 ký tự đặc biệt (ví dụ: @, #, $)
          </Text>
        </Space>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            Đổi Mật Khẩu
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default ChangePasswordFirstLogin;
