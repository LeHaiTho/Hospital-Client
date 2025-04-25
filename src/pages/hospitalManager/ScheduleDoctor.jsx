import React, { useState, useEffect } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Checkbox, Select, DatePicker, Button, notification } from "antd";
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
  const [hospitalSchedule, setHospitalSchedule] = useState([]);
  const [dateTimeRange, setDateTimeRange] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaveDisabled, setIsSaveDisabled] = useState(false);

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

  useEffect(() => {
    fetchDoctorList();
    fetchHospitalSchedule();
  }, []);

  useEffect(() => {
    setIsSaveDisabled(false);
    setDateTimeRange([]);
    setSelectedTimeSlot(null);
    setEvents((prevEvents) =>
      prevEvents.map((event) => ({ ...event, isSelected: false }))
    );
  }, [selectedDoctor]);

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

  const handleCheck = async (event) => {
    let shift;
    if (event.title?.toLowerCase().includes("ca sáng")) {
      shift = "morning";
    } else if (event.title?.toLowerCase().includes("ca chiều")) {
      shift = "afternoon";
    } else if (event.title?.toLowerCase().includes("ca tối")) {
      shift = "evening";
    }

    let dateNeedCheck = moment(event.start).format("dddd");
    const dayOfWeekMapping = {
      Sunday: 0,
      Monday: 1,
      Tuesday: 2,
      Wednesday: 3,
      Thursday: 4,
      Friday: 5,
      Saturday: 6,
    };

    const numberDate = dayOfWeekMapping[dateNeedCheck];
    const dayOfDate = filterByDayOfWeek(dateTimeRange, numberDate);

    try {
      const response = await axiosConfig.post("/doctor-schedules/check", {
        doctorId: selectedDoctor,
        shift,
        dayOfDate,
        numberDate,
      });
      if (response.schedule.length > 0) {
        notification.error({
          message:
            "Ca làm việc này đã được đăng ký cho bác sĩ! Vui lòng không chọn lại!",
        });
        handleCheckboxChange(event.id);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleSlotsChange = (eventId, newSlots) => {
    setEvents((prevEvents) =>
      prevEvents.map((event) =>
        event.id === eventId ? { ...event, slots: newSlots } : event
      )
    );
  };

  const formatDataToSend = () => {
    const groupedDates = groupDatesByDayOfWeek();
    const selectedEvents = events.filter((event) => event.isSelected);

    const doctorId = selectedDoctor;
    const startDate = dateTimeRange[0];
    const endDate = dateTimeRange[dateTimeRange.length - 1];

    const schedules = [];
    selectedEvents.forEach((event) => {
      const dateOfWeek = dayjs(event.start).format("dddd");
      const shiftType = event.title.includes("Ca sáng")
        ? "morning"
        : "afternoon";
      const startTime = dayjs(event.start).format("HH:mm");
      const endTime = dayjs(event.end).format("HH:mm");

      let schedule = schedules.find(
        (schedule) => schedule.date_of_week === dateOfWeek
      );

      if (!schedule) {
        schedule = {
          date_of_week: dateOfWeek,
          time_slots: [],
        };
        schedules.push(schedule);
      }

      schedule.time_slots.push({
        shift_type: shiftType,
        start: startTime,
        end: endTime,
      });
    });

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

    finalSchedule.sort((a, b) =>
      dayjs(a.date).isBefore(dayjs(b.date)) ? -1 : 1
    );

    const result = {
      schedules: finalSchedule,
      doctorId: doctorId,
      slotDuration: selectedTimeSlot,
      startDate: startDate,
      endDate: endDate,
    };

    return result;
  };

  const handleSaveSchedule = async () => {
    const result = formatDataToSend();
    if (!result) return;

    setIsSaving(true);
    try {
      const response = await axiosConfig.post(
        "doctor-schedules/create-schedule2",
        result
      );
      if (response) {
        notification.success({
          message: "Lưu lịch thành công!",
        });
        setIsSaveDisabled(true);
      }
    } catch (error) {
      console.log(error);
      notification.error({
        message: "Lưu lịch thất bại, vui lòng thử lại!",
      });
    } finally {
      setIsSaving(false);
    }
  };

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
        <div style={eventStyle}>{event.title}</div>
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
        borderStyle: "solid",
        borderColor: "#0165ff",
        fontWeight: event.isSelected ? "bold" : "400",
        borderLeftWidth: event.isSelected ? 6 : 2,
        borderLeftColor: event.isSelected ? "#0165ff" : "#0165ff",
      },
    };
  };

  const handleRangeChange = (dates, dateStrings) => {
    const start = dayjs(dates?.[0]);
    const end = dayjs(dates?.[1]);

    const dateArray = [];
    let currentDate = start.clone();
    while (currentDate.isBefore(end) || currentDate.isSame(end, "day")) {
      dateArray.push(currentDate.clone());
      currentDate = currentDate.add(1, "days");
    }
    setDateTimeRange(dateArray?.map((date) => date.format("YYYY-MM-DD")));
  };

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

  function filterByDayOfWeek(dates, dayOfWeek) {
    return dates.filter((date) => {
      const day = new Date(date).getDay();
      return day === dayOfWeek;
    });
  }

  return (
    <div
      style={{
        padding: 24,
        background: "#fff",
        minHeight: "100vh",
      }}
    >
      <h2 style={{ textAlign: "center", textTransform: "uppercase" }}>
        Lịch làm việc
      </h2>
      <div style={{ display: "flex", flexDirection: "row", gap: 20 }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 10,
            backgroundColor: "#fff",
            borderWidth: 1,
            borderColor: "#797979",
            borderStyle: "solid",
            padding: "20px",
            borderRadius: "10px",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            <label
              style={{
                display: "flex",
                flexDirection: "row",
                gap: 5,
                fontWeight: "500",
                color: "#000",
              }}
            >
              Bác sĩ
            </label>
            <Select
              style={{ borderWidth: 1, borderColor: "#fff" }}
              value={selectedDoctor}
              onChange={(value) => {
                setSelectedDoctor(value);
              }}
              size="large"
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
                color: "#000",
              }}
            >
              Thời gian xếp lịch
            </label>
            <RangePicker
              format="DD-MM-YYYY"
              onChange={handleRangeChange}
              placeholder={["Ngày bắt đầu", "Ngày kết thúc"]}
              style={{ borderWidth: 1 }}
              disabled={!selectedDoctor}
              size="large"
              value={
                dateTimeRange.length
                  ? [
                      dayjs(dateTimeRange[0], "YYYY-MM-DD"),
                      dayjs(
                        dateTimeRange[dateTimeRange.length - 1],
                        "YYYY-MM-DD"
                      ),
                    ]
                  : null
              }
            />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            <label
              style={{
                display: "flex",
                flexDirection: "row",
                gap: 5,
                fontWeight: "500",
                color: "#000",
              }}
            >
              Thời gian cuộc hẹn khám
            </label>
            <Select
              style={{ borderWidth: 1, borderColor: "#fff" }}
              value={selectedTimeSlot}
              onChange={(value) => setSelectedTimeSlot(value)}
              size="large"
              disabled={!selectedDoctor || !dateTimeRange?.length}
              placeholder="Chọn thời gian cuộc hẹn khám"
            >
              <Option value={30}>30 phút</Option>
              <Option value={45}>45 phút</Option>
              <Option value={60}>60 phút</Option>
            </Select>
          </div>
          <Button
            type="primary"
            style={{ display: "flex", width: "100%" }}
            onClick={handleSaveSchedule}
            disabled={
              isSaveDisabled ||
              isSaving ||
              !selectedDoctor ||
              !dateTimeRange?.length ||
              !selectedTimeSlot
            }
            loading={isSaving}
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
              event: CustomEvent,
            }}
            defaultViewDate={new Date()}
            onSelectEvent={(event) => {
              handleCheck(event);
            }}
            eventPropGetter={eventPropGetter}
            formats={{
              dayFormat: (date, culture, localizer) =>
                localizer.format(date, "dddd"),
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default ScheduleDoctor;
