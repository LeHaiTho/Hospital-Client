import {
  Form,
  Input,
  Upload,
  Button,
  Row,
  Col,
  TimePicker,
  message,
  Spin,
  notification,
  Card,
  Typography,
} from "antd";
import { useEffect, useState } from "react";
import { UploadOutlined } from "@ant-design/icons";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import axiosInstance from "../../../apis/axiosConfig";
import axios from "axios";
import dayjs from "dayjs";
import "../../../index.css";
import "../../../pages/hospitalManager/style.css";
import { FaMagnifyingGlassLocation } from "react-icons/fa6";

import moment from "moment";

const HERE_API_KEY = "te9pF-AZqdY4Dez0jND9_-Eh_Xpe7DWthoixEhgtmeE";
const HospitalForm = () => {
  const [form] = Form.useForm();
  const [description, setDescription] = useState("");
  const [initialValues, setInitialValues] = useState(null);
  const [avatar, setAvatar] = useState(null);
  const [banner, setBanner] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [address, setAddress] = useState(""); // Thêm state để lưu địa chỉ

  console.log("address", latitude, longitude);

  const format = "HH:mm";

  // get hospital info
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
        };
        form.setFieldsValue(hospital);
        setInitialValues({
          ...hospital,
          description: res.hospital.description,
          avatar: res.hospital.avatar,
          banner: res.hospital.banner,
        });
        setDescription(res.hospital.description || "");
        if (res.hospital.avatar) {
          setAvatar([
            {
              uid: "-1",
              name: "image.png",
              status: "done",
              url: `http://localhost:3000${res.hospital.avatar}`,
            },
          ]);
        }
        if (res.hospital.banner) {
          setBanner([
            {
              uid: "-1",
              name: res.hospital.banner.split("/").pop(),
              status: "done",
              url: `http://localhost:3000${res.hospital.banner}`,
            },
          ]);
        }
        setIsLoading(false);
        console.log(res.hospital);
      } catch (error) {
        console.log(error);
      }
    };
    fetchData();
  }, [form]);

  console.log("initialValues", initialValues);

  // Hàm reverse geocoding để lấy địa chỉ từ tọa độ
  const fetchAddressFromCoordinates = async (latitude, longitude) => {
    try {
      const res = await fetch(
        `https://revgeocode.search.hereapi.com/v1/revgeocode?at=${latitude},${longitude}&lang=vi-VN&apiKey=${HERE_API_KEY}`
      );
      const data = await res.json();
      console.log(data);
      if (data.items && data.items.length > 0) {
        const location = data.items[0];
        setAddress(location.address.label); // Đặt địa chỉ vào state
        form.setFieldsValue({
          address: location.address.label, // Cập nhật giá trị vào ô Input
        });
      }
    } catch (error) {
      console.log("Error fetching address:", error);
    }
  };

  // Hàm lấy vị trí hiện tại
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
          fetchAddressFromCoordinates(latitude, longitude); // Gọi hàm reverse geocoding
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

  const handleFinish = async (values) => {
    const formData = new FormData();
    formData.append("name", values.name || initialValues.name);
    formData.append("email", values.email || initialValues.email);
    formData.append("phone", values.phone || initialValues.phone);
    formData.append(
      "address",
      address || values.address || initialValues.address
    );
    formData.append("description", description || initialValues.description);
    formData.append("latitude", latitude || initialValues.latitude || "");
    formData.append("longitude", longitude || initialValues.longitude || "");

    if (avatar && avatar[0] && avatar[0].originFileObj) {
      formData.append("avatar", avatar[0].originFileObj);
    } else {
      formData.append("avatar", initialValues.avatar);
    }
    if (banner && banner[0] && banner[0].originFileObj) {
      formData.append("banner", banner[0].originFileObj);
    } else {
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
      console.log("res", res);

      setIsLoading(false);
      notification.success({
        message: "Thành công!",
        description:
          "Bệnh viện đã được cập nhật thành công!, hãy tiến hành các thông tin tiếp theo dể hoàn thành quá trình đăng ký!",
      });
    } catch (error) {
      console.log(error);
    }
  };
  const onChangeAvatar = (value) => {
    setAvatar(value.fileList);
  };

  const onChangeBanner = (value) => {
    setBanner(value.fileList);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      {isLoading ? (
        <Spin />
      ) : (
        <Form form={form} layout="vertical" onFinish={handleFinish}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Tên cơ sở y tế"
                name="name"
                rules={[
                  { required: true, message: "Vui lòng nhập tên cơ sở y tế!" },
                ]}
              >
                <Input placeholder="Tên cơ sở y tế" />
              </Form.Item>
            </Col>
            <Col style={{ display: "flex", flexDirection: "row", gap: "10px" }}>
              <Col span={12}>
                <Form.Item
                  label="Ảnh đại diện"
                  name="avatar"
                  rules={[
                    {
                      required: !initialValues?.avatar,
                      message: "Vui lòng tải ảnh đại diện!",
                    },
                  ]}
                >
                  <Upload
                    listType="text"
                    maxCount={1}
                    beforeUpload={() => false}
                    onChange={onChangeAvatar}
                    fileList={avatar}
                    accept=".jpg, .jpeg, .png"
                  >
                    <Button icon={<UploadOutlined />}>Tải ảnh</Button>
                  </Upload>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Ảnh bìa"
                  name="banner"
                  rules={[
                    {
                      required: !initialValues?.banner,
                      message: "Vui lòng tải ảnh bìa!",
                    },
                  ]}
                >
                  <Upload
                    listType="text"
                    maxCount={1}
                    beforeUpload={() => false}
                    onChange={onChangeBanner}
                    fileList={banner}
                    accept=".jpg, .jpeg, .png"
                  >
                    <Button icon={<UploadOutlined />}>Tải ảnh</Button>
                  </Upload>
                </Form.Item>
              </Col>
            </Col>
          </Row>

          <div
            style={{
              display: "flex",
              flexDirection: "row",
              gap: "10px",
              alignItems: "center",
              width: "100%",
            }}
          >
            <Form.Item
              label="Địa chỉ"
              name="address"
              rules={[{ required: true, message: "Vui lòng nhập địa chỉ!" }]}
              style={{ width: "70%" }}
            >
              <Input placeholder="Địa chỉ" />
            </Form.Item>

            <div
              style={{
                display: "flex",
                flexDirection: "row",
                gap: "10px",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#0165fc",
                padding: 5,
                borderRadius: "5px",
              }}
            >
              <FaMagnifyingGlassLocation size={20} color="#fff" />
              <Typography.Link
                style={{
                  color: "#fff",
                  fontStyle: "italic",
                  cursor: "pointer",
                }}
                onClick={handleGetCurrentLocation}
              >
                Lấy vị trí hiện tại
              </Typography.Link>
            </div>
          </div>

          {/* <Col span={8}>
              <Form.Item
                label="Email"
                name="email"
                rules={[{ required: true, message: "Vui lòng nhập email!" }]}
              >
                <Input placeholder="Email" type="email" />
              </Form.Item>
            </Col> */}

          <Form.Item
            label="Mô tả"
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
                  "imageUpload",
                  "bulletedList",
                  "numberedList",
                  "blockQuote",
                  "|",
                  "undo",
                  "redo",
                ],
                maxHeight: 100,
              }}
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              Cập nhật
            </Button>
          </Form.Item>
        </Form>
      )}
    </div>
  );
};

export default HospitalForm;

// import {
//   Form,
//   Input,
//   Upload,
//   Button,
//   Row,
//   Col,
//   notification,
//   Spin,
//   message,
// } from "antd";
// import { useEffect, useState } from "react";
// import { UploadOutlined } from "@ant-design/icons";
// import { CKEditor } from "@ckeditor/ckeditor5-react";
// import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
// import axiosInstance from "../../../apis/axiosConfig";
// import dayjs from "dayjs";
// import "../../../index.css";

// // Thay thế YOUR_HERE_API_KEY bằng API Key từ HERE Maps

// const HospitalForm = () => {
//   const [form] = Form.useForm();
//   const [description, setDescription] = useState("");
//   const [initialValues, setInitialValues] = useState(null);
//   const [avatar, setAvatar] = useState(null);
//   const [banner, setBanner] = useState(null);
//   const [isLoading, setIsLoading] = useState(false);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         setIsLoading(true);
//         const res = await axiosInstance.get("/hospitals");
//         const hospital = {
//           name: res.hospital.name,
//           email: res.hospital.email,
//           phone: res.hospital.phone,
//           address: res.hospital.address,
//         };
//         form.setFieldsValue(hospital);
//         setInitialValues({
//           ...hospital,
//           description: res.hospital.description,
//           avatar: res.hospital.avatar,
//           banner: res.hospital.banner,
//         });
//         setDescription(res.hospital.description || "");
//         setIsLoading(false);
//       } catch (error) {
//         console.log(error);
//       }
//     };
//     fetchData();
//   }, [form]);

// const handleGetCurrentLocation = () => {
//   if (navigator.geolocation) {
//     navigator.geolocation.getCurrentPosition(
//       (position) => {
//         const { latitude, longitude } = position.coords;
//         setLatitude(latitude);
//         setLongitude(longitude);
//         form.setFieldsValue({
//           latitude: latitude.toString(),
//           longitude: longitude.toString(),
//         });
//         fetchAddressFromCoordinates(latitude, longitude); // Gọi hàm reverse geocoding
//         notification.success({
//           message: "Lấy vị trí thành công!",
//           description: `Latitude: ${latitude}, Longitude: ${longitude}`,
//         });
//       },
//       (error) => {
//         switch (error.code) {
//           case error.PERMISSION_DENIED:
//             notification.error({
//               message: "Quyền truy cập vị trí bị từ chối",
//               description:
//                 "Vui lòng cấp quyền truy cập vị trí trong cài đặt trình duyệt.",
//             });
//             break;
//           case error.POSITION_UNAVAILABLE:
//             notification.error({
//               message: "Vị trí không khả dụng",
//               description: "Không thể lấy vị trí hiện tại. Vui lòng thử lại.",
//             });
//             break;
//           case error.TIMEOUT:
//             notification.error({
//               message: "Thời gian lấy vị trí hết hạn",
//               description: "Vui lòng thử lại.",
//             });
//             break;
//           case error.UNKNOWN_ERROR:
//             notification.error({
//               message: "Lỗi không xác định",
//               description: "Đã xảy ra lỗi khi cố gắng lấy vị trí.",
//             });
//             break;
//           default:
//             notification.error({
//               message: "Lỗi",
//               description: "Đã xảy ra lỗi khi cố gắng lấy vị trí.",
//             });
//         }
//       }
//     );
//   } else {
//     notification.error({
//       message: "Trình duyệt không hỗ trợ Geolocation",
//       description: "Vui lòng sử dụng trình duyệt khác.",
//     });
//   }
// };

//   const handleFinish = async (values) => {
//     const formData = new FormData();
//     formData.append("name", values.name);
//     formData.append("email", values.email);
//     formData.append("phone", values.phone);
//     formData.append("address", address || values.address); // Lấy địa chỉ từ state nếu có
//     formData.append("description", description);
//     formData.append("latitude", latitude);
//     formData.append("longitude", longitude);

//     if (avatar && avatar[0] && avatar[0].originFileObj) {
//       formData.append("avatar", avatar[0].originFileObj);
//     }
//     if (banner && banner[0] && banner[0].originFileObj) {
//       formData.append("banner", banner[0].originFileObj);
//     }

//     try {
//       setIsLoading(true);
//       const res = await axios.put(
//         "http://localhost:3000/hospitals/update",
//         formData,
//         {
//           headers: {
//             "Content-Type": "multipart/form-data",
//             Authorization: `Bearer ${localStorage.getItem("token")}`,
//           },
//         }
//       );
//       setIsLoading(false);
//       notification.success({
//         message: "Thành công!",
//         description: "Bệnh viện đã được cập nhật thành công!",
//       });
//     } catch (error) {
//       console.log(error);
//     }
//   };

//   return (
//     <>
//       {isLoading ? (
//         <Spin />
//       ) : (
//         <Form form={form} layout="vertical" onFinish={handleFinish}>
//           <Row gutter={16}>
//             <Col span={12}>
//               <Form.Item
//                 label="Tên bệnh viện"
//                 name="name"
//                 rules={[
//                   { required: true, message: "Vui lòng nhập tên bệnh viện!" },
//                 ]}
//               >
//                 <Input placeholder="Tên bệnh viện" />
//               </Form.Item>
//             </Col>
//             <Col span={12}>
//               <Form.Item
//                 label="Email"
//                 name="email"
//                 rules={[{ required: true, message: "Vui lòng nhập email!" }]}
//               >
//                 <Input placeholder="Email" type="email" />
//               </Form.Item>
//             </Col>
//           </Row>
//           <Row>
//             <Col span={24}>
//               <Form.Item
//                 label="Địa chỉ"
//                 name="address"
//                 rules={[{ required: true, message: "Vui lòng nhập địa chỉ!" }]}
//               >
//                 <Input placeholder="Địa chỉ" value={address} />
//               </Form.Item>
//             </Col>
//           </Row>
//           <Row gutter={16}>
//             <Col span={12}>
//               <Form.Item
//                 label="Vĩ độ"
//                 name="latitude"
//                 rules={[{ required: true, message: "Vui lòng lấy vị trí!" }]}
//               >
//                 <Input placeholder="Latitude" value={latitude} readOnly />
//               </Form.Item>
//             </Col>
//             <Col span={12}>
//               <Form.Item
//                 label="Kinh độ"
//                 name="longitude"
//                 rules={[{ required: true, message: "Vui lòng lấy vị trí!" }]}
//               >
//                 <Input placeholder="Longitude" value={longitude} readOnly />
//               </Form.Item>
//             </Col>
//           </Row>
//           <Button type="dashed" onClick={handleGetCurrentLocation}>
//             Lấy vị trí hiện tại
//           </Button>

//           <Form.Item>
//             <Button type="primary" htmlType="submit">
//               Cập nhật
//             </Button>
//           </Form.Item>
//         </Form>
//       )}
//     </>
//   );
// };

// export default HospitalForm;
