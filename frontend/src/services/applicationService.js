import axios from "axios";

export async function getAllUserApplications(userId) {
  const response = await axios.get(`/api/application?applicant=${userId}`);
  if (!response.data.success) {
    throw new Error(response.data.message || "Failed to fetch applications");
  }
  return response.data.data;
}

export async function getApplicationById(appId) {
  const response = await axios.get(`/api/application/${appId}`);
  if (!response.data.success) {
    throw new Error(response.data.message || "Failed to fetch application");
  }
  return response.data.data; 
}

export async function applyToJob({ jobId, userId, coverLetter }) {
  const response = await axios.post("/api/application", {
    jobId,
    applicant: userId, 
    coverLetter
  });
  if (!response.data.success) {
    throw new Error(response.data.message || "Failed to apply");
  }
  return response.data.data; 
}

export async function withdrawApplication(appId) {
  const response = await axios.delete(`/api/application/${appId}`);
  if (!response.data.success) {
    throw new Error(response.data.message || "Failed to withdraw");
  }
  return response.data.message;
}

