// import React, { useState, useEffect } from "react";
// import { Table, Button, Modal, Form, Input, message } from "antd";
// import axios from "axios";
// import axiosConfig from "../../apis/axiosConfig";

// const RoomList = () => {
//   const [rooms, setRooms] = useState([]);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [form] = Form.useForm();

//   // Lấy danh sách phòng
//   const fetchRooms = async () => {
//     try {
//       const response = await axiosConfig.get("/hospitals/get");
//       setRooms(response.rooms);
//     } catch (err) {
//       console.log(err);
//     }
//   };
//   console.log(rooms);
//   // Gọi API khi component được render
//   useEffect(() => {
//     fetchRooms();
//   }, []);

//   // Hiển thị modal thêm phòng
//   const showModal = () => {
//     setIsModalOpen(true);
//   };

//   // Đóng modal
//   const handleCancel = () => {
//     setIsModalOpen(false);
//     form.resetFields();
//   };

//   // Xử lý thêm phòng
//   const handleAddRoom = async () => {
//     try {
//       const values = await form.validateFields();
//       const response = await axiosConfig.post("/hospitals/create", values);
//       message.success("Thêm phòng thành công!");
//       setIsModalOpen(false);
//       fetchRooms(); // Làm mới danh sách phòng sau khi thêm thành công
//     } catch (err) {
//       message.error("Thêm phòng thất bại!");
//     }
//   };

//   // Cấu hình cột cho bảng danh sách phòng
//   const columns = [
//     { title: "ID", dataIndex: "id", key: "id" },
//     { title: "Tên phòng", dataIndex: "name", key: "name" },
//     { title: "ID Bệnh viện", dataIndex: "hospital_id", key: "hospital_id" },
//     { title: "Ngày tạo", dataIndex: "createdAt", key: "createdAt" },
//     { title: "Cập nhật lần cuối", dataIndex: "updatedAt", key: "updatedAt" },
//   ];

//   return (
//     <div
//       style={{
//         backgroundColor: "#fff",
//         padding: 16,
//         borderRadius: 7,
//       }}
//     >
//       <h1>Quản lý phòng</h1>
//       <Button type="primary" onClick={showModal}>
//         Thêm phòng
//       </Button>

//       <Table
//         dataSource={rooms}
//         columns={columns}
//         rowKey="id"
//         style={{ marginTop: 20 }}
//       />

//       {/* Modal thêm phòng */}
//       <Modal
//         title="Thêm phòng"
//         open={isModalOpen}
//         onOk={handleAddRoom}
//         onCancel={handleCancel}
//       >
//         <Form form={form} layout="vertical">
//           <Form.Item
//             name="name"
//             label="Tên phòng"
//             rules={[{ required: true, message: "Vui lòng nhập tên phòng" }]}
//           >
//             <Input />
//           </Form.Item>
//         </Form>
//       </Modal>
//     </div>
//   );
// };

// export default RoomList;
