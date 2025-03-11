import axios from "axios";
import { checkTokenExpiration } from "./auth.service.js";

const api = axios.create({
  baseURL: "/api",
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

// Retrieve a user's entire shortlist
export async function getShortlist(userId) {
  const response = await api.get(`/shortlist/${userId}`);
  checkTokenExpiration(response);
  return response.data;
}

// Add a job to a user's shortlist
export async function addJobToShortlist(userId, jobId) {
  const response = await api.post(`/shortlist/${userId}`, { jobId });
  checkTokenExpiration(response);
  return response.data;
}

// Remove a job from the user's shortlist
export async function removeJobFromShortlist(userId, jobId) {
  const response = await api.delete(`/shortlist/${userId}/${jobId}`);
  checkTokenExpiration(response);
  return response.data;
}
