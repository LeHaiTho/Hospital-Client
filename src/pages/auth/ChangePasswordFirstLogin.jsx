import React, { useState } from "react";
import { Form, Input, Button, notification } from "antd";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { login } from "../../redux/slices/authSlice";
import { useDispatch } from "react-redux";

const ChangePasswordFirstLogin = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
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
      console.log("response", response);
      localStorage.removeItem("temporaryToken");
      dispatch(login(response?.data));
      // Nếu đổi mật khẩu thành công
      setLoading(false);
      navigate("/manager/hospitals-info"); // Điều hướng về dashboard sau khi đổi mật khẩu thành công
    } catch (error) {
      setLoading(false);
      console.log("error", error);

      if (error.response.status === 401) {
        notification.error({
          message: "Lỗi",
          description:
            "Phiên đăng nhập của bạn đã hết hạn. Vui lòng đăng nhập lại",
        });
        localStorage.removeItem("temporaryToken");
        navigate("/login");
      }
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "50px auto" }}>
      <h2>Đổi Mật Khẩu Lần Đầu</h2>

      <Form
        layout="vertical"
        onFinish={onFinish}
        initialValues={{ remember: true }}
      >
        <Form.Item
          label="Mật khẩu mới"
          name="newPassword"
          rules={[
            { required: true, message: "Vui lòng nhập mật khẩu mới" },
            { min: 8, message: "Mật khẩu phải có ít nhất 8 ký tự" },
          ]}
        >
          <Input.Password placeholder="Nhập mật khẩu mới" />
        </Form.Item>

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
