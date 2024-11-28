import { notification } from "antd";

const NotificationComponent = (type, message, placement) => {
  return notification[type]({
    message,
    placement,
    duration: 2.5,
  });
};

export default NotificationComponent;
