import React from "react";
import { Form, Input, Button, message, Card } from "antd";
import HospitalForm from "../../features/hospital/components/HospitalForm";

const HospitalInfo = () => {
  return (
    <Card>
      <Card.Meta title="Hospital Info" />
      <HospitalForm />
    </Card>
  );
};

export default HospitalInfo;
