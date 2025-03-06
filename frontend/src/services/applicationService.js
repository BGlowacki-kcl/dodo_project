import axios from "axios";

const api = axios.create({
  baseURL: "/api", /// CHECK IF HERE
});

function getAuthToken() {
  return sessionStorage.getItem("token");
}

api.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export async function getAllUserApplications() {
  const response = await api.get(`/application/all`);
  if (!response.data.success) {
    throw new Error(response.data.message || "Failed to fetch applications");
  }
  return response.data.data;
}

export async function getApplicationById(appId) {
  try{
    const response = await api.get(`/application/byId?id=${appId}`);
    if (!response.data.success) {
      throw new Error(response.data.message || "Failed to fetch application");
    }
    return response.data;
  } catch (error) {
    if(error.response.status && error.response.status === 403) {
      return {status: 403, message: "You are not authorized to view this application"};
    } 
    return {status: 500, message: "Failed to fetch application"};
  }
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
  const response = await api.delete(`/application/withdraw?id=${appId}`);
  if (!response.data.success) {
    throw new Error(response.data.message || "Failed to withdraw");
  }
  return response.data.message;
}

