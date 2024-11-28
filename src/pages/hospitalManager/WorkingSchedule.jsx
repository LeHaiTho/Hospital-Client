import React from "react";
import { Card, Button, Col, Row, Table, TimePicker, Collapse } from "antd";
import { Checkbox } from "antd";
import { useState } from "react";
import moment from "moment";
import dayjs from "dayjs";
import axiosConfig from "../../apis/axiosConfig";
const { Panel } = Collapse;

const WorkingSchedule = () => {
  const [schedules, setSchedules] = useState({
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: [],
    Sunday: [],
  });

  const [copiedSchedules, setCopiedSchedules] = useState([]);

  const handleAddTimeSlot = (day) => {
    setSchedules((prev) => ({
      ...prev,
      [day]:
        prev[day].length < 3
          ? [...prev[day], { start: null, end: null }]
          : prev[day],
    }));
  };

  const handleTimeChange = (day, index, time, type) => {
    // duyệt qua các ca để tìm ca đang chỉnh sửa
    const newSchedules = schedules[day].map((slot, i) =>
      i === index ? { ...slot, [type]: time } : slot
    );
    setSchedules({ ...schedules, [day]: newSchedules });
  };

  const handleDeleteTimeSlot = (day, index) => {
    const newSchedules = schedules[day].filter((_, i) => i !== index);
    setSchedules((prev) => ({
      ...prev,
      [day]: newSchedules,
    }));
  };

  // Chức năng copy ca làm việc đầu tiên của một ngày
  const handleCopy = (day) => {
    if (schedules[day].length > 0) {
      setCopiedSchedules(schedules[day]); // Sao chép toàn bộ ca làm việc của ngày đó
      console.log(`Đã copy lịch của ${day}`);
    }
  };

  // Chức năng paste ca làm việc đã được copy vào một ngày khác
  const handlePaste = (day) => {
    if (copiedSchedules.length > 0) {
      setSchedules((prev) => ({
        ...prev,
        [day]: [...copiedSchedules], // Paste ca làm việc vào ngày hiện tại
      }));
      console.log(`Đã paste lịch vào ${day}`);
    }
  };

  const handleSaveSchedule = async () => {
    const working_day = { ...schedules };
    console.log(working_day);
    const res = await axiosConfig.post(
      "/working-days/create-working-day-for-hospital",
      { working_day }
    );
    console.log(res);
  };
  return (
    <div>
      <h3>Chuyên khoa</h3>
      <Row gutter={20}>
        <Col span={16}>
          <Card style={{ borderRadius: 0 }}>
            {Object.keys(schedules).map((day) => (
              <Collapse key={day}>
                <Panel header={day} key={day}>
                  <Button onClick={() => handleCopy(day)}>Copy</Button>
                  <Button onClick={() => handlePaste(day)}>Paste</Button>
                  {schedules[day].map((slot, index) => (
                    <div
                      key={index}
                      style={{
                        display: "flex",
                        gap: 10,
                      }}
                    >
                      {index === 0 && <p>Ca sáng:</p>}
                      {index === 1 && <p>Ca chiều:</p>}
                      {index === 2 && <p>Ca tối:</p>}
                      <div
                        style={{
                          display: "flex",
                          gap: 10,
                          flexDirection: "row",
                          alignItems: "center",
                        }}
                      >
                        <TimePicker
                          value={slot.start ? dayjs(slot.start, "HH:mm") : null}
                          format="HH:mm"
                          placeholder="Chọn thời gian"
                          onChange={(time) =>
                            handleTimeChange(day, index, time, "start")
                          }
                        />
                        <span>đến</span>
                        <TimePicker
                          value={slot.end ? dayjs(slot.end, "HH:mm") : null}
                          format="HH:mm"
                          placeholder="Chọn thời gian"
                          onChange={(time) =>
                            handleTimeChange(day, index, time, "end")
                          }
                        />
                      </div>
                      <Button onClick={() => handleDeleteTimeSlot(day, index)}>
                        Xóa
                      </Button>
                    </div>
                  ))}
                  <Button onClick={() => handleAddTimeSlot(day)}>
                    Thêm ca
                  </Button>
                </Panel>
              </Collapse>
            ))}
            <Button onClick={handleSaveSchedule}>Lưu</Button>
          </Card>
        </Col>
        <Col span={8}>
          <Card
            className="scroll-container"
            style={{
              maxHeight: "100vh",
              minHeight: "100%",
              borderRadius: 0,
              boxShadow: "0 1px 2px rgba(0, 0, 0, 0.2)",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: 20,
                alignItems: "center",
              }}
            >
              <h3>Thời gian làm việc</h3>
              Lich
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default WorkingSchedule;
