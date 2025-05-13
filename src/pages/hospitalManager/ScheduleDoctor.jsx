import React, { useState, useEffect } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import {
  Select,
  Button,
  DatePicker,
  notification,
  Modal,
  Table,
  Empty,
  Spin,
  Tag,
} from "antd";
import "./style.css";
import axiosConfig from "../../apis/axiosConfig";
import dayjs from "dayjs";
import "moment/locale/vi";

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
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [doctorSchedules, setDoctorSchedules] = useState([]);
  const [loadingSchedules, setLoadingSchedules] = useState(false);

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

    // Nếu có bác sĩ được chọn, lấy lịch làm việc của bác sĩ đó
    if (selectedDoctor) {
      fetchDoctorSchedules(selectedDoctor);
    }
  }, [selectedDoctor]);

  const fetchDoctorSchedules = async (doctorId) => {
    try {
      setLoadingSchedules(true);
      const response = await axiosConfig.get(
        `/doctor-schedules/doctor/${doctorId}/get-all-schedules`
      );
      setDoctorSchedules(response.schedules || []);
    } catch (error) {
      console.log("Error fetching doctor schedules:", error);
      notification.error({
        message: "Không thể lấy lịch làm việc của bác sĩ",
        description: "Đã xảy ra lỗi khi tải lịch làm việc của bác sĩ.",
      });
      setDoctorSchedules([]);
    } finally {
      setLoadingSchedules(false);
    }
  };

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

    const schedules = {};
    selectedEvents.forEach((event) => {
      const dayOfWeek = moment(event.start).format("dddd");
      const startTime = moment(event.start).format("HH:mm:ss");
      const endTime = moment(event.end).format("HH:mm:ss");
      let shiftType;

      if (event.title.toLowerCase().includes("ca sáng")) {
        shiftType = "morning";
      } else if (event.title.toLowerCase().includes("ca chiều")) {
        shiftType = "afternoon";
      } else if (event.title.toLowerCase().includes("ca tối")) {
        shiftType = "evening";
      }

      // Lặp qua từng ngày trong nhóm ngày theo thứ
      groupedDates[dayOfWeek]?.forEach((date) => {
        if (!schedules[date]) {
          schedules[date] = {
            date_of_week: dayOfWeek,
            time_slots: [],
          };
        }

        // Thêm time slot vào ngày
        schedules[date].time_slots.push({
          shift_type: shiftType,
          start: startTime,
          end: endTime,
        });
      });
    });

    return {
      schedules,
      doctorId,
      slotDuration: selectedTimeSlot,
    };
  };

  const handleSaveSchedule = async () => {
    if (!selectedDoctor || !dateTimeRange.length || !selectedTimeSlot) {
      notification.error({
        message: "Thiếu thông tin",
        description:
          "Vui lòng chọn bác sĩ, khoảng thời gian và thời lượng cuộc hẹn",
      });
      return;
    }

    const selectedEvents = events.filter((event) => event.isSelected);
    if (selectedEvents.length === 0) {
      notification.error({
        message: "Chưa chọn ca làm việc",
        description: "Vui lòng chọn ít nhất một ca làm việc",
      });
      return;
    }

    setIsSaving(true);
    try {
      const dataToSend = formatDataToSend();
      const response = await axiosConfig.post(
        "/doctor-schedules/create-schedule",
        dataToSend
      );

      notification.success({
        message: "Thành công",
        description: response.message || "Đã tạo lịch làm việc thành công",
      });

      // Reset form
      setSelectedDoctor(null);
      setDateTimeRange([]);
      setSelectedTimeSlot(null);
      setEvents((prevEvents) =>
        prevEvents.map((event) => ({ ...event, isSelected: false }))
      );
    } catch (error) {
      console.log(error);
      notification.error({
        message: "Lỗi",
        description:
          error.response?.data?.message ||
          "Đã xảy ra lỗi khi tạo lịch làm việc",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRangeChange = (dates, dateStrings) => {
    if (!dates) {
      setDateTimeRange([]);
      return;
    }

    const startDate = moment(dateStrings[0], "DD-MM-YYYY");
    const endDate = moment(dateStrings[1], "DD-MM-YYYY");
    const dateRange = [];

    // Tạo mảng các ngày trong khoảng
    let currentDate = startDate.clone();
    while (currentDate.isSameOrBefore(endDate)) {
      dateRange.push(currentDate.format("YYYY-MM-DD"));
      currentDate.add(1, "days");
    }

    setDateTimeRange(dateRange);
  };

  const filterByDayOfWeek = (dates, dayOfWeek) => {
    return dates.filter((date) => {
      const day = moment(date).day();
      return day === dayOfWeek;
    });
  };

  const groupDatesByDayOfWeek = () => {
    const grouped = {
      Monday: [],
      Tuesday: [],
      Wednesday: [],
      Thursday: [],
      Friday: [],
      Saturday: [],
      Sunday: [],
    };

    dateTimeRange.forEach((date) => {
      const dayOfWeek = moment(date).format("dddd");
      grouped[dayOfWeek].push(date);
    });

    return grouped;
  };

  const CustomEvent = ({ event }) => {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: 5,
        }}
      >
        <input
          type="checkbox"
          checked={event.isSelected}
          onChange={() => handleCheckboxChange(event.id)}
          disabled={!selectedDoctor || !dateTimeRange.length}
        />
        <span>{event.title}</span>
      </div>
    );
  };

  const eventPropGetter = (event) => {
    let style = {
      backgroundColor: "#3174ad",
      borderRadius: "5px",
      opacity: 0.8,
      color: "white",
      border: "0px",
      display: "block",
    };

    if (event.isSelected) {
      style.backgroundColor = "#28a745";
      style.opacity = 1;
    }

    return {
      style,
    };
  };

  // Columns for doctor schedule modal
  const scheduleColumns = [
    {
      title: "Ngày",
      dataIndex: "date",
      key: "date",
      render: (text) => moment(text).format("DD/MM/YYYY"),
    },
    {
      title: "Thứ",
      dataIndex: "date_of_week",
      key: "date_of_week",
    },
    {
      title: "Ca làm việc",
      dataIndex: "shift_type",
      key: "shift_type",
      render: (text) => {
        let color = "blue";
        let label = "Ca sáng";

        if (text === "afternoon") {
          color = "green";
          label = "Ca chiều";
        } else if (text === "evening") {
          color = "purple";
          label = "Ca tối";
        }

        return <Tag color={color}>{label}</Tag>;
      },
    },
    {
      title: "Thời gian",
      key: "time",
      render: (_, record) => (
        <span>
          {moment(record.start_time, "HH:mm:ss").format("HH:mm")} -
          {moment(record.end_time, "HH:mm:ss").format("HH:mm")}
        </span>
      ),
    },
    {
      title: "Số lượng slot",
      dataIndex: "appointmentSlots",
      key: "appointmentSlots",
      render: (slots) => slots?.length || 0,
    },
    {
      title: "Đã đặt",
      dataIndex: "appointmentSlots",
      key: "bookedSlots",
      render: (slots) => slots?.filter((slot) => slot.isBooked)?.length || 0,
    },
  ];

  const showDoctorSchedules = () => {
    setIsModalVisible(true);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 10,
        backgroundColor: "#fff",
        padding: "20px",
        borderRadius: "10px",
      }}
    >
      <h2 style={{ textAlign: "center", textTransform: "uppercase" }}>
        Lịch làm việc của bác sĩ
      </h2>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          gap: 10,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 10,
            width: "20%",
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
            {selectedDoctor && (
              <Button
                type="link"
                onClick={showDoctorSchedules}
                style={{ marginTop: 5 }}
              >
                Xem lịch làm việc
              </Button>
            )}
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

      {/* Modal hiển thị lịch làm việc của bác sĩ */}
      <Modal
        title={`Lịch làm việc của bác sĩ ${
          doctorList.find((d) => d.id === selectedDoctor)?.fullname || ""
        }`}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        width={800}
        footer={[
          <Button key="close" onClick={() => setIsModalVisible(false)}>
            Đóng
          </Button>,
        ]}
      >
        {loadingSchedules ? (
          <div style={{ textAlign: "center", padding: "20px" }}>
            <Spin size="large" />
            <p>Đang tải lịch làm việc...</p>
          </div>
        ) : doctorSchedules.length > 0 ? (
          <Table
            dataSource={doctorSchedules}
            columns={scheduleColumns}
            rowKey="id"
            pagination={{ pageSize: 10 }}
          />
        ) : (
          <Empty
            description="Bác sĩ chưa có lịch làm việc"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        )}
      </Modal>
    </div>
  );
};

export default ScheduleDoctor;
