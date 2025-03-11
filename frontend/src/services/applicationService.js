import axios from "axios";
import { checkTokenExpiration } from "./auth.service.js";

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
  const response = await fetch('/api/application/all', {
    method: 'GET',
    headers: {
      "Content-Type": "application/json",
      'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
    }
  })
  console.log("RES: ",response);
  checkTokenExpiration(response);

  if (!response.data.success) {
    throw new Error(response.data.message || "Failed to fetch applications");
  }
  return response.data.data;
}

export async function getApplicationById(appId) {
  try{
    const response = await fetch(`/api/application/byId?id=${appId}`, {
      method: 'GET',
      headers: {
          "Content-Type": "application/json",
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
        }
    });
    checkTokenExpiration(response);
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

export async function applyToJob({ jobId, coverLetter }) {
  const response = await fetch('/api/application/apply', {
    method: 'POST',
    headers: {
      "Content-Type": "application/json",
      'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
    },
    body: JSON.stringify({
      jobId,
      coverLetter
    })
  })
  checkTokenExpiration(response);
  if (!response.data.success) {
    throw new Error(response.data.message || "Failed to apply");
  }
  return response.data.data; 
}

export async function withdrawApplication(appId) {
  const response = await fetch(`/api/application/withdraw?id=${appId}`, {
    method: 'DELETE',
    headers: {
      "Content-Type": "application/json",
      'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
    }
  });
  checkTokenExpiration(response);
  if (!response.data.success) {
    throw new Error(response.data.message || "Failed to withdraw");
  }
  return response.data.message;
}

