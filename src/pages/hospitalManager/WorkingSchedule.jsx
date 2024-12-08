// import React from "react";
// import { Card, Button, Col, Row, Table, TimePicker, Collapse } from "antd";
// import { Checkbox } from "antd";
// import { useState } from "react";
// import moment from "moment";
// import dayjs from "dayjs";
// import axiosConfig from "../../apis/axiosConfig";
// const { Panel } = Collapse;

// const WorkingSchedule = () => {
//   const [schedules, setSchedules] = useState({
//     Monday: [],
//     Tuesday: [],
//     Wednesday: [],
//     Thursday: [],
//     Friday: [],
//     Saturday: [],
//     Sunday: [],
//   });

//   const [copiedSchedules, setCopiedSchedules] = useState([]);

//   const handleAddTimeSlot = (day) => {
//     setSchedules((prev) => ({
//       ...prev,
//       [day]:
//         prev[day].length < 3
//           ? [...prev[day], { start: null, end: null }]
//           : prev[day],
//     }));
//   };

//   const handleTimeChange = (day, index, time, type) => {
//     // duyệt qua các ca để tìm ca đang chỉnh sửa
//     const newSchedules = schedules[day].map((slot, i) =>
//       i === index ? { ...slot, [type]: time } : slot
//     );
//     setSchedules({ ...schedules, [day]: newSchedules });
//   };

//   const handleDeleteTimeSlot = (day, index) => {
//     const newSchedules = schedules[day].filter((_, i) => i !== index);
//     setSchedules((prev) => ({
//       ...prev,
//       [day]: newSchedules,
//     }));
//   };

//   // Chức năng copy ca làm việc đầu tiên của một ngày
//   const handleCopy = (day) => {
//     if (schedules[day].length > 0) {
//       setCopiedSchedules(schedules[day]); // Sao chép toàn bộ ca làm việc của ngày đó
//       console.log(`Đã copy lịch của ${day}`);
//     }
//   };

//   // Chức năng paste ca làm việc đã được copy vào một ngày khác
//   const handlePaste = (day) => {
//     if (copiedSchedules.length > 0) {
//       setSchedules((prev) => ({
//         ...prev,
//         [day]: [...copiedSchedules], // Paste ca làm việc vào ngày hiện tại
//       }));
//       console.log(`Đã paste lịch vào ${day}`);
//     }
//   };

//   const handleSaveSchedule = async () => {
//     const working_day = { ...schedules };
//     console.log(working_day);
//     const res = await axiosConfig.post(
//       "/working-days/create-working-day-for-hospital",
//       { working_day }
//     );
//     console.log(res);
//   };
//   return (
//     <div>
//       <h3>Chuyên khoa</h3>
//       <Row gutter={20}>
//         <Col span={16}>
//           <Card style={{ borderRadius: 0 }}>
//             {Object.keys(schedules).map((day) => (
//               <Collapse key={day}>
//                 <Panel header={day} key={day}>
//                   <Button onClick={() => handleCopy(day)}>Copy</Button>
//                   <Button onClick={() => handlePaste(day)}>Paste</Button>
//                   {schedules[day].map((slot, index) => (
//                     <div
//                       key={index}
//                       style={{
//                         display: "flex",
//                         gap: 10,
//                       }}
//                     >
//                       {index === 0 && <p>Ca sáng:</p>}
//                       {index === 1 && <p>Ca chiều:</p>}
//                       {index === 2 && <p>Ca tối:</p>}
//                       <div
//                         style={{
//                           display: "flex",
//                           gap: 10,
//                           flexDirection: "row",
//                           alignItems: "center",
//                         }}
//                       >
//                         <TimePicker
//                           value={slot.start ? dayjs(slot.start, "HH:mm") : null}
//                           format="HH:mm"
//                           placeholder="Chọn thời gian"
//                           onChange={(time) =>
//                             handleTimeChange(day, index, time, "start")
//                           }
//                         />
//                         <span>đến</span>
//                         <TimePicker
//                           value={slot.end ? dayjs(slot.end, "HH:mm") : null}
//                           format="HH:mm"
//                           placeholder="Chọn thời gian"
//                           onChange={(time) =>
//                             handleTimeChange(day, index, time, "end")
//                           }
//                         />
//                       </div>
//                       <Button onClick={() => handleDeleteTimeSlot(day, index)}>
//                         Xóa
//                       </Button>
//                     </div>
//                   ))}
//                   <Button onClick={() => handleAddTimeSlot(day)}>
//                     Thêm ca
//                   </Button>
//                 </Panel>
//               </Collapse>
//             ))}
//             <Button onClick={handleSaveSchedule}>Lưu</Button>
//           </Card>
//         </Col>
//         <Col span={8}>
//           <Card
//             className="scroll-container"
//             style={{
//               maxHeight: "100vh",
//               minHeight: "100%",
//               borderRadius: 0,
//               boxShadow: "0 1px 2px rgba(0, 0, 0, 0.2)",
//             }}
//           >
//             <div
//               style={{
//                 display: "flex",
//                 flexDirection: "column",
//                 justifyContent: "space-between",
//                 gap: 20,
//                 alignItems: "center",
//               }}
//             >
//               <h3>Thời gian làm việc</h3>
//               Lich
//             </div>
//           </Card>
//         </Col>
//       </Row>
//     </div>
//   );
// };

// export default WorkingSchedule;

// import React, { useState } from "react";
// import { Calendar, Views, momentLocalizer } from "react-big-calendar";
// import moment from "moment";
// import "react-big-calendar/lib/css/react-big-calendar.css";
// import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop"; // Correct path for DnD
// import "react-big-calendar/lib/addons/dragAndDrop/styles.css"; // DnD styles
// import { Modal, Button } from "antd"; // Import Modal và Button từ Ant Design

// const localizer = momentLocalizer(moment);
// const DnDCalendar = withDragAndDrop(Calendar); // Wrap Calendar with drag-and-drop functionality

// const WorkingSchedule = () => {
//   const [events, setEvents] = useState([
//     {
//       id: 1,
//       title: "Ca sáng",
//       start: new Date(2024, 11, 4, 7, 0), // Ví dụ ngày giờ
//       end: new Date(2024, 11, 4, 11, 0),
//     },
//     {
//       id: 2,
//       title: "Ca chiều",
//       start: new Date(2024, 11, 5, 13, 0),
//       end: new Date(2024, 11, 5, 17, 0),
//     },
//   ]);

//   const [isModalVisible, setIsModalVisible] = useState(false);
//   const [eventToDelete, setEventToDelete] = useState(null); // Sự kiện cần xóa

//   // Xử lý sự kiện khi kéo thả
//   const onEventDrop = ({ event, start, end, allDay }) => {
//     const updatedEvents = events.map((existingEvent) =>
//       existingEvent.id === event.id
//         ? { ...existingEvent, start, end, allDay }
//         : existingEvent
//     );
//     setEvents(updatedEvents);
//   };

//   // Xử lý resize sự kiện
//   const onEventResize = ({ event, start, end }) => {
//     const updatedEvents = events.map((existingEvent) =>
//       existingEvent.id === event.id
//         ? { ...existingEvent, start, end }
//         : existingEvent
//     );
//     setEvents(updatedEvents);
//   };

//   // Xử lý khi tạo mới sự kiện bằng cách chọn vùng
//   const handleSelectSlot = ({ start, end }) => {
//     const newEvent = {
//       id: Math.random(), // Tạo ID ngẫu nhiên
//       title: "Sự kiện mới",
//       start,
//       end,
//       isNew: true, // Đánh dấu sự kiện là mới tạo
//     };
//     setEvents((prevEvents) => [...prevEvents, newEvent]); // Thêm sự kiện mới
//   };

//   // Xử lý xóa sự kiện sau khi xác nhận
//   const handleDeleteEvent = () => {
//     if (eventToDelete) {
//       const updatedEvents = events.filter(
//         (event) => event.id !== eventToDelete.id
//       );
//       setEvents(updatedEvents);
//       setEventToDelete(null); // Reset sự kiện cần xóa
//       setIsModalVisible(false); // Đóng modal
//     }
//   };

//   // Hiển thị Modal xác nhận khi nhấn nút "Xóa"
//   const showDeleteConfirm = (event) => {
//     setEventToDelete(event); // Lưu sự kiện cần xóa
//     setIsModalVisible(true); // Mở modal xác nhận
//   };

//   // Tùy chỉnh kiểu sự kiện
//   const eventPropGetter = (event) => {
//     if (event.isNew) {
//       return {
//         style: {
//           backgroundColor: "#ffcccc", // Màu nền cho sự kiện mới tạo
//         },
//       };
//     }
//     return {};
//   };

//   return (
//     <div>
//       <h2>Lịch hoạt động của bệnh viện</h2>
//       <DnDCalendar
//         localizer={localizer}
//         events={events}
//         defaultView={Views.WEEK}
//         selectable
//         resizable
//         onEventDrop={onEventDrop} // Xử lý kéo thả
//         onEventResize={onEventResize} // Xử lý thay đổi kích thước
//         onSelectSlot={handleSelectSlot} // Tạo mới sự kiện khi chọn vùng
//         eventPropGetter={eventPropGetter} // Tùy chỉnh kiểu sự kiện
//         style={{ height: 500 }}
//         step={30} // Thời gian trong 30 phút
//         timeslots={2} // 2 timeslot = 1 giờ
//       />

//       {/* Hiển thị danh sách sự kiện với nút xóa */}
//       <div>
//         {events.map((event) =>
//           event.isNew ? (
//             <div key={event.id} style={{ position: "relative", marginTop: 10 }}>
//               <span>{event.title}</span>
//               <button
//                 onClick={() => showDeleteConfirm(event)}
//                 style={{
//                   position: "absolute",
//                   top: 5,
//                   right: 5,
//                   color: "red",
//                   background: "transparent",
//                   border: "none",
//                   fontSize: "20px",
//                   cursor: "pointer",
//                 }}
//               >
//                 X
//               </button>
//             </div>
//           ) : null
//         )}
//       </div>

//       {/* Modal xác nhận xóa */}
//       <Modal
//         title="Xác nhận xóa"
//         visible={isModalVisible}
//         onOk={handleDeleteEvent} // Xóa sự kiện khi nhấn "OK"
//         onCancel={() => setIsModalVisible(false)} // Đóng modal khi nhấn "Cancel"
//         okText="Xóa"
//         cancelText="Hủy"
//       >
//         <p>Bạn có chắc chắn muốn xóa sự kiện này không?</p>
//       </Modal>
//     </div>
//   );
// };

// export default WorkingSchedule;

import React, { useState, useEffect } from "react";
import { Calendar, Views, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop"; // Correct path for DnD
import "react-big-calendar/lib/addons/dragAndDrop/styles.css"; // DnD styles
import { Modal, Button, Table, notification } from "antd"; // Import Modal, Button, and Table from Ant Design
import { CloseOutlined } from "@ant-design/icons"; // Icon Xóa từ Ant Design
import dayjs from "dayjs";
import axiosConfig from "../../apis/axiosConfig";

const localizer = momentLocalizer(moment);
const DnDCalendar = withDragAndDrop(Calendar); // Wrap Calendar with drag-and-drop functionality
// Dữ liệu mẫu
// const sampleData = {
//   Monday: [
//     { start: "07:00", end: "12:00", title: "Ca sáng" },
//     { start: "13:00", end: "17:30", title: "Ca chiều" },
//   ],
//   Wednesday: [{ start: "07:00", end: "12:00", title: "Ca sáng" }],
//   Friday: [{ start: "13:00", end: "17:30", title: "Ca chiều" }],
// };
const WorkingSchedule = () => {
  const [events, setEvents] = useState([]);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null); // Event to delete
  const [hospitalSchedule, setHospitalSchedule] = useState([]);

  // useEffect(() => {
  //   const currentWeekStart = dayjs().startOf("week"); // Ngày đầu tuần (Chủ Nhật)

  //   // Chuyển đổi dữ liệu mẫu thành các sự kiện
  //   const newEvents = Object.entries(sampleData).flatMap(([dayName, slots]) => {
  //     const dayIndex = [
  //       "Sunday",
  //       "Monday",
  //       "Tuesday",
  //       "Wednesday",
  //       "Thursday",
  //       "Friday",
  //       "Saturday",
  //     ].indexOf(dayName);
  //     const dayDate = currentWeekStart.add(dayIndex, "day"); // Tính ngày cụ thể trong tuần hiện tại

  //     return slots.map((slot) => {
  //       const startDateTime = dayDate
  //         .hour(Number(slot.start.split(":")[0]))
  //         .minute(Number(slot.start.split(":")[1]))
  //         .toDate();
  //       const endDateTime = dayDate
  //         .hour(Number(slot.end.split(":")[0]))
  //         .minute(Number(slot.end.split(":")[1]))
  //         .toDate();

  //       return {
  //         id: Math.random(), // Tạo ID ngẫu nhiên
  //         title: slot.title,
  //         start: startDateTime,
  //         end: endDateTime,
  //       };
  //     });
  //   });

  //   setEvents(newEvents); // Cập nhật state với sự kiện mới
  // }, []);

  // Handle drag-and-drop

  const fetchHospitalSchedule = async () => {
    try {
      const response = await axiosConfig.get(
        "/working-days/get-hospital-schedule-for-calendar"
      );
      setHospitalSchedule(response);
      setEvents(convertScheduleData(response));
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchHospitalSchedule();
  }, []);

  // convert data from backend to data for calendar
  const convertScheduleData = (data) => {
    return data?.flatMap((day) =>
      day.timeSlots.map((timeSlot) => ({
        id: timeSlot.id,
        title: `${timeSlot.shift_type === "morning" ? "Ca sáng" : "Ca chiều"}`,
        start: moment(
          `${day.date_of_week} ${timeSlot.start_time}`,
          "dddd HH:mm"
        ).toDate(),
        end: moment(
          `${day.date_of_week} ${timeSlot.end_time}`,
          "dddd HH:mm"
        ).toDate(),
      }))
    );
  };

  const onEventDrop = ({ event, start, end }) => {
    let newTitle = event.title;

    const morningStartLimit = new Date(
      start.getFullYear(),
      start.getMonth(),
      start.getDate(),
      7,
      0
    );
    const morningEndLimit = new Date(
      start.getFullYear(),
      start.getMonth(),
      start.getDate(),
      12,
      0
    );
    const afternoonStartLimit = new Date(
      start.getFullYear(),
      start.getMonth(),
      start.getDate(),
      12,
      0
    );
    const afternoonEndLimit = new Date(
      start.getFullYear(),
      start.getMonth(),
      start.getDate(),
      17,
      30
    );

    // Thay đổi title dựa trên khung giờ
    if (start >= morningStartLimit && end <= morningEndLimit) {
      newTitle = "Ca sáng";
    } else if (start >= afternoonStartLimit && end <= afternoonEndLimit) {
      newTitle = "Ca chiều";
    }

    const updatedEvents = events.map((existingEvent) =>
      existingEvent.id === event.id
        ? { ...existingEvent, start, end, title: newTitle }
        : existingEvent
    );
    setEvents(updatedEvents);
  };

  // const onEventDrop = ({ event, start, end, allDay }) => {
  //   const updatedEvents = events.map((existingEvent) =>
  //     existingEvent.id === event.id
  //       ? { ...existingEvent, start, end, allDay }
  //       : existingEvent
  //   );
  //   setEvents(updatedEvents);
  // };

  // Handle resize event
  const onEventResize = ({ event, start, end }) => {
    const isMorningShift = event.title === "Ca sáng";
    const isAfternoonShift = event.title === "Ca chiều";

    let adjustedStart = start;
    let adjustedEnd = end;

    // Giới hạn thời gian cho ca sáng
    if (isMorningShift) {
      const morningStartLimit = new Date(
        start.getFullYear(),
        start.getMonth(),
        start.getDate(),
        7,
        0
      );
      const morningEndLimit = new Date(
        start.getFullYear(),
        start.getMonth(),
        start.getDate(),
        12,
        0
      );

      adjustedStart = start < morningStartLimit ? morningStartLimit : start;
      adjustedEnd = end > morningEndLimit ? morningEndLimit : end;
    }

    // Giới hạn thời gian cho ca chiều
    if (isAfternoonShift) {
      const afternoonStartLimit = new Date(
        start.getFullYear(),
        start.getMonth(),
        start.getDate(),
        12,
        0
      );
      const afternoonEndLimit = new Date(
        start.getFullYear(),
        start.getMonth(),
        start.getDate(),
        17,
        30
      );

      adjustedStart = start < afternoonStartLimit ? afternoonStartLimit : start;
      adjustedEnd = end > afternoonEndLimit ? afternoonEndLimit : end;
    }

    // Cập nhật sự kiện với thời gian đã điều chỉnh
    const updatedEvents = events.map((existingEvent) =>
      existingEvent.id === event.id
        ? { ...existingEvent, start: adjustedStart, end: adjustedEnd }
        : existingEvent
    );
    setEvents(updatedEvents);
  };

  // Handle event creation when selecting a slot
  const handleSelectSlot = ({ start, end }) => {
    let title;

    const startHour = start.getHours();
    if (startHour >= 7 && startHour < 12) {
      title = `Ca sáng`;
    } else if (startHour >= 12 && startHour < 18) {
      title = "Ca chiều";
    }
    const newEvent = {
      id: Math.random(), // Generate random ID
      title,
      start,
      end,

      isNew: true, // Mark as new event
    };
    setEvents((prevEvents) => [...prevEvents, newEvent]); // Add new event
  };

  // Handle event deletion after confirmation
  const handleDeleteEvent = () => {
    if (eventToDelete) {
      const updatedEvents = events.filter(
        (event) => event.id !== eventToDelete.id
      );
      setEvents(updatedEvents);
      setEventToDelete(null); // Reset event to delete
      setIsModalVisible(false); // Close modal
    }
  };

  // Show confirmation modal for delete action
  const showDeleteConfirm = (event) => {
    setEventToDelete(event); // Save event to delete
    setIsModalVisible(true); // Open delete modal
  };
  const handleSaveSchedule = async () => {
    if (events.length > 0) {
      const dayOfWeek = [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ];

      // Tạo mảng chứa các ngày trong tuần
      const workingDays = dayOfWeek.reduce((acc, day) => {
        acc[day] = [];
        return acc;
      }, {});

      events.forEach((event) => {
        const day = dayjs(event.start).format("dddd");
        const start = dayjs(event.start).format("HH:mm");
        const end = dayjs(event.end).format("HH:mm");
        const title = event.title === "Ca sáng" ? "morning" : "afternoon";

        // Thêm thông tin start và end vào mảng của ngày tương ứng
        workingDays[day]?.push({ start, end, title });
      });

      try {
        const response = await axiosConfig.post(
          "/working-days/create-working-day-for-hospital",
          {
            working_day: workingDays,
          }
        );
        if (response) {
          notification.success({
            message: "Tạo lịch hoạt động thành công",
          });
        }
      } catch (error) {
        console.log(error);
      }
    }
  };
  // Customize event style
  const CustomEvent = ({ event, onDelete }) => {
    return (
      <div
        style={{
          position: "relative",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "4px 8px",
          color: "white",
          borderRadius: "4px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span>{event.title}</span>
          <CloseOutlined
            style={{
              cursor: "pointer",
              color: "#fff",
              fontSize: "12px",
              position: "absolute",
              top: "2px",
              right: "4px",
            }}
            onClick={(e) => {
              e.stopPropagation(); // Ngăn sự kiện click tràn vào card
              onDelete(event); // Gọi hàm xóa sự kiện
            }}
          />
        </div>
      </div>
    );
  };

  const eventPropGetter = (event) => {
    return {
      style: {
        backgroundColor: "#0165ff",
        color: "white",
        borderRadius: "4px",
        padding: "4px",
      },
    };
  };

  return (
    <div
      style={{
        gap: 10,
        display: "flex",
        flexDirection: "column",
        paddingRight: 10,
      }}
    >
      <h2 style={{ textAlign: "center", textTransform: "uppercase" }}>
        Lịch hoạt động của bệnh viện
      </h2>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          flexDirection: "row",
          gap: 10,
        }}
      >
        <DnDCalendar
          localizer={localizer}
          events={events}
          defaultView={Views.WEEK}
          selectable
          resizable
          onEventDrop={onEventDrop} // Handle drag-and-drop
          onEventResize={onEventResize} // Handle resize
          onSelectSlot={handleSelectSlot} // Create event on slot select
          eventPropGetter={eventPropGetter} // Customize event style
          style={{
            height: "80vh",
            display: "flex",
            width: "80%",
          }}
          formats={{
            dayFormat: (date, culture, localizer) =>
              localizer.format(date, "dddd"), // Hiển thị tên ngày bằng tiếng Việt
          }}
          step={30} // Slot time 30 minutes
          timeslots={2} // 2 timeslot = 1 hour
          min={new Date(0, 0, 0, 7, 0)} // Start time 7:00
          max={new Date(0, 0, 0, 21, 0)} // End time 23:00
          toolbar={false}
          header={false}
          components={{
            event: (props) => (
              <CustomEvent {...props} onDelete={showDeleteConfirm} />
            ),
          }}
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
          }}
        >
          <Button type="primary" onClick={handleSaveSchedule}>
            Lưu lịch
          </Button>
        </div>
      </div>

      {/* Delete confirmation modal */}
      <Modal
        title="Xác nhận xóa"
        open={isModalVisible}
        onOk={handleDeleteEvent} // Delete event on OK
        onCancel={() => setIsModalVisible(false)} // Close modal on Cancel
        okText="Xóa"
        cancelText="Hủy"
      >
        <p>Bạn có chắc chắn muốn xóa sự kiện này không?</p>
      </Modal>
    </div>
  );
};

export default WorkingSchedule;

// // Columns for the table to display event details
// const columns = [
//   {
//     title: "Tiêu đề",
//     dataIndex: "title",
//     key: "title",
//   },
//   {
//     title: "Giờ bắt đầu",
//     dataIndex: "start",
//     key: "start",
//     render: (start) => moment(start).format("HH:mm DD/MM/YYYY"),
//   },
//   {
//     title: "Giờ kết thúc",
//     dataIndex: "end",
//     key: "end",
//     render: (end) => moment(end).format("HH:mm DD/MM/YYYY"),
//   },
//   {
//     title: "Hành động",
//     key: "action",
//     render: (_, record) => (
//       <Button
//         onClick={() => showDeleteConfirm(record)}
//         style={{ color: "red", border: "none" }}
//       >
//         Xóa
//       </Button>
//     ),
//   },
// ];
