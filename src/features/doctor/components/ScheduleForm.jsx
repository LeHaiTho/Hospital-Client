import React, { useEffect } from "react";
import {
  Form,
  Select,
  TimePicker,
  DatePicker,
  Button,
  message,
  Col,
  Row,
} from "antd";
import moment from "moment";
import dayjs from "dayjs";
import { useState } from "react";
import axiosConfig from "../../../apis/axiosConfig";
const { RangePicker } = DatePicker;
const { Option } = Select;

const ScheduleForm = ({ doctors, onSubmit }) => {
  const [form] = Form.useForm();
  const [doctorList, setDoctorList] = useState(null);
  const [shiftTypes, setShiftTypes] = useState(null);
  useEffect(() => {
    const fetchDoctorList = async () => {
      const response = await axiosConfig.get("/doctors/name-list");
      setDoctorList(response.doctorList);
    };
    fetchDoctorList();
    const fetchShiftTypes = async () => {
      const response = await axiosConfig.get("/hospitals/shift");
      setShiftTypes(response.shiftTypes);
    };
    fetchShiftTypes();
  }, []);
  const handleSubmit = async (values) => {
    console.log(values);
    try {
      const response = await axiosConfig.post(
        "/doctor-schedules/create-schedule",
        values
      );
      console.log(response);
    } catch (error) {
      console.log(error);
      message.error(error.message);
    }
  };
  // const handleChangeDate = async (values) => {
  //   const startDate = moment(values[0]).format("YYYY-MM-DD");
  //   const endDate = moment(values[1]).format("YYYY-MM-DD");
  //   const dates = [startDate, endDate];
  //   const response = await axiosConfig.post(
  //     "/doctor-schedules/get-schedule",
  //     dates
  //   );
  //   console.log("response", response);
  // };
  return (
    <Form form={form} layout="vertical" onFinish={handleSubmit}>
      {/* Chọn bác sĩ */}
      <Form.Item
        name="doctor"
        label="Chọn bác sĩ"
        rules={[{ required: true, message: "Vui lòng chọn bác sĩ" }]}
      >
        <Select placeholder="Chọn bác sĩ">
          {doctorList?.map((doctor) => (
            <Option key={doctor.id} value={doctor.id}>
              {doctor.fullname}
            </Option>
          ))}
        </Select>
      </Form.Item>

      {/* Chọn khoảng thời gian */}

      <Form.Item
        name="days"
        label="Chọn khoảng thời gian"
        rules={[{ required: true }]}
      >
        <RangePicker
          picker="date"
          style={{ width: "100%" }}
          // onChange={handleChangeDate}
        />
      </Form.Item>
      <Form.Item
        name="shift"
        label="Chọn ca làm việc"
        rules={[{ required: true, message: "Vui lòng chọn ca làm việc" }]}
      >
        <Select mode="multiple" showSearch placeholder="Chọn ca làm việc">
          {shiftTypes?.morning && (
            <Select.Option value="morning" label="Sáng">
              {`Sáng (${dayjs(shiftTypes?.morning?.start, "HH:mm").format(
                "HH:mm"
              )} - ${dayjs(shiftTypes?.morning?.end, "HH:mm").format(
                "HH:mm"
              )})`}
            </Select.Option>
          )}
          {shiftTypes?.afternoon && (
            <Select.Option value="afternoon" label="Chiều">
              {`Chiều (${dayjs(shiftTypes?.afternoon.start, "HH:mm").format(
                "HH:mm"
              )} - ${dayjs(shiftTypes?.afternoon.end, "HH:mm").format(
                "HH:mm"
              )})`}
            </Select.Option>
          )}
          {shiftTypes?.evening &&
            shiftTypes.evening.start &&
            shiftTypes.evening.end && (
              <Select.Option value="evening" label="Tối">
                {`Tối (${dayjs(shiftTypes?.evening.start, "HH:mm").format(
                  "HH:mm"
                )} - ${dayjs(shiftTypes?.evening.end, "HH:mm").format(
                  "HH:mm"
                )})`}
              </Select.Option>
            )}
        </Select>
      </Form.Item>
      {/* Thời gian khám cách nhau bao nhiêu phút */}
      <Form.Item
        name="slot_duration"
        label="Thời gian khám cách nhau"
        rules={[{ required: true, message: "Vui lòng chọn thời gian khám" }]}
      >
        <Select placeholder="Chọn thời gian khám">
          <Option value={15}>15 phút</Option>
          <Option value={20}>20 phút</Option>
          <Option value={30}>30 phút</Option>
          <Option value={40}>40 phút</Option>
          <Option value={50}>50 phút</Option>
          <Option value={60}>60 phút</Option>
        </Select>
      </Form.Item>

      <Button type="primary" htmlType="submit">
        Lưu lịch
      </Button>
    </Form>
  );
};

export default ScheduleForm;
