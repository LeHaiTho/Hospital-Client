import React, { useState, useEffect } from "react";
import {
  DatePicker,
  Select,
  Row,
  Col,
  Checkbox,
  Button,
  TimePicker,
} from "antd";
import moment from "moment";
import dayjs from "dayjs";
import axiosConfig from "../../apis/axiosConfig";

const { RangePicker } = DatePicker;
const { Option } = Select;
// Thiết lập Day.js sử dụng ngôn ngữ tiếng Việt
const SchedulePage = () => {
  const [doctorList, setDoctorList] = useState([]); // List of doctors
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedRange, setSelectedRange] = useState([null, null]);
  const [datesToShow, setDatesToShow] = useState([]);
  const [hospitalWorkingDays, setHospitalWorkingDays] = useState([]);
  const [slotDuration, setSlotDuration] = useState(null);
  const [selectedSchedules, setSelectedSchedules] = useState({});

  // Mock data for doctors (replace this with an actual API call to get doctors)
  const fetchDoctors = async () => {
    const response = await axiosConfig.get("/doctors/name-list");
    setDoctorList(response.doctorList);
  };

  const fetchHospitalWorkingDays = async () => {
    const response = await axiosConfig.get(
      "/working-days/get-hospital-working-days-time-slots"
    );
    setHospitalWorkingDays(response.workingDays);
  };
  console.log(hospitalWorkingDays);
  useEffect(() => {
    fetchDoctors();
    fetchHospitalWorkingDays();
  }, []);

  // Function to handle when the date range is selected
  const onDateChange = (dates) => {
    const start = dayjs(dates[0]);
    const end = dayjs(dates[1]);
    const daysArray = [];

    let currentDate = start.clone();
    while (currentDate.isBefore(end) || currentDate.isSame(end, "day")) {
      daysArray.push(currentDate.clone());
      currentDate = currentDate.add(1, "days");
    }
    setDatesToShow(daysArray.map((day) => day.format("YYYY-MM-DD")));
  };

  // nhóm các ngày theo từng ngày trong tuần
  const groupDatesByDayOfWeek = () => {
    const groupedDates = {};

    datesToShow.forEach((date) => {
      const dayOfWeek = dayjs(date).format("dddd");
      if (!groupedDates[dayOfWeek]) {
        groupedDates[dayOfWeek] = [];
      }
      groupedDates[dayOfWeek].push(date);
    });
    return groupedDates;
  };
  groupDatesByDayOfWeek();
  // gán thời gian cho từng ngày
  const assignedTimeSlotstoDays = (groupedDates, hospitalWorkingDays) => {
    const assignedSchedules = {};
    Object.keys(groupedDates).forEach((dayOfWeek) => {
      const hospitalDaySchedule = hospitalWorkingDays.find(
        (day) => day.date_of_week === dayOfWeek
      );
      if (hospitalDaySchedule) {
        groupedDates[dayOfWeek].forEach((date) => {
          assignedSchedules[date] = {
            date,
            date_of_week: dayOfWeek,
            time_slots: hospitalDaySchedule.timeSlots.map((slot) => ({
              shift_type: slot.shift_type,
              start: slot.start_time,
              end: slot.end_time,
            })),
          };
        });
      }
    });
    return assignedSchedules;
  };

  const assignedSchedules = assignedTimeSlotstoDays(
    groupDatesByDayOfWeek(),
    hospitalWorkingDays
  );
  console.log("assignedSchedules", assignedSchedules);

  const handleCheck = (e, date, slotIndex) => {
    // Kiểm tra xem checkbox có được check hay không
    if (e.target.checked) {
      setSelectedSchedules((prevSelectedSchedules) => {
        const newSchedule = assignedSchedules[date]; // Lấy lịch làm việc cho ngày hiện tại

        // Tạo đối tượng mới hoặc lấy đối tượng đã có cho ngày hiện tại
        const updatedSchedules = { ...prevSelectedSchedules };

        // Nếu ngày chưa có trong danh sách selectedSchedules, thêm mới
        if (!updatedSchedules[date]) {
          updatedSchedules[date] = {
            date: newSchedule.date,
            date_of_week: dayjs(date).format("dddd"), // Lưu tên ngày trong tuần
            time_slots: [],
          };
        }

        // Lấy ca làm việc từ vị trí slotIndex
        const selectedSlot = newSchedule.time_slots[slotIndex];

        // Thêm ca làm việc vào danh sách time_slots nếu chưa tồn tại
        updatedSchedules[date].time_slots.push({
          shift_type: selectedSlot.shift_type,
          start: selectedSlot.start,
          end: selectedSlot.end,
        });

        return updatedSchedules; // Trả về đối tượng selectedSchedules đã cập nhật
      });
    } else {
      // Xử lý trường hợp checkbox bị bỏ chọn (xóa slot nếu cần)
      setSelectedSchedules((prevSelectedSchedules) => {
        const updatedSchedules = { ...prevSelectedSchedules };

        // Nếu ngày có trong selectedSchedules, xóa ca làm việc tương ứng
        if (updatedSchedules[date]) {
          updatedSchedules[date].time_slots = updatedSchedules[
            date
          ].time_slots.filter(
            (slot, idx) => idx !== slotIndex // Bỏ ca làm việc tại vị trí slotIndex
          );

          // Nếu ngày không còn ca làm việc nào, xóa luôn ngày đó khỏi danh sách
          if (updatedSchedules[date].time_slots.length === 0) {
            delete updatedSchedules[date];
          }
        }

        return updatedSchedules; // Trả về đối tượng selectedSchedules đã cập nhật
      });
    }
  };
  console.log("selectedSchedules", selectedSchedules);

  const handleSaveSchedule = async () => {
    const values = {
      doctorId: selectedDoctor,
      slotDuration: parseInt(slotDuration),
      schedules: selectedSchedules,
    };
    console.log(values);
    const response = await axiosConfig.post(
      "doctor-schedules/create-schedule",
      values
    );
  };

  const renderColumns = () => {
    return datesToShow?.map((date, index) => {
      const assignedSchedule = assignedSchedules[date];

      return (
        <div
          key={index}
          style={{ padding: "10px", border: "1px solid #ccc", width: "100%" }}
        >
          <h4>{`${dayjs(date).format("DD/MM/YYYY")} - ${
            dayjs(date).format("dddd").charAt(0).toUpperCase() +
            dayjs(date).format("dddd").slice(1)
          }`}</h4>

          {assignedSchedule ? (
            assignedSchedule.time_slots?.map((slot, slotIndex) => (
              <div
                key={slotIndex}
                style={{
                  marginBottom: "10px",
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <Checkbox onChange={(e) => handleCheck(e, date, slotIndex)}>
                  {slot.shift_type === "morning"
                    ? "Ca sáng"
                    : slot.shift_type === "afternoon"
                    ? "Ca chiều"
                    : "Ca tối"}
                </Checkbox>
                <TimePicker
                  defaultValue={dayjs(slot.start, "HH:mm:ss")}
                  format="HH:mm"
                />
                <TimePicker
                  defaultValue={dayjs(slot.end, "HH:mm:ss")}
                  format="HH:mm"
                />
              </div>
            ))
          ) : (
            <p>No working hours available</p>
          )}
        </div>
      );
    });
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Doctor Shift Management</h2>

      {/* Left side: Doctor selection and date range */}
      <Row gutter={16}>
        <Col span={6}>
          <h3>Select Doctor</h3>
          <Select
            style={{ width: "100%" }}
            placeholder="Select a doctor"
            onChange={(value) => setSelectedDoctor(value)}
          >
            {doctorList?.map((doctor) => (
              <Option key={doctor.id} value={doctor.id}>
                {doctor.fullname}
              </Option>
            ))}
          </Select>

          <h3 style={{ marginTop: "20px" }}>Select Date Range</h3>
          <RangePicker style={{ width: "100%" }} onChange={onDateChange} />
          <h3 style={{ marginTop: "20px" }}>Select Slot Duration</h3>
          <Select
            style={{ width: "100%" }}
            onChange={(value) => setSlotDuration(value)}
          >
            <Option value="15">15 minutes</Option>
            <Option value="20">20 minutes</Option>
            <Option value="25">25 minutes</Option>
            <Option value="30">30 minutes</Option>
            <Option value="35">35 minutes</Option>
            <Option value="40">40 minutes</Option>
            <Option value="45">45 minutes</Option>
            <Option value="50">50 minutes</Option>
            <Option value="55">55 minutes</Option>
            <Option value="60">60 minutes</Option>
          </Select>
          <Button
            style={{ marginTop: "20px" }}
            type="primary"
            onClick={handleSaveSchedule}
          >
            Thêm lịch làm việc
          </Button>
        </Col>

        {/* Right side: Display the date columns */}
        <Col span={18}>
          <h3>Shift Schedule</h3>
          <Row gutter={16}>{renderColumns()}</Row>
        </Col>
      </Row>

      {/* Button to submit the shifts */}
      <div style={{ marginTop: "20px" }}>
        <Button type="primary" disabled={!selectedDoctor || !selectedRange[0]}>
          Save Shifts
        </Button>
      </div>
    </div>
  );
};

export default SchedulePage;
