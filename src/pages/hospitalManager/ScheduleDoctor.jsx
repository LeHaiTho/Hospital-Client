import React, { useState, useEffect } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import {
  Card,
  Checkbox,
  Select,
  Tooltip,
  DatePicker,
  Button,
  message,
  notification,
} from "antd";
import { PiWarningCircleLight } from "react-icons/pi";
import "./style.css";
import axiosConfig from "../../apis/axiosConfig";
import dayjs from "dayjs";
const { Option } = Select;
const { RangePicker } = DatePicker;
const localizer = momentLocalizer(moment);

const ScheduleDoctor = () => {
  const [events, setEvents] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [doctorList, setDoctorList] = useState([]);
  const [roomList, setRoomList] = useState([]);
  const [hospitalSchedule, setHospitalSchedule] = useState([]);

  const fetchDoctorList = async () => {
    try {
      const response = await axiosConfig.get("/doctors/name-list");
      setDoctorList(response.doctorList);
    } catch (error) {
      console.log(error);
    }
  };
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
  // console.log("hospitalSchedule", hospitalSchedule);
  // console.log("events", events);
  useEffect(() => {
    fetchHospitalSchedule();
  }, []);
  const fetchRoomList = async () => {
    try {
      const response = await axiosConfig.get("/rooms/list-room");
      setRoomList(response.rooms);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchDoctorList();
    fetchRoomList();
  }, []);
  console.log(roomList);

  // convert data from backend to data for calendar
  const convertScheduleData = (data) => {
    return data?.flatMap((day) =>
      day.timeSlots.map((timeSlot) => ({
        id: timeSlot.id,
        title: `${
          timeSlot.shift_type === "morning" ? "Ca sáng" : "Ca chiều"
        }, ${moment(timeSlot.start_time, "HH:mm").format("HH:mm")} - ${moment(
          timeSlot.end_time,
          "HH:mm"
        ).format("HH:mm")}`,
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

  const handleCheckboxChange = (eventId) => {
    setEvents((prevEvents) =>
      prevEvents.map((event) =>
        event.id === eventId
          ? { ...event, isSelected: !event.isSelected }
          : event
      )
    );
  };

  const handleRoomChange = (eventId, newRoom) => {
    setEvents((prevEvents) =>
      prevEvents.map((event) =>
        event.id === eventId ? { ...event, room: newRoom } : event
      )
    );
  };

  const handleSlotsChange = (eventId, newSlots) => {
    setEvents((prevEvents) =>
      prevEvents.map((event) =>
        event.id === eventId ? { ...event, slots: newSlots } : event
      )
    );
  };

  console.log("events", events);
  // format data to send to backend
  const formatDataToSend = () => {
    const groupedDates = groupDatesByDayOfWeek(); // Nhóm các ngày theo thứ trong tuần
    const selectedEvents = events.filter((event) => event.isSelected); // Lọc các sự kiện đã chọn
    const errorRoom = selectedEvents.some((event) => !event.room); // Kiểm tra nếu có sự kiện không có phòng

    if (errorRoom) {
      message.error("Vui lòng chọn phòng cho ca làm việc!");
      return;
    }

    const doctorId = selectedDoctor;
    const startDate = dateTimeRange[0];
    const endDate = dateTimeRange[dateTimeRange.length - 1];

    const schedules = []; // Mảng để lưu lịch làm việc

    selectedEvents.forEach((event) => {
      const dateOfWeek = dayjs(event.start).format("dddd"); // Ví dụ: Monday, Tuesday, ...
      const shiftType = event.title.includes("Ca sáng")
        ? "morning"
        : "afternoon"; // Xác định ca sáng/ca chiều
      const startTime = dayjs(event.start).format("HH:mm");
      const endTime = dayjs(event.end).format("HH:mm");

      // Tìm phần tử đã có trong schedules cho date_of_week
      let schedule = schedules.find(
        (schedule) => schedule.date_of_week === dateOfWeek
      );

      // Nếu chưa có, tạo mới phần tử cho date_of_week
      if (!schedule) {
        schedule = {
          date_of_week: dateOfWeek,
          time_slots: [],
        };
        schedules.push(schedule);
      }

      // Thêm thời gian ca vào time_slots
      schedule.time_slots.push({
        shift_type: shiftType,
        start: startTime,
        end: endTime,
        room: event.room,
      });
    });

    // Tạo dữ liệu gửi xuống server theo cấu trúc yêu cầu
    const finalSchedule = [];
    Object.keys(groupedDates).forEach((dayOfWeek) => {
      const scheduleForDay = schedules.find(
        (schedule) => schedule.date_of_week === dayOfWeek
      );

      if (scheduleForDay) {
        groupedDates[dayOfWeek].forEach((date) => {
          finalSchedule.push({
            date: date,
            date_of_week: dayOfWeek,
            time_slots: scheduleForDay.time_slots,
          });
        });
      }
    });

    // Sắp xếp lịch theo ngày tăng dần (date)
    finalSchedule.sort((a, b) =>
      dayjs(a.date).isBefore(dayjs(b.date)) ? -1 : 1
    );

    // Gửi dữ liệu theo định dạng yêu cầu
    const result = {
      schedules: finalSchedule,
      doctorId: doctorId,
      slotDuration: selectedTimeSlot, // Thời gian mỗi ca làm việc (ví dụ 30 phút)
      startDate: startDate,
      endDate: endDate,
    };

    return result;
  };

  // Tiến hành gọi API với `result` để lưu lịch làm việc
  const handleSaveSchedule = async () => {
    const result = formatDataToSend();
    try {
      const response = await axiosConfig.post(
        "doctor-schedules/create-schedule2",
        result
      );
      if (response) {
        notification.success({
          message: "Lưu lịch thành công!",
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Custom component cho từng sự kiện
  const CustomEvent = ({ event }) => {
    const eventStyle = {
      display: "flex",
      justifyContent: "space-between",
      flexDirection: "column",
      height: "100%",
      width: "100%",
      padding: "5px",
    };

    return (
      <div
        style={{
          color: event.isSelected ? "#0165ff" : "#000",
          fontWeight: event.isSelected ? "500" : "400",
        }}
      >
        {/* Header */}
        <div style={eventStyle}>{event.title}</div>

        {/* Nội dung */}
        <div style={eventStyle}>
          <Checkbox
            checked={event.isSelected}
            onChange={() => handleCheckboxChange(event.id)}
            size="small"
            style={{
              marginBottom: "5px",
              fontWeight: event.isSelected ? "500" : "400",
              color: event.isSelected ? "#0165ff" : "#000",
            }}
          >
            Chọn
          </Checkbox>
          <Select
            value={event.room}
            style={{
              width: 100,
              borderWidth: 1,
              backgroundColor: !event.isSelected ? "#cce0fe" : "",
            }}
            onChange={(value) => handleRoomChange(event.id, value)}
            size="small"
            disabled={!event.isSelected}
          >
            {roomList?.map((room) => (
              <Option value={room?.id} key={room?.id}>
                {room?.name}
              </Option>
            ))}
          </Select>
        </div>
      </div>
    );
  };
  const eventPropGetter = (event) => {
    return {
      style: {
        backgroundColor: "#cce0fe",
        color: event.isSelected ? "#0165ff" : "#000",
        borderRadius: "4px",
        padding: "4px",
        borderWidth: "2px",
        borderStyle: "solid",
        borderColor: "#0165ff",
        fontWeight: event.isSelected ? "bold" : "400",
        borderLeftWidth: event.isSelected ? 6 : 2,
        borderLeftColor: event.isSelected ? "#0165ff" : "#0165ff",
      },
    };
  };
  const [dateTimeRange, setDateTimeRange] = useState([]);
  const handleRangeChange = (dates, dateStrings) => {
    const start = dayjs(dates?.[0]);
    const end = dayjs(dates?.[1]);

    // lấy tất cả thời gian thuộc startDate và endDate
    const dateArray = [];
    let currentDate = start.clone();
    while (currentDate.isBefore(end) || currentDate.isSame(end, "day")) {
      dateArray.push(currentDate.clone());
      currentDate = currentDate.add(1, "days");
    }
    setDateTimeRange(dateArray?.map((date) => date.format("YYYY-MM-DD")));
  };

  // nhóm các ngày theo từng ngày trong tuần
  const groupDatesByDayOfWeek = () => {
    const groupedDates = {};
    dateTimeRange?.forEach((date) => {
      const dayOfWeek = dayjs(date).format("dddd");
      if (!groupedDates[dayOfWeek]) {
        groupedDates[dayOfWeek] = [];
      }
      groupedDates[dayOfWeek].push(date);
    });
    return groupedDates;
  };

  // {
  //   "date": "2024-12-12",
  //   "date_of_week": "Thursday",
  //   "time_slots": [
  //     {
  //       "shift_type": "morning",
  //       "start": "07:00",
  //       "end": "11:30"
  //     }
  // ]
  // gán date và time_slots cho từng ngày
  const assignDateAndTimeSlotsToDays = (groupedDates, doctorSchedule) => {
    const assignedSchedules = {};
  };
  console.log(groupDatesByDayOfWeek());
  console.log(dateTimeRange);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",

        gap: 10,
      }}
    >
      <h2 style={{ textAlign: "center", textTransform: "uppercase" }}>
        Lịch làm việc
      </h2>
      <div style={{ display: "flex", flexDirection: "row", gap: 20 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            <label
              style={{
                display: "flex",
                flexDirection: "row",
                gap: 5,
                fontWeight: "500",
              }}
            >
              Bác sĩ
              <PiWarningCircleLight style={{ color: "red" }} />
            </label>
            <Select
              style={{ borderWidth: 1 }}
              value={selectedDoctor}
              onChange={(value) => setSelectedDoctor(value)}
            >
              {doctorList?.map((doctor) => (
                <Option value={doctor?.id} key={doctor?.id}>
                  {doctor?.fullname}
                </Option>
              ))}
            </Select>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            <label
              style={{
                display: "flex",
                flexDirection: "row",
                gap: 5,
                fontWeight: "500",
              }}
            >
              Thời gian xếp lịch
              <PiWarningCircleLight style={{ color: "red" }} />
            </label>
            <RangePicker
              format="DD-MM-YYYY"
              onChange={handleRangeChange}
              placeholder={["Ngày bắt đầu", "Ngày kết thúc"]}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            <label
              style={{
                display: "flex",
                flexDirection: "row",
                gap: 5,
                fontWeight: "500",
              }}
            >
              Thời gian cuộc hẹn khám
              <PiWarningCircleLight style={{ color: "red" }} />
            </label>

            <Select
              style={{ borderWidth: 1 }}
              value={selectedTimeSlot}
              onChange={(value) => setSelectedTimeSlot(value)}
            >
              <Option value={30}>30 phút </Option>
              <Option value={45}>45 phút</Option>
              <Option value={60}>60 phút</Option>
            </Select>
          </div>
          <Button
            type="primary"
            style={{ display: "flex", width: "100%" }}
            onClick={handleSaveSchedule}
          >
            Lưu lịch
          </Button>
        </div>
        <div
          style={{
            height: "80vh",
            width: "100%",
            display: "flex",
            gap: 10,
            flexDirection: "column",
          }}
        >
          <Calendar
            localizer={localizer}
            defaultView="week"
            events={events}
            views={["week"]}
            startAccessor="start"
            endAccessor="end"
            style={{ height: "100%" }}
            min={new Date(2024, 10, 1, 7, 0)}
            max={new Date(2024, 10, 30, 21, 0)}
            toolbar={false}
            components={{
              event: CustomEvent, // Gắn custom event component
            }}
            defaultViewDate={new Date()}
            onSelectEvent={(event) => {
              console.log(event);
            }}
            eventPropGetter={eventPropGetter}
            formats={{
              dayFormat: (date, culture, localizer) =>
                localizer.format(date, "dddd"), // Hiển thị tên ngày bằng tiếng Việt
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default ScheduleDoctor;
