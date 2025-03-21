import { checkTokenExpiration } from './auth.service';
import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});
 
const getAuthToken = () => {
  return sessionStorage.getItem('token');  
};
 
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

/// change to api.---- for header
export const getAllJobs = async () => {
  const response = await axios.get(`/api/job`); 
  checkTokenExpiration(response);
  return response.data;
};

export const getJobById = async (id) => {
  const response = await axios.get(`/api/job/${id}`);
  checkTokenExpiration(response);
  return response.data;
};

export const createJob = async (jobData) => {
  const response = await api.post(`/job/create`, jobData);
  checkTokenExpiration(response);
  return response.data; 
};

export const updateJob = async (id, jobData) => {
  const response = await axios.put(`/api/job/${id}`, jobData);
  checkTokenExpiration(response);
  return response.data; 
};

export const deleteJob = async (id) => {
  const response = await axios.delete(`/api/job/${id}`);
  checkTokenExpiration(response);
  return response.data;
};

export const getJobCountByType = async (jobType) => {
  const response = await axios.get(`/api/job/count/type?type=${jobType}`);
  return response.data.count;
};

export const getAllJobRoles = async () => {
  const response = await axios.get(`api/job/roles`);
  return response.data;
};

export const getAllJobLocations = async () => {
  const response = await axios.get(`api/job/locations`);
  return response.data;
}

export const getAllJobTypes = async () => {
  const response = await axios.get(`api/job/employmentType`);
  return response.data;
}

export const getFilteredJobs = async (filters) => {
  const queryParams = new URLSearchParams();
  filters.jobType?.forEach((type) => queryParams.append("jobType", type));
  filters.location?.forEach((loc) => queryParams.append("location", loc));
  filters.role?.forEach((role) => queryParams.append("role", role));
  const response = await axios.get(`/api/job/search?${queryParams.toString()}`);
  return response.data;
};
