import React from "react";
import { Calendar } from "antd";
import moment from "moment";
import "../../../index.css";

const ScheduleCalendar = ({ schedules }) => {
  const dateCellRender = (value) => {
    const formattedDate = value.format("YYYY-MM-DD");
    const schedule = schedules[formattedDate];

    if (schedule) {
      return (
        <div>
          {schedule.morning && (
            <div>
              <strong>Sáng:</strong>
              {schedule.morning[0]} - {schedule.morning[1]}
            </div>
          )}
          {schedule.afternoon && (
            <div>
              <strong>Chiều:</strong>
              {schedule.afternoon[0]} - {schedule.afternoon[1]}
            </div>
          )}
          {schedule.evening && (
            <div>
              <strong>Tối:</strong>
              {schedule.evening[0]} - {schedule.evening[1]}
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <Calendar
      style={{
        padding: 16,
        overflowX: "auto",
        overflowY: "auto",
        whiteSpace: "-moz-pre-wrap",
      }}
      cellRender={dateCellRender}
    />
  );
};

export default ScheduleCalendar;
