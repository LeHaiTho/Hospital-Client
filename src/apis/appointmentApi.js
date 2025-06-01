import axiosConfig from "./axiosConfig";

// Get appointments by doctor ID
export const getAppointmentsByDoctorId = async (params = {}) => {
  try {
    const response = await axiosConfig.get(
      "/appointments/get-appointments-by-doctor",
      {
        params: params, // Pass query parameters like page, limit, status, etc.
      }
    );
    return response;
  } catch (error) {
    throw error.response || error;
  }
};

// Get appointment by ID
export const getAppointmentById = async (appointmentId) => {
  try {
    const response = await axiosConfig.get(
      `/appointments/get-appointment-by-id/${appointmentId}`
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Update appointment status
export const updateAppointmentStatus = async (appointmentId, status) => {
  try {
    const response = await axiosConfig.patch(
      `/appointments/update-appointment-status/${appointmentId}`,
      { status }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Cancel appointment
export const cancelAppointment = async (appointmentId) => {
  try {
    const response = await axiosConfig.patch(
      `/appointments/cancel-appointment/${appointmentId}`
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get appointment by appointment code (for doctor to get patient info)
export const getAppointmentByCode = async (appointmentCode) => {
  try {
    const response = await axiosConfig.get(
      `/appointments/get-appointment-by-id-by-hospital/${appointmentCode}`
    );
    return response;
  } catch (error) {
    throw error.response || error;
  }
};
