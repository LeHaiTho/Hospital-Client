import React from "react";
import { Form, Input, Button, Checkbox, Flex, Alert } from "antd";
import { useNavigate, Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { handleNavigation } from "../../utils/navigation";
import {
  login,
  setError,
  clearError,
  setLoading,
} from "../../redux/slices/authSlice";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import NotificationComponent from "../../utils/NotificationComponent";
import axiosConfig from "../../apis/axiosConfig";
import axios from "axios";
import { Typography } from "antd";

const { Text } = Typography;

const Login = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isLoading, isError, message, user } = useSelector(
    (state) => state.auth
  );

  const onFinish = async (values) => {
    dispatch(setLoading(true));
    dispatch(clearError());
    try {
      const response = await axiosConfig.post("/auth/login", values);
      if (response?.temporaryToken) {
        localStorage.setItem("temporaryToken", response?.temporaryToken);
        navigate("/change-password-first-login");
        // } else if (response && response.user) {
      } else {
        dispatch(setLoading(true));
        dispatch(login(response));
        handleNavigation(response?.user?.role, navigate);
      }
    } catch (error) {
      console.log("error", error);
      dispatch(setError(error.response?.data?.message));
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        backgroundColor: "#f0f2f5",
      }}
    >
      <Form
        form={form}
        name="login"
        onFinish={onFinish}
        className="login-form"
        style={{
          maxWidth: "400px",
          width: "100%",
          padding: "2rem",
          background: "#ffffff",
          borderRadius: "8px",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
          animation: "fadeIn 0.5s ease-in-out",
        }}
      >
        <h2
          style={{
            textAlign: "center",
            marginBottom: "1.5rem",
            fontSize: "24px",
            color: "#333",
          }}
        >
          Đăng Nhập
        </h2>
        <Form.Item
          name="username"
          rules={[{ required: true, message: "Vui lòng nhập tài khoản !" }]}
        >
          <Input
            size="large"
            placeholder="Tài khoản"
            prefix={<UserOutlined />}
          />
        </Form.Item>
        <Form.Item
          name="password"
          rules={[{ required: true, message: "Vui lòng nhập mật khẩu !" }]}
        >
          <Input.Password
            size="large"
            prefix={<LockOutlined />}
            placeholder="Mật khẩu"
          />
        </Form.Item>
        <Form.Item>
          <Flex justify="space-between" align="center">
            <Form.Item valuePropName="checked" noStyle>
              <Checkbox>Remember me</Checkbox>
            </Form.Item>
            <Link to="/forgot-password">Quên mật khẩu</Link>
          </Flex>
        </Form.Item>
        {isError && <Text type="danger">{message}</Text>}
        <Form.Item>
          <Button
            htmlType="submit"
            type="primary"
            block
            loading={isLoading}
            size="large"
          >
            Đăng Nhập
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Login;
