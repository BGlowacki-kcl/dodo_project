import { checkTokenExpiration } from './auth.service';
import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});
 
const getAuthToken = () => {
  return localStorage.getItem('token');  
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
export const getAllJobs = async (employerId) => {
  const url = employerId ? `/api/job?postedBy=${employerId}` : `/api/job`;
  const response = await axios.get(url);
  checkTokenExpiration(response);
  return response.data; 
};

export const getJobById = async (id) => {
  const response = await axios.get(`/api/job/${id}`);
  checkTokenExpiration(response);
  return response.data;
};

export const createJob = async (jobData) => {
  const response = await axios.post(`/api/job`, jobData);
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
