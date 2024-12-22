import { FaEdit } from "react-icons/fa";
import { RiDeleteBinLine } from "react-icons/ri";
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
import "moment/locale/vi"; // Import Vietnamese locale for moment
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { AiFillFileExcel } from "react-icons/ai";
import { FileExcelOutlined, FilePdfOutlined } from "@ant-design/icons";

moment.locale("vi");
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
  const [openModal, setOpenModal] = useState(false);
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

  // Hàm xuất Excel
  const exportToExcel = () => {
    // Chuyển đổi dữ liệu sang định dạng Excel
    const data = events.map((event) => ({
      Ngày: moment(event.start).format("dddd"),
      "Giờ bắt đầu": moment(event.start).format("HH:mm"),
      "Giờ kết thúc": moment(event.end).format("HH:mm"),
    }));

    // Tạo worksheet
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Thời gian hoạt động");

    // Xuất file
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    // Lưu file
    const file = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(file, "ThoiGianHoatDong.xlsx");
  };
  const exportToPDF = () => {
    const doc = new jsPDF();

    // Thêm font hỗ trợ tiếng Việt (tùy chọn, có thể cần thêm font hỗ trợ nếu sử dụng các ký tự đặc biệt)
    doc.setFont("helvetica", "normal");

    // Tiêu đề PDF
    doc.setFontSize(18);
    doc.text("REPORT ", 14, 20);
    doc.setFontSize(12);
    doc.text(`export date: ${moment().format("DD/MM/YYYY")}`, 14, 30);

    // Dữ liệu bảng
    const tableData = events.map((event) => [
      moment(event.start).locale("vi").format("dddd, DD/MM/YYYY"), // Sử dụng locale "vi" cho tiếng Việt
      moment(event.start).format("HH:mm"),
      moment(event.end).format("HH:mm"),
    ]);

    // Cấu hình bảng
    doc.autoTable({
      // head: [["Day", "start", "end"]],
      body: tableData,
      startY: 40,
      theme: "grid",
      headStyles: {
        fillColor: [0, 123, 255], // Xanh dương nhạt
        textColor: [255, 255, 255], // Màu trắng
        fontSize: 12,
      },
      bodyStyles: {
        fontSize: 11,
      },
      columnStyles: {
        0: { cellWidth: 70 }, // Cột "Ngày"
        1: { cellWidth: 40 }, // Cột "Giờ bắt đầu"
        2: { cellWidth: 40 }, // Cột "Giờ kết thúc"
      },
      didDrawPage: function (data) {
        // Footer PDF
        const pageCount = doc.internal.getNumberOfPages();
        doc.setFontSize(10);
        doc.text(`Trang ${pageCount}`, 180, 290); // Hiển thị số trang ở góc dưới cùng bên phải
      },
    });

    // Lưu file PDF
    doc.save("ThoiGianHoatDong.pdf");
  };
  // Define a custom header component
  const CustomHeader = ({ label }) => (
    <div
      style={{
        backgroundColor: "blue",
        padding: "10px",
        textAlign: "center",
      }}
    >
      {label}
    </div>
  );
  return (
    <div
      style={{
        gap: 10,
        display: "flex",
        flexDirection: "column",
        paddingRight: 10,
        backgroundColor: "#fff",
        padding: "20px",
        borderRadius: "10px",
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
          // custom header calendar

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
            toolbar: CustomHeader,
          }}
        />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
          }}
        >
          <Button
            icon={<AiFillFileExcel size={20} color="green" />}
            type="primary"
            onClick={exportToExcel}
          >
            Xuất Excel
          </Button>
          <Button type="" onClick={exportToPDF}>
            Xuất PDF
          </Button>
          <Button type="text" onClick={() => setOpenModal(true)}>
            Lưu lịch
          </Button>
          <Button type="text" onClick={handleSaveSchedule}>
            Lưu lịch
          </Button>
        </div>
      </div>
      <Modal
        title="Thời gian hoạt động"
        open={openModal}
        onCancel={() => setOpenModal(false)}
      >
        <Table dataSource={events} columns={columns} size="small" />
        {/* button save file PDF, EXCEL */}
        <div style={{ marginTop: 16, textAlign: "right" }}>
          <Button
            type="primary"
            icon={<FileExcelOutlined />}
            style={{ marginRight: 8 }}
          >
            Save as Excel
          </Button>
          <Button type="primary" icon={<FilePdfOutlined />}>
            Save as PDF
          </Button>
        </div>
      </Modal>

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
const columns = [
  {
    title: "Ngày",
    dataIndex: "start",
    key: "start",
    align: "center",
    render: (start) => moment(start).format("dddd"),
  },
  {
    title: "Giờ bắt đầu",
    dataIndex: "start",
    key: "start",
    align: "center",
    render: (start) => moment(start).format("HH:mm"),
  },
  {
    title: "Giờ kết thúc",
    dataIndex: "end",
    key: "end",
    align: "center",
    render: (end) => moment(end).format("HH:mm"),
  },
  {
    title: "Hành động",
    key: "action",
    render: (_, record) => (
      <div
        style={{
          display: "flex",
          gap: 10,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <FaEdit style={{ cursor: "pointer" }} size={18} color="#000" />
        <RiDeleteBinLine style={{ cursor: "pointer" }} size={20} color="red" />
      </div>
    ),
  },
];
