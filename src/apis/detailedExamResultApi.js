import axiosConfig from "./axiosConfig";

// Create detailed exam result with file uploads
export const createDetailedExamResult = async (formData) => {
  try {
    const response = await axiosConfig.post(
      "/detailed-exam-results/create",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response;
  } catch (error) {
    throw error.response || error;
  }
};

// Get detailed exam result by appointment code
export const getDetailedExamResultByAppointmentCode = async (
  appointmentCode
) => {
  try {
    const response = await axiosConfig.get(
      `/detailed-exam-results/appointment/${appointmentCode}`
    );
    return response;
  } catch (error) {
    throw error.response || error;
  }
};

// Get all detailed exam results for a doctor
export const getDoctorDetailedExamResults = async (doctorId, params = {}) => {
  try {
    const response = await axiosConfig.get(
      `/detailed-exam-results/doctor/${doctorId}`,
      {
        params,
      }
    );
    return response;
  } catch (error) {
    throw error.response || error;
  }
};

// Update detailed exam result
export const updateDetailedExamResult = async (id, data) => {
  try {
    const response = await axiosConfig.put(
      `/detailed-exam-results/${id}`,
      data
    );
    return response;
  } catch (error) {
    throw error.response || error;
  }
};

// Delete detailed exam result
export const deleteDetailedExamResult = async (id) => {
  try {
    const response = await axiosConfig.delete(`/detailed-exam-results/${id}`);
    return response;
  } catch (error) {
    throw error.response || error;
  }
};

// Get patient exam history (optimized with ID-based search)
export const getPatientExamHistory = async (requestData) => {
  try {
    const response = await axiosConfig.post(
      "/detailed-exam-results/patient/history",
      requestData // Can contain { patientId, patientType } or { patientInfo }
    );
    return response;
  } catch (error) {
    throw error.response || error;
  }
};
